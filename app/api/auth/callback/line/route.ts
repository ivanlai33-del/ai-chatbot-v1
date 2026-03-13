import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
    const code = req.nextUrl.searchParams.get('code');
    const state = req.nextUrl.searchParams.get('state');
    const error = req.nextUrl.searchParams.get('error');

    if (error) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?auth_error=${error}`);
    }

    if (!code) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?auth_error=no_code`);
    }

    try {
        // 1. Exchange code for access token
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

        const { access_token, id_token } = tokenResponse.data;

        // 2. Get user profile
        const profileResponse = await axios.get('https://api.line.me/v2/profile', {
            headers: { Authorization: `Bearer ${access_token}` }
        });

        const { userId, displayName, pictureUrl } = profileResponse.data;

        // 3. Store or Update User in Supabase (Optional: depending on if you want to track members)
        // For now, we mainly need the userId to bind to the bot later.
        // We'll redirect back to the main page with the userId in the query (or set a cookie)
        
        const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?line_id=${userId}&line_name=${encodeURIComponent(displayName)}`);
        
        // Setting a cookie for simpler frontend access
        response.cookies.set('line_user_id', userId, { maxAge: 3600, path: '/' });
        response.cookies.set('line_user_name', displayName, { maxAge: 3600, path: '/' });

        return response;

    } catch (err: any) {
        console.error('LINE Callback Error:', err.response?.data || err.message);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?auth_error=server_error`);
    }
}
