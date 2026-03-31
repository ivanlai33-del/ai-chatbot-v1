'use client';

import { CheckCircle2, MapPin, Truck, Share2 } from 'lucide-react';
import InputField from '@/components/ui/InputField';
import TextareaField from '@/components/ui/TextareaField';

const SHOPPING_PLATFORMS = ['蝦皮購物', 'Momo 購物', 'PChome', '官方網站', 'Pinkoi', '酷澎 Coupang'];
const DELIVERY_PLATFORMS = [
    { name: 'Foodpanda', key: 'foodpanda_url', emoji: '🛵', color: 'bg-pink-50 border-pink-200 text-pink-700' },
    { name: 'Uber Eats', key: 'ubereats_url', emoji: '🟢', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
];

const SectionHeader = ({ icon: Icon, label }: { icon: any; label: string }) => (
    <div className="flex items-center gap-2 pt-1 pb-1">
        <div className="w-5 h-5 rounded-md bg-teal-100 flex items-center justify-center">
            <Icon className="w-3 h-3 text-teal-600" />
        </div>
        <span className="text-[11px] font-black text-slate-400 tracking-widest uppercase">{label}</span>
        <div className="flex-1 h-px bg-slate-100 ml-1" />
    </div>
);

interface ContactTabProps {
    config: any;
    setConfig: (fn: (c: any) => any) => void;
}

export default function ContactTab({ config, setConfig }: ContactTabProps) {
    const togglePlatform = (p: string) => {
        const ps = config.contact_info.platforms || [];
        const next = ps.includes(p) ? ps.filter((x: string) => x !== p) : [...ps, p];
        setConfig((c: any) => ({ ...c, contact_info: { ...c.contact_info, platforms: next } }));
    };

    return (
        <div className="space-y-5">

            {/* ── 基本聯絡 ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InputField label="LINE 客服 ID" placeholder="@your_id" value={config.contact_info.line_id} onChange={v => setConfig((c: any) => ({ ...c, contact_info: { ...c.contact_info, line_id: v } }))} />
                <InputField label="聯絡電話" placeholder="02-1234-5678" value={config.contact_info.phone} onChange={v => setConfig((c: any) => ({ ...c, contact_info: { ...c.contact_info, phone: v } }))} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InputField label="營業時間" placeholder="例：週一至週五 09:00-18:00" value={config.contact_info.hours} onChange={v => setConfig((c: any) => ({ ...c, contact_info: { ...c.contact_info, hours: v } }))} />
                <InputField label="公休日說明" placeholder="例：每週二公休、國定假日休息" value={config.contact_info.closed_days} onChange={v => setConfig((c: any) => ({ ...c, contact_info: { ...c.contact_info, closed_days: v } }))} />
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
            <SectionHeader icon={CheckCircle2} label="購物平台（AI 將主動引導）" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {SHOPPING_PLATFORMS.map(p => (
                    <label 
                        key={p} 
                        className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border-2 transition-all cursor-pointer ${
                            config.contact_info.platforms?.includes(p)
                                ? 'bg-teal-50 border-teal-400 text-teal-700 shadow-sm'
                                : 'bg-white border-slate-200 text-slate-500 hover:border-teal-300 hover:bg-teal-50/30'
                        }`}
                    >
                        <input type="checkbox" className="hidden" checked={config.contact_info.platforms?.includes(p)} onChange={() => togglePlatform(p)} />
                        <span className="text-[12px] font-bold">{p}</span>
                        {config.contact_info.platforms?.includes(p) && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-teal-500" />}
                    </label>
                ))}
            </div>

            {/* ── 外送平台 ── */}
            <SectionHeader icon={Truck} label="外送平台（餐飲業適用）" />
            <div className="space-y-2.5">
                {DELIVERY_PLATFORMS.map(p => (
                    <div key={p.name} className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 ${p.color}`}>
                        <span className="text-base">{p.emoji}</span>
                        <span className="text-[13px] font-black w-20 shrink-0">{p.name}</span>
                        <input
                            type="text"
                            placeholder={`${p.name} 店家連結...`}
                            value={config.contact_info[p.key] || ''}
                            onChange={e => setConfig((c: any) => ({ ...c, contact_info: { ...c.contact_info, [p.key]: e.target.value } }))}
                            className="flex-1 bg-white/70 text-[12px] text-slate-700 px-3 py-1.5 rounded-lg border border-white/80 focus:outline-none focus:border-teal-300 transition-all placeholder:text-slate-400"
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
