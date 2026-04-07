import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { messagingApi } from '@line/bot-sdk';
import { FreemiumGuard } from '@/lib/services/FreemiumGuard';

export const maxDuration = 60; // Allow more time for large broadcasts

export async function POST(req: NextRequest) {
    try {
        const { botId, tags = [], message } = await req.json();

        if (!botId || !message) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        // 1. 取得店家設定與 LINE Access Token
        const { data: config, error: configError } = await supabase
            .from('line_channel_configs')
            .select('user_id, channel_access_token')
            .eq('id', botId)
            .single();

        if (configError || !config) {
            return NextResponse.json({ success: false, error: 'Channel config not found' }, { status: 404 });
        }

        // 🛡️ 方案額度與功能權限檢查
        const userPlan = await FreemiumGuard.getUserTier(config.user_id);
        if (userPlan < 2) {
            return NextResponse.json({ success: false, error: '此功能僅限「單店主力 (包含)」以上方案使用' }, { status: 403 });
        }

        // 目前暫時不強制扣費推播費用（未來需扣除 Token 或推播額度）
        // 可以串接 UsageService 檢查當月剩餘額度

        // 2. 獲取受眾名單
        let query = supabase.from('bot_customers').select('id, line_user_id').eq('bot_id', botId);
        
        let targetUserIds: string[] = [];

        if (tags && tags.length > 0) {
            // 如果有選標籤，透過關聯表篩選
            const { data: taggedData, error: tagError } = await supabase
                .from('bot_customer_tags')
                .select('customer_id')
                .in('tag_name', tags);
                
            if (tagError) throw tagError;
            
            const customerIds = Array.from(new Set(taggedData.map(t => t.customer_id)));
            if (customerIds.length === 0) {
                return NextResponse.json({ success: true, sentCount: 0, message: '沒有符合該標籤的受眾' });
            }
            
            const { data: targetCustomers } = await query.in('id', customerIds);
            targetUserIds = (targetCustomers || []).map(c => c.line_user_id);
        } else {
            // 沒有選標籤 = 全發
            const { data: allCustomers } = await query;
            targetUserIds = (allCustomers || []).map(c => c.line_user_id);
        }

        if (targetUserIds.length === 0) {
            return NextResponse.json({ success: true, sentCount: 0, message: '名單為空' });
        }

        // 3. 執行推播 (LINE Multi-cast API 每次最多 500 人)
        const client = new messagingApi.MessagingApiClient({
            channelAccessToken: config.channel_access_token
        });

        // Split into chunks of 500
        const chunkSize = 500;
        let sentCount = 0;
        
        for (let i = 0; i < targetUserIds.length; i += chunkSize) {
            const chunk = targetUserIds.slice(i, i + chunkSize);
            await client.multicast({
                to: chunk,
                messages: [{ type: 'text', text: message }]
            });
            sentCount += chunk.length;
        }

        // 紀錄推播記錄 (Optional: 未來可以加上 webhook/campaign 表格)
        
        return NextResponse.json({ success: true, sentCount });

    } catch (err: any) {
        console.error('[API:Broadcast] Error:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
