'use client';

import { CheckCircle2, MapPin, Truck, Share2, Phone } from 'lucide-react';
import InputField from '@/components/ui/InputField';
import TextareaField from '@/components/ui/TextareaField';
import { getFeatureAccess, getRequiredPlanName } from '@/lib/feature-access';

const SHOPPING_PLATFORMS = ['蝦皮購物', 'Momo 購物', 'PChome', '官方網站', 'Pinkoi', '酷澎 Coupang'];
const DELIVERY_PLATFORMS = [
    { name: 'Foodpanda', key: 'foodpanda_url', emoji: '🛵', color: 'bg-pink-50 border-pink-200 text-pink-700' },
    { name: 'Uber Eats', key: 'ubereats_url', emoji: '🟢', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
];

const SectionHeader = ({ icon: Icon, label }: { icon: any; label: string }) => (
    <div className="flex items-center gap-4 pt-12 pb-6 px-2 first:pt-4">
        <p className="text-[14px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
        <div className="flex-1 h-[1px] bg-slate-100" />
    </div>
);

interface ContactTabProps {
    config: any;
    setConfig: (fn: (c: any) => any) => void;
    planLevel?: number;
}

export default function ContactTab({ config, setConfig, planLevel = 0 }: ContactTabProps) {
    const fa = getFeatureAccess(planLevel);
    const isLocked = !fa.contactPortal;

    const togglePlatform = (p: string) => {
        const ps = config.contact_info.platforms || [];
        const next = ps.includes(p) ? ps.filter((x: string) => x !== p) : [...ps, p];
        setConfig((c: any) => ({ ...c, contact_info: { ...c.contact_info, platforms: next } }));
    };

    if (isLocked) {
        return (
            <div className="py-20 flex flex-col items-center justify-center text-center px-10 bg-white/10 backdrop-blur-md rounded-[24px] shadow-sm">
                <div className="w-24 h-24 rounded-[24px] bg-white/60 flex items-center justify-center mb-8 shadow-2xl">
                    <Phone className="w-10 h-10 text-emerald-500" strokeWidth={2.5} />
                </div>
                <h3 className="text-[28px] font-black text-slate-900 mb-4">聯絡窗口功能尚未開通</h3>
                <p className="text-[16px] text-slate-600 max-w-lg mb-8 font-bold leading-relaxed">
                    升級至 <span className="text-emerald-600">{getRequiredPlanName('contactPortal')}</span> 以上方案，
                    即可設定商家電話、門市地址、營業時間等資訊，讓 AI 直接為客人指引聯絡。
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
        <div className="space-y-5">

            <div className=" rounded-[24px] p-10   space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <InputField label="LINE 客服 ID" placeholder="@your_id" value={config.contact_info.line_id} onChange={v => setConfig((c: any) => ({ ...c, contact_info: { ...c.contact_info, line_id: v } }))} />
                    <InputField label="聯絡電話" placeholder="02-1234-5678" value={config.contact_info.phone} onChange={v => setConfig((c: any) => ({ ...c, contact_info: { ...c.contact_info, phone: v } }))} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <InputField label="營業時間" placeholder="例：週一至週五 09:00-18:00" value={config.contact_info.hours} onChange={v => setConfig((c: any) => ({ ...c, contact_info: { ...c.contact_info, hours: v } }))} />
                    <InputField label="公休日說明" placeholder="例：每週二公休、國定假日休息" value={config.contact_info.closed_days} onChange={v => setConfig((c: any) => ({ ...c, contact_info: { ...c.contact_info, closed_days: v } }))} />
                </div>
            </div>

            {/* ── 位置資訊 ── */}
            <SectionHeader icon={MapPin} label="位置與到達資訊" />
            <div className="space-y-3">
                <InputField label="Google Map 連結" placeholder="https://maps.google.com/..." value={config.contact_info.map_url} onChange={v => setConfig((c: any) => ({ ...c, contact_info: { ...c.contact_info, map_url: v } }))} />
                <InputField label="停車資訊" placeholder="例：B1 停車場，週一免費 / 附近步行 3 分鐘" value={config.contact_info.parking_info} onChange={v => setConfig((c: any) => ({ ...c, contact_info: { ...c.contact_info, parking_info: v } }))} />
            </div>

            {/* ── 預約方式 ── */}
            <SectionHeader icon={CheckCircle2} label="預約 / 服務方式" />
            <TextareaField 
                label="預約方式說明（AI 將主動引導客人）" 
                placeholder="例：歡迎透過 LINE 傳訊或致電預約，或填寫 Google 表單：https://forms.google.com/..." 
                value={config.contact_info.booking_method}
                onChange={v => setConfig((c: any) => ({ ...c, contact_info: { ...c.contact_info, booking_method: v } }))} 
                rows={2}
            />

            {/* ── 購物平台 ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SHOPPING_PLATFORMS.map(p => (
                    <label 
                        key={p} 
                        className={`flex items-center gap-3 p-5 rounded-[24px] border transition-all cursor-pointer  ${
                            config.contact_info.platforms?.includes(p)
                                ? 'bg-gradient-to-r from-emerald-500 to-cyan-600 border-transparent text-white shadow-emerald-500/20'
                                : 'bg-white/60  text-slate-600 hover:bg-white'
                        }`}
                    >
                        <input type="checkbox" className="hidden" checked={config.contact_info.platforms?.includes(p)} onChange={() => togglePlatform(p)} />
                        <span className="text-[17px] font-black">{p}</span>
                        {config.contact_info.platforms?.includes(p) && <CheckCircle2 className="w-5 h-5 ml-auto text-emerald-400" />}
                    </label>
                ))}
            </div>

            {/* ── 外送平台 ── */}
            <SectionHeader icon={Truck} label="外送平台（餐飲業適用）" />
            <div className="space-y-4">
                {DELIVERY_PLATFORMS.map(p => (
                    <div key={p.name} className="flex items-center gap-6 p-6 rounded-[24px]    group hover:bg-white transition-all">
                        <div className="w-14 h-14 rounded-[24px] bg-white shadow-sm flex items-center justify-center text-2xl border border-slate-50 group-hover:scale-110 transition-transform">
                            {p.emoji}
                        </div>
                        <span className="text-[18px] font-black w-24 shrink-0 text-slate-800">{p.name}</span>
                        <input
                            type="text"
                            placeholder={`${p.name} 店家連結...`}
                            value={config.contact_info[p.key] || ''}
                            onChange={e => setConfig((c: any) => ({ ...c, contact_info: { ...c.contact_info, [p.key]: e.target.value } }))}
                            className="flex-1  text-[16px] font-bold text-slate-700 px-6 py-4 rounded-[24px]  focus:outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-300"
                        />
                    </div>
                ))}
            </div>

            {/* ── 社群媒體 ── */}
            <SectionHeader icon={Share2} label="社群媒體連結" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InputField label="Instagram" placeholder="https://instagram.com/your_account" value={config.contact_info.instagram} onChange={v => setConfig((c: any) => ({ ...c, contact_info: { ...c.contact_info, instagram: v } }))} />
                <InputField label="Facebook" placeholder="https://facebook.com/your_page" value={config.contact_info.facebook} onChange={v => setConfig((c: any) => ({ ...c, contact_info: { ...c.contact_info, facebook: v } }))} />
            </div>

            {/* ── 分店據點 ── */}
            <SectionHeader icon={MapPin} label="分店據點" />
            <TextareaField 
                label="每行一個名稱或地址" 
                placeholder={"例：\n台北大安店 (台北市大安區...)\n台中勤美店 (台中市西區...)"}
                value={config.contact_info.branches?.join('\n') || ''}
                onChange={v => setConfig((c: any) => ({ ...c, contact_info: { ...c.contact_info, branches: v.split('\n').filter((t: string) => t) } }))}
                rows={4}
            />
        </div>
    );
}
