import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabase } from '@/lib/supabase';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// 動態建構英文版 LINE 圖文選單提示詞（仿照 gpt-image-2 最佳實踐格式）
function buildRichMenuPrompt(content: string, style: string, layout: string, buttons: any): string {
    let layoutInstruction = '';
    let buttonLabels = '';
    let targetSize = '2500x1686 pixels (Full Size)';

    if (layout === '1-3') {
        const b1 = buttons?.button1 || 'Main';
        const b2 = buttons?.button2 || 'Option A';
        const b3 = buttons?.button3 || 'Option B';
        const b4 = buttons?.button4 || 'Option C';
        layoutInstruction = `Layout: Full Size (2500x1686). Top 65 percent is an illustration area themed around: "${content}". Bottom 35 percent is a horizontal menu bar with exactly 3 evenly spaced touch buttons labeled: "${b2}", "${b3}", "${b4}". Above the 3 buttons, a full-width header label reads: "${b1}".`;
        buttonLabels = `"${b1}", "${b2}", "${b3}", "${b4}"`;
    } else if (layout === 'compact-3') {
        targetSize = '2500x843 pixels (Compact Size)';
        const b1 = buttons?.button1 || 'Menu 1';
        const b2 = buttons?.button2 || 'Menu 2';
        const b3 = buttons?.button3 || 'Menu 3';
        layoutInstruction = `Layout: Compact Size (2500x843). This is a single row menu. Split the horizontal area into 3 exactly equal rectangular buttons from left to right, labeled: "${b1}", "${b2}", "${b3}". The theme is: "${content}".`;
        buttonLabels = `"${b1}", "${b2}", "${b3}"`;
    } else {
        const btns = [1,2,3,4,5,6].map(i => buttons?.[`button${i}`] || `Button ${i}`);
        layoutInstruction = `Layout: Full Size (2500x1686). Grid layout with exactly 6 equal rectangular buttons arranged in 2 rows and 3 columns. Row 1: "${btns[0]}", "${btns[1]}", "${btns[2]}". Row 2: "${btns[3]}", "${btns[4]}", "${btns[5]}".`;
        buttonLabels = btns.map(b => `"${b}"`).join(', ');
    }

    return `Professional LINE rich menu UI design. 
Target Dimensions: ${targetSize}.
${layoutInstruction}
Visual style: ${style}.
Design rules:
- Buttons should be creatively integrated with the background theme "${content}".
- Feel free to use modern UI elements: subtle gradients, soft shadows, glassmorphism effects, or creative organic shapes for buttons.
- Ensure the button labels (${buttonLabels}) are highly legible with high contrast against their respective areas.
- Maintain a clean grid layout where the logical center of each button aligns with the specified ${layout} structure.
- Use a harmonious and premium color palette inspired by ${style}.
- NO phone frames, NO browser UI, NO random gibberish text.
- Each interactive zone must be visually distinct but artistically unified with the overall composition.
The final result must look like a high-end, custom-designed mobile app interface specifically for a LINE Official Account.`;
}

export async function POST(req: Request) {
    try {
        const { content, style, buttons, layout, userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: '未提供使用者識別碼' }, { status: 400 });
        }

        // 1. 檢查額度
        const { data: member, error: memberError } = await supabase
            .from('stock_radar_members')
            .select('message_credits')
            .eq('line_user_id', userId)
            .single();

        if (memberError || !member) {
            return NextResponse.json({ error: '找不到會員資料，請先完成身份驗證' }, { status: 404 });
        }

        if (member.message_credits < 100) {
            return NextResponse.json({ error: '額度不足，生成一張圖片需要 100 點額度' }, { status: 403 });
        }

        // 2. 建構 LINE 專屬提示詞
        const finalPrompt = buildRichMenuPrompt(content, style, layout, buttons);
        console.log('[Rich Menu] 生成提示詞：\n', finalPrompt);

        // 3. 呼叫 gpt-image-2 (改回橫向尺寸以符合 LINE 比例)
        const response = await openai.images.generate({
            model: "gpt-image-2",
            prompt: finalPrompt,
            n: 1,
            size: "1792x1024", 
            quality: "low",
        } as any);

        if (!response.data || response.data.length === 0) {
            throw new Error('AI 模型未回傳任何圖片數據');
        }
        const imgData = response.data[0];
        let imageUrl: string;
        
        if (imgData.url) {
            imageUrl = imgData.url;
        } else if ((imgData as any).b64_json) {
            // 如果是 base64，我們回傳一個 data URI，但前端會用這個 URL 呼叫 publish
            // 為了規避 413，我們這裡可以考慮上傳到 storage，但為了快速修復，
            // 我們先確保前端在呼叫 publish 時，如果是大數據則由後端下載。
            imageUrl = `data:image/png;base64,${(imgData as any).b64_json}`;
        } else {
            throw new Error('模型未回傳有效的圖片資料');
        }

        // 4. 扣除額度
        await supabase
            .from('stock_radar_members')
            .update({ message_credits: member.message_credits - 100 })
            .eq('line_user_id', userId);

        return NextResponse.json({ 
            success: true, 
            imageUrl,
            promptUsed: finalPrompt.substring(0, 300),
            remainingCredits: member.message_credits - 100
        });

    } catch (error: any) {
        console.error('AI Generation Error:', error);
        return NextResponse.json({ error: error.message || '生成失敗，請稍後再試' }, { status: 500 });
    }
}
