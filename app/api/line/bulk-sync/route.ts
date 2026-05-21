import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * POST /api/line/bulk-sync
 * Allows batch initialization of multiple bot slots as 'pending'.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { setupToken, bots } = body;

        if (!setupToken || !Array.isArray(bots)) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });
        }

        // 1. Find user by setupToken (search in configs first)
        const { data: config, error: configErr } = await supabase
            .from('line_channel_configs')
            .select('id, user_id')
            .eq('setup_token', setupToken)
            .limit(1)
            .maybeSingle();

        if (!config || !config.user_id) {
            return NextResponse.json({
                error: '查無此同步金鑰。請回到儀表板，重新將「產生同步書籤」按鈕拖曳到書籤列，並使用最新的書籤！'
            }, { status: 401, headers: { 'Access-Control-Allow-Origin': '*' } });
        }

        const userId = config.user_id;

        // Fetch plan level for this user (handle mock user gracefully for local dev)
        let planLevel = 2; // Default to Company tier for mock/local testing

        if (userId !== '00000000-0000-0000-0000-000000000001') {
            const { data: user, error: userErr } = await supabase
                .from('direct_users')
                .select('plan_level')
                .eq('id', userId)
                .single();

            if (userErr || !user) {
                return NextResponse.json({ error: 'User not found for this token' }, { status: 401, headers: { 'Access-Control-Allow-Origin': '*' } });
            }
            planLevel = user.plan_level;
        }

        // Bypass plan level for local testing so they can test the UI regardless of db state
        const limit = 6;

        const { count: currentCount } = await supabase
            .from('line_channel_configs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        // Calculate how many more we can add (accounting for the one we will update)
        // If they have 1 pending slot (the one that generated the token), we will overwrite it.
        const actualRemaining = limit - (currentCount || 0) + 1;
        if (actualRemaining <= 0) {
            return NextResponse.json({ error: `您的額度已達上限 (${limit})。` }, { status: 403, headers: { 'Access-Control-Allow-Origin': '*' } });
        }

        const toCreate = bots.slice(0, actualRemaining);
        const results = [];

        for (let i = 0; i < toCreate.length; i++) {
            const bot = toCreate[i];
            let configId = '';

            if (i === 0 && config?.id) {
                // Update the existing pending slot that owns this setupToken
                const { data: updated, error: updateErr } = await supabase
                    .from('line_channel_configs')
                    .update({
                        channel_name: bot.name,
                        channel_icon: bot.icon
                    })
                    .eq('id', config.id)
                    .select()
                    .single();

                if (!updateErr && updated) {
                    configId = updated.id;
                }
            } else {
                // Create new pending slots for the rest
                const { data: newConfig, error: insertErr } = await supabase
                    .from('line_channel_configs')
                    .insert({
                        user_id: userId,
                        channel_name: bot.name,
                        channel_icon: bot.icon,
                        status: 'pending'
                    })
                    .select()
                    .single();

                if (!insertErr && newConfig) {
                    configId = newConfig.id;
                    // Pre-initialize store config (Knowledge Base) for the new slots
                    await supabase.from('store_configs').insert({
                        user_id: userId,
                        bot_config_id: configId,
                        brand_dna: { name: bot.name },
                        completion_pct: 0
                    });
                }
            }

            if (configId) results.push(configId);
        }

        return NextResponse.json({
            success: true,
            count: results.length,
            message: `成功建立 ${results.length} 個待命店長空間。`
        }, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            }
        });

    } catch (error: any) {
        console.error('[BulkSync] Fatal Error:', error);
        return NextResponse.json({ error: error.message }, {
            status: 500,
            headers: { 'Access-Control-Allow-Origin': '*' }
        });
    }
}

// Handle CORS preflight requests
export async function OPTIONS() {
    return new NextResponse(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}
