import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// LINE Rich Menu API 端點
const LINE_API = 'https://api.line.me/v2/bot/richmenu';
const LINE_DATA_API = 'https://api-data.line.me/v2/bot/richmenu';

// 根據版型和按鈕設定，建立 LINE Rich Menu areas 定義
function buildRichMenuAreas(layout: string, buttons: any, actions: any[]) {
    if (layout === '1-3') {
        // 尺寸：2500 x 1686，上方佔 65%，下方三等分
        const topHeight = Math.round(1686 * 0.65); // ~1096
        const bottomY = topHeight;
        const bottomHeight = 1686 - topHeight; // ~590
        const colWidth = Math.round(2500 / 3); // ~833

        return [
            // 上方大區塊
            {
                bounds: { x: 0, y: 0, width: 2500, height: topHeight },
                action: actions[0] || { type: 'message', text: buttons?.button1 || '主要功能' }
            },
            // 下方三個按鈕
            {
                bounds: { x: 0, y: bottomY, width: colWidth, height: bottomHeight },
                action: actions[1] || { type: 'message', text: buttons?.button2 || '按鈕2' }
            },
            {
                bounds: { x: colWidth, y: bottomY, width: colWidth, height: bottomHeight },
                action: actions[2] || { type: 'message', text: buttons?.button3 || '按鈕3' }
            },
            {
                bounds: { x: colWidth * 2, y: bottomY, width: 2500 - colWidth * 2, height: bottomHeight },
                action: actions[3] || { type: 'message', text: buttons?.button4 || '按鈕4' }
            },
        ];
    } else if (layout === 'compact-3') {
        // 緊湊型尺寸：2500 x 843，三等分
        const colWidth = Math.round(2500 / 3);
        const height = 843;
        return [
            {
                bounds: { x: 0, y: 0, width: colWidth, height },
                action: actions[0] || { type: 'message', text: buttons?.button1 || '按鈕1' }
            },
            {
                bounds: { x: colWidth, y: 0, width: colWidth, height },
                action: actions[1] || { type: 'message', text: buttons?.button2 || '按鈕2' }
            },
            {
                bounds: { x: colWidth * 2, y: 0, width: 2500 - colWidth * 2, height },
                action: actions[2] || { type: 'message', text: buttons?.button3 || '按鈕3' }
            }
        ];
    } else {
        // 6等分：2列3欄 (2500 x 1686)
        const colWidth = Math.round(2500 / 3);
        const rowHeight = Math.round(1686 / 2);
        const areas = [];
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 3; col++) {
                const idx = row * 3 + col;
                areas.push({
                    bounds: {
                        x: col * colWidth,
                        y: row * rowHeight,
                        width: col === 2 ? 2500 - colWidth * 2 : colWidth,
                        height: row === 1 ? 1686 - rowHeight : rowHeight,
                    },
                    action: actions[idx] || { type: 'message', text: buttons?.[`button${idx + 1}`] || `按鈕${idx + 1}` }
                });
            }
        }
        return areas;
    }
}

export async function POST(req: Request) {
    try {
        const { botId, imageUrl, layout, buttons, actions, menuName } = await req.json();

        if (!botId || !imageUrl) {
            return NextResponse.json({ error: '缺少必要參數 (botId, imageUrl)' }, { status: 400 });
        }

        // 1. 從資料庫取得 Channel Access Token (修正表格名稱為 line_channel_configs)
        const { data: bot, error: botError } = await supabase
            .from('line_channel_configs')
            .select('channel_access_token')
            .eq('id', botId)
            .single();

        if (botError || !bot?.channel_access_token) {
            console.error('[Rich Menu Publish] DB Error or Token Missing:', { botId, error: botError });
            return NextResponse.json({ error: `找不到 LINE 串接金鑰 (ID: ${botId})，請先確認「LINE 連結設定」已完成且已存檔。` }, { status: 400 });
        }

        const token = bot.channel_access_token;
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        };

        // 2. 建立 Rich Menu 結構
        const areas = buildRichMenuAreas(layout, buttons, actions || []);
        const richMenuBody = {
            size: { width: 2500, height: 1686 },
            selected: true,
            name: menuName || '圖文選單',
            chatBarText: '點選開啟選單',
            areas,
        };

        const createRes = await fetch(LINE_API, {
            method: 'POST',
            headers,
            body: JSON.stringify(richMenuBody),
        });

        if (!createRes.ok) {
            const errText = await createRes.text();
            return NextResponse.json({ error: `LINE API 建立選單失敗: ${errText}` }, { status: 500 });
        }

        const { richMenuId } = await createRes.json();

        // 3. 上傳圖片到 LINE
        let imageBuffer: Buffer;
        let contentType = 'image/png';

        if (imageUrl.startsWith('data:')) {
            // 如果是 base64，我們在這裡處理，但建議前端傳 URL
            const base64Data = imageUrl.split(',')[1];
            imageBuffer = Buffer.from(base64Data, 'base64');
            contentType = imageUrl.split(';')[0].split(':')[1] || 'image/png';
        } else {
            // 直接從 URL 下載，這樣前端傳過來的 JSON 就很小，不會觸發 Nginx 413 錯誤
            const imgRes = await fetch(imageUrl);
            if (!imgRes.ok) throw new Error('無法從來源下載圖片');
            const arrayBuffer = await imgRes.arrayBuffer();
            imageBuffer = Buffer.from(arrayBuffer);
            contentType = imgRes.headers.get('content-type') || 'image/png';
        }

        console.log(`[Rich Menu] 準備上傳圖片, 大小: ${imageBuffer.length} bytes, 類型: ${contentType}`);

        const uploadRes = await fetch(`${LINE_DATA_API}/${richMenuId}/content`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': contentType,
            },
            body: imageBuffer,
        });

        if (!uploadRes.ok) {
            const errText = await uploadRes.text();
            // 已建立選單但圖片上傳失敗，嘗試刪除
            await fetch(`${LINE_API}/${richMenuId}`, { method: 'DELETE', headers });
            return NextResponse.json({ error: `圖片上傳失敗: ${errText}` }, { status: 500 });
        }

        // 4. 設為預設選單（套用到所有用戶）
        const defaultRes = await fetch(`https://api.line.me/v2/bot/user/all/richmenu/${richMenuId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!defaultRes.ok) {
            const errText = await defaultRes.text();
            return NextResponse.json({
                success: true,
                richMenuId,
                warning: `選單已建立但設定預設失敗: ${errText}，請至 LINE Official Account Manager 手動設定`,
            });
        }

        return NextResponse.json({
            success: true,
            richMenuId,
            message: '圖文選單已成功發佈到 LINE，並設為所有用戶的預設選單！',
        });

    } catch (error: any) {
        console.error('Rich Menu Publish Error:', error);
        return NextResponse.json({ error: error.message || '發佈失敗' }, { status: 500 });
    }
}
