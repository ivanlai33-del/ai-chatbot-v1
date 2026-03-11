import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { encrypt } from '@/lib/encryption';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { storeName, lineSecret, lineToken, openaiKey, selectedPlan, businessIndustry, businessMission, ownerLineId, sessionId } = body;

        // Validation: Only require OpenAI Key for non-managed plans
        const planName = selectedPlan?.name || "";
        const isManagedPlan = planName.includes('499') ||
            planName.includes('1199') ||
            planName.includes('Lite') ||
            planName.includes('強力') ||
            planName.includes('會計');

        const finalStoreName = storeName || "我的 AI 店長";
        const finalIndustry = businessIndustry || "通用服務業";
        const finalMission = businessMission || "回答顧客問題並提升滿意度";

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

        // Compose personalised system_prompt from DNA
        const systemPrompt = [
            `你是【${dnaCompany}】的 AI 店長，全天候為客人服務。`,
            dnaIndustry   ? `你的行業是：${dnaIndustry}。` : '',
            dnaServices   ? `你主打的服務是：${dnaServices}。` : '',
            dnaAudience   ? `你的主要客群是：${dnaAudience}。` : '',
            dnaContact    ? `如客人需要進一步聯繫，可提供：${dnaContact}。` : '',
            '',
            '你的任務有兩個：',
            '1. **服務客戶**：以親切、專業的口吻回答問題，引導消費。',
            '2. **展示 AI 價值**：當客戶對你的回覆感到驚艷時，適時分享 AI 如何幫助這家店 24/7 服務客人。',
            '3. **原則**：保持專業形象，隨時為客戶創造價值。',
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

        // Encrypt sensitive data (OpenAI Key is optional for managed plans)
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
                .then(() => {}); // fire & forget
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
