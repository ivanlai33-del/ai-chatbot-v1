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

        // 2. Validate Partner
        const { data: partner, error: partnerError } = await supabase
            .from('partners')
            .select('id')
            .eq('api_key', apiKey)
            .single();

        if (partnerError || !partner) {
            return NextResponse.json({ success: false, error: 'Unauthorized: Invalid API Key' }, { status: 401 });
        }

        // 2.5. Rate Limit: 120 bind requests per minute per partner
        const rl = checkRateLimit(`bind:${partner.id}`, 120, 60_000);
        if (!rl.allowed) {
            return NextResponse.json(
                { success: false, error: 'Too Many Requests: Binding rate limit exceeded.' },
                { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
            );
        }

        // 3. Parse Request
        const body = await req.json();
        const { bot_id, line_user_id } = body;

        if (!bot_id || !line_user_id) {
            return NextResponse.json({ success: false, error: 'Bad Request: "bot_id" and "line_user_id" are required' }, { status: 400 });
        }

        // 4. Verify the bot belongs to this partner
        const { data: bot, error: botError } = await supabase
            .from('bots')
            .select('id, owner_line_id, store_name')
            .eq('id', bot_id)
            .eq('partner_id', partner.id)
            .single();

        if (botError || !bot) {
            return NextResponse.json({ success: false, error: 'Not Found: Bot does not exist or does not belong to your partner account' }, { status: 404 });
        }

        // 5. Check if already bound to someone else (Optional strict policy, but generally good for security)
        if (bot.owner_line_id && bot.owner_line_id !== line_user_id) {
            // Depending on business logic, we could either reject or overwrite. We'll overwrite for flexibility in SaaS.
            console.log(`Overwriting existing binding for bot ${bot_id}`);
        }

        // 6. Execute Binding
        const { error: updateError } = await supabase
            .from('bots')
            .update({ owner_line_id: line_user_id, updated_at: new Date().toISOString() })
            .eq('id', bot_id);

        if (updateError) {
            throw updateError;
        }

        return NextResponse.json({
            success: true,
            bot_id: bot_id,
            line_user_id: line_user_id,
            store_name: bot.store_name,
            message: 'Account successfully bound.'
        }, { status: 200 });

    } catch (error: any) {
        console.error('Bind API Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
