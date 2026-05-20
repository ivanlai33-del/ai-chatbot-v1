import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
    const code = req.nextUrl.searchParams.get('code');
    const state = req.nextUrl.searchParams.get('state');
    const error = req.nextUrl.searchParams.get('error');

    const isPopup = state?.startsWith('popup_') || false;

    if (error) {
        if (isPopup) {
            return new NextResponse(`<html><body><script>window.opener.postMessage({ type: 'LINE_LOGIN_ERROR', error: '${error}' }, '*'); window.close();</script></body></html>`, { headers: { 'Content-Type': 'text/html' } });
        }
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?auth_error=${error}`);
    }

    if (!code) {
        if (isPopup) {
            return new NextResponse(`<html><body><script>window.opener.postMessage({ type: 'LINE_LOGIN_ERROR', error: 'no_code' }, '*'); window.close();</script></body></html>`, { headers: { 'Content-Type': 'text/html' } });
        }
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?auth_error=no_code`);
    }

    try {
        // ... exchange ...
        const tokenResponse = await axios.post('https://api.line.me/oauth2/v2.1/token', 
            new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/callback/line`,
                client_id: process.env.LINE_LOGIN_CHANNEL_ID!,
                client_secret: process.env.LINE_LOGIN_CHANNEL_SECRET!,
            }).toString(),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        const { access_token } = tokenResponse.data;
        const profileResponse = await axios.get('https://api.line.me/v2/profile', {
            headers: { Authorization: `Bearer ${access_token}` }
        });

        const { userId, displayName } = profileResponse.data;

        if (isPopup) {
            const html = `
                <html>
                    <head>
                        <title>驗證成功</title>
                        <style>
                            body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f4f7f6; }
                            .card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; }
                            .btn { background: #00b900; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; margin-top: 1rem; font-weight: bold; }
                        </style>
                    </head>
                    <body>
                        <div class="card">
                            <h2>身分驗證成功！</h2>
                            <p>正在為您跳轉，請稍候...</p>
                            <button class="btn" onclick="window.close()">關閉視窗</button>
                        </div>
                        <script>
                            // Send message to parent window
                            window.opener.postMessage({
                                type: 'LINE_LOGIN_SUCCESS',
                                line_id: '${userId}',
                                line_name: '${displayName.replace(/'/g, "\\'")}'
                            }, '*');
                            
                            // Small delay to ensure postMessage is processed before closure
                            setTimeout(() => {
                                window.close();
                            }, 100);
                        </script>
                    </body>
                </html>
            `;
            const res = new NextResponse(html, { headers: { 'Content-Type': 'text/html' } });
            res.cookies.set('line_user_id', userId, { maxAge: 3600, path: '/' });
            res.cookies.set('line_user_name', displayName, { maxAge: 3600, path: '/' });
            return res;
        }
        
        const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?line_id=${userId}&line_name=${encodeURIComponent(displayName)}`);
        response.cookies.set('line_user_id', userId, { maxAge: 3600, path: '/' });
        response.cookies.set('line_user_name', displayName, { maxAge: 3600, path: '/' });
        return response;

    } catch (err: any) {
        console.error('LINE Callback Error:', err.response?.data || err.message);
        if (isPopup) {
            return new NextResponse(`<html><body><script>window.opener.postMessage({ type: 'LINE_LOGIN_ERROR', error: 'server_error' }, '*'); window.close();</script></body></html>`, { headers: { 'Content-Type': 'text/html' } });
        }
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?auth_error=server_error`);
    }
}
