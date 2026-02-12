import { NextResponse } from 'next/server';
import { Client, WebhookEvent } from '@line/bot-sdk';
import OpenAI from 'openai';
import { supabase } from '@/lib/supabase';
import { decrypt } from '@/lib/encryption';

export async function GET() {
    return new Response('Bot Webhook is Active. Use POST for Line events.', { status: 200 });
}

export async function POST(
    req: Request,
    { params }: { params: { botId: string } }
) {
    const botId = params.botId;

    try {
        // Line verification may send empty body or different content types
        let body: any;
        try {
            body = await req.json();
        } catch (e) {
            console.log('Received empty or non-JSON body in bot-webhook');
            return NextResponse.json({ status: 'ok' });
        }

        const events: WebhookEvent[] = body.events || [];
        if (events.length === 0) {
            return NextResponse.json({ status: 'success', message: 'No events to process' });
        }

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

        // 2. Decrypt credentials & Setup Fallbacks
        const lineConfig = {
            channelAccessToken: decrypt(bot.line_channel_access_token),
            channelSecret: decrypt(bot.line_channel_secret),
        };

        // Managed Key Strategy: Use bot's key if exists, otherwise fallback to server's master key
        const decryptedUserKey = bot.openai_api_key ? decrypt(bot.openai_api_key) : "";
        const openaiApiKey = decryptedUserKey || process.env.MASTER_OPENAI_KEY || process.env.OPENAI_API_KEY;

        const client = new Client(lineConfig);
        const openai = new OpenAI({ apiKey: openaiApiKey });

        for (const event of events) {
            if (event.type === 'message' && event.message.type === 'text') {
                const userMessage = event.message.text;
                const lineUserId = event.source.userId!;

                // 3. Log user message (Non-blocking)
                supabase.from('chat_logs').insert({
                    bot_id: botId,
                    user_id: lineUserId,
                    role: 'user',
                    content: userMessage
                }).then(({ error }) => {
                    if (error) console.error('Logging User Msg failed:', error.message);
                });

                // 4. Fetch history for context (last 10 messages)
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

                // 5. Call OpenAI with history
                console.log('Calling OpenAI with model gpt-4o-mini...');
                const completion = await openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: messages as any,
                });

                const aiResponse = completion.choices[0].message.content || '抱歉，我現在無法回答。';
                console.log('OpenAI response received');

                // 6. Log AI response (Non-blocking)
                supabase.from('chat_logs').insert({
                    bot_id: botId,
                    user_id: lineUserId,
                    role: 'ai',
                    content: aiResponse
                }).then(({ error }) => {
                    if (error) console.error('Logging AI Msg failed:', error.message);
                });

                // 7. Reply via Line
                console.log('Sending reply to Line...');
                await client.replyMessage(event.replyToken, {
                    type: 'text',
                    text: aiResponse,
                });
                console.log('Line reply sent successfully');
            }
        }

        return NextResponse.json({ status: 'success' });
    } catch (error: any) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
