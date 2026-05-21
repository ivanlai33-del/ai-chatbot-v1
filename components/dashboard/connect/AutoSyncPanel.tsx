'use client';

import { motion } from 'framer-motion';
import { RefreshCw, Star, MoveRight, ExternalLink } from 'lucide-react';

interface AutoSyncPanelProps {
    setupToken: string | null;
    currentDomain: string;
    renderBookmarkletButton: () => React.ReactNode;
}

export default function AutoSyncPanel({ setupToken, currentDomain, renderBookmarkletButton }: AutoSyncPanelProps) {
    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 italic">
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white text-xs font-black flex items-center justify-center shadow-lg shadow-blue-500/20">1</div>
                    <p className="text-sm font-medium text-slate-600">將下方按鈕「拖移」到瀏覽器書籤列</p>
                </div>
                <div className="flex justify-center py-6">
                    {renderBookmarkletButton()}
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 italic">
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white text-xs font-black flex items-center justify-center shadow-lg shadow-blue-500/20">2</div>
                    <p className="text-sm font-medium text-slate-600">前往 LINE Developers 並點擊該書籤即可完成</p>
                </div>
            </div>
            <button 
                onClick={() => window.open('https://developers.line.biz/console/', '_blank')}
                className="w-full py-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 text-slate-600"
            >
                打開 LINE Developers 控制台 <ExternalLink className="w-4 h-4" />
            </button>
        </div>
    );
}
