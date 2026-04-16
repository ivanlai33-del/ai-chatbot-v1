import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    // 🔒 安全守衛：僅限管理員查看
    const ADMIN_ID = "Ud8b8dd79162387a80b2b5a4aba20f604";
    if (userId !== ADMIN_ID) {
        return NextResponse.json({ error: 'Unauthorized Access to Intelligence' }, { status: 403 });
    }

    try {
        // 1. 抓取最近 30 天的原始數據 (限制數量以防效能問題，未來可優化為定期統計表)
        const { data: rawLogs, error: logsErr } = await supabase
            .from('platform_visitor_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(500);

        if (logsErr) throw logsErr;

        // 2. 數據聚合處理
        const utmMap: Record<string, number> = {};
        const contentTagMap: Record<string, number> = {};
        const deviceMap: Record<string, number> = {};
        const cityMap: Record<string, number> = {};
        const siteMap: Record<string, number> = {};

        rawLogs?.forEach(log => {
            // 站台分布統計 (從 page_url 提取 Host)
            try {
                if (log.page_url) {
                    const url = new URL(log.page_url);
                    const host = url.hostname;
                    siteMap[host] = (siteMap[host] || 0) + 1;
                } else {
                    siteMap['未知站台'] = (siteMap['未知站台'] || 0) + 1;
                }
            } catch (e) {
                siteMap['其它來源'] = (siteMap['其它來源'] || 0) + 1;
            }

            // UTM 來源統計
            const source = log.utm_source || '直接流量 (Direct)';
            utmMap[source] = (utmMap[source] || 0) + 1;

            // 裝置統計
            const device = log.device_type || 'Desktop';
            deviceMap[device] = (deviceMap[device] || 0) + 1;

            // 城市統計
            const city = log.city || '未知';
            cityMap[city] = (cityMap[city] || 0) + 1;

            // 內容標籤統計
            if (Array.isArray(log.content_tags)) {
                log.content_tags.forEach((tag: string) => {
                    contentTagMap[tag] = (contentTagMap[tag] || 0) + 1;
                });
            }
        });

        // 3. 格式化為前端圖表需要的格式
        const siteData = Object.entries(siteMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        const utmData = Object.entries(utmMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        const contentTags = Object.entries(contentTagMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        const cities = Object.entries(cityMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        return NextResponse.json({
            success: true,
            summary: {
                totalVisitors: rawLogs?.length || 0,
                siteData,
                utmData,
                contentTags,
                deviceMap,
                cities,
                latestLogs: rawLogs?.slice(0, 10)
            }
        });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
