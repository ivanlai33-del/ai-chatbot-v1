import { NextRequest, NextResponse } from 'next/server';
import { getGoogleAccessToken } from '@/lib/google-jwt';
import { supabase } from '@/lib/supabase';
import axios from 'axios';

export async function POST(req: NextRequest) {
    try {
        const clientEmail = process.env.GSC_CLIENT_EMAIL;
        const privateKey = process.env.GSC_PRIVATE_KEY?.replace(/\\n/g, '\n'); 
        const siteUrl = 'https://bot.ycideas.com';

        if (!clientEmail || !privateKey) {
            return NextResponse.json({ success: false, error: 'Missing GSC credentials in env' }, { status: 500 });
        }

        // 1. Get Access Token
        const accessToken = await getGoogleAccessToken(
            clientEmail,
            privateKey,
            ['https://www.googleapis.com/auth/webmasters.readonly']
        );

        // 2. Query Search Console (Top 10 Keywords - Last 30 Days)
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

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
                console.error('[GSC Sync] Supabase upsert failed:', upsertError.message);
                return NextResponse.json({ success: false, error: upsertError.message }, { status: 500 });
            }
        }

        return NextResponse.json({ 
            success: true, 
            count: statsToInsert.length,
            keywords: statsToInsert.slice(0, 3).map((s: any) => s.keyword)
        });

    } catch (err: any) {
        console.error('[GSC Sync] Internal Error:', err.response?.data || err.message);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
