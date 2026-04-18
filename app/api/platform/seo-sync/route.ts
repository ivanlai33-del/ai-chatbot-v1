import { NextRequest, NextResponse } from 'next/server';
import { getGoogleAccessToken } from '@/lib/google-jwt';
import { supabase } from '@/lib/supabase';
import axios from 'axios';

export async function POST(req: NextRequest) {
    try {
        const clientEmail = process.env.GSC_CLIENT_EMAIL;
        const rawKey = process.env.GSC_PRIVATE_KEY || '';
        
        // 🚀 暴力標準化：移除所有現有的標籤與空白，只留下 Base64 核心
        // 注意：不論用戶貼入的是 \\n 還是真實換行，全部過濾掉
        const base64Body = rawKey
            .replace(/-----BEGIN PRIVATE KEY-----/g, '')
            .replace(/-----END PRIVATE KEY-----/g, '')
            .replace(/\\n/g, '')
            .replace(/\s+/g, '')
            .replace(/"/g, '')
            .trim();

        // 重新拼接成完美的 64 字元換行 PKCS#8 格式
        const privateKey = `-----BEGIN PRIVATE KEY-----\n${base64Body.match(/.{1,64}/g)?.join('\n')}\n-----END PRIVATE KEY-----\n`;

        const siteUrl = 'https://bot.ycideas.com';

        if (!clientEmail || !privateKey) {
            return NextResponse.json({ 
                success: false, 
                error: `Missing GSC credentials in env (Email: ${!!clientEmail}, Key: ${!!privateKey})` 
            }, { status: 500 });
        }

        // 1. Get Access Token
        let accessToken;
        try {
            accessToken = await getGoogleAccessToken(
                clientEmail,
                privateKey,
                ['https://www.googleapis.com/auth/webmasters.readonly']
            );
        } catch (authErr: any) {
            console.error('[GSC Sync] Auth failed:', authErr.message);
            return NextResponse.json({ success: false, error: 'Auth Failed: ' + authErr.message }, { status: 500 });
        }

        // 2. Query Search Console (Top 10 Keywords - Last 30 Days)
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        try {
            const gscRes = await axios.post(
                `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
                {
                    startDate,
                    endDate,
                    dimensions: ['query'],
                    rowLimit: 12,
                    aggregationType: 'auto'
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const rows = gscRes.data.rows || [];
            console.log(`[GSC Sync] Fetched ${rows.length} keywords`);

            // 3. Save to Supabase
            const statsToInsert = rows.map((row: any) => ({
                keyword: row.keys[0],
                clicks: row.clicks,
                impressions: row.impressions,
                ctr: row.ctr,
                position: row.position,
                synced_at: new Date().toISOString()
            }));

            if (statsToInsert.length > 0) {
                const { error: upsertError } = await supabase
                    .from('seo_stats')
                    .upsert(statsToInsert, { onConflict: 'keyword, synced_at' });

                if (upsertError) {
                    throw new Error('Supabase Error: ' + upsertError.message);
                }
            }

            return NextResponse.json({ 
                success: true, 
                count: statsToInsert.length,
                keywords: statsToInsert.slice(0, 3).map((s: any) => s.keyword)
            });

        } catch (gscErr: any) {
            console.error('[GSC Sync] API failed:', gscErr.response?.data || gscErr.message);
            return NextResponse.json({ 
                success: false, 
                error: gscErr.response?.data?.error?.message || gscErr.message 
            }, { status: 500 });
        }

    } catch (err: any) {
        console.error('[GSC Sync] Internal Error:', err.response?.data || err.message);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
