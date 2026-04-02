import { NextRequest, NextResponse } from 'next/server';
import { WebhookEvent, messagingApi } from '@line/bot-sdk';
import { supabase } from '@/lib/supabase';
import { AIService } from '@/lib/services/AIService';
import * as crypto from 'crypto';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const configId = params.id;

    try {
        // 1. Get raw body for signature validation
        const rawBody = await req.text();
        const signature = req.headers.get('x-line-signature') || '';

        // 2. Fetch config from DB
        const { data: config, error: configError } = await supabase
            .from('line_channel_configs')
            .select('*')
            .eq('id', configId)
            .single();

        if (configError || !config) {
            console.error('LINE Config not found:', configId);
            return NextResponse.json({ error: 'Config not found' }, { status: 404 });
        }

        // 3. Verify Signature
        const hash = crypto
            .createHmac('sha256', config.channel_secret)
            .update(rawBody)
            .digest('base64');

        if (hash !== signature) {
            console.error('Invalid signature for config:', configId);
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        // 4. Parse events
        const body = JSON.parse(rawBody);
        const events: WebhookEvent[] = body.events;

        // --- ACCELERATION ENGINE START ---
        // We handle the heavy lifting in a background promise that we do NOT await
        // so we can return 200 OK to LINE within its strict 1s timeout.
        const processEvents = async () => {
            try {
                const client = new messagingApi.MessagingApiClient({
                    channelAccessToken: config.channel_access_token
                });

                // 4.5 Fetch Store Config for Knowledge Base
                const { data: storeConfig } = await supabase
                    .from('store_configs')
                    .select('*')
                    .eq('bot_config_id', configId)
                    .maybeSingle();

                const storeSystemPrompt = storeConfig 
                    ? AIService.generateStoreSystemPrompt(storeConfig)
                    : `你現在是 LINE 官方帳號的 AI 店長。請簡短、精確且有禮貌地回答客戶。`;

                for (const event of events) {
                    if (event.type === 'message' && event.message.type === 'text') {
                        const userId = event.source.userId;
                        const userMessage = event.message.text;

                        // 5. Call AIService (Now running in Background)
                        const aiResult = await AIService.generateResponse({
                            messages: [{ role: 'user', content: userMessage }],
                            userId: config.user_id,
                            lineUserId: userId,
                            systemPromptOverride: storeSystemPrompt
                        });

                        // 6. Save to Chat Logs in background
                        const isLead = /09\d{2}[-\s]?\d{3}[-\s]?\d{3}|(預約|報名|想買|電話)/i.test(userMessage + aiResult.message);
                        await supabase.from('chat_logs').insert({
                            config_id: configId,
                            user_id: config.user_id,
                            line_user_id: userId,
                            user_message: userMessage,
                            ai_response: aiResult.message,
                            is_lead: isLead,
                            metadata: aiResult.metadata,
                            created_at: new Date().toISOString()
                        });

                        // 7. Reply to LINE
                        await client.replyMessage({
                            replyToken: event.replyToken,
                            messages: [{ type: 'text', text: aiResult.message }]
                        });
                    }
                }
            } catch (err) {
                console.error('[CRITICAL] Background Processing Failed:', err);
            }
        };

        // Important: Fire and forget correctly!
        // In some environments like Vercel, we might need waitUntil, but for general dev/deploy:
        processEvents().catch(console.error);

        // --- ACCELERATION ENGINE END ---

        return NextResponse.json({ status: 'ok' });
    } catch (error: any) {
        console.error('LINE Webhook Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
