import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { brandId, branches, mgmtToken } = body;

        // 1. Simple Auth (In production, use real session/token auth)
        if (!mgmtToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!branches || !Array.isArray(branches)) {
            return NextResponse.json({ error: 'Invalid branches data' }, { status: 400 });
        }

        const results = [];
        for (const branch of branches) {
            const { storeName, lineSecret, lineToken, address, customPrompt } = branch;

            // 2. Create Bot for each branch
            const { data, error } = await supabase
                .from('bots')
                .insert([
                    {
                        store_name: storeName,
                        brand_id: brandId,
                        owner_type: 'hq',
                        line_channel_secret: lineSecret,
                        line_channel_access_token: lineToken,
                        system_prompt: customPrompt || `這是連鎖品牌的分店：${storeName}。地址：${address}`,
                        status: 'active'
                    }
                ])
                .select();

            if (!error) results.push(data[0].id);
        }

        return NextResponse.json({
            success: true,
            createdCount: results.length,
            ids: results
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
