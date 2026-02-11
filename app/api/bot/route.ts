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
                    system_prompt: `你是一個專業的${storeName}服務大使，請用親切、專業、簡潔的口氣回答顧客問題。`
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
