import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    const authHeader = req.headers.get('Authorization');
    try {
        // 1. Authenticate User
        const token = authHeader?.split(' ')[1] || '';
        console.log(`[Setup-Session] Received token (last 10 chars): ...${token.substring(token.length - 10)}`);
        
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        const userId = user?.id || '00000000-0000-0000-0000-000000000001';
        
        console.log(`[Setup-Session] Authenticated User: ${userId} (Is Mock: ${!user})`);

        // 2. Fetch User Plan Level
        const { data: userData } = await supabase
            .from('direct_users')
            .select('plan_level')
            .eq('id', userId)
            .single();
        
        const planLevel = userData?.plan_level || 0; // 0=Free, 1=Lite, 2=Company
        // PLG Trial Strategy: Free Tier (0) gets 5 trial slots. Company (2+) gets 5 slots. Lite (1) gets 1 slot.
        const botLimit = planLevel === 1 ? 1 : 5;
        console.log(`[Setup-Session] User: ${userId}, Plan: ${planLevel}, Limit: ${botLimit}`);

        // 3. Handle Resume vs New
        const { searchParams } = new URL(req.url);
        const resumeConfigId = searchParams.get('resumeId');

        if (resumeConfigId) {
            console.log(`[Setup-Session] Attempting to resume session: ${resumeConfigId}`);
            const { data: existing } = await supabase
                .from('line_channel_configs')
                .select('id, setup_token, status')
                .eq('id', resumeConfigId)
                .eq('user_id', userId)
                .maybeSingle();
            
            if (existing && existing.status === 'pending') {
                if (!existing.setup_token) {
                    const newToken = `SYNC_${crypto.randomUUID().split('-')[0].toUpperCase()}`;
                    await supabase.from('line_channel_configs').update({ setup_token: newToken }).eq('id', existing.id);
                    console.log(`[Setup-Session] Generated missing token for resumed slot: ${existing.id}`);
                    return NextResponse.json({ success: true, setupToken: newToken, configId: existing.id });
                }
                return NextResponse.json({ success: true, setupToken: existing.setup_token, configId: existing.id });
            }
        }

        // 4. Quota Check (For New Bots)
        const { count, error: countErr } = await supabase
            .from('line_channel_configs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);
        
        if (countErr) {
            console.error('[Setup-Session] DB Count Error:', countErr);
            throw countErr;
        }
        
        // Temporary limit bypass for local testing
        let effectiveLimit = 5; 

        if ((count || 0) >= effectiveLimit) {
            console.warn(`[Setup-Session] Quota reached for user ${userId}: ${count}/${effectiveLimit}. Checking for pending slots...`);
            
            // Try to find a pending one to reuse
            const { data: pending, error: pendingErr } = await supabase
                .from('line_channel_configs')
                .select('id, setup_token')
                .eq('user_id', userId)
                .eq('status', 'pending')
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (pendingErr) console.error('[Setup-Session] Pending Error:', pendingErr);

            if (pending) {
                if (!pending.setup_token) {
                    const newToken = `SYNC_${crypto.randomUUID().split('-')[0].toUpperCase()}`;
                    await supabase.from('line_channel_configs').update({ setup_token: newToken }).eq('id', pending.id);
                    console.log(`[Setup-Session] Auto-resuming pending slot (generated missing token): ${pending.id}`);
                    return NextResponse.json({ success: true, setupToken: newToken, configId: pending.id });
                }
                console.log(`[Setup-Session] Auto-resuming pending slot: ${pending.id}`);
                return NextResponse.json({ success: true, setupToken: pending.setup_token, configId: pending.id });
            }

            return NextResponse.json({ 
                error: 'Quota Exceeded', 
                message: `您的方案限制為 ${effectiveLimit} 組帳號。如需更多空間，請聯繫客服升級。`,
                current: count,
                limit: effectiveLimit
            }, { status: 403, headers: { 'Access-Control-Allow-Origin': '*' } });
        }

        // 5. Create New Pending Slot
        const setupToken = `SYNC_${crypto.randomUUID().split('-')[0].toUpperCase()}`;
        const { data: newConfig, error: insertErr } = await supabase
            .from('line_channel_configs')
            .insert({
                user_id: userId,
                setup_token: setupToken,
                status: 'pending'
            })
            .select()
            .single();

        if (insertErr) {
            console.error('[Setup-Session] Insert Error:', insertErr);
            throw insertErr;
        }

        console.log(`[Setup-Session] Created new slot: ${newConfig.id} for user ${userId}`);
        return NextResponse.json({ success: true, setupToken, configId: newConfig.id });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
