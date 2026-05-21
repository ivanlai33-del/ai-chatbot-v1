/**
 * 藍新金流 SHA256 本機自驗腳本
 * 使用方式：node scratch/debug_sha_verify.mjs
 * 
 * 填入以下三個值後執行，即可驗證你的 HashKey/HashIV 是否正確
 */
import crypto from 'crypto';

// ⬇️ 請填入正式後台的 HashKey / HashIV（從藍新後台 API 金鑰頁複製）
const HASH_KEY = process.env.NEWEBPAY_HASH_KEY || '請填入HashKey';
const HASH_IV  = process.env.NEWEBPAY_HASH_IV  || '請填入HashIV';

// ⬇️ 從瀏覽器 HTML 複製的 TradeInfo（你貼過來的那一長串 hex）
const TRADE_INFO_FROM_BROWSER = '82308c8a3386502f37e647a647c8620622faa7161191fd8d747976da3e288bb1928564eede35ee9568bc343679050d4b5731b915959557d1fe68f34193999c364f954d7ecbe20a6b20329d37da463d08a147236b1217109bf91fb344dfaf82f83873642436a1673b41700372709a29c8775b3efdb768ae5cd835e5adca0c6237471a353e9ce47d9aa6521327f03479cb09a27743be952fc93417741fb9a667ba54860fd103e8d2eb55b67d74898232ca1a89117bbcdf2309e83e9292de1de341649a51033aecbf1c82e9043db08a66d95a641bd96b2a403645c5b12e4128936bb6e2e88288a4c9ce152fa59e159339d5e3c81cffae847d676e727a73b790e73d2948d43fb58901b63659493ab9015b53fdb911b96185e3b8c5a1c4a2066a52762fb94dc234adf2b7fdd9aafa3656d404b9a9d59ac6201d78393bfd0b6f9173b22b786616ef766aed6e39e3c0140e7b6b00562336242d9239074555d866d3cdd7bfb24787811d1331d04c1c7f681f72a41f681488b99a72321a860665070996a6aa7918b7a9dfbfcef1b5794825bc8b71ef5cd01e3deff052f417e5711818c9189b58e680959e00029ef6161c76329c727be5e410227eb62e6bdd18282bf70deab2ca3fe43b6624e53f2d648b64c551b1520d35769d58037c8a5f21db2ef79265b56af73977e46bc7172cd48c0de25ce2113dc7dd7a37c1e5885a4b72fe0aff3235e0a078ff3f12112c659d6014c8f55819c86d2a1b41bdf337763e6ae88b8e640205327324fb9996eaf9f344b139926e2d4b80ede4fd6215f120ed4cee68a5427871ce48abd87066395f7ebf48816cd9d6e5630db72af5aca2a92960721744e7';

// ⬇️ 從 HTML 複製的 TradeSha（藍新給的）
const TRADE_SHA_FROM_BROWSER = 'E2B1A843442E4941205469C03C0A842E9A43AB4943AA9709E7AF02293A8FA982';

// ===== 計算開始 =====

// ✅ 正確格式：HashKey=${Key}&${TradeInfo}&HashIV=${IV}（無 TradeInfo= 前綴）
const shaString = `HashKey=${HASH_KEY}&${TRADE_INFO_FROM_BROWSER}&HashIV=${HASH_IV}`;
const localSha = crypto.createHash('sha256').update(shaString).digest('hex').toUpperCase();

console.log('\n========== NewebPay SHA256 自驗報告 ==========');
console.log('MerchantID 應為: MS3823624815');
console.log('HashKey (前8碼):', HASH_KEY.substring(0, 8) + '...');
console.log('HashIV  (前8碼):', HASH_IV.substring(0, 8) + '...');
console.log('');
console.log('本機計算的 TradeSha:', localSha);
console.log('藍新回傳的 TradeSha:', TRADE_SHA_FROM_BROWSER);
console.log('');
if (localSha === TRADE_SHA_FROM_BROWSER) {
    console.log('✅ 比對成功！你的 HashKey/HashIV 正確，SHA 格式正確。');
    console.log('   問題一定在「後端 log 的 TradeInfo」和「瀏覽器送出的 TradeInfo」不一致。');
} else {
    console.log('❌ 比對失敗！可能原因：');
    console.log('   1. 正式後台的 HashKey/HashIV 與環境變數不一致。');
    console.log('   2. SHA 格式仍有問題（請確認中間沒有 TradeInfo= 前綴）。');
    console.log('   → 請登入藍新後台重新複製 HashKey/HashIV，與 .env.local 逐字比對。');
}
console.log('===============================================\n');
