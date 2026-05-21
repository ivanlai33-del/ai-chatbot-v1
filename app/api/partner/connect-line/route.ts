import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { bot_id, connectionConfig } = body;

        if (!bot_id || !connectionConfig) {
            return NextResponse.json({ success: false, error: 'Missing bot_id or connectionConfig' }, { status: 400 });
        }

        const { channelSecret, accessToken, basicId } = connectionConfig;

        // 1. Save / Update LINE Config
        const { data: config, error: configError } = await supabase
            .from('line_channel_configs')
            .upsert({
                bot_id: bot_id, // Ensure this column exists in your actual table
                channel_secret: channelSecret, // In production, encrypt this
                channel_access_token: accessToken, // In production, encrypt this
                bot_basic_id: basicId,
                status: 'active',
                updated_at: new Date().toISOString()
            }, { onConflict: 'bot_id' })
            .select()
            .single();

        if (configError) throw configError;

        // 2. Update Bot Status
        const { error: botUpdateError } = await supabase
            .from('bots')
            .update({ 
                status: 'connected',
                line_config_id: config.id 
            })
            .eq('id', bot_id);

        if (botUpdateError) throw botUpdateError;

        return NextResponse.json({
            success: true,
            message: "LINE Connection Successful!",
            config_id: config.id
        });

    } catch (error: any) {
        console.error('Connect Line API Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
