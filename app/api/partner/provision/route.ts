import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit } from '@/lib/middleware/rateLimit';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    try {
        // 1. Authenticate the Partner via Bearer Token
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, error: 'Unauthorized: Missing or invalid Bearer token' }, { status: 401 });
        }

        const apiKey = authHeader.split(' ')[1];

        // 2. Validate Partner API Key in DB
        const { data: partner, error: partnerError } = await supabase
            .from('partners')
            .select('*')
            .eq('api_key', apiKey)
            .single();

        if (partnerError || !partner) {
            return NextResponse.json({ success: false, error: 'Unauthorized: Invalid API Key' }, { status: 401 });
        }

        // 2.5. Rate Limit Check (60 provisions per minute per partner)
        const rl = checkRateLimit(`provision:${partner.id}`, 60, 60_000);
        if (!rl.allowed) {
            return NextResponse.json(
                { success: false, error: 'Too Many Requests: Rate limit exceeded. Slow down.' },
                { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
            );
        }

        // 3. Parse Request Payload
        const body = await req.json();
        const { store_name, system_prompt, industry = 'Financial/StockRadar' } = body;

        if (!store_name) {
            return NextResponse.json({ success: false, error: 'Bad Request: "store_name" is required' }, { status: 400 });
        }

        // 4. Check available slots (unless unlimited)
        if (partner.slots_purchased <= 0) {
            return NextResponse.json({ success: false, error: 'Forbidden: No available slots remaining' }, { status: 403 });
        }

        // 5. Deduct slot
        if (partner.slots_purchased < 999999) { // 999999 representing unlimited
            await supabase
                .from('partners')
                .update({ slots_purchased: partner.slots_purchased - 1 })
                .eq('id', partner.id);
        }

        // 6. Create the Bot in the database
        // We set owner_type to 'partner' to signify this was created via the API
        const defaultPrompt = system_prompt || "你是一個專業的 AI 客服助手。請使用條列式重點回答，並保持客氣禮貌。";

        const newBot = {
            store_name,
            system_prompt: defaultPrompt,
            partner_id: partner.id,
            owner_type: 'partner',
            status: 'active'
        };

        const { data: botData, error: botError } = await supabase
            .from('bots')
            .insert([newBot])
            .select('id, mgmt_token, store_name, created_at')
            .single();

        if (botError) {
            console.error("Bot DB insert error:", botError.message);
            return NextResponse.json({ success: false, error: 'Failed to provision bot.' }, { status: 500 });
        }

        // 7. Return success response with Bot credentials
        return NextResponse.json({
            success: true,
            bot_id: botData.id,
            mgmt_token: botData.mgmt_token,
            store_name: botData.store_name,
            message: "Bot provisioned successfully. Please direct the user to their LINE Bot to bind their owner account."
        }, { status: 201 });

    } catch (error: any) {
        console.error('Provision API Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
