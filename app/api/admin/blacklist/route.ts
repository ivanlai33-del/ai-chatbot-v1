import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ADMIN_ID = "Ud8b8dd79162387a80b2b5a4aba20f604";

function getAdminId(req: Request): string | null {
    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader.match(/line_user_id=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
}

// ✅ GET: 取得所有用戶清單 (含封號狀態)
export async function GET(req: Request) {
    const adminId = getAdminId(req);
    if (adminId !== ADMIN_ID) {
        return NextResponse.json({ success: false, error: '權限不足：僅限系統管理員' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'all'; // all | banned | active

    let query = supabase
        .from('platform_users')
        .select('line_user_id, display_name, plan_level, is_banned, ban_reason, created_at, last_login_at, risk_score')
        .order('created_at', { ascending: false });

    if (filter === 'banned') query = query.eq('is_banned', true);
    if (filter === 'active') query = query.eq('is_banned', false);

    const { data, error } = await query;

    if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, users: data || [] });
}

// 🔨 POST: 封號 / 解封 / 記錄警告
export async function POST(req: Request) {
    const adminId = getAdminId(req);
    if (adminId !== ADMIN_ID) {
        return NextResponse.json({ success: false, error: '權限不足：僅限系統管理員' }, { status: 403 });
    }

    const body = await req.json();
    const { action, lineUserId, reason } = body;

    if (!lineUserId || !action) {
        return NextResponse.json({ success: false, error: '缺少必要參數' }, { status: 400 });
    }

    if (action === 'ban') {
        const { error } = await supabase
            .from('platform_users')
            .update({
                is_banned: true,
                ban_reason: reason || '違反平台使用條款 — 由管理員執行封號',
                banned_at: new Date().toISOString(),
                banned_by: adminId
            })
            .eq('line_user_id', lineUserId);

        if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        return NextResponse.json({ success: true, message: `✅ 帳號 ${lineUserId} 已成功停權` });
    }

    if (action === 'unban') {
        const { error } = await supabase
            .from('platform_users')
            .update({
                is_banned: false,
                ban_reason: null,
                banned_at: null,
                banned_by: null
            })
            .eq('line_user_id', lineUserId);

        if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        return NextResponse.json({ success: true, message: `✅ 帳號 ${lineUserId} 已成功解除停權` });
    }

    if (action === 'warn') {
        // 增加風險值（累積到一定程度可自動封號）
        const { data: user } = await supabase
            .from('platform_users')
            .select('risk_score')
            .eq('line_user_id', lineUserId)
            .single();

        const newScore = (user?.risk_score || 0) + 25;
        const shouldAutoBan = newScore >= 100;

        const { error } = await supabase
            .from('platform_users')
            .update({
                risk_score: newScore,
                is_banned: shouldAutoBan,
                ban_reason: shouldAutoBan ? '⚠️ 系統自動停權：累積風險值達到上限' : null
            })
            .eq('line_user_id', lineUserId);

        if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        return NextResponse.json({ 
            success: true, 
            message: shouldAutoBan ? `🚨 風險值滿載，帳號已自動停權！` : `⚠️ 警告已記錄，風險值：${newScore}/100`,
            autoBanned: shouldAutoBan
        });
    }

    return NextResponse.json({ success: false, error: '不支援的操作類型' }, { status: 400 });
}
