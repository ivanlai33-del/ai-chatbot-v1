'use client';

import { useRef } from 'react';
import TextareaField from '@/components/ui/TextareaField';

const LOGIC_PRESETS = [
    { label: '首次購優惠', text: '- 當客人首次詢問時，提供「首購 9 折」優惠碼：WELCOME90\n' },
    { label: '預約流程', text: '- 提到預約時，引導客人提供「姓名、電話、預約時間」，告知需提前三天預約\n' },
    { label: '售後服務', text: '- 若詢問售後或退換貨，請引導至官方 LINE 客服處理\n' },
    { label: '促銷活動', text: '- 推廣目前的促銷活動，全館滿 2000 折 200\n' },
    { label: '缺貨處理', text: '- 若商品缺貨，請建議客人留下聯繫方式以利到貨通知\n' },
    { label: '會員制度', text: '- 介紹會員積點：消費滿額積點，點數可折抵現金\n' },
    { label: '實體門市', text: '- 若詢問實體店，引導至分店資訊並提供 Google Map 連結\n' },
    { label: '配送時間', text: '- 告知配送時間：下單後 3-5 個工作天內送達\n' },
    { label: '支付方式', text: '- 支援支付：信用卡、LINE Pay、電子支付及轉帳\n' },
    { label: '商業合作', text: '- 商業合作洽詢請引導至官方信箱：business@example.com\n' },
];

const INDUSTRY_LOGIC_GROUPS = [
    { label: '餐飲業', tags: [
        { label: '推薦特餐', text: '- 主動介紹今日特餐或推薦菜色\n' },
        { label: '引導訂位', text: '- 引導提供「姓名、人數、用餐時間」以完成訂位\n' },
        { label: '外帶外送', text: '- 詢問外送時，引導至 Foodpanda/Uber Eats\n' },
    ]},
    { label: '零售通路', tags: [
        { label: '推播優惠', text: '- 遇猶豫客，主動提供今日限時滿額折扣\n' },
        { label: '指引門市', text: '- 客人詢問實體門市時，主動提供門市地址與營業時間\n' },
        { label: '缺貨留資', text: '- 若商品缺貨，主動請客人留下聯繫方式以便貨到通知\n' },
    ]},
    { label: '電商網購', tags: [
        { label: '退貨指引', text: '- 詢問退換貨時，先安撫情緒並提供退款/換貨表單連結\n' },
        { label: '物流查詢', text: '- 詢問進度時，引導客人提供訂單編號以供進度查詢\n' },
        { label: '促銷提醒', text: '- 結帳障礙時，提醒滿額免運或檔期優惠代碼\n' },
    ]},
    { label: '醫療美容', tags: [
        { label: '首次體驗', text: '- 首次諮詢客人，主動提供基本掛號/評估的免費體驗邀請\n' },
        { label: '術後衛教', text: '- 客人詢問保養時，提醒術後防曬保濕等核心衛教要點\n' },
        { label: '預約改期', text: '- 提醒若需更改預約請務必於 24 小時前告知\n' },
    ]},
    { label: '教育補習', tags: [
        { label: '試聽引導', text: '- 對於猶豫的家長或學員，主動邀請免費預約試聽\n' },
        { label: '師資介紹', text: '- 強調師資陣容與小班制優勢以提升信任度\n' },
        { label: '報名優惠', text: '- 主動提及二人同行或早鳥折扣以促成報名\n' },
    ]},
    { label: '旅遊住宿', tags: [
        { label: '熱門提醒', text: '- 提醒連假/週末熱門時段易滿房，建議盡早預訂\n' },
        { label: '交通指引', text: '- 主動提供大眾運輸路線、接駁車或停車場資訊\n' },
        { label: '周邊景點', text: '- 預訂成功後，主動推薦附近的熱門景點給客人\n' },
    ]},
    { label: '不動產', tags: [
        { label: '預約帶看', text: '- 引導客人留下預算、地區偏好及聯絡方式以安排帶看\n' },
        { label: '促案推薦', text: '- 如果客人的預算不足，主動推薦其他高CP值替代物件\n' },
        { label: '資金試算', text: '- 主動提供房貸試算的概念或房貸理財工具連結\n' },
    ]},
    { label: '金融保險', tags: [
        { label: '免責聲明', text: '- 各項建議後務必附註「投資理財有風險，不構成絕對投資建議」\n' },
        { label: '初診邀請', text: '- 引導客人提供現有保單進行一對一免費健診評估\n' },
        { label: '理賠指引', text: '- 安撫發生狀況的客人，提供需備齊的理賠文件清單\n' },
    ]},
    { label: '寵物服務', tags: [
        { label: '疫苗提醒', text: '- 預約住宿或美容時，提醒務必攜帶疫苗施打證明\n' },
        { label: '安撫飼主', text: '- 以愛毛孩的同理心安撫飼主對於寵物分離焦慮的擔憂\n' },
        { label: '客製需求', text: '- 詢問毛孩是否有特定過敏原或特殊習性需重點紀錄\n' },
    ]},
    { label: '專業顧問', tags: [
        { label: '保密承諾', text: '- 對話中主動強調對客戶專案資料的高度保密承諾\n' },
        { label: '評估會議', text: '- 引導客戶線上填寫基本現況表單以安排初步評估會議\n' },
        { label: '專案實績', text: '- 適時分享過往無機密的成功案例以增加信賴感\n' },
    ]},
    { label: '健身運動', tags: [
        { label: '激勵用語', text: '- 語氣中充滿活力與鼓勵，強烈稱讚客人想改變的決心\n' },
        { label: '體驗課', text: '- 推薦從單次零負擔的教練體驗課開始嘗試\n' },
        { label: '目標確認', text: '- 詢問客人的主要目標是減脂或增肌，以推薦對應課程\n' },
    ]},
    { label: '居家服務', tags: [
        { label: '照片估價', text: '- 請客人拍攝需施作的現場空間照片，以便免費提供初步估價\n' },
        { label: '安心保證', text: '- 說明公司人員皆有良民證與專業訓練，讓客人安心開門\n' },
        { label: '時間確認', text: '- 引導客人確認希望能來派工服務的確切日期與時段\n' },
    ]},
    { label: '汽車服務', tags: [
        { label: '規格詢問', text: '- 主動詢問車款、年份與遇到的狀況，以加速判定處理方式\n' },
        { label: '急難救援', text: '- 若客人描述為拋錨或無法行駛，立刻提供 24h 道路救援聯絡方式\n' },
        { label: '保養邀約', text: '- 以確保行車安全為由，邀請入廠進行免費健檢\n' },
    ]},
    { label: '婚慶攝影', tags: [
        { label: '作品集', text: '- 了解客人偏好的風格（清新、歐美、街拍）並給予對應作品集連結\n' },
        { label: '檔期提醒', text: '- 強調旺季好日子檔期有限，鼓勵盡速預約現場洽談\n' },
        { label: '預算聚焦', text: '- 確認客人希望單純拍照還是包含租借禮服、新秘的包套方案\n' },
    ]},
    { label: '3C維修', tags: [
        { label: '備份提醒', text: '- 確認預約維修前，務必再三提醒客人自行備份重要資料\n' },
        { label: '故障排除', text: '- 提供初步的重開機、清理接點等簡易自救法以建立信任感\n' },
        { label: '維修報價', text: '- 強調線上報價為初步估計，實際需以工程師拆機精確檢測後為主\n' },
    ]},
];

interface LogicTabProps {
    config: any;
    setConfig: (fn: (c: any) => any) => void;
}

/* Single industry dropdown: selecting an option appends its text then resets */
function IndustrySelect({ group, onAppend }: {
    group: typeof INDUSTRY_LOGIC_GROUPS[0];
    onAppend: (text: string) => void;
}) {
    const ref = useRef<HTMLSelectElement>(null);
    return (
        <select
            ref={ref}
            defaultValue=""
            aria-label={`${group.label} 引導規則`}
            title={`${group.label} 引導規則`}
            onChange={e => {
                const val = e.target.value;
                if (val) {
                    onAppend(val);
                    setTimeout(() => { if (ref.current) ref.current.value = ''; }, 0);
                }
            }}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-[12.5px] font-bold text-slate-700 focus:outline-none focus:border-slate-500 cursor-pointer hover:border-slate-400 transition-all"
        >
            <option value="" disabled>＋ {group.label}</option>
            {group.tags.map(tag => (
                <option key={tag.label} value={tag.text}>{tag.label}</option>
            ))}
        </select>
    );
}

export default function LogicTab({ config, setConfig }: LogicTabProps) {
    const append = (text: string) =>
        setConfig((c: any) => ({ ...c, logic_rules: c.logic_rules + text }));

    const selectedIndustry = config.brand_dna?.industry || '';
    
    // Fuzzy match the selected industry against our logic groups
    const activeGroup = INDUSTRY_LOGIC_GROUPS.find(g => 
        selectedIndustry && (g.label.includes(selectedIndustry) || selectedIndustry.includes(g.label.replace('業', '')))
    );

    return (
        <div className="space-y-5">

            {/* ── 行業別下拉選單（只顯示當前選中的行業）── */}
            <div>
                <p className="text-[11px] font-black text-slate-400 tracking-widest uppercase mb-2.5">
                    專屬行業引導標籤（{selectedIndustry || '未選擇行業'}）
                </p>
                {activeGroup ? (
                    <div className="w-1/3">
                        <IndustrySelect group={activeGroup} onAppend={append} />
                    </div>
                ) : (
                    <div className="w-full px-4 py-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-[12px] font-bold text-slate-400 text-center">
                        {selectedIndustry 
                            ? `目前「${selectedIndustry}」尚無專屬預設標籤，您可以自由新增引導規則。`
                            : '請先至「品牌 DNA」分頁選擇行業別，以顯示專屬引導標籤。'}
                    </div>
                )}
            </div>

            {/* ── 通用 Tag（3 欄網格）── */}
            <div>
                <p className="text-[11px] font-black text-slate-400 tracking-widest uppercase mb-2.5">
                    通用引導標籤
                </p>
                <div className="grid grid-cols-3 gap-2">
                    {LOGIC_PRESETS.map(tag => (
                        <button
                            key={tag.label}
                            onClick={() => append(tag.text)}
                            className="py-2.5 px-3 rounded-xl bg-white border border-slate-200 text-[11.5px] font-bold text-slate-600 hover:border-slate-800 hover:bg-slate-800 hover:text-white transition-all text-center"
                        >
                            + {tag.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── AI 引導規則自由輸入 ── */}
            <div>
                <p className="text-[11px] font-black text-slate-400 tracking-widest uppercase mb-2.5">
                    AI 引導規則（自由輸入）
                </p>
                <TextareaField
                    label=""
                    placeholder={"例：\n- 當客人詢問價格時，先介紹您的核心方案\n- 當客人猶豫時，提供限時折扣或贈品資訊\n- 遇到投訴，立即致歉並提供轉接客服資訊"}
                    value={config.logic_rules}
                    onChange={v => setConfig((c: any) => ({ ...c, logic_rules: v }))}
                    rows={12}
                />
            </div>
        </div>
    );
}
