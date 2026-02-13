import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PATCH(
    req: NextRequest,
    { params }: { params: { botId: string } }
) {
    const botId = params.botId;

    try {
        const body = await req.json();
        const { mgmtToken, systemPrompt, status } = body;

        if (!mgmtToken) {
            return NextResponse.json({ error: 'Missing management token' }, { status: 401 });
        }

        // 1. Verify Ownership
        const { data: bot, error: verifyError } = await supabase
            .from('bots')
            .select('id')
            .eq('id', botId)
            .eq('mgmt_token', mgmtToken)
            .single();

        if (verifyError || !bot) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Prepare Updates
        const updates: any = {};
        if (systemPrompt !== undefined) updates.system_prompt = systemPrompt;
        if (status !== undefined) updates.status = status;
        updates.updated_at = new Date().toISOString();

        // 3. Apply Updates
        const { data: updatedBot, error: updateError } = await supabase
            .from('bots')
            .update(updates)
            .eq('id', botId)
            .select()
            .single();

        if (updateError) throw updateError;

        return NextResponse.json({ success: true, bot: updatedBot });
    } catch (error: any) {
        console.error('Update Bot Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: { botId: string } }
) {
    // Optionally allow read if token is provided
    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get('token');

        if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 401 });

        const { data: bot, error } = await supabase
            .from('bots')
            .select('*')
            .eq('id', params.botId)
            .eq('mgmt_token', token)
            .single();

        if (error || !bot) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        return NextResponse.json(bot);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
