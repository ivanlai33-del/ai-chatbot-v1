/**
 * ============================================================
 * 🏆 TIER-1: Customer LINE Bot Webhook (line_channel_configs)
 * ============================================================
 * Route: /api/line/webhook/[id]
 * 
 * ⚠️  VERCEL CRITICAL FIX: Must await processing before returning.
 *     Fire-and-forget causes Vercel to kill background tasks immediately
 *     after response is sent, so replyMessage never executes.
 */

import { NextRequest, NextResponse } from 'next/server';
import { WebhookEvent, messagingApi } from '@line/bot-sdk';
import { supabase } from '@/lib/supabase';
import { AIService } from '@/lib/services/AIService';
import * as crypto from 'crypto';

export const maxDuration = 60;

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
            console.error('[TIER1:LineWebhook] Config not found:', configId);
            return NextResponse.json({ error: 'Config not found' }, { status: 404 });
        }

        // 3. Verify Signature
        const hash = crypto
            .createHmac('sha256', config.channel_secret)
            .update(rawBody)
            .digest('base64');

        if (hash !== signature) {
            console.error('[TIER1:LineWebhook] Invalid signature for config:', configId);
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        // 4. Parse events
        const body = JSON.parse(rawBody);
        const events: WebhookEvent[] = body.events || [];

        if (events.length === 0) {
            return NextResponse.json({ status: 'ok' });
        }

        console.log(`[TIER1:LineWebhook][${configId}] Processing ${events.length} event(s)`);

        // ✅ CRITICAL FIX: Must AWAIT — Vercel kills background tasks after response.
        await processEvents(configId, config, events);

        console.log(`[TIER1:LineWebhook][${configId}] All events processed.`);
        return NextResponse.json({ status: 'ok' });

    } catch (error: any) {
        console.error('[TIER1:LineWebhook] Top-level error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

async function processEvents(
    configId: string,
    config: any,
    events: WebhookEvent[]
) {
    try {
        const client = new messagingApi.MessagingApiClient({
            channelAccessToken: config.channel_access_token
        });

        // Fetch Store Config for Knowledge Base
        const { data: storeConfig } = await supabase
            .from('store_configs')
            .select('*')
            .eq('bot_config_id', configId)
            .maybeSingle();

        const storeSystemPrompt = storeConfig
            ? AIService.generateStoreSystemPrompt(storeConfig)
            : `你現在是 LINE 官方帳號的 AI 店長。請簡短、精確且有禮貌地回答客戶。`;

        console.log(`[TIER1:LineWebhook][${configId}] Store prompt ready, processing events...`);

        for (const event of events) {
            if (event.type === 'message' && event.message.type === 'text') {
                const userId = event.source.userId;
                const userMessage = event.message.text;

                console.log(`[TIER1:LineWebhook][${configId}] User ${userId}: ${userMessage.substring(0, 30)}...`);

                // Call AIService
                const aiResult = await AIService.generateResponse({
                    messages: [{ role: 'user', content: userMessage }],
                    userId: config.user_id,
                    lineUserId: userId,
                    systemPromptOverride: storeSystemPrompt
                });

                console.log(`[TIER1:LineWebhook][${configId}] AI response ready, replying...`);

                // Reply to LINE (must happen before response is sent)
                await client.replyMessage({
                    replyToken: event.replyToken,
                    messages: [{ type: 'text', text: aiResult.message }]
                });

                console.log(`[TIER1:LineWebhook][${configId}] Reply sent successfully.`);

                // Save to Chat Logs (async, non-blocking — does not affect reply)
                const isLead = /09\d{2}[-\s]?\d{3}[-\s]?\d{3}|(預約|報名|想買|電話)/i.test(userMessage + aiResult.message);
                supabase.from('chat_logs').insert({
                    config_id: configId,
                    user_id: config.user_id,
                    line_user_id: userId,
                    user_message: userMessage,
                    is_lead: isLead,
                    created_at: new Date().toISOString()
                }).then(({ error }) => {
                    if (error) console.error(`[TIER1:LineWebhook][${configId}] Chat log save failed:`, error.message);
                });
            }
        }
    } catch (err: any) {
        console.error(`[TIER1:LineWebhook][${configId}] processEvents error:`, err.message);
    }
}
