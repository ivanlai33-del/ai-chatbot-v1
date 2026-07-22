import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const botId = searchParams.get('botId') || 'default-bot';

    const appId = process.env.THREADS_APP_ID || '1234567890';
    const redirectUri = encodeURIComponent(`https://bot.ycideas.com/api/modules/seo-geo/auth/threads/callback`);
    const scope = encodeURIComponent('threads_basic,threads_content_publish,threads_read_replies,threads_manage_replies');

    // 如果沒有真正的 Meta App ID，導向專屬測試授權開通 API
    if (!process.env.THREADS_APP_ID) {
        const testCallbackUrl = new URL(`/api/modules/seo-geo/auth/threads/callback?code=mock_code&botId=${botId}`, req.url);
        return NextResponse.redirect(testCallbackUrl);
    }

    const oauthUrl = `https://www.threads.net/oauth/authorize?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code&state=${botId}`;
    return NextResponse.redirect(oauthUrl);
}
