import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
    const authHeader = req.headers.get('Authorization');
    console.log('[Status] Received GET request. Auth Header present:', !!authHeader);
    
    try {
        const { data: { user }, error: authErr } = await supabase.auth.getUser(authHeader?.split(' ')[1] || '');
        if (authErr) console.warn('[Status] Auth User Error (falling back to dummy):', authErr.message);
        
        const userId = user?.id || '00000000-0000-0000-0000-000000000001';
        const { searchParams } = new URL(req.url);
        const botId = searchParams.get('botId') || searchParams.get('configId');

        let query = supabase.from('line_channel_configs').select('*');
        if (botId) {
            query = query.eq('id', botId);
        } else {
            query = query.eq('user_id', userId).limit(1);
        }

        const { data: config, error } = await (botId ? query.maybeSingle() : query.single());

        if (error) {
            console.error('[Status] DB Query Error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!config) {
            console.warn('[Status] No config found for user:', userId);
            return NextResponse.json({ status: 'not_configured' });
        }

        console.log('[Status] Found Config ID:', config.id, 'Status in DB:', config.status);
        console.log('[Status] Fields present:', { 
            hasId: !!config.channel_id, 
            hasSecret: !!config.channel_secret, 
            hasBot: !!config.bot_basic_id, 
            hasTok: !!config.channel_access_token 
        });

        const isReal = (val: any) => val && typeof val === 'string' && !['pending', 'ID_PENDING', 'SECRET_PENDING', 'TOKEN_PENDING', 'none'].includes(val.toLowerCase());

        const response = { 
            status: config.status,
            config: {
                id: config.id,
                botBasicId: config.bot_basic_id,
                channelId: config.channel_id,
                channelSecret: config.channel_secret ? 'HIDDEN' : null,
                channelAccessToken: config.channel_access_token ? 'HIDDEN' : null,
                lastValidatedAt: config.last_validated_at,
                webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://bot.ycideas.com'}/api/line/webhook/${config.id}`
            },
            collected: {
                id: isReal(config.channel_id),
                sec: isReal(config.channel_secret),
                bot: isReal(config.bot_basic_id),
                tok: isReal(config.channel_access_token)
            }
        };
        
        console.log('[Status] Sending response status:', response.status);
        return NextResponse.json(response);
    } catch (error: any) {
        console.error('[Status] Fatal Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
