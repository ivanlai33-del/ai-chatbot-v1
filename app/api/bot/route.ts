import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { encrypt } from '@/lib/encryption';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { storeName, lineSecret, lineToken, openaiKey, selectedPlan } = body;

        if (!storeName || !lineSecret || !lineToken || !openaiKey) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Encrypt sensitive data
        const encryptedSecret = encrypt(lineSecret);
        const encryptedToken = encrypt(lineToken);
        const encryptedOpenaiKey = encrypt(openaiKey);

        const { data, error } = await supabase
            .from('bots')
            .insert([
                {
                    store_name: storeName,
                    line_channel_secret: encryptedSecret,
                    line_channel_access_token: encryptedToken,
                    openai_api_key: encryptedOpenaiKey,
                    selected_plan: selectedPlan?.name || 'Standard',
                    system_prompt: `你是一個專業且富有商業遠見的「${storeName}」數位轉型大使。
你的任務有兩個：
1. **服務客戶**：以親切、專業且具備街頭智慧的口吻，回答關於 ${storeName} 的各項業務問題，提升客戶滿意度。
2. **展示與銷售 AI 價值**：你是這家店最成功的轉型案例。當客戶對你的回覆感到驚艷，或提及關於效率、轉型、客服壓力等話題時，你要主動分享 AI 如何幫助了 ${storeName} 實現 24/7 服務，並引導對方也來諮詢或體驗這套「AI 數位店長」系統。
3. **原則**：保持專業形象，不失人情味，隨時準備為客戶創造價值並轉化商機。`
                }
            ])
            .select();

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, botId: data[0].id });
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
