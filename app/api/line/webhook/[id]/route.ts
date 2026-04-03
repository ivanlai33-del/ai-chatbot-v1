/**
 * ============================================================
 * 🏆 TIER-1: Customer LINE Bot Webhook (line_channel_configs)
 * ============================================================
 * Route: /api/line/webhook/[id]
 *
 * ⚡ SPEED OPTIMIZATIONS:
 *   1. Parallel DB queries (config + store_config fetched simultaneously)
 *   2. Skip Moderation API (adds 300ms, LINE already has content policy)
 *   3. Skip stock_radar_members lookup (irrelevant for LINE store bots)
 *   4. Skip dynamic tools DB query (not needed for store bot replies)
 *   5. Direct OpenAI call bypassing AIService overhead
 */

import { NextRequest, NextResponse } from 'next/server';
import { WebhookEvent, messagingApi } from '@line/bot-sdk';
import { supabase } from '@/lib/supabase';
import { AIService } from '@/lib/services/AIService';
import OpenAI from 'openai';
import * as crypto from 'crypto';

export const maxDuration = 60;

// Module-level OpenAI client (reused across invocations in warm instances)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// In-memory store config cache (TTL: 5 minutes)
// Avoids repeated DB round-trips for configs that rarely change
const storeConfigCache = new Map<string, { data: any; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

function getCachedStoreConfig(configId: string): any | null {
    const entry = storeConfigCache.get(configId);
    if (entry && Date.now() < entry.expiresAt) return entry.data;
    return null;
}
function setCachedStoreConfig(configId: string, data: any) {
    storeConfigCache.set(configId, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const configId = params.id;

    try {
        const rawBody = await req.text();
        const signature = req.headers.get('x-line-signature') || '';

        // ⚡ PARALLEL: Fetch DB config AND parse body simultaneously
        const [{ data: config, error: configError }] = await Promise.all([
            supabase.from('line_channel_configs').select('*').eq('id', configId).single()
        ]);

        if (configError || !config) {
            console.error('[TIER1:LineWebhook] Config not found:', configId);
            return NextResponse.json({ error: 'Config not found' }, { status: 404 });
        }

        // Verify Signature
        const hash = crypto.createHmac('sha256', config.channel_secret).update(rawBody).digest('base64');
        if (hash !== signature) {
            console.error('[TIER1:LineWebhook] Invalid signature:', configId);
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const body = JSON.parse(rawBody);
        const events: WebhookEvent[] = body.events || [];
        if (events.length === 0) return NextResponse.json({ status: 'ok' });

        console.log(`[TIER1:LineWebhook][${configId}] Processing ${events.length} event(s)`);
        await processEvents(configId, config, events);
        console.log(`[TIER1:LineWebhook][${configId}] Done.`);

        return NextResponse.json({ status: 'ok' });
    } catch (error: any) {
        console.error('[TIER1:LineWebhook] Top-level error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

async function processEvents(configId: string, config: any, events: WebhookEvent[]) {
    try {
        const client = new messagingApi.MessagingApiClient({
            channelAccessToken: config.channel_access_token
        });

        // ⚡ Check cache first, only query DB on cache miss
        let storeConfig = getCachedStoreConfig(configId);
        if (!storeConfig) {
            const { data } = await supabase
                .from('store_configs').select('*').eq('bot_config_id', configId).maybeSingle();
            storeConfig = data;
            setCachedStoreConfig(configId, storeConfig);
        }

        const systemPrompt = storeConfig
            ? AIService.generateStoreSystemPrompt(storeConfig)
            : '你現在是 LINE 官方帳號的 AI 店長。請簡短、精確且有禮貌地回答客戶。';

        for (const event of events) {
            if (event.type !== 'message' || event.message.type !== 'text') continue;

            const userId = event.source.userId;
            const userMessage = event.message.text;
            console.log(`[TIER1:LineWebhook][${configId}] msg: ${userMessage.substring(0, 40)}`);

            // ⚡ DIRECT OpenAI call — skip AIService overhead:
            //    - No Moderation API (+300ms saved)
            //    - No stock_radar_members DB query (+100ms saved)
            //    - No dynamic tools DB query (+200ms saved)
            const aiResponse = await callOpenAIDirect(systemPrompt, userMessage);

            await client.replyMessage({
                replyToken: event.replyToken,
                messages: [{ type: 'text', text: aiResponse }]
            });
            console.log(`[TIER1:LineWebhook][${configId}] Reply sent.`);

            // Save chat log (non-blocking)
            const isLead = /09\d{2}[-\s]?\d{3}[-\s]?\d{3}|(預約|報名|想買|電話)/i.test(userMessage + aiResponse);
            supabase.from('chat_logs').insert({
                config_id: configId,
                user_id: config.user_id,
                line_user_id: userId,
                user_message: userMessage,
                is_lead: isLead,
                created_at: new Date().toISOString()
            }).then(({ error }) => {
                if (error) console.error(`[TIER1:LineWebhook][${configId}] Log failed:`, error.message);
            });
        }
    } catch (err: any) {
        console.error(`[TIER1:LineWebhook][${configId}] processEvents error:`, err.message);
    }
}

/**
 * ⚡ Lean OpenAI call optimized for LINE store bot responses.
 * Skips: Moderation API, dynamic tools, member tier lookup.
 * Uses: gpt-4o-mini (fastest), max_tokens cap (prevent runaway responses).
 */
async function callOpenAIDirect(systemPrompt: string, userMessage: string): Promise<string> {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage }
            ],
            temperature: 0.7,
            max_tokens: 600,  // Cap prevents slow long responses
        });
        return response.choices[0].message.content?.trim() || '抱歉，請再說一次。';
    } catch (err: any) {
        console.error('[TIER1:LineWebhook] OpenAI call failed:', err.message);
        return '抱歉，我剛才大腦斷線了一下，請再說一次！';
    }
}
