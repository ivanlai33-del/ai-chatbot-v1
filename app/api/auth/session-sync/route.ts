import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

import axios from 'axios';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, displayName, pictureUrl, idToken } = body;

        if (!userId || !idToken) {
            return NextResponse.json({ success: false, error: 'Missing userId or idToken' }, { status: 400 });
        }

        // 🛡️ SECURITY HARDENING: Verify Identity with LINE
        // We don't trust the client-side userId. We verify the cryptographically signed idToken.
        try {
            const verifyRes = await axios.post('https://api.line.me/oauth2/v2.1/verify', 
                new URLSearchParams({
                    id_token: idToken,
                    client_id: process.env.LINE_LOGIN_CHANNEL_ID!,
                }).toString(),
                { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
            );

            const verifiedData = verifyRes.data;
            if (verifiedData.sub !== userId) {
                console.error('[Auth Sync] Token Subject Mismatch:', { tokenSub: verifiedData.sub, providedId: userId });
                return NextResponse.json({ success: false, error: 'Identity mismatch' }, { status: 403 });
            }
            console.log('[Auth Sync] Identity verified successfully for:', userId);
        } catch (verifyErr: any) {
            console.error('[Auth Sync] Token Verification Failed:', verifyErr.response?.data || verifyErr.message);
            return NextResponse.json({ success: false, error: 'Invalid authentication token' }, { status: 401 });
        }

        // 1. Persist to Supabase (Member Data)
        const { data: memberData, error: upsertError } = await supabase
            .from('direct_users')
            .upsert({
                line_user_id: userId,
                display_name: displayName,
                avatar_url: pictureUrl || '',
            }, { onConflict: 'line_user_id', ignoreDuplicates: false })
            .select('id, plan_level')
            .single();

        if (upsertError) {
            console.error('[Auth Sync] Supabase upsert failed:', upsertError.message);
        } else if (memberData) {
            // Auto-create store_configs row if not exists
            await supabase
                .from('store_configs')
                .upsert({ user_id: memberData.id }, { onConflict: 'user_id', ignoreDuplicates: true });
        }

        // 2. Set Cookies for the domain (to share session with main site)
        const response = NextResponse.json({ 
            success: true, 
            member: memberData 
        });

        const cookieOptions = {
            maxAge: 3600 * 24 * 7, // 7 days
            path: '/',
            sameSite: 'lax' as const,
        };

        response.cookies.set('line_user_id', userId, cookieOptions);
        response.cookies.set('line_user_name', displayName || '', cookieOptions);
        response.cookies.set('line_user_picture', pictureUrl || '', cookieOptions);
        response.cookies.set('plan_level', String(memberData?.plan_level ?? 0), cookieOptions);

        return response;

    } catch (err: any) {
        console.error('[Auth Sync] Internal Error:', err.message);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
