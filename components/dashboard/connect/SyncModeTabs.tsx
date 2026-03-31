'use client';

interface SyncModeTabsProps {
    mode: 'auto' | 'manual' | 'remote';
    setMode: (mode: 'auto' | 'manual' | 'remote') => void;
}

export default function SyncModeTabs({ mode, setMode }: SyncModeTabsProps) {
    return (
        <div className="flex bg-white/50 p-1 rounded-2xl border border-slate-200 w-fit">
            {(['auto', 'manual', 'remote'] as const).map((m) => (
                <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`px-8 py-3 rounded-xl text-lg font-black transition-all ${
                        mode === m 
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' 
                            : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                    {m === 'auto' ? '自動同步' : m === 'manual' ? '手動填寫' : '遠端邀請'}
                </button>
            ))}
        </div>
    );
}
