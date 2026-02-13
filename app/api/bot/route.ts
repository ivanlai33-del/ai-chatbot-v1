import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { encrypt } from '@/lib/encryption';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { storeName, lineSecret, lineToken, openaiKey, selectedPlan, businessIndustry, businessMission } = body;

        // Validation: Only require OpenAI Key for non-managed plans
        const planName = selectedPlan?.name || "";
        const isManagedPlan = planName.includes('399') ||
            planName.includes('990') ||
            planName.includes('Lite') ||
            planName.includes('會計');

        const finalStoreName = storeName || "我的 AI 店長";
        const finalIndustry = businessIndustry || "通用服務業";
        const finalMission = businessMission || "回答顧客問題並提升滿意度";

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
                    system_prompt: `你是一個專業且富有商業遠見的「${finalStoreName}」數位轉型大使。
你的產業類別是：${finalIndustry}。
你的核心任務是：${finalMission}。

你的任務有兩個：
1. **服務客戶**：以親切、專業且具備該行業特點的口吻，準確執行任務（${finalMission}）。
2. **展示與銷售 AI 價值**：你是這家店最成功的轉型案例。當客戶對你的回覆感到驚艷，或提及關於效率、轉型、客服壓力等話題時，你要主動分享 AI 如何幫助了這家店實現 24/7 服務，並引導對方也來諮詢或體驗這套「AI 數位店長」系統。
3. **原則**：保持專業形象，隨時準備為客戶創造價值並轉化商機。`
                }
            ])
            .select();

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
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
