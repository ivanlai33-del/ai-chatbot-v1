import { NextResponse } from 'next/server';

/**
 * 處理藍新金流的 ReturnURL 跳轉
 * 藍新會使用 POST 方法將使用者導回此頁面
 */
export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const data = Object.fromEntries(formData.entries());
        
        console.log('[NewebPay Return] Received POST data:', data);

        // 將 POST 轉換為 GET，重新導向至成功頁面
        // 我們可以把藍新傳回來的參數帶在 URL 上，方便頁面顯示狀態
        const response = NextResponse.redirect(new URL('/dashboard/billing/success', request.url), {
            status: 303, // See Other
        });

        return response;
    } catch (error) {
        console.error('[NewebPay Return] Error processing redirect:', error);
        return NextResponse.redirect(new URL('/dashboard/billing/success', request.url));
    }
}
