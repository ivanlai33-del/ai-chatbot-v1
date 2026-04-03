import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';
import { getStoreLimit } from '@/lib/config/pricing';

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
        
        const planLevel = userData?.plan_level || 0;
        // 從 pricing.ts 積木讀取此方案的店數上限（不寫死）
        const effectiveBotLimit = getStoreLimit(planLevel);
        console.log(`[Setup-Session] User: ${userId}, Plan: ${planLevel}, Limit: ${effectiveBotLimit}`);

        // 3. Handle Resume vs New (Deterministic ID Integration)
        const { searchParams } = new URL(req.url);
        const resumeConfigId = searchParams.get('resumeId'); // This is the ID of the bot slot from the dashboard

        if (resumeConfigId) {
            console.log(`[Setup-Session] ENSURING DETERMINISTIC SLOT: ${resumeConfigId}`);
            
            // 4. Try to find existing slot by THIS ID
            const { data: existing } = await supabase
                .from('line_channel_configs')
                .select('id, setup_token, status')
                .eq('id', resumeConfigId)
                .maybeSingle();
            
            if (existing) {
                // Return found slot (Verification 100% matched)
                if (!existing.setup_token) {
                    const newToken = `SYNC_${crypto.randomUUID().split('-')[0].toUpperCase()}`;
                    await supabase.from('line_channel_configs').update({ setup_token: newToken }).eq('id', existing.id);
                    return NextResponse.json({ success: true, setupToken: newToken, configId: existing.id });
                }
                return NextResponse.json({ success: true, setupToken: existing.setup_token, configId: existing.id });
            }

            // 5. IF IT DOES NOT EXIST: Create it WITH THIS SPECIFIC ID
            // This guarantees the Webhook URL is permanently pinned to the Dashboard Slot
            console.log(`[Setup-Session] Pinning new Webhook URL to Dashboard Slot: ${resumeConfigId}`);
            const setupToken = `SYNC_${crypto.randomUUID().split('-')[0].toUpperCase()}`;
            const { data: linkedConfig, error: linkedErr } = await supabase
                .from('line_channel_configs')
                .insert({
                    id: resumeConfigId, // Force the ID to match the bot slot!
                    user_id: userId,
                    setup_token: setupToken,
                    status: 'pending'
                })
                .select()
                .single();

            if (!linkedErr) {
                return NextResponse.json({ success: true, setupToken, configId: linkedConfig.id });
            } else {
                console.error('[Setup-Session] Linked Insert Error:', linkedErr);
                // If it failed because ID is taken but not found by user, fallback to new
            }
        }

        // 6. Quota Check (For Generic/New Slots)
        const { count, error: countErr } = await supabase
            .from('line_channel_configs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);
        
        if (countErr) throw countErr;
        
        let effectiveLimit = effectiveBotLimit;
        if ((count || 0) >= effectiveLimit) {
            // Find LATEST pending as last resort
            const { data: pending } = await supabase
                .from('line_channel_configs')
                .select('id, setup_token')
                .eq('user_id', userId)
                .eq('status', 'pending')
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (pending) {
                return NextResponse.json({ success: true, setupToken: pending.setup_token || 'SESSION_ACTIVE', configId: pending.id });
            }

            return NextResponse.json({ 
                error: 'Quota Exceeded', 
                message: `您的方案限制為 ${effectiveLimit} 組帳號。` 
            }, { status: 403 });
        }

        // 7. Create Standard Pending Slot
        const setupToken = `SYNC_${crypto.randomUUID().split('-')[0].toUpperCase()}`;
        const { data: newConfig, error: insertErr } = await supabase
            .from('line_channel_configs')
            .insert({ user_id: userId, setup_token: setupToken, status: 'pending' })
            .select().single();

        if (insertErr) throw insertErr;
        return NextResponse.json({ success: true, setupToken, configId: newConfig.id });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
