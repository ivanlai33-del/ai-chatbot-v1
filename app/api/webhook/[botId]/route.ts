import { NextResponse } from 'next/server';
import { Client, WebhookEvent } from '@line/bot-sdk';
import OpenAI from 'openai';
import { supabase } from '@/lib/supabase';
import { decrypt } from '@/lib/encryption';

export async function POST(
    req: Request,
    { params }: { params: { botId: string } }
) {
    const botId = params.botId;

    try {
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

        // 2. Decrypt credentials
        const lineConfig = {
            channelAccessToken: decrypt(bot.line_channel_access_token),
            channelSecret: decrypt(bot.line_channel_secret),
        };
        const openaiApiKey = decrypt(bot.openai_api_key);

        const client = new Client(lineConfig);
        const openai = new OpenAI({ apiKey: openaiApiKey });

        const body = await req.json();
        const events: WebhookEvent[] = body.events;

        for (const event of events) {
            if (event.type === 'message' && event.message.type === 'text') {
                const userMessage = event.message.text;

                // 3. Call OpenAI with dynamic prompt
                const completion = await openai.chat.completions.create({
                    model: "gpt-4o",
                    messages: [
                        { role: "system", content: bot.system_prompt || "你是一個專業助手。" },
                        { role: "user", content: userMessage }
                    ],
                });

                const aiResponse = completion.choices[0].message.content || '抱歉，我現在無法回答。';

                // 4. Reply via Line
                await client.replyMessage(event.replyToken, {
                    type: 'text',
                    text: aiResponse,
                });
            }
        }

        return NextResponse.json({ status: 'success' });
    } catch (error) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ status: 'error' }, { status: 500 });
    }
}
