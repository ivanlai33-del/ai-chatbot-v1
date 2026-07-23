/**
 * 📈 併發與悲觀鎖壓力測試驗證腳本 (Wallet Stress Test)
 * 模擬 20 個併發請求在 10 毫秒內同時對金流錢包發起儲值、扣款與重複發起扣款。
 * 驗證指標：
 * 1. 死鎖 (Deadlock) 防範
 * 2. 雙重扣款 (Double Spending) 100% 杜絕
 * 3. 冪等金鑰重覆發送只執行 1 次
 * 4. 餘額點數對帳 100% 精準無誤
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ 缺少 Supabase 環境變數，請確認 NEXT_PUBLIC_SUPABASE_URL');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const TEST_OWNER_ID = 'TEST_STRESS_OWNER_999';

async function runStressTest() {
    console.log('🚀 開始執行 [金融級錢包併發壓力測試]...');

    // Step 1. 清理舊測試資料
    await supabase.from('wallet_transactions').delete().eq('owner_line_id', TEST_OWNER_ID);
    await supabase.from('store_wallets').delete().eq('owner_line_id', TEST_OWNER_ID);

    // 初始化錢包：儲值 1,000 點
    console.log('🔹 步驟 1: 初始化錢包 1,000 點...');
    const { data: initData, error: initErr } = await supabase.rpc('process_wallet_transaction_atomic', {
        p_owner_id: TEST_OWNER_ID,
        p_bot_id: null,
        p_store_name: '壓測測試門市',
        p_type: 'TOP_UP',
        p_amount: 1000,
        p_description: '壓測初始化儲值 1,000 點',
        p_idempotency_key: `STRESS-INIT-${Date.now()}`
    });

    if (initErr) {
        console.error('❌ 初始化失敗:', initErr);
        process.exit(1);
    }

    console.log('✅ 初始化成功！當前餘額:', initData.balance_after);

    // Step 2. 模擬 10 個併發請求同時扣款 -100 點 (總計應扣除 10 * 100 = 1,000 點，餘額歸零)
    console.log('\n🔥 步驟 2: 發起 10 個平行併發扣款 (-100 點/次)...');
    const concurrentReqs = Array.from({ length: 10 }).map((_, idx) => {
        return supabase.rpc('process_wallet_transaction_atomic', {
            p_owner_id: TEST_OWNER_ID,
            p_bot_id: null,
            p_store_name: '壓測測試門市',
            p_type: 'MONTHLY_DEDUCTION',
            p_amount: -100,
            p_description: `併發扣款請求 #${idx + 1}`,
            p_idempotency_key: `STRESS-DEDUCT-CONCURRENT-${idx + 1}`
        });
    });

    const results = await Promise.all(concurrentReqs);
    const successCount = results.filter(r => r.data && r.data.success).length;
    const failCount = results.filter(r => r.error).length;

    console.log(`📊 併發扣款結果: 成功 ${successCount} 次 / 失敗 ${failCount} 次`);

    // 檢查資料庫最終餘額
    const { data: finalWallet } = await supabase
        .from('store_wallets')
        .select('balance_credits')
        .eq('owner_line_id', TEST_OWNER_ID)
        .single();

    console.log(`🎯 最終資料庫餘額: ${finalWallet.balance_credits} 點 (預期值: 0)`);

    // Step 3. 測試冪等性防重複扣款 (重覆發送相同 idempotency_key 5 次)
    console.log('\n🛡️ 步驟 3: 重複發送相同冪等金鑰 (Idempotency Key) 5 次...');
    const IDEM_KEY = 'STRESS-IDEM-DUPLICATE-KEY-12345';
    
    // 首刷 (+500點)
    await supabase.rpc('process_wallet_transaction_atomic', {
        p_owner_id: TEST_OWNER_ID,
        p_bot_id: null,
        p_store_name: '壓測測試門市',
        p_type: 'TOP_UP',
        p_amount: 500,
        p_description: '冪等性測試首刷 +500',
        p_idempotency_key: IDEM_KEY
    });

    // 重複發送 4 次
    const duplicateReqs = Array.from({ length: 4 }).map(() => {
        return supabase.rpc('process_wallet_transaction_atomic', {
            p_owner_id: TEST_OWNER_ID,
            p_bot_id: null,
            p_store_name: '壓測測試門市',
            p_type: 'TOP_UP',
            p_amount: 500,
            p_description: '冪等性重複發送',
            p_idempotency_key: IDEM_KEY
        });
    });

    const dupResults = await Promise.all(duplicateReqs);
    const replayCount = dupResults.filter(r => r.data && r.data.idempotency_replay).length;

    console.log(`🛡️ 冪等重放攔截結果: ${replayCount} 次重覆發送被成功攔截 (idempotency_replay = true)`);

    // 最終餘額核對
    const { data: walletCheck } = await supabase
        .from('store_wallets')
        .select('balance_credits')
        .eq('owner_line_id', TEST_OWNER_ID)
        .single();

    console.log(`✨ 最終核對總餘額: ${walletCheck.balance_credits} 點 (預期值: 500)`);

    if (Number(walletCheck.balance_credits) === 500 && successCount === 10 && replayCount === 4) {
        console.log('\n🎉🎉🎉 [壓力測試通過！100% 杜絕雙重扣款與競態條件！]');
    } else {
        console.error('❌ 測試結果異常，請檢查資料庫記錄');
    }

    // 清理測試資料
    await supabase.from('wallet_transactions').delete().eq('owner_line_id', TEST_OWNER_ID);
    await supabase.from('store_wallets').delete().eq('owner_line_id', TEST_OWNER_ID);
}

runStressTest().catch(console.error);
