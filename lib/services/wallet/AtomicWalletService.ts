import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

export interface WalletTransactionRequest {
    ownerLineId: string;
    botId?: string | null;
    storeName?: string | null;
    type: 'TOP_UP' | 'REFERRAL_REWARD' | 'MONTHLY_DEDUCTION' | 'OVERAGE_DEDUCTION' | 'STORE_DEDUCTION';
    amount: number; // 正數為入帳，負數為扣抵
    description: string;
    idempotencyKey?: string | null;
}

export interface WalletTransactionResult {
    success: boolean;
    idempotencyReplay: boolean;
    transactionId: string;
    balanceAfter: number;
    amount: number;
    error?: string;
}

export class AtomicWalletService {

    /**
     * 生成全系統唯一的冪等金鑰 (Idempotency Key)
     */
    public static generateIdempotencyKey(prefix: string, seedId: string, uniqueTag: string): string {
        const raw = `${prefix}:${seedId}:${uniqueTag}`;
        const hash = crypto.createHash('sha256').update(raw).digest('hex').substring(0, 16);
        return `${prefix}-${hash}`;
    }

    /**
     * 🛡️ 金融級原子交易（悲觀鎖 + 防重複扣款 冪等性）
     * 透過 Supabase RPC `process_wallet_transaction_atomic` 行級鎖定執行。
     */
    public static async processTransaction(req: WalletTransactionRequest): Promise<WalletTransactionResult> {
        const idempotencyKey = req.idempotencyKey || this.generateIdempotencyKey(
            req.type,
            req.ownerLineId,
            `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
        );

        try {
            const { data, error } = await supabase.rpc('process_wallet_transaction_atomic', {
                p_owner_id: req.ownerLineId,
                p_bot_id: req.botId || null,
                p_store_name: req.storeName || null,
                p_type: req.type,
                p_amount: req.amount,
                p_description: req.description,
                p_idempotency_key: idempotencyKey
            });

            if (error) {
                console.error('[AtomicWalletService RPC Error]', error);
                return {
                    success: false,
                    idempotencyReplay: false,
                    transactionId: '',
                    balanceAfter: 0,
                    amount: req.amount,
                    error: error.message
                };
            }

            return {
                success: data.success,
                idempotencyReplay: data.idempotency_replay,
                transactionId: data.transaction_id,
                balanceAfter: Number(data.balance_after),
                amount: Number(data.amount)
            };

        } catch (err: any) {
            console.error('[AtomicWalletService Exception]', err);
            return {
                success: false,
                idempotencyReplay: false,
                transactionId: '',
                balanceAfter: 0,
                amount: req.amount,
                error: err.message || 'Atomic transaction failed'
            };
        }
    }
}
