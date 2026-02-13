import { NextResponse } from 'next/server';
import { Client, WebhookEvent } from '@line/bot-sdk';
import OpenAI from 'openai';
import { supabase } from '@/lib/supabase';
import { decrypt } from '@/lib/encryption';

export async function GET() {
    return new Response('Bot Webhook is Active.', { status: 200 });
}

export async function POST(
    req: Request,
    { params }: { params: { botId: string } }
) {
    const botId = params.botId;

    try {
        let body: any;
        try {
            body = await req.json();
        } catch (e) {
            return NextResponse.json({ status: 'ok' });
        }

        const events: WebhookEvent[] = body.events || [];
        if (events.length === 0) return NextResponse.json({ status: 'ok' });

        // 1. Fetch bot config from Supabase
        const { data: bot, error: botError } = await supabase
            .from('bots')
            .select('*')
            .eq('id', botId)
            .single();

        if (botError || !bot) {
            console.error('Bot not found:', botError);
            return NextResponse.json({ status: 'error', message: 'Bot not found' }, { status: 404 });
        }

        // 1.5 Subscription Status Check
        if (bot.status !== 'active') {
            const body = await req.json().catch(() => ({ events: [] }));
            const events: WebhookEvent[] = body.events || [];
            const client = new Client({
                channelAccessToken: decrypt(bot.line_channel_access_token),
                channelSecret: decrypt(bot.line_channel_secret),
            });

            for (const event of events) {
                if (event.type === 'message' && event.message.type === 'text') {
                    await client.replyMessage(event.replyToken, {
                        type: 'text',
                        text: '【系統通知】老闆您好，本 AI 服務目前已到期或停機。為了不中斷您的生意，請聯繫總店長或前往管理後台完成續費，感謝您的支持！'
                    });
                }
            }
            return NextResponse.json({ status: 'suspended' });
        }

        // 2. Decrypt credentials & Setup Fallbacks
        const lineConfig = {
            channelAccessToken: decrypt(bot.line_channel_access_token),
            channelSecret: decrypt(bot.line_channel_secret),
        };

        const decryptedUserKey = bot.openai_api_key ? decrypt(bot.openai_api_key) : "";
        const openaiApiKey = decryptedUserKey || process.env.MASTER_OPENAI_KEY || process.env.OPENAI_API_KEY;

        const client = new Client(lineConfig);
        const openai = new OpenAI({ apiKey: openaiApiKey });

        for (const event of events) {
            if (event.type === 'message' && event.message.type === 'text') {
                const userMessage = event.message.text.trim();
                const lineUserId = event.source.userId!;

                // A. Instant Test
                if (userMessage === 'ping' || userMessage === '測試') {
                    await client.replyMessage(event.replyToken, { type: 'text', text: '收到！連線正常。' });
                    continue;
                }

                // B. Fetch History
                const { data: history } = await supabase
                    .from('chat_logs')
                    .select('role, content')
                    .eq('bot_id', botId)
                    .eq('user_id', lineUserId)
                    .order('created_at', { ascending: false })
                    .limit(10);

                const messages = [
                    { role: "system", content: bot.system_prompt || "你是一個專業助手。" },
                    ...(history || []).reverse().map((m: any) => ({
                        role: m.role === 'ai' ? 'assistant' : m.role,
                        content: m.content
                    }))
                ];

                // C. Call OpenAI with Timeout
                let aiResponse = '抱歉，我現在無法回答。';
                try {
                    const completionPromise = openai.chat.completions.create({
                        model: "gpt-4o-mini",
                        messages: [
                            ...messages,
                            { role: "user", content: userMessage }
                        ] as any,
                    });

                    const timeoutPromise = new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Timeout')), 25000)
                    );

                    const completion: any = await Promise.race([completionPromise, timeoutPromise]);
                    aiResponse = completion.choices[0].message.content || '...';
                } catch (e: any) { console.error('AI Error:', e.message); }

                // D. Non-blocking Logging
                (async () => {
                    try {
                        await supabase.from('chat_logs').insert([
                            { bot_id: botId, user_id: lineUserId, role: 'user', content: userMessage },
                            { bot_id: botId, user_id: lineUserId, role: 'ai', content: aiResponse }
                        ]);
                    } catch (e) { console.error('Log failed'); }
                })();

                // E. Reply
                try {
                    await client.replyMessage(event.replyToken, {
                        type: 'text',
                        text: aiResponse.trim() || '收到您的訊息！'
                    });
                } catch (replyError: any) {
                    console.error('Line API Error:', JSON.stringify(replyError.originalError?.response?.data || replyError.message));
                }
            }
        }

        return NextResponse.json({ status: 'success' });
    } catch (error: any) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
