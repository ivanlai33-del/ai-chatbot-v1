import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/wallet/[ownerId]
 * 取得老闆的錢包總餘額、異動紀錄明細與儲值方案
 */
export async function GET(
    req: NextRequest,
    { params }: { params: { ownerId: string } }
) {
    try {
        let ownerLineId = params.ownerId;

        if (!ownerLineId || ownerLineId === 'undefined' || ownerLineId === 'null') {
            ownerLineId = req.nextUrl.searchParams.get('lineUserId') || 'Ud8b8dd79162387a80b2b5a4aba20f604';
        }

        // 1. 查詢或初始化錢包
        let { data: wallet } = await supabase
            .from('store_wallets')
            .select('*')
            .eq('owner_line_id', ownerLineId)
            .maybeSingle();

        if (!wallet) {
            const { data: created, error: createErr } = await supabase
                .from('store_wallets')
                .insert({
                    owner_line_id: ownerLineId,
                    balance_credits: 0,
                    total_earned: 0,
                    total_spent: 0
                })
                .select('*')
                .single();

            if (createErr || !created) {
                wallet = { owner_line_id: ownerLineId, balance_credits: 0, total_earned: 0, total_spent: 0 };
            } else {
                wallet = created;
            }
        }

        // 2. 撈取對帳單交易紀錄
        const { data: transactions } = await supabase
            .from('wallet_transactions')
            .select('*')
            .eq('owner_line_id', ownerLineId)
            .order('created_at', { ascending: false });

        return NextResponse.json({
            success: true,
            balanceCredits: Number(wallet.balance_credits) || 0,
            totalEarned: Number(wallet.total_earned) || 0,
            totalSpent: Number(wallet.total_spent) || 0,
            transactions: transactions || []
        });

    } catch (err: any) {
        console.error('[Wallet GET Error]', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

/**
 * POST /api/wallet/[ownerId]
 * 儲值購物金點數 (Top-up simulation / Payment Integration)
 */
export async function POST(
    req: NextRequest,
    { params }: { params: { ownerId: string } }
) {
    try {
        let ownerLineId = params.ownerId;
        const body = await req.json();
        const { amount, bonusCredits = 0, description = '線上儲值購物金' } = body;

        if (!amount || amount <= 0) {
            return NextResponse.json({ error: 'Invalid top-up amount' }, { status: 400 });
        }

        const totalAdd = Number(amount) + Number(bonusCredits);

        // 1. 取得當前錢包
        let { data: wallet } = await supabase
            .from('store_wallets')
            .select('*')
            .eq('owner_line_id', ownerLineId)
            .maybeSingle();

        const currentBalance = Number(wallet?.balance_credits || 0);
        const newBalance = currentBalance + totalAdd;
        const newTotalEarned = Number(wallet?.total_earned || 0) + totalAdd;

        // 2. 更新錢包餘額
        await supabase
            .from('store_wallets')
            .upsert({
                owner_line_id: ownerLineId,
                balance_credits: newBalance,
                total_earned: newTotalEarned,
                updated_at: new Date().toISOString()
            });

        // 3. 寫入對帳單交易紀錄
        const { data: tx } = await supabase
            .from('wallet_transactions')
            .insert({
                owner_line_id: ownerLineId,
                type: 'TOP_UP',
                amount: totalAdd,
                balance_after: newBalance,
                description: `${description} (${amount}元 ${bonusCredits > 0 ? `+加碼${bonusCredits}點` : ''})`
            })
            .select('*')
            .single();

        return NextResponse.json({
            success: true,
            newBalance,
            transaction: tx
        });

    } catch (err: any) {
        console.error('[Wallet POST Error]', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
