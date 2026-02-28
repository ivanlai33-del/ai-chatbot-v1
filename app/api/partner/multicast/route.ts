import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit } from '@/lib/middleware/rateLimit';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN!;

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

        // 2.5. Rate Limit: 20 multicast requests per minute per partner (each can push to 5000 users, so this is generous)
        const rl = checkRateLimit(`multicast:${partner.id}`, 20, 60_000);
        if (!rl.allowed) {
            return NextResponse.json(
                { success: false, error: 'Too Many Requests: Multicast rate limit exceeded. Max 20/min.' },
                { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
            );
        }

        // 3. Parse Request Payload
        const body = await req.json();
        const { bot_ids, messages } = body;

        // Validation
        if (!bot_ids || !Array.isArray(bot_ids) || bot_ids.length === 0) {
            return NextResponse.json({ success: false, error: 'Bad Request: "bot_ids" array is required and cannot be empty' }, { status: 400 });
        }
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json({ success: false, error: 'Bad Request: "messages" array is required' }, { status: 400 });
        }

        // 4. Rate Limiting Check (Simple example: Partners might have a monthly limit, but here we just ensure basic sanity check)
        // A robust system would use Redis for sliding window rate limits per partner here.
        if (bot_ids.length > 5000) {
            return NextResponse.json({ success: false, error: 'Payload Too Large: Max 5000 bot_ids per request' }, { status: 413 });
        }

        // 5. Fetch corresponding owner_line_ids for these bot_ids, strictly scoped to this partner
        // Chunk the DB query if bot_ids is very large, but Supabase handles IN clauses well up to a few thousand.
        const { data: bots, error: botsError } = await supabase
            .from('bots')
            .select('id, owner_line_id')
            .eq('partner_id', partner.id)
            .eq('status', 'active') // Only send to active bots
            .in('id', bot_ids)
            .not('owner_line_id', 'is', null);

        if (botsError) {
            console.error("Error fetching bots for multicast:", botsError);
            return NextResponse.json({ success: false, error: 'Internal Server Error while resolving bot mappings' }, { status: 500 });
        }

        if (!bots || bots.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No active bound bots found for the provided IDs. No messages sent.',
                sent_count: 0
            }, { status: 200 });
        }

        // Extract valid LINE User IDs
        const lineUserIds = bots.map(b => b.owner_line_id).filter(id => id);

        // Deduplicate LINE User IDs (edge case: multiple bots bound to same LINE owner)
        const uniqueLineUserIds = Array.from(new Set(lineUserIds));

        // 6. Execute LINE Multicast in Chunks of 500 (LINE API Limit)
        const chunkSize = 500;
        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < uniqueLineUserIds.length; i += chunkSize) {
            const chunkUserIds = uniqueLineUserIds.slice(i, i + chunkSize);

            try {
                const response = await fetch('https://api.line.me/v2/bot/message/multicast', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
                    },
                    body: JSON.stringify({
                        to: chunkUserIds,
                        messages: messages
                    })
                });

                if (!response.ok) {
                    const errorData = await response.text();
                    console.error(`Multicast LINE API Error (Chunk ${i}):`, errorData);
                    failCount += chunkUserIds.length;
                } else {
                    successCount += chunkUserIds.length;
                }
            } catch (fetchErr) {
                console.error(`Fetch error during LINE multicast (Chunk ${i}):`, fetchErr);
                failCount += chunkUserIds.length;
            }
        }

        // 7. Return summary
        return NextResponse.json({
            success: true,
            message: `Multicast operation completed.`,
            stats: {
                requested_bots: bot_ids.length,
                resolved_active_line_ids: uniqueLineUserIds.length,
                successfully_sent: successCount,
                failed: failCount
            }
        }, { status: 200 });

    } catch (error: any) {
        console.error('Multicast API Generic Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
