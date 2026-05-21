import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { config, partner_id } = body;

        if (!config || !partner_id) {
            return NextResponse.json({ success: false, error: 'Missing config or partner_id' }, { status: 400 });
        }

        // 1. Check partner slots
        const { data: partner } = await supabase
            .from('partners')
            .select('slots_purchased')
            .eq('id', partner_id)
            .single();

        if (!partner || partner.slots_purchased <= 0) {
            return NextResponse.json({ success: false, error: 'No slots available' }, { status: 403 });
        }

        // 2. Start Provisioning
        // a. Create Bot
        const { data: bot, error: botError } = await supabase
            .from('bots')
            .insert([{
                store_name: config.name,
                industry: config.industry,
                system_prompt: config.systemPrompt,
                partner_id: partner_id,
                owner_type: 'partner',
                status: 'active'
            }])
            .select('*')
            .single();

        if (botError) throw botError;

        // b. Create Workflows
        if (config.workflows && config.workflows.length > 0) {
            const workflows = config.workflows.map((w: any) => ({
                bot_id: bot.id,
                name: w.name,
                trigger_event: w.trigger,
                actions: [{ type: w.action, params: {} }],
                is_active: true
            }));
            await supabase.from('workflows').insert(workflows);
        }

        // c. Create Initial FAQ / Knowledge
        if (config.initialFAQ && config.initialFAQ.length > 0) {
            await supabase.from('store_configs').upsert({
                bot_id: bot.id,
                faq_base: config.initialFAQ.map((f: any) => ({ question: f.q, answer: f.a }))
            }, { onConflict: 'bot_id' });
        }

        // d. Deduct Slot
        await supabase
            .from('partners')
            .update({ slots_purchased: partner.slots_purchased - 1 })
            .eq('id', partner_id);

        return NextResponse.json({
            success: true,
            bot_id: bot.id,
            mgmt_token: bot.mgmt_token,
            message: "Agentic Provisioning Successful!"
        });

    } catch (error: any) {
        console.error('Agentic Config API Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
