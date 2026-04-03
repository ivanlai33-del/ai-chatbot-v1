/**
 * ============================================================
 * 🏆 TIER-1: LINE Webhook Entry Point
 * ============================================================
 * 職責：接收 LINE 的 Webhook 請求，執行完整處理後回 200。
 *
 * ⚠️  Vercel Serverless 限制：Response 送出後背景任務會被強制終止。
 *     因此必須 await processStoreEvents() 先完成再回傳。
 *     用 waitUntil 或 streaming 來繞過此限制的方案不可靠，
 *     最穩定的做法是直接 await，並設定合理的 maxDuration。
 *
 * ✅  所有業務邏輯在：lib/bots/store-manager/StoreManagerEngine.ts
 */

import { NextResponse } from 'next/server';
import { WebhookEvent } from '@line/bot-sdk';
import { processStoreEvents } from '@/lib/bots/store-manager/StoreManagerEngine';

// Vercel Pro/Team 可設定最長 300 秒，Hobby 最長 60 秒
export const maxDuration = 60;

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

    // ✅ 必須 await：Vercel Serverless 在 response 送出後會殺掉所有背景任務。
    //    processStoreEvents 內部會以並行方式處理，速度不受影響。
    //    LINE 的 5 秒 Reply Token 限制由引擎內部的 replyMessage 處理。
    try {
        await processStoreEvents(botId, events);
    } catch (err: any) {
        console.error(`[TIER1:Webhook] Error for bot ${botId}:`, err?.message);
    }

    return NextResponse.json({ status: 'ok' });
}
