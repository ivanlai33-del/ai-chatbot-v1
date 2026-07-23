import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/wallet/[ownerId]
 * 取得老闆的錢包總餘額、扣抵偏好 (deductionMode)、對帳單與明細
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

        // 1. 查詢或初始化錢包 (含 deduction_mode 偏好)
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
                    total_spent: 0,
                    deduction_mode: 'AUTO_ALL'
                })
                .select('*')
                .single();

            if (createErr || !created) {
                wallet = { owner_line_id: ownerLineId, balance_credits: 0, total_earned: 0, total_spent: 0, deduction_mode: 'AUTO_ALL' };
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
            deductionMode: wallet.deduction_mode || 'AUTO_ALL',
            transactions: transactions || []
        });

    } catch (err: any) {
        console.error('[Wallet GET Error]', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

/**
 * POST /api/wallet/[ownerId]
 * 儲值購物金點數或切換扣款偏好設定 (deductionMode)
 */
export async function POST(
    req: NextRequest,
    { params }: { params: { ownerId: string } }
) {
    try {
        let ownerLineId = params.ownerId;
        const body = await req.json();

        // 情境 A：切換扣款偏好模式 (AUTO_ALL vs OVERAGE_ONLY)
        if (body.action === 'UPDATE_DEDUCTION_MODE') {
            const { deductionMode } = body;
            if (!['AUTO_ALL', 'OVERAGE_ONLY'].includes(deductionMode)) {
                return NextResponse.json({ error: 'Invalid deductionMode' }, { status: 400 });
            }

            await supabase
                .from('store_wallets')
                .upsert({
                    owner_line_id: ownerLineId,
                    deduction_mode: deductionMode,
                    updated_at: new Date().toISOString()
                });

            return NextResponse.json({
                success: true,
                deductionMode
            });
        }

        // 情境 B：線上儲值購物金點數
        const { amount, bonusCredits = 0, description = '線上儲值購物金' } = body;

        if (!amount || amount <= 0) {
            return NextResponse.json({ error: 'Invalid top-up amount' }, { status: 400 });
        }

        const totalAdd = Number(amount) + Number(bonusCredits);

        let { data: wallet } = await supabase
            .from('store_wallets')
            .select('*')
            .eq('owner_line_id', ownerLineId)
            .maybeSingle();

        const currentBalance = Number(wallet?.balance_credits || 0);
        const newBalance = currentBalance + totalAdd;
        const newTotalEarned = Number(wallet?.total_earned || 0) + totalAdd;

        await supabase
            .from('store_wallets')
            .upsert({
                owner_line_id: ownerLineId,
                balance_credits: newBalance,
                total_earned: newTotalEarned,
                updated_at: new Date().toISOString()
            });

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
