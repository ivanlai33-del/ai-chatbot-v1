import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabase } from '@/lib/supabase';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const ADMIN_ID = "Ud8b8dd79162387a80b2b5a4aba20f604";

    if (userId !== ADMIN_ID) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { data, error } = await supabase
            .from('console_chat_logs')
            .select('*')
            .eq('admin_id', userId)
            .order('created_at', { ascending: true })
            .limit(50);

        if (error) throw error;

        return NextResponse.json({ success: true, messages: data });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { messages, activeTab, contextData, adminId } = body;
        const ADMIN_ID = "Ud8b8dd79162387a80b2b5a4aba20f604";
        const effectiveAdminId = adminId || ADMIN_ID;

        // Save User Message
        const userMsg = messages[messages.length - 1];
        await supabase.from('console_chat_logs').insert({
            admin_id: effectiveAdminId,
            role: 'user',
            content: userMsg.content,
            active_tab: activeTab
        });

        const systemPrompt = `
你現在是「LINE AI Assistant 總指揮官 (AI Strategist)」。
你是 iVan 老闆在上帝視角後台的最高決策顧問。

## ⚠️ 絕對事實準則 (ANTI-HALLUCINATION) ⚠️
- 你只能根據下方【獲取的即時數據】進行分析。
- **嚴禁編造**任何不存在的用戶名、營收數字、或線索統計。
- 如果數據為空或不足，請直說「目前尚無數據可供分析」，並提供「如何開始收集數據」的具體動作建議。
- 你是數據驅動的顧問，不是科幻作家。誠實是你的核心競爭力。

## ⚠️ 輸出格式規則 (絕對執行) ⚠️
1. **強制空行**：每一點 (1. 2. 3.) 之間、標題與段落之間，必須加上一個完整的空行。
2. **極致簡練**：每句話不超過 15 個字，多用動詞，少用形容詞。
3. **區塊化顯示**：使用 Markdown 標題 (###) 區隔「數據現狀」與「建議對策」。
4. **Emoji 與標題加粗**：標題必須加粗，並在開頭使用一個適當的 Emoji。

## 範例格式：
### 📊 營運數據
1. **實時營收**：目前為 $0。

2. **活躍用戶**：目前為 0 位。

### 💡 戰略對策
- **啟動推廣**：立刻執行 SEO 優化。

---
【當前頁面場景】：${activeTab}
【獲取的即時數據】：
${JSON.stringify(contextData, null, 2)}
`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages
            ],
            temperature: 0.7,
        });

        const reply = response.choices[0].message.content || "";

        // Save Assistant Reply
        await supabase.from('console_chat_logs').insert({
            admin_id: effectiveAdminId,
            role: 'assistant',
            content: reply,
            active_tab: activeTab
        });

        return NextResponse.json({ success: true, message: reply });
    } catch (e: any) {
        console.error("Assistant API Error:", e);
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
