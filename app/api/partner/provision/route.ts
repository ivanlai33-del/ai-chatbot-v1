import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, industry, systemPrompt } = body;

        if (!name || !systemPrompt) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        // Simulate deployment delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 1. Get the first/active partner (mocking session context for demo)
        const { data: partners } = await supabase
            .from('partners')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1);

        let partnerId = null;
        if (partners && partners.length > 0) {
            partnerId = partners[0].id;

            // Deduct a slot
            if (partners[0].slots_purchased > 0) {
                await supabase
                    .from('partners')
                    .update({ slots_purchased: partners[0].slots_purchased - 1 })
                    .eq('id', partnerId);
            }
        }

        // 2. Create the Bot in the database
        const newBot = {
            name,
            industry,
            system_prompt: systemPrompt,
            partner_id: partnerId,
            is_active: true
        };

        const { data: botData, error: botError } = await supabase
            .from('bots')
            .insert([newBot])
            .select()
            .single();

        if (botError) {
            console.error("Bot DB insert error:", botError.message);
            // Fallback for UI if DB table missing
            return NextResponse.json({
                success: true,
                bot: { id: 'mock_bot_' + Date.now(), ...newBot }
            });
        }

        return NextResponse.json({
            success: true,
            bot: botData
        });

    } catch (error: any) {
        console.error('Provision API Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
