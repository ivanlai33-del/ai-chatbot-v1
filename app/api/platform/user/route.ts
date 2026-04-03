import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const requestedLineId = searchParams.get('lineUserId');
    
    // 從 Cookie 抓取真正在瀏覽器的 UID (由 LINE 登入時設定)
    const cookieHeader = req.headers.get('cookie') || '';
    const sessionUidMatch = cookieHeader.match(/line_user_id=([^;]+)/);
    const sessionUid = sessionUidMatch ? decodeURIComponent(sessionUidMatch[1]) : null;

    if (!requestedLineId) {
        return NextResponse.json({ success: false, error: 'Missing LINE ID' }, { status: 400 });
    }

    // 🚨 越權掃描：如果請求的 ID 跟登入的不同，判定為異常挖掘行為
    if (sessionUid && requestedLineId !== sessionUid) {
        console.error(`🚨 SECURITY ALERT: Potential IDOR attempt by ${sessionUid} trying to access ${requestedLineId}`);
        // 可以在此處將該 sessionUid 的風險值加分，或直接封號
        return NextResponse.json({ success: false, error: 'Unauthorized Access detected - Operation Logged' }, { status: 403 });
    }

    const { data: user, error } = await supabase
        .from('platform_users')
        .select('*')
        .eq('line_user_id', requestedLineId)
        .single();

    // 👮 封號檢查：如果用戶已被封鎖，直接回傳停權通知
    if (user && user.is_banned) {
        console.warn(`🛑 BANNED USER ATTEMPT: ${requestedLineId}`);
        return NextResponse.json({ 
            success: false, 
            error: 'ACCOUNT_BANNED', 
            message: '由於偵測到多次異常操作或違反資安條款，您的帳號已被系統永久停權。如果您有任何疑義，請聯繫官方客服。' 
        }, { status: 403 });
    }

    if (error && error.code !== 'PGRST116') {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: user || { plan_level: 0 } });
}
