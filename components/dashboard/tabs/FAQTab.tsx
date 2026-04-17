'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Plus, Trash2, Lock, HelpCircle } from 'lucide-react';
import InputField from '@/components/ui/InputField';
import TextareaField from '@/components/ui/TextareaField';
import { useState } from 'react';
import { getFeatureAccess, getPlanName, getRequiredPlanName, isAtLimit, formatLimit } from '@/lib/feature-access';

const FAQ_PRESETS = [
    { label: '營業時間與店址', q: '請問你們的營業時間與地址在哪裡？', a: '我們位於 [請填寫地址]，營業時間為 [請填寫時間]。歡迎您的光臨！' },
    { label: '付款方式說明', q: '請問支援哪些付款方式？', a: '我們目前支援 [信用卡、轉帳、LINE Pay、街口] 等支付方式。' },
    { label: '配送與運費', q: '請問運費如何計算？多久會送到？', a: '全館滿 [金額] 免運，一般地區約 [數字] 個工作天內送達。' },
    { label: '退換貨政策', q: '如果收到商品不滿意，可以退換貨嗎？', a: '我們提供 [7] 天鑑賞期，若商品保持全新完整，均可聯繫客服辦理退換貨處理。' },
    { label: '會員積點與優惠', q: '請問如何加入會員？有什麼優惠嗎？', a: '消費每滿 [金額] 即可獲得 1 點及會員福利。詳細方案請點擊選單查看。' },
    { label: '售後保固服務', q: '請問商品有保固嗎？', a: '所有電子產品均提供 [一年] 官方保固服務，請保留購買證明。' },
    { label: '聯絡人工客服', q: '請問如何聯繫真人客服？', a: '若 AI 無法解答您的問題，請撥打 [電話] 或在 LINE 輸入「轉接真人」。' },
    { label: '使用/保存建議', q: '請問商品該如何保存或使用？', a: '建議放置於 [陰涼通風處]，避免陽光直射，使用前請詳閱說明書。' },
    { label: '急單處理流程', q: '我有急用，可以當天出貨嗎？', a: '若有急單需求，請於下午 [時間] 前下單並聯繫客服確認庫存狀況。' },
    { label: '大宗採購/合作', q: '請問有提供大宗採購或商業合作嗎？', a: '有的，請將您的需求發送至 [Email] 或聯繫商業合作專線。' },
];

const INDUSTRY_FAQ_PACKS: Record<string, { q: string; a: string }[]> = {
    '餐飲業': [
        { q: '請問可以訂位嗎？', a: '可以！請提供您的姓名、人數與希望的用餐時間，我們將為您確認是否有空位。' },
        { q: '請問有外帶或外送服務嗎？', a: '有的！我們提供外帶服務，外送請透過 [Foodpanda/Uber Eats] 下單。' },
        { q: '請問菜單有素食選項嗎？', a: '我們有提供素食選項，點餐時請告知服務人員，我們會特別為您準備。' },
        { q: '請問等候時間大約多久？', a: '用餐尖峰時段等候約 15-30 分鐘，建議您提前訂位以節省等候時間。' },
        { q: '請問有提供包廂嗎？', a: '我們提供包廂，需提前預約，請聯繫我們確認檔期。' },
    ],
    '零售通路': [
        { q: '請問實體門市在哪裡？', a: '我們的門市位於 [地址]，營業時間為 [時間]。歡迎光臨！' },
        { q: '請問有提供刷卡服務嗎？', a: '有的，我們支援信用卡、LINE Pay 與街口支付。' },
        { q: '請問可以退換貨嗎？', a: '購買後 7 天內憑發票且商品保持完整，即可辦理退換貨。' },
        { q: '請問會員有什麼優惠？', a: '加入會員可享消費積點，滿千折百，生日當月還有專屬折扣！' },
        { q: '請問目前有缺貨的商品何時到貨？', a: '熱銷商品補貨時間約 [天數] 天，您可以留下聯絡方式，到貨立即通知您。' },
    ],
    '電商網購': [
        { q: '請問運費如何計算？', a: '全館滿 [金額] 免運，未滿酌收 [金額] 運費。' },
        { q: '請問多久會出貨？', a: '現貨商品下單後 1-3 個工作天內出貨，預購商品依頁面標示為主。' },
        { q: '請問已經下單可以修改訂單嗎？', a: '若訂單狀態尚未進入「準備出貨」，請聯繫客服為您修改。' },
        { q: '請問有提供超商取貨嗎？', a: '有的，我們支援 7-11、全家超商取貨付款。' },
        { q: '請問收到瑕疵品怎麼辦？', a: '請於收到商品 3 天內拍照並傳送給客服，我們將免費為您更換。' },
    ],
    '醫療美容': [
        { q: '請問需要提前預約嗎？', a: '為確保服務品質，看診及療程均採全面預約制，請提前聯繫我們。' },
        { q: '請問初次諮詢收費嗎？', a: '初次諮詢由專業顧問為您評估，只收取基本掛號/諮詢費。' },
        { q: '請問療程大約需要多久？', a: '視不同療程而定，一般保養約 1 小時，建議預留充足時間。' },
        { q: '請問術後需要特別注意什麼？', a: '術後請避免高溫環境，並加強保濕與防曬，詳細衛教單會於結束後提供。' },
        { q: '請問可以分期付款嗎？', a: '我們支援特定銀行信用卡分期零利率，歡迎詢問詳情。' },
    ],
    '教育補習': [
        { q: '請問有提供試聽嗎？', a: '有的！我們提供一堂免費試聽，請聯繫我們預約時間。' },
        { q: '請問一班大約多少人？', a: '我們採小班制教學，每班控制在 [人數] 人以內，確保學習品質。' },
        { q: '請問缺課可以補課嗎？', a: '可以透過線上錄影補課，或安排其他同進度班級跨班補課。' },
        { q: '請問報名有什麼優惠？', a: '目前提供早鳥優惠及兩人同行折扣，詳細方案歡迎索取。' },
        { q: '請問如何知道學習成效？', a: '每個月會有定期的學習評量與家長日，並提供進度報告。' },
    ],
    '旅遊住宿': [
        { q: '請問幾點可以入住與退房？', a: '入住時間為下午 3:00 後，退房為上午 11:00 前。' },
        { q: '請問有提供停車位嗎？', a: '有的，我們有專屬免費停車場供住客使用。' },
        { q: '請問可以帶寵物入住嗎？', a: '目前我們有開放特定的寵物友善房型，預約時請先告知。' },
        { q: '請問房價包含早餐嗎？', a: '是的，所有房型均含隔日自助式/套餐式早餐。' },
        { q: '請問取消訂房規定？', a: '入住前 14 天取消可全額退款，詳細退改規定請參考官網說明。' },
    ],
    '不動產': [
        { q: '請問如何預約看屋？', a: '請加 LINE 告知您感興趣的物件，我們的專員會為您安排看屋時間。' },
        { q: '請問有幫忙代租代管嗎？', a: '有的，我們提供一條龍的包租代管服務，歡迎屋主洽詢。' },
        { q: '請問買屋需要準備多少自備款？', a: '一般建議準備房屋總價的 2-3 成作為頭期款，貸款成數依個人信用而定。' },
        { q: '請問有提供外縣市帶看嗎？', a: '我們服務範圍以 [區域] 為主，若為特定案件可為您轉介當地夥伴。' },
        { q: '請問看屋需要收費嗎？', a: '了解需求與帶看物件皆為免費服務，成交後才收取服務費。' },
    ],
    '金融保險': [
        { q: '請問如何開始保單健診？', a: '請預約一對一諮詢，並攜帶您既有的保單，我們將為您做全盤檢視。' },
        { q: '請問保費可以用信用卡繳嗎？', a: '多數險種皆支援信用卡繳費，還可享銀行分期零利率。' },
        { q: '請問理賠需要準備什麼文件？', a: '通常需要診斷證明、收據正副本等，視險種而定，我們專員會協助您準備。' },
        { q: '請問理賠金大約多久會下來？', a: '資料齊全送件後，保險公司一般約 10-15 個工作天內核發。' },
        { q: '請問小資族推薦買什麼保險？', a: '建議先以醫療險、意外險打底，再依預算考量重大傷病或壽險。' },
    ],
    '寵物服務': [
        { q: '請問洗澡需要預約嗎？', a: '為確保毛孩不需久候，美容及洗澡服務均採全預約制。' },
        { q: '請問毛孩很怕生可以洗嗎？', a: '請提早告知，我們會安排經驗豐富的美容師，並拉長適應時間。' },
        { q: '請問住宿需要自己帶飼料嗎？', a: '建議攜帶毛孩平常習慣吃的飼料，以免突然換食造成腸胃不適。' },
        { q: '請問毛孩還沒打滿疫苗可以來嗎？', a: '為了所有毛孩的健康與安全，需確認打滿疫苗才能提供服務。' },
        { q: '請問有提供接送服務嗎？', a: '[距離] 公里內我們提供付費接送服務，需提前預約。' },
    ],
    '專業顧問': [
        { q: '請問初次諮詢費用怎麼算？', a: '我們提供首次 30 分鐘的免費評估，後續專案將依需求提供正式報價。' },
        { q: '請問服務範圍包含外縣市嗎？', a: '我們提供線上視訊諮詢，實體會議則以 [區域] 為主，外縣市酌收交通費。' },
        { q: '請問如何開始專案？', a: '確認報價單並簽署合約、支付訂金後，即正式啟動專案。' },
        { q: '請問會簽署保密協議 (NDA) 嗎？', a: '一定會！我們極度重視客戶隱私，專案開始前皆會簽訂保密協議。' },
        { q: '請問專案通常需要多久時間？', a: '依據複雜度而定，多數專案週期為 1-3 個月。' },
    ],
    '健身運動': [
        { q: '請問有體驗課程嗎？', a: '有的，我們提供首次參觀及一堂教練體驗課，請聯繫預約。' },
        { q: '請問會籍是綁約的嗎？', a: '我們提供月訂閱、季約與年約多種方案，可依您的運動頻率彈性選擇。' },
        { q: '請問有提供盥洗設備嗎？', a: '館內設有免費的高級淋浴間、吹風機及置物櫃供會員使用。' },
        { q: '請問需要自己準備護具嗎？', a: '基本器材附有護具，若有個人衛生考量或特殊訓練需求，建議自備。' },
        { q: '請問暫時無法運動可以請假嗎？', a: '可以的！出示就醫證明或出差證明，即可辦理會籍暫停。' },
    ],
    '居家服務': [
        { q: '請問服務範圍涵蓋哪裡？', a: '目前的服務範圍包含 [台北市、新北市] 全區。' },
        { q: '請問如何預估費用？', a: '請提供現場照片與坪數，我們將線上為您提供免費初步報價。' },
        { q: '請問需要自備清潔/修繕工具嗎？', a: '不需要，我們的專業人員會攜帶所有必需的設備與耗材前往。' },
        { q: '請問施工期間屋主需要在家嗎？', a: '初次服務建議您在場確認範圍，後續若您有事外出，我們也會拍照回報進度。' },
        { q: '請問如果不滿意可以重做嗎？', a: '服務完成當下若有未達標準之處，人員會立即免費補強至您滿意為止。' },
    ],
    '汽車服務': [
        { q: '請問保養需要預約嗎？', a: '為節省您的寶貴時間，強烈建議提前 LINE 預約進廠時段。' },
        { q: '請問有提供代步車嗎？', a: '若維修時間超過 [天數] 天，且代步車有空檔時，我們可免費提供。' },
        { q: '請問自備機油會收工資嗎？', a: '可以自備機油，我們會酌收基本工資及廢油處理費。' },
        { q: '請問保固是多久？', a: '我們提供的零件與維修服務，皆享有 [時間/里程] 的安心保固。' },
        { q: '請問可以刷卡嗎？', a: '支援所有主流信用卡，部份銀行滿額還可分 3 期零利率。' },
    ],
    '婚慶攝影': [
        { q: '請問檔期要多久前預約？', a: '熱門的週末好日子建議提早 6-12 個月前預約，以免向隅。' },
        { q: '請問拍攝會有毛片全給嗎？', a: '我們的方案皆包含所有調色後的數位檔案（全給），精修數量則依方案而定。' },
        { q: '請問如果下雨怎麼辦？', a: '若為全戶外婚紗拍攝，可討論延期；若為婚禮當日紀錄，則會啟動雨天備案的拍攝視角。' },
        { q: '請問有配合的新秘或禮服嗎？', a: '有的，我們有精選的合作夥伴，包套預約可享專屬優惠。' },
        { q: '請問照片大約多久會交件？', a: '拍攝完成後約 6-8 週為後製期，會透過雲端連結給您挑選精修。' },
    ],
    '3C維修': [
        { q: '請問檢測需要收費嗎？', a: '若檢測後決定維修，檢測費將全額折抵維修費；若不修則收取基本檢測費。' },
        { q: '請問維修大約要多久？', a: '更換電池/螢幕約 1-2 小時；若是主機板等複雜維修則需 3-7 個工作天。' },
        { q: '請問換下來的零件可以帶走嗎？', a: '可以的，除電池因安全考量由我們回收外，其餘舊零件您皆可帶回。' },
        { q: '請問修理完資料會不見嗎？', a: '若非軟體重灌或主機板嚴重損毀，一般維修不會影響資料。但強烈建議送修前自行備份。' },
        { q: '請問維修後的保固時間？', a: '我們對更換的該零件提供 [3-6 個月] 不等的非人為損壞保固。' },
    ]
};

interface FAQTabProps {
    config: any;
    setConfig: (fn: (c: any) => any) => void;
    planLevel?: number;
    botId: string;
}

export default function FAQTab({ config, setConfig, planLevel = 0, botId }: FAQTabProps) {
    const fa = getFeatureAccess(planLevel);
    const faqLimit = fa.faq; // 0 = 關閉, -1 = 無限
    const currentCount = config.faq_base?.length ?? 0;
    const atLimit = isAtLimit(currentCount, faqLimit);
    const isLocked = faqLimit === 0;
    const [packOpen, setPackOpen] = useState(false);
    const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});

    const toggleItem = (i: number) => setExpandedItems(p => ({ ...p, [i]: !p[i] }));
    const isItemOpen = (i: number) => expandedItems[i] === true;

    const addPack = (industry: string) => {
        const pack = INDUSTRY_FAQ_PACKS[industry] || [];
        setConfig((c: any) => ({
            ...c,
            faq_base: [...c.faq_base, ...pack.map(p => ({ q: p.q, a: p.a, tags: [] }))]
        }));
    };

    const updateFAQ = (i: number, field: 'q' | 'a', value: string) => {
        const f = [...config.faq_base];
        f[i] = { ...f[i], [field]: value };
        setConfig((c: any) => ({ ...c, faq_base: f }));
    };

    const removeFAQ = (i: number) => {
        const f = [...config.faq_base];
        f.splice(i, 1);
        setConfig((c: any) => ({ ...c, faq_base: f }));
    };

    const [syncUrl, setSyncUrl] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSync = async () => {
        if (!syncUrl) return;
        setIsSyncing(true);
        try {
            const res = await fetch('/api/console/intelligence/sync-faq', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: syncUrl, botId })
            });
            const json = await res.json();
            if (json.success && json.data) {
                const newFaq = json.data.map((item: any) => ({
                    q: item.q,
                    a: item.a,
                    tags: []
                }));
                setConfig((c: any) => ({ ...c, faq_base: [...c.faq_base, ...newFaq] }));
                setSyncUrl('');
            } else {
                alert(json.error || '同步失敗');
            }
        } catch (err) {
            console.error('FAQ Sync Error:', err);
            alert('系統錯誤，請稍後再試');
        } finally {
            setIsSyncing(false);
        }
    };

    // 免費方案 (free/tier=0) 不開放 FAQ
    if (isLocked) {
        return (
            <div className="py-20 flex flex-col items-center justify-center text-center px-10 bg-white/10 backdrop-blur-md rounded-[24px] shadow-sm">
                <div className="w-24 h-24 rounded-[24px] bg-white/60 flex items-center justify-center mb-8 shadow-2xl">
                    <HelpCircle className="w-10 h-10 text-emerald-500" strokeWidth={2.5} />
                </div>
                <h3 className="text-[28px] font-black text-slate-900 mb-4">常見問題智庫尚未開通</h3>
                <p className="text-[16px] text-slate-600 max-w-lg mb-8 font-bold leading-relaxed">
                    此功能需升級至 <span className="text-emerald-600">{getRequiredPlanName('faq', 1)}</span> 以上，
                    即可建立標準化常見問答庫，讓 AI 24 小時自動回覆客人常見問類。
                </p>
                <button
                    onClick={() => window.dispatchEvent(new CustomEvent('switch-tab', { detail: 'billing' }))}
                    className="px-10 py-4 rounded-[16px] bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-black text-[15px] shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                    立即升級解鎖 →
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 額度指示列 */}
            <div className="flex items-center justify-between px-2">
                <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest">常見問答庫</p>
                <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[12px] font-black
                    ${atLimit ? 'bg-red-100 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>
                    <div className={`w-2 h-2 rounded-full ${atLimit ? 'bg-red-500' : 'bg-emerald-500'}`} />
                    {currentCount} / {formatLimit(faqLimit)} 組
                    {atLimit && <span className="ml-1">(已達上限)</span>}
                </div>
            </div>

            {/* 智能同步區塊 */}
            <div className="p-6 rounded-[32px] bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl shadow-slate-200/50 mb-2">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-[12px] bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                        <HelpCircle className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h4 className="text-[16px] font-black">官網 FAQ 自動同步</h4>
                        <p className="text-[12px] text-slate-400 font-bold uppercase tracking-wider">AI Questions Extraction</p>
                    </div>
                </div>
                
                <div className="bg-white/5 p-4 rounded-[20px] backdrop-blur-md border border-white/10 flex gap-3">
                    <div className="flex-1 relative">
                        <HelpCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                        <input
                            type="text"
                            placeholder="貼上官網 FAQ 頁面，AI 自動抓取常見問題..."
                            className="w-full bg-transparent pl-11 pr-4 py-3 text-[14px] font-bold focus:outline-none placeholder:text-slate-500"
                            value={syncUrl}
                            onChange={(e) => setSyncUrl(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={handleSync}
                        disabled={!syncUrl || isSyncing}
                        className="px-6 py-2 rounded-[14px] bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 transition-all font-black text-[14px] flex items-center gap-2"
                    >
                        {isSyncing ? (
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>同步</>
                        )}
                    </button>
                </div>
            </div>

            {/* ══ SECTION 1: 快速匯入 (collapsible) ══ */}
            <div className="rounded-[24px]   overflow-hidden  mb-6">
                <button
                    onClick={() => setPackOpen(v => !v)}
                    className="flex items-center justify-between w-full px-10 py-6 hover:bg-white/80 transition-colors group"
                >
                    <div className="flex flex-col text-left">
                        <span className="text-[17px] font-black text-slate-800">快速匯入問答套組</span>
                        <span className="text-[12px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Industry Packs & Presets</span>
                    </div>
                    <ChevronDown className={`w-6 h-6 text-slate-400 transition-transform duration-300 ${packOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                    {packOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="p-4 space-y-4 border-t border-slate-100 bg-white">

                                {/* Industry packs — 4 columns, max 3 rows */}
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-2">行業別套組（一鍵匯入 5 個問答）</p>
                                    <div className="grid grid-cols-4 gap-2">
                                        {Object.keys(INDUSTRY_FAQ_PACKS).map(ind => (
                                            <motion.button
                                                key={ind}
                                                whileTap={{ scale: 0.96 }}
                                                onClick={() => addPack(ind)}
                                                className="py-2 px-2 rounded-[24px] bg-white border border-slate-200 text-[11.5px] font-bold text-slate-600 hover:border-emerald-500 hover:bg-emerald-500 hover:text-white transition-all text-center"
                                            >
                                                {ind}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                {/* Preset tags — 2-row wrap */}
                                <div>
                                    <p className="text-[13px] font-black text-slate-600 tracking-widest uppercase mb-2">通用標籤（單筆加入）</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {FAQ_PRESETS.map(preset => (
                                            <button
                                                key={preset.label}
                                                onClick={() => setConfig((c: any) => ({
                                                    ...c,
                                                    faq_base: [...c.faq_base, { q: preset.q, a: preset.a, tags: [] }]
                                                }))}
                                                className="py-2 px-2 rounded-[24px] bg-white border border-slate-200 text-[11px] font-bold text-slate-500 hover:border-emerald-500 hover:bg-emerald-500 hover:text-white transition-all text-center"
                                            >
                                                + {preset.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ══ SECTION 2: FAQ List ══ */}
            {config.faq_base.map((item: any, i: number) => {
                const open = isItemOpen(i);
                return (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-[24px]    overflow-hidden group/card transition-all hover:bg-white/80"
                    >
                        {/* Header — always visible */}
                        <div
                            className="flex items-center gap-6 px-10 py-6 cursor-pointer hover:bg-white/40 transition-colors select-none"
                            onClick={() => toggleItem(i)}
                        >
                            {/* Collapse icon */}
                            <div className="shrink-0 w-5 h-5 flex items-center justify-center text-slate-400">
                                {open
                                    ? <ChevronDown className="w-3.5 h-3.5" />
                                    : <ChevronRight className="w-3.5 h-3.5" />
                                }
                            </div>

                            {/* FAQ number */}
                            <span className="shrink-0 text-[10px] font-black text-slate-400 tracking-widest uppercase w-10">
                                Q{i + 1}
                            </span>

                            {/* Question preview */}
                            <span className={`flex-1 text-[17px] font-black tracking-tight truncate ${item.q ? 'text-slate-900' : 'text-slate-400'}`}>
                                {item.q || '（請輸入問題）'}
                            </span>

                            {/* Delete */}
                            <button
                                onClick={e => { e.stopPropagation(); removeFAQ(i); }}
                                className="shrink-0 flex items-center gap-1 text-[11px] text-slate-400 hover:text-red-500 font-bold transition-colors hover:bg-red-50 px-2 py-1 rounded-[24px]"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">刪除</span>
                            </button>
                        </div>

                        {/* Body — collapsible */}
                        <AnimatePresence initial={false}>
                            {open && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.18 }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-5 pb-4 pt-2 space-y-3 border-t border-slate-100">
                                        <InputField
                                            label="問題"
                                            placeholder="常見用戶問題"
                                            value={item.q}
                                            onChange={v => updateFAQ(i, 'q', v)}
                                        />
                                        <TextareaField
                                            label="回答"
                                            placeholder="您的標準答覆內容"
                                            value={item.a}
                                            onChange={v => updateFAQ(i, 'a', v)}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                );
            </div>
            </div>

            {/* ── Add FAQ ── */}
            {atLimit ? (
                <div className="w-full flex flex-col items-center justify-center gap-3 py-8 rounded-[24px] border-2 border-dashed border-amber-200 bg-amber-50">
                    <div className="flex items-center gap-2 text-amber-600">
                        <Lock className="w-5 h-5" />
                        <span className="text-[15px] font-black">已達 {formatLimit(faqLimit)} 組上限（{getPlanName(planLevel)}）</span>
                    </div>
                    <button
                        onClick={() => window.dispatchEvent(new CustomEvent('switch-tab', { detail: 'billing' }))}
                        className="px-6 py-2.5 rounded-[12px] bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-[13px] font-black shadow-md hover:scale-105 transition-all"
                    >
                        升級方案以新增更多 →
                    </button>
                </div>
            ) : (
                <motion.button
                    whileHover={{ scale: 1.01, y: -2 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => {
                        const newIdx = config.faq_base.length;
                        setConfig((c: any) => ({ ...c, faq_base: [...c.faq_base, { q: '', a: '', tags: [] }] }));
                        setTimeout(() => setExpandedItems(p => ({ ...p, [newIdx]: true })), 50);
                    }}
                    className="w-full flex items-center justify-center gap-4 py-8 rounded-[24px] bg-gradient-to-r from-emerald-500 to-cyan-600 text-[18px] font-black text-white transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                >
                    <Plus className="w-5 h-5" /> 新增一個 FAQ 問題
                </motion.button>
            )}
        </div>
    );
}
