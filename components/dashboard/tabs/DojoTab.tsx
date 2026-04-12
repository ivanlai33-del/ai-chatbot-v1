'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    MessageSquare, Tag, Sparkles, BrainCircuit, Wand2,
    Unlock, Lock, Brain, Loader2, ChevronRight, Save,
    Info, Zap, CheckCircle2, AlertCircle
} from 'lucide-react';
import { getFeatureAccess, getPlanName, getRequiredPlanName } from '@/lib/feature-access';

/* ────────────────────────────────────────────────────────────
   積木定義 — 附上「點下去會發生什麼」步驟說明
──────────────────────────────────────────────────────────── */
const DOJO_BRICKS = [
    {
        id: 'listen',
        icon: MessageSquare,
        title: '店長聽令',
        tagline: '即時插播指令',
        badge: '最常用',
        badgeColor: 'bg-emerald-100 text-emerald-700',
        description: '當天有突發狀況，需要 AI 立刻知道並照辦。',
        howto: '點擊後，在右側輸入欄直接打上狀況，例如：「A 商品今日賣完，請告知客戶改推薦 B 商品」',
        example: '@店長聽令 今日豬排飯已售完，請推薦客人點雞排便當',
        cmd: '@店長聽令 ',
        color: 'from-emerald-50 to-cyan-50',
        accent: 'border-emerald-300',
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
    },
    {
        id: 'sync',
        icon: Tag,
        title: '更新知識',
        tagline: '新增 AI 長期記憶',
        badge: '建立資料',
        badgeColor: 'bg-blue-100 text-blue-700',
        description: '將新商品、新活動、新政策告訴 AI，讓它永久記住。',
        howto: '點擊後，在右側描述新資訊。例如新品上架、優惠活動、特殊規定，讓 AI 以後都能主動告知客人。',
        example: '@更新知識 本月新推出「買一送一」活動，僅限週末，限定 A 商品',
        cmd: '@更新知識 ',
        color: 'from-blue-50 to-indigo-50',
        accent: 'border-blue-300',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
    },
    {
        id: 'audit_k',
        icon: Sparkles,
        title: '調閱知識',
        tagline: '檢視 AI 目前知道什麼',
        badge: '查看現況',
        badgeColor: 'bg-amber-100 text-amber-700',
        description: '讓 AI 列出它目前記住的所有知識摘要。',
        howto: '點擊後直接發送，不需要額外輸入。AI 會回覆目前儲存的全部知識清單，方便你確認資料是否正確。',
        example: '@調閱知識',
        cmd: '@調閱知識',
        color: 'from-amber-50 to-yellow-50',
        accent: 'border-amber-300',
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600',
    },
    {
        id: 'audit_p',
        icon: BrainCircuit,
        title: '調閱人設',
        tagline: '查看 AI 目前的個性策略',
        badge: '查看現況',
        badgeColor: 'bg-amber-100 text-amber-700',
        description: '讓 AI 說明它目前的銷售邏輯、回應風格與對話策略。',
        howto: '點擊後直接發送。AI 會回覆目前被設定的個性、語氣與引導策略，讓你確認店長的「靈魂」是否符合期待。',
        example: '@調閱人設',
        cmd: '@調閱人設',
        color: 'from-purple-50 to-fuchsia-50',
        accent: 'border-purple-300',
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600',
    },
    {
        id: 'persona',
        icon: Wand2,
        title: '修改人設',
        tagline: '調整 AI 底層個性',
        badge: '進階操作',
        badgeColor: 'bg-rose-100 text-rose-700',
        description: '直接修改 AI 的語氣、個性和對話策略，屬於深層調整。',
        howto: '點擊後，在右側描述你希望 AI 如何調整說話方式或銷售策略。適合有明確目標的老闆使用。',
        example: '@修改人設 請更主動幫客人推薦商品，語氣更熱情活潑一點',
        cmd: '@修改人設 ',
        color: 'from-rose-50 to-pink-50',
        accent: 'border-rose-300',
        iconBg: 'bg-rose-100',
        iconColor: 'text-rose-600',
    },
];

/* ────────────────────────────────────────────────────────────
   積木卡片元件
──────────────────────────────────────────────────────────── */
function CommandBrick({ brick, onSelect, isSelected }: {
    brick: typeof DOJO_BRICKS[0];
    onSelect: (cmd: string) => void;
    isSelected: boolean;
}) {
    const [expanded, setExpanded] = useState(false);
    const Icon = brick.icon;

    return (
        <motion.div
            layout
            className={`rounded-[20px] border-2 transition-all duration-200 overflow-hidden cursor-pointer
                ${isSelected
                    ? `${brick.accent} bg-gradient-to-br ${brick.color} shadow-md`
                    : 'border-transparent bg-white shadow-sm hover:shadow-md hover:border-slate-200'
                }`}
            onClick={() => { onSelect(brick.cmd); setExpanded(true); }}
        >
            <div className="p-5">
                {/* Header Row */}
                <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2.5 rounded-[14px] ${brick.iconBg}`}>
                        <Icon className={`w-5 h-5 ${brick.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[15px] font-black text-slate-900">{brick.title}</span>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${brick.badgeColor}`}>
                                {brick.badge}
                            </span>
                        </div>
                        <p className="text-[12px] text-slate-500 font-semibold">{brick.tagline}</p>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
                </div>

                <p className="text-[13px] text-slate-600 leading-relaxed mb-3">{brick.description}</p>

                {/* 點擊展開使用說明 */}
                <button
                    onClick={e => { e.stopPropagation(); setExpanded(v => !v); }}
                    className="flex items-center gap-1.5 text-[12px] font-black text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <Info className="w-3.5 h-3.5" />
                    {expanded ? '收起說明' : '如何使用？'}
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-90' : ''}`} />
                </button>
            </div>

            {/* 展開的使用說明 */}
            {expanded && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`px-5 pb-5 border-t border-black/5`}
                >
                    <div className="pt-4 space-y-3">
                        <div className="flex gap-2">
                            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">1</span>
                            <p className="text-[12px] text-slate-600 leading-relaxed">{brick.howto}</p>
                        </div>
                        <div className="bg-slate-900 rounded-[12px] px-4 py-3">
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1.5">指令範例</p>
                            <p className="text-[12px] text-emerald-400 font-mono leading-relaxed">{brick.example}</p>
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}

/* ────────────────────────────────────────────────────────────
   主元件
──────────────────────────────────────────────────────────── */
export default function DojoTab({ config, setConfig, planLevel, onSave, isSaving }: {
    config: any;
    setConfig: any;
    planLevel: number;
    onSave?: () => void;
    isSaving?: boolean;
}) {
    const [selectedBrickId, setSelectedBrickId] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);

    const handleBrickSelect = (brickId: string, cmd: string) => {
        setSelectedBrickId(brickId);
        // 如果 cmd 不含空格結尾（調閱類），直接覆蓋；否則追加
        const current = config.dynamic_context || '';
        const isQuery = !cmd.endsWith(' ');
        if (isQuery) {
            setConfig((c: any) => ({ ...c, dynamic_context: cmd }));
        } else {
            // 如果目前內容已有相同積木，新增到下一行
            const separator = current.trim() ? '\n' : '';
            setConfig((c: any) => ({ ...c, dynamic_context: current.trim() + separator + cmd }));
        }
    };

    const handleSave = () => {
        onSave?.();
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const charCount = (config.dynamic_context || '').length;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">

            {/* ── 頂部使用說明橫幅 ── */}
            <div className="flex items-start gap-4 p-5 rounded-[20px] bg-gradient-to-r from-cyan-50 to-emerald-50 border border-cyan-200/60">
                <div className="p-2 rounded-[12px] bg-cyan-100 shrink-0">
                    <Zap className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                    <p className="text-[14px] font-black text-slate-800 mb-1">📢 即時下指令給 AI 店長</p>
                    <p className="text-[13px] text-slate-600 leading-relaxed">
                        有突發狀況、新資訊或想調整 AI 的說話方式？在這裡直接告訴店長。
                        <span className="font-black text-cyan-700"> 選積木 → 填內容 → 按儲存</span>，3 秒即時生效。
                    </p>
                </div>
            </div>

            {/* ── Feature Gate ── */}
            {getFeatureAccess(planLevel).instantCommands === 0 && (
                <div className="relative rounded-[24px] overflow-hidden">
                    <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[12px] flex flex-col items-center justify-center p-10 text-center">
                        <div className="w-16 h-16 rounded-[20px] bg-white shadow-xl flex items-center justify-center mb-5 border border-amber-100">
                            <Lock className="w-8 h-8 text-amber-500" />
                        </div>
                        <h5 className="text-[22px] font-black text-slate-900 mb-3">🔒 需要升級才能使用</h5>
                        <p className="text-[15px] text-slate-500 mb-6 max-w-md leading-relaxed">
                            升級至「<span className="text-emerald-600">{getRequiredPlanName('instantCommands', 1)}</span>」以上，即可解鎖指令積木，擁有 AI 店長的最高指令優先權。
                        </p>
                        <button
                            onClick={() => window.dispatchEvent(new CustomEvent('switch-tab', { detail: 'billing' }))}
                            className="px-10 py-4 rounded-[16px] bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-[15px] font-black shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all"
                        >
                            立即升級解鎖
                        </button>
                    </div>
                    <div className="opacity-30 pointer-events-none">
                        <div className="h-64 bg-slate-100 rounded-[24px]" />
                    </div>
                </div>
            )}

            {getFeatureAccess(planLevel).instantCommands > 0 && (
                <div className="grid grid-cols-12 gap-6">

                    {/* ── 左側：積木選單 ── */}
                    <div className="col-span-12 lg:col-span-5 space-y-3">
                        <div className="flex items-center justify-between px-1 mb-1">
                            <p className="text-[12px] font-black text-slate-400 tracking-[0.2em] uppercase flex items-center gap-2">
                                <span className="w-2 h-4 bg-cyan-500 rounded-full" />
                                步驟 1：選擇指令積木
                            </p>
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-[11px] font-black text-cyan-700">
                                <Zap className="w-3 h-3" />
                                可同時啟用 {getFeatureAccess(planLevel).instantCommands} 條（{getPlanName(planLevel)}）
                            </div>
                        </div>
                        {DOJO_BRICKS.map(brick => (
                            <CommandBrick
                                key={brick.id}
                                brick={brick}
                                isSelected={selectedBrickId === brick.id}
                                onSelect={(cmd) => handleBrickSelect(brick.id, cmd)}
                            />
                        ))}

                        {/* 安全說明 */}
                        <div className="p-4 rounded-[16px] bg-slate-900 text-white mt-2">
                            <div className="flex items-center gap-2 mb-2">
                                <Unlock className="w-4 h-4 text-emerald-400" />
                                <span className="text-[11px] font-black text-emerald-400 tracking-widest uppercase">指令防偽保護</span>
                            </div>
                            <p className="text-[12px] text-slate-400 leading-relaxed">
                                僅接受已綁定老闆 LINE ID 的指令。任何試圖模擬老闆身分的請求會被自動攔截。
                            </p>
                        </div>
                    </div>

                    {/* ── 右側：指令組裝台 ── */}
                    <div className="col-span-12 lg:col-span-7 space-y-4">
                        <p className="text-[12px] font-black text-slate-400 tracking-[0.2em] uppercase px-1 flex items-center gap-2">
                            <span className="w-2 h-4 bg-emerald-500 rounded-full" />
                            步驟 2：填寫指令內容
                        </p>

                        {/* 組裝台主體 */}
                        <div className="rounded-[20px] border border-slate-200 bg-white shadow-sm overflow-hidden">
                            {/* 提示列 */}
                            <div className="flex items-center gap-2 px-5 py-3 bg-slate-50 border-b border-slate-100">
                                {selectedBrickId ? (
                                    <>
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        <span className="text-[12px] font-black text-emerald-700">
                                            已選擇「{DOJO_BRICKS.find(b => b.id === selectedBrickId)?.title}」積木 — 在下方繼續輸入具體內容
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <AlertCircle className="w-4 h-4 text-slate-400" />
                                        <span className="text-[12px] font-semibold text-slate-400">
                                            點選左側積木快速開始，或直接在下方自由輸入指令
                                        </span>
                                    </>
                                )}
                            </div>

                            <textarea
                                value={config.dynamic_context || ''}
                                onChange={e => setConfig((c: any) => ({ ...c, dynamic_context: e.target.value }))}
                                placeholder={'點擊左側積木，或直接在此輸入指令...\n\n範例：\n@店長聽令 今日豬排飯售完，請推薦客人改點雞排便當\n@更新知識 本週六下午兩點舉辦試吃活動，歡迎到場'}
                                rows={10}
                                className="w-full p-5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none resize-none leading-relaxed bg-white"
                            />

                            {/* 底部工具列 */}
                            <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-t border-slate-100 gap-4">
                                <div className="flex items-center gap-4 text-[12px] text-slate-400 font-semibold">
                                    <span className="flex items-center gap-1.5">
                                        <BrainCircuit className="w-4 h-4 text-cyan-600" />
                                        {config.last_dojo_update
                                            ? `上次儲存：${new Date(config.last_dojo_update).toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
                                            : '尚未儲存過'}
                                    </span>
                                    <span className={`${charCount > 500 ? 'text-amber-500' : 'text-slate-300'}`}>
                                        {charCount} 字
                                    </span>
                                </div>

                                <button
                                    onClick={handleSave}
                                    disabled={isSaving || !config.dynamic_context?.trim()}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-[12px] text-[13px] font-black transition-all
                                        ${saved
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-40 disabled:pointer-events-none'
                                        }`}
                                >
                                    {isSaving ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> 儲存中...</>
                                    ) : saved ? (
                                        <><CheckCircle2 className="w-4 h-4" /> 已生效！</>
                                    ) : (
                                        <><Save className="w-4 h-4" /> 儲存並生效</>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* 步驟說明 */}
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { step: '1', text: '選擇左側積木', sub: '快速套用指令格式' },
                                { step: '2', text: '填寫指令內容', sub: '描述你想讓 AI 知道的事' },
                                { step: '3', text: '點擊儲存生效', sub: '即時更新 AI 行為' },
                            ].map(item => (
                                <div key={item.step} className="p-4 rounded-[16px] bg-white border border-slate-100 text-center">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-white text-[11px] font-black flex items-center justify-center mx-auto mb-2">
                                        {item.step}
                                    </div>
                                    <p className="text-[12px] font-black text-slate-700">{item.text}</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">{item.sub}</p>
                                </div>
                            ))}
                        </div>

                        {/* 語音聽令提示 */}
                        <div className="flex items-center gap-4 p-4 rounded-[16px] bg-gradient-to-r from-slate-800 to-slate-900 text-white">
                            <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shrink-0">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-[13px] font-black mb-0.5">🗣️ 懶人模式：語音聽令</p>
                                <p className="text-[12px] text-slate-400 leading-relaxed">
                                    不想打字？在 LINE 發送<span className="text-cyan-400 font-black">語音訊息</span>，AI 自動轉譯並同步到這裡。
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}
