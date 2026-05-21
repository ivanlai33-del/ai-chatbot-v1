'use client';

import { motion } from 'framer-motion';
import { Bot, MousePointer2, MousePointerClick, Star } from 'lucide-react';

// Browser Animation Component (Step 1)
export const BrowserGuide = ({ type }: { type: 'chrome' | 'safari' | 'edge' }) => {
    const isSafari = type === 'safari';
    
    return (
        <div className="relative w-full aspect-[16/10] bg-white rounded-2xl border-2 border-slate-100 overflow-hidden shadow-inner">
            <div className="absolute top-0 w-full h-8 bg-slate-50 border-b border-slate-100 flex items-center px-3 gap-1.5">
                <div className="flex gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                </div>
                <div className="flex-1 h-5 bg-white rounded-md border border-slate-200 ml-4 flex items-center px-2">
                    <div className="text-[8px] text-slate-300 overflow-hidden truncate">https://developers.line.biz/console/channel/...</div>
                </div>
                {type !== 'safari' && <div className="w-4 h-4 rounded-sm border border-slate-200 flex items-center justify-center text-[8px] text-slate-400">★</div>}
            </div>

            <div className={`absolute top-8 w-full h-6 border-b border-dashed border-sky-200/50 bg-sky-50/20 flex items-center px-4 ${isSafari ? 'hidden' : ''}`}>
                <div className="flex gap-4">
                    <div className="w-12 h-2 bg-slate-100 rounded-full" />
                    <div className="w-16 h-2 bg-slate-100 rounded-full" />
                    <motion.div 
                        initial={{ opacity: 0.5, scale: 0.95 }}
                        animate={{ opacity: [0.5, 1, 0.5], scale: [0.95, 1.05, 0.95] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-24 h-4 bg-sky-200/50 rounded-md border border-sky-300 flex items-center justify-center -mt-0.5"
                    >
                        <div className="text-[6px] font-black text-sky-600 uppercase tracking-tighter">放置於此</div>
                    </motion.div>
                </div>
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <div className="w-24 h-10 bg-gradient-to-r from-sky-400 to-blue-500 rounded-xl shadow-lg flex items-center justify-center text-[8px] font-bold text-white mb-2 text-center px-1">
                    AI店長設定專用書籤
                </div>
                
                <motion.div 
                    initial={{ y: 0, x: 0, opacity: 1 }}
                    animate={{ 
                        y: isSafari ? -140 : -132, 
                        x: isSafari ? -120 : 60,
                        opacity: [1, 1, 0] 
                    }}
                    transition={{ 
                        duration: 2.5, 
                        repeat: Infinity,
                        repeatDelay: 0.5,
                        ease: "easeInOut"
                    }}
                    className="absolute top-0 z-20"
                >
                    <div className="w-24 h-10 bg-gradient-to-r from-sky-300 to-blue-400 rounded-xl shadow-2xl flex items-center justify-center text-[8px] font-bold text-white opacity-60 text-center px-1">
                         AI店長設定專用書籤
                    </div>
                    <div className="absolute -bottom-2 -right-2 text-slate-800">
                        <MousePointer2 className="w-5 h-5 fill-white" />
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

// Animation: Mouse clicks Messaging API project (Step 2)
export const ProjectSelector = () => {
    return (
        <div className="relative w-full aspect-[16/6] bg-slate-50 rounded-2xl border-2 border-slate-100 overflow-hidden shadow-inner flex flex-col mt-4">
            <div className="w-full h-6 bg-white border-b border-slate-200 flex items-center px-3 gap-2">
                <div className="text-[7px] font-black text-slate-400">LINE Developers Console</div>
            </div>
            <div className="flex-1 p-3 flex gap-3 items-center">
                <div className="relative w-20 aspect-square bg-white rounded-xl border-2 border-sky-500/30 p-2 flex flex-col items-center justify-center gap-1 shadow-sm">
                    <div className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-sky-500 text-white text-[5px] font-black rounded-full shadow-md">Messaging API</div>
                    <Bot className="w-4 h-4 text-sky-500" />
                    <div className="text-[6px] font-black text-slate-800">您的專案</div>
                </div>
                <div className="w-20 aspect-square bg-white rounded-xl border border-slate-200 p-2 flex flex-col items-center justify-center gap-1 opacity-20">
                    <div className="w-6 h-6 rounded-full bg-slate-100" />
                </div>
                
                <motion.div 
                    initial={{ x: 120, y: 60 }}
                    animate={{ 
                        x: [120, 20, 20, 20, 20], 
                        y: [60, 20, 20, 20, 20],
                        scale: [1, 1, 0.8, 1, 1],
                        opacity: [1, 1, 1, 1, 0]
                    }}
                    transition={{ duration: 4, repeat: Infinity, times: [0, 0.3, 0.35, 0.4, 1] }}
                    className="absolute z-20 pointer-events-none"
                >
                    <MousePointerClick className="w-6 h-6 text-black drop-shadow-lg" />
                </motion.div>
            </div>
        </div>
    );
};

// Animation: Clicks bookmark twice on two tabs (Step 3)
export const TabSync = () => {
    return (
        <div className="relative w-full aspect-[16/11] bg-slate-50 rounded-2xl border-2 border-slate-200 overflow-hidden shadow-inner flex flex-col mt-4">
            <div className="w-full bg-slate-100 border-b border-slate-200 p-1 flex flex-col gap-1">
                <div className="flex items-center gap-1 px-1">
                    <motion.div 
                        animate={{ 
                            background: ['#ffffff', '#ffffff', '#e2e8f0', '#e2e8f0', '#ffffff'],
                            borderColor: ['#3b82f6', '#3b82f6', '#00000000', '#00000000', '#3b82f6'],
                            opacity: [1, 1, 0.6, 0.6, 1]
                        }}
                        transition={{ duration: 6, repeat: Infinity, times: [0, 0.45, 0.5, 0.95, 1] }}
                        className="px-3 py-1 bg-white border-t-2 border-sky-500 rounded-t-md flex items-center gap-1.5 shadow-sm"
                    >
                        <div className="w-2.5 h-2.5 rounded-full bg-sky-100 flex items-center justify-center">
                             <Bot className="w-1.5 h-1.5 text-sky-600" />
                        </div>
                        <span className="text-[6px] font-black text-slate-700 whitespace-nowrap">Messaging API</span>
                    </motion.div>
                    <motion.div 
                        animate={{ 
                            background: ['#e2e8f0', '#e2e8f0', '#ffffff', '#ffffff', '#e2e8f0'],
                            borderColor: ['#00000000', '#00000000', '#3b82f6', '#3b82f6', '#00000000'],
                            opacity: [0.6, 0.6, 1, 1, 0.6]
                        }}
                        transition={{ duration: 6, repeat: Infinity, times: [0, 0.45, 0.5, 0.95, 1] }}
                        className="px-3 py-1 bg-slate-200 rounded-t-md flex items-center gap-1.5"
                    >
                         <span className="text-[6px] font-bold text-slate-500 whitespace-nowrap">Basic Settings</span>
                    </motion.div>
                </div>
                <div className="w-full h-7 bg-white border-b border-slate-200 flex items-center px-3 gap-2">
                     <div className="p-1 items-center justify-center bg-sky-50 rounded border border-sky-200 flex gap-1.5 shadow-sm">
                         <Star className="w-2.5 h-2.5 text-sky-500 fill-sky-500" />
                         <div className="w-10 h-1 bg-sky-400/30 rounded-full" />
                         <motion.div 
                             animate={{ scale: [1, 1.1, 1], opacity: [1, 0.8, 1], boxShadow: ['0 0 0px blue', '0 0 8px skyblue', '0 0 0px blue'] }}
                             transition={{ duration: 6, repeat: Infinity, times: [0, 0.25, 0.3, 0.75, 0.8, 1] }}
                             className="absolute left-3 w-20 h-5 bg-sky-500/10 rounded-sm border border-sky-500/20 pointer-events-none"
                         />
                     </div>
                     <div className="w-16 h-1 bg-slate-100 rounded-full" />
                </div>
            </div>

            <div className="flex-1 p-3 bg-white relative">
                 <motion.div 
                    animate={{ 
                        opacity: [1, 1, 0, 0, 1],
                        y: [0, 0, 5, 5, 0]
                    }}
                    transition={{ duration: 6, repeat: Infinity, times: [0, 0.45, 0.5, 0.95, 1] }}
                    className="space-y-3"
                 >
                    <div className="text-[8px] font-black text-slate-800 border-b border-slate-100 pb-1">Channel Access Token</div>
                    <div className="h-4 bg-slate-50 rounded border border-slate-100 w-full" />
                 </motion.div>
                 <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ 
                        opacity: [0, 0, 1, 1, 0],
                        y: [5, 5, 0, 0, 5]
                    }}
                    transition={{ duration: 6, repeat: Infinity, times: [0, 0.45, 0.5, 0.95, 1] }}
                    className="absolute inset-x-3 top-3 space-y-3"
                 >
                    <div className="text-[8px] font-black text-slate-800 border-b border-slate-100 pb-1">Channel Secret</div>
                    <div className="h-4 bg-slate-50 rounded border border-slate-100 w-full" />
                 </motion.div>

                 <motion.div 
                    animate={{ 
                        x: [180, 45, 45, 45, 45, 180, 45, 45, 45, 45], 
                        y: [120, -14, -14, -14, -14, 120, -14, -14, -14, -14],
                        scale: [1, 1, 0.8, 1, 1, 1, 1, 0.8, 1, 1],
                        opacity: [1, 1, 1, 1, 1, 0, 1, 1, 1, 1]
                    }}
                    transition={{ duration: 6, repeat: Infinity, times: [0, 0.2, 0.25, 0.3, 0.4, 0.45, 0.7, 0.75, 0.8, 0.9] }}
                    className="absolute z-20 pointer-events-none"
                >
                    <MousePointerClick className="w-6 h-6 text-black drop-shadow-xl" />
                </motion.div>
            </div>
        </div>
    );
};
