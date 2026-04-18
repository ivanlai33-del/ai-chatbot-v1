import { NextRequest, NextResponse } from 'next/server';
import { getGoogleAccessToken } from '@/lib/google-jwt';
import { supabase } from '@/lib/supabase';
import axios from 'axios';

import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
    try {
        let gscConfig: any = null;
        try {
            const configPath = path.join(process.cwd(), 'gsc-key.json');
            if (fs.existsSync(configPath)) {
                gscConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                console.log('[GSC Sync] Using local gsc-key.json');
            }
        } catch (e) {
            console.warn('[GSC Sync] Native config read failed, using env');
        }

        const clientEmail = gscConfig?.client_email || process.env.GSC_CLIENT_EMAIL;
        const rawKey = gscConfig?.private_key || process.env.GSC_PRIVATE_KEY || '';
        
        // 🚀 保持最強大的金鑰解析邏輯
        const base64Body = rawKey
            .replace(/-----BEGIN PRIVATE KEY-----/g, '')
            .replace(/-----END PRIVATE KEY-----/g, '')
            .replace(/\\n/g, '')
            .replace(/\s+/g, '')
            .replace(/"/g, '')
            .trim();

        const privateKey = `-----BEGIN PRIVATE KEY-----\n${base64Body.match(/.{1,64}/g)?.join('\n')}\n-----END PRIVATE KEY-----\n`;

        const siteUrl = 'https://bot.ycideas.com';

        if (!clientEmail || !privateKey || !base64Body) {
            return NextResponse.json({ 
                success: false, 
                error: `Missing GSC credentials (Email: ${!!clientEmail}, Key: ${!!privateKey})` 
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
