import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, displayName, pictureUrl } = body;

        if (!userId) {
            return NextResponse.json({ success: false, error: 'Missing userId' }, { status: 400 });
        }

        console.log('[Auth Sync] Syncing session for:', userId);

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
