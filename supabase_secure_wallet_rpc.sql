-- ============================================================
-- 🛡️ 金融級悲觀鎖 (Pessimistic Lock) 與冪等性 (Idempotency) RPC 函數
-- ============================================================

-- 1. 為 wallet_transactions 增加冪等金鑰欄位 (idempotency_key)
ALTER TABLE public.wallet_transactions 
ADD COLUMN IF NOT EXISTS idempotency_key TEXT UNIQUE;

-- 2. 建立 PostgreSQL 原生原子交易 RPC 函數 (FOR UPDATE 行級鎖定)
CREATE OR REPLACE FUNCTION public.process_wallet_transaction_atomic(
    p_owner_id TEXT,
    p_bot_id UUID,
    p_store_name TEXT,
    p_type TEXT,
    p_amount NUMERIC,
    p_description TEXT,
    p_idempotency_key TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_balance NUMERIC := 0;
    v_total_earned NUMERIC := 0;
    v_total_spent NUMERIC := 0;
    v_new_balance NUMERIC := 0;
    v_new_earned NUMERIC := 0;
    v_new_spent NUMERIC := 0;
    v_tx_id UUID;
    v_existing_tx JSONB;
BEGIN
    -- 🔒 A. 冪等性檢查 (Idempotency Check)
    -- 若同一個 idempotency_key 已執行過，直接回傳舊結果，絕不重複扣款/發放！
    IF p_idempotency_key IS NOT NULL THEN
        SELECT jsonb_build_object(
            'success', true,
            'idempotency_replay', true,
            'transaction_id', id,
            'balance_after', balance_after,
            'amount', amount
        ) INTO v_existing_tx
        FROM public.wallet_transactions
        WHERE idempotency_key = p_idempotency_key;

        IF v_existing_tx IS NOT NULL THEN
            RETURN v_existing_tx;
        END IF;
    END IF;

    -- 🔒 B. 悲觀鎖定 (Pessimistic Lock: SELECT ... FOR UPDATE)
    -- 對該老闆的錢包 Row 上鎖，同時間其他併發請求必須排隊等待
    SELECT balance_credits, total_earned, total_spent
    INTO v_current_balance, v_total_earned, v_total_spent
    FROM public.store_wallets
    WHERE owner_line_id = p_owner_id
    FOR UPDATE;

    -- 若錢包不存在，自動為其初始化建立並鎖定
    IF NOT FOUND THEN
        INSERT INTO public.store_wallets (owner_line_id, balance_credits, total_earned, total_spent, deduction_mode)
        VALUES (p_owner_id, 0, 0, 0, 'AUTO_ALL');

        v_current_balance := 0;
        v_total_earned := 0;
        v_total_spent := 0;
    END IF;

    -- 💰 C. 計算新餘額與防負數檢查
    v_new_balance := v_current_balance + p_amount;

    IF v_new_balance < 0 THEN
        RAISE EXCEPTION 'Insufficient wallet balance: current %, attempted change %', v_current_balance, p_amount;
    END IF;

    IF p_amount > 0 THEN
        v_new_earned := v_total_earned + p_amount;
        v_new_spent := v_total_spent;
    ELSE
        v_new_earned := v_total_earned;
        v_new_spent := v_total_spent + ABS(p_amount);
    END IF;

    -- 📝 D. 原字性更新錢包主表
    UPDATE public.store_wallets
    SET balance_credits = v_new_balance,
        total_earned = v_new_earned,
        total_spent = v_new_spent,
        updated_at = NOW()
    WHERE owner_line_id = p_owner_id;

    -- 🧾 E. 原子性寫入流水對帳單 (帶入 idempotency_key)
    INSERT INTO public.wallet_transactions (
        owner_line_id,
        bot_id,
        store_name,
        type,
        amount,
        balance_after,
        description,
        idempotency_key
    )
    VALUES (
        p_owner_id,
        p_bot_id,
        p_store_name,
        p_type,
        p_amount,
        v_new_balance,
        p_description,
        p_idempotency_key
    )
    RETURNING id INTO v_tx_id;

    -- F. 回傳成功結果
    RETURN jsonb_build_object(
        'success', true,
        'idempotency_replay', false,
        'transaction_id', v_tx_id,
        'balance_after', v_new_balance,
        'amount', p_amount
    );

EXCEPTION WHEN OTHERS THEN
    -- 發生任何錯誤時，自動全數 Rollback
    RAISE;
END;
$$;
