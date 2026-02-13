import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const { botId, mgmtToken } = await req.json();

        if (!botId || !mgmtToken) {
            return NextResponse.json({ error: 'Missing botId or mgmtToken' }, { status: 400 });
        }

        const { data: bot, error } = await supabase
            .from('bots')
            .select('id, store_name, selected_plan, system_prompt, status')
            .eq('id', botId)
            .eq('mgmt_token', mgmtToken)
            .single();

        if (error || !bot) {
            return NextResponse.json({ error: 'Unauthorized or not found' }, { status: 401 });
        }

        return NextResponse.json({
            success: true,
            bot: {
                id: bot.id,
                storeName: bot.store_name,
                plan: bot.selected_plan,
                systemPrompt: bot.system_prompt,
                status: bot.status
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
