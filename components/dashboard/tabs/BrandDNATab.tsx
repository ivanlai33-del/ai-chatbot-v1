'use client';

import { Tag, Users, MessageSquare, Hand, BrainCircuit, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

/* ── Shared: compact input field ── */
function Field({ label, placeholder, value, onChange, hint }: {
    label: string; placeholder?: string; value: string;
    onChange: (v: string) => void; hint?: string;
}) {
    return (
        <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1.5 tracking-wide uppercase">{label}</label>
            <input
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-[13px] text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all hover:border-slate-300"
            />
            {hint && <p className="text-[10px] text-slate-400 mt-1">{hint}</p>}
        </div>
    );
}

function Textarea({ label, placeholder, value, onChange, rows = 3, hint }: {
    label: string; placeholder?: string; value: string;
    onChange: (v: string) => void; rows?: number; hint?: string;
}) {
    return (
        <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1.5 tracking-wide uppercase">{label}</label>
            <textarea
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                rows={rows}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-[13px] text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all resize-none hover:border-slate-300"
            />
            {hint && <p className="text-[10px] text-slate-400 mt-1">{hint}</p>}
        </div>
    );
}

/* ── Section divider with icon + title ── */
function Section({ Icon, title, subtitle }: { Icon: React.ElementType; title: string; subtitle?: string }) {
    return (
        <div className="flex items-center gap-2.5 pt-2 pb-1">
            <Icon className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={1.5} />
            <div className="flex-1">
                <p className="text-[15px] font-black text-slate-800 leading-none">{title}</p>
                {subtitle && <p className="text-[10px] text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
            <div className="w-full max-w-[240px] h-px bg-slate-100" />
        </div>
    );
}

const TONE_PROMPTS: Record<string, string> = {
    '親切專業': '您是一位親切且專業的店長，請用溫暖且有耐心的語氣回答客人的問題，並在適當的時候提供專業建議。',
    '熱情活潑': '您是一位充滿活力的店長，語氣非常熱情，多用感嘆號和表情符號，讓客人感受到歡迎！',
    '沉穩知性': '您是一位睿智且冷靜的店長，語音沉穩有條理，傾向提供深入見解和精確資訊。',
    '幽默有趣': '您是一位幽默風趣的店長，回話要有梗、有創意，讓客人感到放鬆且愉快。',
    '簡潔俐落': '您是一位效率至上的店長，回話直接切入重點，不拖泥帶水，提供最精確的答案。',
};

const INDUSTRY_TONES: Record<string, string> = {
    '餐飲業': '您是一位熱情好客的餐飲店長，熟悉菜單、口味與用餐體驗，回話溫暖親切。',
    '零售通路': '您是一位專業的零售業店長，熟悉商品規格、庫存與優惠，引導客人找到最合適的商品。',
    '電商網購': '您是一位效率高且親切的電商客服，熟悉退換貨與配送流程，善於協助排解訂單問題。',
    '醫療美容': '您是一位親切專業的醫美接待，熟悉療程與注意事項，善於解答疑慮並引導諮詢預約。',
    '教育補習': '您是一位熱忱的教育機構接待，熟悉課程與招生流程，善於為不同年齡層學員推薦合適課程。',
    '旅遊住宿': '您是一位充滿熱情的旅遊顧問與旅宿管家，熟悉行程與設施，善於激發客人的旅遊興趣。',
    '不動產': '您是一位沉穩專業的房仲接待，熟悉物件資訊與交易流程，回話有條理且具說服力。',
    '金融保險': '您是一位謹慎專業的金融服務接待，回話準確且附有免責提示，善於引導進一步諮詢。',
    '寵物服務': '您是一位溫暖有愛的寵物服務接待，熟悉寵物照護知識，回話親切充滿關懷。',
    '專業顧問': '您是一位知性專業的服務接待，熟悉業務範疇與諮詢流程，回話清晰有條理。',
    '健身運動': '您是一位充滿活力且專業的健身顧問，熟悉會籍與課程，用語積極正向，鼓勵客人行動。',
    '居家服務': '您是一位值得信賴的居家服務管家，回話令人安心，善於引導客人提供報價所需資訊。',
    '汽車服務': '您是一位專業有效率的汽車保修廠長/顧問，熟悉車輛狀況，回話具備專業感且令人安心。',
    '婚慶攝影': '您是一位極具美感與耐心的婚慶攝影顧問，善於傾聽新人需求並提供客製化建議。',
    '3C維修': '您是一位邏輯清晰的 3C 專業維修技師，善於引導客人描述故障狀況並提供初步排除建議。',
    '其他': '您是一位親切且專業的店長，請用溫暖且有耐心的語氣回答客人的問題，並在適當的時候提供專業建議。',
};

const INDUSTRIES = [
    '餐飲業', '零售通路', '電商網購', '醫療美容', '教育補習', 
    '旅遊住宿', '不動產', '金融保險', '寵物服務', '專業顧問', 
    '健身運動', '居家服務', '汽車服務', '婚慶攝影', '3C維修', '其他'
];

interface BrandDNATabProps {
    config: any;
    setConfig: (fn: (c: any) => any) => void;
}

export default function BrandDNATab({ config, setConfig }: BrandDNATabProps) {
    const update = (field: string, value: string) =>
        setConfig((c: any) => ({ ...c, brand_dna: { ...c.brand_dna, [field]: value } }));

    const handleIndustrySelect = (industry: string) => {
        setConfig((c: any) => ({
            ...c,
            brand_dna: {
                ...c.brand_dna,
                industry,
                tone_prompt: INDUSTRY_TONES[industry] || INDUSTRY_TONES['其他'],
            },
        }));
    };

    return (
        <div className="space-y-5">

            {/* ── 行業 ── */}
            <Section Icon={Layers} title="行業類別" subtitle="選擇後 AI 語調自動對應" />
            <div className="grid grid-cols-4 gap-2">
                {INDUSTRIES.map(ind => (
                    <motion.button key={ind} whileTap={{ scale: 0.96 }}
                        onClick={() => handleIndustrySelect(ind)}
                        className={`py-2 px-2 rounded-xl text-[12px] font-bold border transition-all text-center ${
                            config.brand_dna.industry === ind
                                ? 'bg-slate-900 border-slate-900 text-white'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-800 hover:bg-slate-800 hover:text-white'
                        }`}
                    >
                        {ind}
                    </motion.button>
                ))}
            </div>

            {/* ── 品牌基本資料 ── */}
            <Section Icon={Tag} title="品牌基本資料" subtitle="定義品牌身份" />

            <div className="grid grid-cols-2 gap-3">
                <Field label="品牌名稱 *" placeholder="商店或品牌名稱" value={config.brand_dna.name} onChange={v => update('name', v)} hint="顯示在 AI 回話中" />
                <Field label="品牌標語" placeholder="一句話描述品牌特色" value={config.brand_dna.tagline} onChange={v => update('tagline', v)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Field label="目標客群" placeholder="例：25–40 歲家庭主婦" value={config.brand_dna.target_audience} onChange={v => update('target_audience', v)} hint="幫助 AI 調整溝通方式" />
                <Field label="禁止話題" placeholder="例：競品、政治（逗號分隔）" value={config.brand_dna.forbidden_topics} onChange={v => update('forbidden_topics', v)} />
            </div>

            <Textarea label="品牌介紹" placeholder="品牌的故事、理念與背景..." value={config.brand_dna.introduction} onChange={v => update('introduction', v)} rows={3} />
            <Textarea label="主要服務內容" placeholder="核心產品或服務，每行一項..." value={config.brand_dna.services} onChange={v => update('services', v)} rows={3} />

            {/* ── AI 語調 ── */}
            <Section Icon={BrainCircuit} title="AI 語調個性" subtitle="選擇語調，可自由微調提示詞" />

            <div className="flex flex-wrap gap-2">
                {Object.keys(TONE_PROMPTS).map(tone => (
                    <motion.button key={tone} whileTap={{ scale: 0.96 }}
                        onClick={() => setConfig((c: any) => ({ ...c, brand_dna: { ...c.brand_dna, tone, tone_prompt: TONE_PROMPTS[tone] } }))}
                        className={`px-4 py-2 rounded-lg text-[12.5px] font-bold border transition-all ${
                            config.brand_dna.tone === tone
                                ? 'bg-slate-900 border-slate-900 text-white'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
                        }`}
                    >
                        {tone}
                    </motion.button>
                ))}
            </div>

            <Textarea label="語調提示詞（可自訂）" placeholder="描述 AI 的回話風格..." value={config.brand_dna.tone_prompt} onChange={v => update('tone_prompt', v)} rows={3} />

            {/* ── 接待設定 ── */}
            <Section Icon={MessageSquare} title="接待行為設定" subtitle="AI 對話的開場與收尾" />

            <Textarea label="歡迎語" placeholder="例：您好！歡迎來到 [品牌名]，我是您的 AI 助理..." value={config.brand_dna.welcome_message} onChange={v => update('welcome_message', v)} rows={2} />

            <div className="grid grid-cols-2 gap-3">
                <Field label="結尾慣用語" placeholder="例：歡迎再來" value={config.brand_dna.closing_phrase} onChange={v => update('closing_phrase', v)} hint="AI 回話的固定結語" />
                <Field label="轉真人客服關鍵字" placeholder="例：投訴、真人、轉接" value={config.brand_dna.human_trigger_keywords} onChange={v => update('human_trigger_keywords', v)} hint="偵測到後轉交人工" />
            </div>

        </div>
    );
}
