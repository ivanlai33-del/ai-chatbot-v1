import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { decrypt } from '@/lib/encryption';

export async function POST(req: NextRequest) {
    try {
        const { storeName, lineSecret } = await req.json();

        if (!storeName || !lineSecret) {
            return NextResponse.json({ error: '請提供店名與 Line Secret 以進行驗證' }, { status: 400 });
        }

        // 1. Fetch bots matching the store name
        const { data: bots, error } = await supabase
            .from('bots')
            .select('id, store_name, line_channel_secret, mgmt_token')
            .eq('store_name', storeName);

        if (error) {
            console.error('Recovery search error:', error);
            return NextResponse.json({ error: '搜尋過程中發生錯誤' }, { status: 500 });
        }

        if (!bots || bots.length === 0) {
            return NextResponse.json({ error: '找不到對應的店名，請檢查輸入是否正確' }, { status: 404 });
        }

        // 2. Verify Line Secret by decrypting stored values
        const matchedBot = bots.find(bot => {
            try {
                const decryptedSecret = decrypt(bot.line_channel_secret);
                return decryptedSecret === lineSecret;
            } catch (e) {
                return false;
            }
        });

        if (!matchedBot) {
            return NextResponse.json({ error: '授權驗證失敗，Line Secret 不正確' }, { status: 401 });
        }

        // 3. Return the management link info
        return NextResponse.json({
            success: true,
            botId: matchedBot.id,
            mgmtToken: matchedBot.mgmt_token
        });

    } catch (error: any) {
        console.error('Recovery API error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
