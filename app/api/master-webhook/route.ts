import { NextResponse } from 'next/server';
import { Client, WebhookEvent } from '@line/bot-sdk';
import OpenAI from 'openai';
import { supabase } from '@/lib/supabase';
import { SECURITY_DEFENSE_HEADER, maskSensitiveOutput } from '@/lib/security';

export const dynamic = 'force-dynamic';

const lineConfig = {
    channelAccessToken: process.env.MASTER_LINE_TOKEN || '',
    channelSecret: process.env.MASTER_LINE_SECRET || '',
};

const openai = new OpenAI({
    apiKey: process.env.MASTER_OPENAI_KEY || process.env.OPENAI_API_KEY,
});

const DEFAULT_MASTER_PROMPT = `你是一位具備頂尖商業思維與技術底蘊的「AI 數位總店長」。目前我們已成功協助了 {botCount} 位老闆建立專屬的 AI 店長！`;

export async function GET() {
    return new Response('Master Bot Webhook is Active. Use POST for Line events.', { status: 200 });
}

export async function HEAD() {
    return new Response(null, { status: 200 });
}

export async function OPTIONS() {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, HEAD',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-line-signature',
        },
    });
}

export async function POST(req: Request) {
    console.log('Master Webhook POST received');
    try {
        let body: any;
        try {
            body = await req.json();
        } catch (e) {
            console.log('Master Webhook: Non-JSON or empty body');
            return NextResponse.json({ status: 'ok' });
        }

        const events: WebhookEvent[] = body.events || [];
        if (events.length === 0) return NextResponse.json({ status: 'ok' });

        if (!lineConfig.channelAccessToken || !lineConfig.channelSecret) {
            console.error('Master Bot: Missing Line credentials in Environment Variables');
            return NextResponse.json({ error: 'Config missing' }, { status: 500 });
        }

        const client = new Client(lineConfig);

        for (const event of events) {
            if (event.type === 'message' && event.message.type === 'text') {
                const userMessage = event.message.text;
                const lineUserId = event.source.userId!;

                const { count: botCount } = await supabase.from('bots').select('*', { count: 'exact', head: true });
                const masterPrompt = (process.env.MASTER_SYSTEM_PROMPT || DEFAULT_MASTER_PROMPT).replace('{botCount}', (botCount || 0).toString());

                await supabase.from('chat_logs').insert({ bot_id: 'master-bot', user_id: lineUserId, role: 'user', content: userMessage });

                const { data: history } = await supabase.from('chat_logs').select('role, content').eq('bot_id', 'master-bot').eq('user_id', lineUserId).order('created_at', { ascending: false }).limit(6);

                const messages = [
                    { role: "system", content: SECURITY_DEFENSE_HEADER + "\n" + masterPrompt },
                    ...(history || []).reverse().map((m: any) => ({ role: m.role === 'ai' ? 'assistant' : m.role, content: m.content }))
                ];

                const completion = await openai.chat.completions.create({ model: "gpt-4o", messages: messages as any });
                let aiResponse = completion.choices[0].message.content || '抱歉，主機正在維護中。';
                aiResponse = maskSensitiveOutput(aiResponse);

                await supabase.from('chat_logs').insert({ bot_id: 'master-bot', user_id: lineUserId, role: 'ai', content: aiResponse });
                await client.replyMessage(event.replyToken, { type: 'text', text: aiResponse });
            }
        }
        return NextResponse.json({ status: 'success' });
    } catch (error: any) {
        console.error('Master Webhook Error:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
