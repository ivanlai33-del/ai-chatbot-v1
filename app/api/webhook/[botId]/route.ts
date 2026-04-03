/**
 * ============================================================
 * 🏆 TIER-1: LINE Webhook Entry Point
 * ============================================================
 * 職責：接收 LINE 的 Webhook 請求，立刻回 200，
 *       然後將事件交給 StoreManagerEngine 在背景處理。
 *
 * ⚠️  這個檔案只做「接收與分派」，不含任何業務邏輯。
 *     商品機器人的所有邏輯在：
 *     lib/bots/store-manager/StoreManagerEngine.ts
 */

import { NextResponse } from 'next/server';
import { WebhookEvent } from '@line/bot-sdk';
import { processStoreEvents } from '@/lib/bots/store-manager/StoreManagerEngine';

export async function GET() {
    return new Response('TIER-1 Store Bot Webhook is Active.', { status: 200 });
}

export async function POST(
    req: Request,
    { params }: { params: { botId: string } }
) {
    const botId = params.botId;

    let body: any;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ status: 'ok' });
    }

    const events: WebhookEvent[] = body.events || [];
    if (events.length === 0) return NextResponse.json({ status: 'ok' });

    // ✅ Fire-and-forget: 立刻回 200 給 LINE，
    //    讓 StoreManagerEngine 在背景完整執行（slot 一定被釋放）
    processStoreEvents(botId, events).catch((err: any) => {
        console.error(`[TIER1:Webhook] Unhandled error for bot ${botId}:`, err?.message);
    });

    return NextResponse.json({ status: 'ok' });
}
