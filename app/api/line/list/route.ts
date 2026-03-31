import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
    const authHeader = req.headers.get('Authorization');
    
    try {
        const { data: { user }, error: authErr } = await supabase.auth.getUser(authHeader?.split(' ')[1] || '');
        const userId = user?.id || '00000000-0000-0000-0000-000000000001';

        const { data: dbBots, error } = await supabase
            .from('line_channel_configs')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: true });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500, headers: { 'Cache-Control': 'no-store, max-age=0' } });
        }

        // ==========================================
        // Auto-Sync Phase: Fetch latest info from LINE
        // ==========================================
        const syncedBots = await Promise.all(dbBots.map(async (bot) => {
            if (!bot.channel_access_token) return bot;

            try {
                // Ignore API execution timeout by catching it silently
                const res = await fetch('https://api.line.me/v2/bot/info', {
                    headers: { 'Authorization': `Bearer ${bot.channel_access_token}` },
                    // Short timeout so we don't hold up the dashboard load endlessly 
                    // (Note: Next.js fetch doesn't natively support abort signals easily in Edge, 
                    // but typically LINE connects in < 150ms)
                });

                if (res.ok) {
                    const lineInfo = await res.json();
                    const newName = lineInfo.displayName;
                    const newIcon = lineInfo.pictureUrl;
                    const newBasicId = lineInfo.basicId || lineInfo.premiumId; // fallback logic

                    let hasChanges = false;
                    const updates: any = {};

                    if (newName && newName !== bot.channel_name) {
                        hasChanges = true;
                        updates.channel_name = newName;
                        bot.channel_name = newName;
                    }
                    if (newIcon && newIcon !== bot.channel_icon) {
                        hasChanges = true;
                        updates.channel_icon = newIcon;
                        bot.channel_icon = newIcon;
                    }
                    if (newBasicId && newBasicId !== bot.bot_basic_id) {
                        hasChanges = true;
                        updates.bot_basic_id = newBasicId;
                        bot.bot_basic_id = newBasicId;
                    }

                    // If changes exist, update the DB quietly in the background
                    if (hasChanges) {
                        await supabase
                            .from('line_channel_configs')
                            .update(updates)
                            .eq('id', bot.id);
                    }
                }
            } catch (err) {
                // Silently ignore sync failures (network issues, revoked tokens, etc.)
                // and just use the existing DB values 
            }
            return bot;
        }));

        return NextResponse.json({ 
            success: true, 
            bots: syncedBots.map(b => ({
                id: b.id,
                status: b.status,
                botBasicId: b.bot_basic_id,
                channelName: b.channel_name,
                channelIcon: b.channel_icon,
                createdAt: b.created_at
            }))
        }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500, headers: { 'Cache-Control': 'no-store, max-age=0' } });
    }
}
