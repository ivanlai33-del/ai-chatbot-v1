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
        const host = req.headers.get('host') || 'localhost:3000';
        const protocol = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
        const baseUrl = `${protocol}://${host}`;
        const redirectUri = `${baseUrl}/api/auth/callback/line`;

        // ... exchange ...
        const tokenResponse = await axios.post('https://api.line.me/oauth2/v2.1/token', 
            new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirectUri,
                client_id: process.env.LINE_LOGIN_CHANNEL_ID!,
                client_secret: process.env.LINE_LOGIN_CHANNEL_SECRET!,
            }).toString(),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        const { access_token } = tokenResponse.data;
        const profileResponse = await axios.get('https://api.line.me/v2/profile', {
            headers: { Authorization: `Bearer ${access_token}` }
        });

        const { userId, displayName, pictureUrl } = profileResponse.data;
        console.log('[LINE Callback] Profile received:', { userId, displayName, hasPicture: !!pictureUrl });

        // === MEMBER PERSISTENCE ===
        // Upsert into direct_users table (creates record on first login)
        const { data: memberData, error: upsertError } = await supabase
            .from('direct_users')
            .upsert({
                line_user_id: userId,
                display_name: displayName,
                avatar_url: pictureUrl || '',
            }, { onConflict: 'line_user_id', ignoreDuplicates: false })
            .select('id, plan_level, subscription_status')
            .single();

        if (upsertError) {
            console.error('[LINE Callback] Failed to upsert member:', upsertError.message);
        } else if (memberData) {
            // Auto-create store_configs row if not exists (Big 5 data scaffold)
            await supabase
                .from('store_configs')
                .upsert({ user_id: memberData.id }, { onConflict: 'user_id', ignoreDuplicates: true });
        }
        // ========================

        if (isPopup) {
            const html = `
                <html>
                    <head>
                        <meta charset="UTF-8">
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
                            window.opener.postMessage({
                                type: 'LINE_LOGIN_SUCCESS',
                                line_id: ${JSON.stringify(userId)},
                                line_name: ${JSON.stringify(displayName)},
                                line_picture: ${JSON.stringify(pictureUrl || '')}
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
            res.cookies.set('line_user_id', userId, { maxAge: 3600 * 24 * 7, path: '/' });
            res.cookies.set('line_user_name', displayName, { maxAge: 3600 * 24 * 7, path: '/' });
            res.cookies.set('line_user_picture', pictureUrl || '', { maxAge: 3600 * 24 * 7, path: '/' });
            res.cookies.set('plan_level', String(memberData?.plan_level ?? 0), { maxAge: 3600 * 24 * 7, path: '/' });
            return res;
        }
        
        // Standard redirect: go to member dashboard
        const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`);
        response.cookies.set('line_user_id', userId, { maxAge: 3600 * 24 * 7, path: '/' });
        response.cookies.set('line_user_name', displayName, { maxAge: 3600 * 24 * 7, path: '/' });
        response.cookies.set('line_user_picture', pictureUrl || '', { maxAge: 3600 * 24 * 7, path: '/' });
        response.cookies.set('plan_level', String(memberData?.plan_level ?? 0), { maxAge: 3600 * 24 * 7, path: '/' });
        return response;

    } catch (err: any) {
        console.error('LINE Callback Error:', err.response?.data || err.message);
        if (isPopup) {
            return new NextResponse(`<html><body><script>window.opener.postMessage({ type: 'LINE_LOGIN_ERROR', error: 'server_error' }, '*'); window.close();</script></body></html>`, { headers: { 'Content-Type': 'text/html' } });
        }
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?auth_error=server_error`);
    }
}
