import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { encrypt } from '@/lib/encryption';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { storeName, lineSecret, lineToken, openaiKey, selectedPlan, businessIndustry, businessMission, ownerLineId, sessionId } = body;

        // Validation: Only require OpenAI Key for non-managed plans
        const planName = selectedPlan?.name || "";
        const isManagedPlan = 
            planName.includes('199') ||
            planName.includes('499') ||
            planName.includes('1299') ||
            planName.includes('2490') ||
            planName.includes('4990') ||
            planName.includes('7990') ||
            planName.includes('入門') ||
            planName.includes('單店') ||
            planName.includes('成長多店') ||
            planName.includes('連鎖專業') ||
            planName.includes('旗艦') ||
            planName.includes('1199') ||
            planName.includes('強力') ||
            planName.includes('會計');

        const finalStoreName = storeName || "我的 AI 店長";
        const finalIndustry = businessIndustry || "通用服務業";
        const finalMission = businessMission || "回答顧客問題並提升滿意度";

        // 🛡️ DEDUPLICATION LOGIC:
        if (ownerLineId && finalStoreName) {
            const { data: existingBots } = await supabase
                .from('bots')
                .select('id')
                .eq('owner_line_id', ownerLineId)
                .eq('store_name', finalStoreName);

            if (existingBots && existingBots.length > 0) {
                const botId = existingBots[0].id;
                
                const encryptedSecret = encrypt(lineSecret);
                const encryptedToken = encrypt(lineToken);
                const encryptedOpenaiKey = openaiKey ? encrypt(openaiKey) : "";

                const { error: updateError } = await supabase
                    .from('bots')
                    .update({
                        line_channel_secret: encryptedSecret,
                        line_channel_access_token: encryptedToken,
                        openai_api_key: encryptedOpenaiKey,
                        selected_plan: selectedPlan?.name || 'Standard',
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', botId);

                if (updateError) {
                    console.error('Supabase Update Error:', updateError);
                    return NextResponse.json({ error: updateError.message }, { status: 500 });
                }

                return NextResponse.json({
                    success: true,
                    botId: botId,
                    message: 'Existing Store Updated'
                });
            }
        }

        // Try to load Brand DNA collected during pre-sales chat
        let dna: Record<string, string> = {};
        if (sessionId) {
            const { data: dnaRow } = await supabase
                .from('brand_dna')
                .select('*')
                .eq('session_id', sessionId)
                .single();
            if (dnaRow) dna = dnaRow;
        }

        const dnaIndustry   = dna.industry_type   || finalIndustry;
        const dnaCompany    = dna.company_name     || finalStoreName;
        const dnaServices   = dna.main_services    || finalMission;
        const dnaAudience   = dna.target_audience  || '';
        const dnaContact    = dna.contact_info     || '';

        const systemPrompt = [
            `你是【${dnaCompany}】的 AI 店長，全天候為客人服務。`,
            dnaIndustry   ? `你的行業是：${dnaIndustry}。` : '',
            dnaServices   ? `你主打的服務是：${dnaServices}。` : '',
            dnaAudience   ? `你的主要客群是：${dnaAudience}。` : '',
            dnaContact    ? `如客人需要進一步聯繫，可提供：${dnaContact}。` : '',
            '',
            '### 你的核心任務 (The Double-Hook)：',
            '1. **溫暖服務**：以親切、專業且具備商業感（Emoji 點綴）的口吻回答問題。',
            '2. **主動引導**：回答問題後，必須主動詢問顧客一個與服務相關的問題（例如：「想了解哪種款式？」或「預約明天下午三點有空嗎？」）。',
            '3. **AI 價值轉場**：每 3-5 次對話中，適時提到：「雖然我不是人類，但我能 24 小時守在店裡回覆您，老闆很放心！」',
            '4. **原則**：你是店家的門面，嚴禁敷衍。',
        ].filter(Boolean).join('\n');

        if (!lineSecret) {
            return NextResponse.json({ error: '請填寫 Line Channel Secret' }, { status: 400 });
        }
        if (!lineToken) {
            return NextResponse.json({ error: '請填寫 Line Access Token' }, { status: 400 });
        }
        if (!isManagedPlan && !openaiKey) {
            return NextResponse.json({ error: '此方案需要提供 OpenAI API Key' }, { status: 400 });
        }

        // Encrypt sensitive data
        const encryptedSecret = encrypt(lineSecret);
        const encryptedToken = encrypt(lineToken);
        const encryptedOpenaiKey = openaiKey ? encrypt(openaiKey) : "";

        const mgmtToken = crypto.randomUUID();

        const { data, error } = await supabase
            .from('bots')
            .insert([
                {
                    store_name: finalStoreName,
                    line_channel_secret: encryptedSecret,
                    line_channel_access_token: encryptedToken,
                    openai_api_key: encryptedOpenaiKey,
                    selected_plan: selectedPlan?.name || 'Standard',
                    mgmt_token: mgmtToken,
                    owner_line_id: ownerLineId || null,
                    system_prompt: systemPrompt,
                }
            ])
            .select();

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Back-fill bot_id into brand_dna so the lead is marked as converted
        if (sessionId && data?.[0]?.id) {
            supabase
                .from('brand_dna')
                .update({ bot_id: data[0].id })
                .eq('session_id', sessionId)
                .then(() => {}); 
        }

        return NextResponse.json({
            success: true,
            botId: data[0].id,
            mgmtToken: mgmtToken
        });
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const lineUserId = searchParams.get('lineUserId');

        if (!lineUserId) {
            return NextResponse.json({ error: 'Missing lineUserId' }, { status: 400 });
        }

        const { data: bots, error } = await supabase
            .from('bots')
            .select('id, store_name, status, mgmt_token')
            .eq('owner_line_id', lineUserId)
            .order('created_at', { ascending: false }); 

        if (error) {
            console.error('Supabase fetch error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            bots: bots || []
        });
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const botId = searchParams.get('botId');

        if (!botId) {
            return NextResponse.json({ error: 'Missing botId' }, { status: 400 });
        }

        // 1. Delete from line_channel_configs
        const { error: lineErr } = await supabase
            .from('line_channel_configs')
            .delete()
            .eq('id', botId);

        // 2. Delete from bots (it might be in either or both depending on setup stage)
        const { error: botErr } = await supabase
            .from('bots')
            .delete()
            .eq('id', botId);

        if (lineErr && botErr) {
            return NextResponse.json({ error: 'Failed to delete store' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
