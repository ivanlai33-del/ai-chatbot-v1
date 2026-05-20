import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const isPopup = searchParams.get('popup') === 'true';
    
    const channelId = process.env.LINE_LOGIN_CHANNEL_ID;
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const baseUrl = `${protocol}://${host}`;
    const redirectUri = encodeURIComponent(`${baseUrl}/api/auth/callback/line`);
    
    // Simplified state: avoid base64/JSON encoding issues in URLs
    const state = isPopup ? `popup_${Math.random().toString(36).substring(2, 10)}` : Math.random().toString(36).substring(2, 10);
    
    const lineAuthUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${channelId}&redirect_uri=${redirectUri}&state=${state}&scope=profile%20openid%20email`;

    return NextResponse.redirect(lineAuthUrl);
}
