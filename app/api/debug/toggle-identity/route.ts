import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * 身份切換偵錯 API
 * 用於讓管理員模擬一般使用者的身份與權限
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { mode } = body; // 'admin' 或 'free'

        const cookieStore = cookies();

        if (mode === 'free') {
            // 設定測試模式 Cookie，效期 2 小時
            cookieStore.set('x-admin-test-mode', 'free', {
                maxAge: 7200,
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
            });
            console.log('[Debug] Admin Test Mode: Enabled (Free Member Emulation)');
        } else {
            // 清除測試模式 Cookie
            cookieStore.delete('x-admin-test-mode');
            console.log('[Debug] Admin Test Mode: Disabled (Restored Super Admin)');
        }

        return NextResponse.json({ success: true, mode });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * 取得目前測試模式狀態
 */
export async function GET() {
    const cookieStore = cookies();
    const mode = cookieStore.get('x-admin-test-mode')?.value || 'admin';
    return NextResponse.json({ mode });
}
