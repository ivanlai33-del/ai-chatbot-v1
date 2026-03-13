import { NextResponse } from 'next/server';

export async function GET() {
    const channelId = process.env.LINE_LOGIN_CHANNEL_ID;
    const redirectUri = encodeURIComponent(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/callback/line`);
    const state = Math.random().toString(36).substring(2, 15);
    
    // In a real app, you'd store the state in a cookie to verify it later
    const lineAuthUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${channelId}&redirect_uri=${redirectUri}&state=${state}&scope=profile%20openid%20email`;

    return NextResponse.redirect(lineAuthUrl);
}
