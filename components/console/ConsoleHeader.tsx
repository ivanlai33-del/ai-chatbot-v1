import { Bell, ShieldCheck, Store, ChevronDown } from 'lucide-react';

interface ConsoleHeaderProps {
    activeTabLabel?: string;
    viewMode: 'platform' | 'personal';
    setViewMode: (mode: 'platform' | 'personal') => void;
}

export default function ConsoleHeader({ activeTabLabel, viewMode, setViewMode }: ConsoleHeaderProps) {
    const isAdmin = true; // Secured by parent page.tsx check

    return (
        <header className="h-16 border-b border-slate-700/50 bg-[#0f172a]/80 backdrop-blur-md flex items-center justify-between px-8 z-10 shrink-0">
            <div className="flex items-center gap-6">
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] whitespace-nowrap">
                    {activeTabLabel}
                </h2>
                
                {/* Admin-only View Switcher */}
                <div className="flex items-center gap-1 p-1 bg-slate-900/60 rounded-xl border border-slate-700/40 scale-90 origin-left">
                    <button 
                        onClick={() => setViewMode('platform')}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                            viewMode === 'platform' ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "text-slate-500 hover:text-slate-300"
                        )}
                    >
                        <ShieldCheck className="w-3 h-3" /> 平台營運
                    </button>
                    <button 
                        onClick={() => setViewMode('personal')}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                            viewMode === 'personal' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-slate-500 hover:text-slate-300"
                        )}
                    >
                        <Store className="w-3 h-3" /> 五位店長
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="hidden sm:flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        System: Stable
                    </div>
                </div>
                <div className="relative group">
                    <Bell className="w-5 h-5 text-slate-400 cursor-pointer group-hover:text-white transition-colors" />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-500 border-2 border-[#0f172a] rounded-full" />
                </div>
            </div>
        </header>
    );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
