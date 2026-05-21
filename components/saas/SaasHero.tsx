'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Bot, ChevronRight, BrainCircuit, Cpu, Network } from 'lucide-react';
import { SAAS_HERO_CONFIG } from '@/config/saas_config';

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 15
        }
    }
} as const;

export default function SaasHero() {
    const { tag, title, highlight, description, backLink, dashboardLink } = SAAS_HERO_CONFIG;
    const TagIcon = tag.icon;

    return (
        <div className="max-w-5xl mx-auto space-y-20 relative z-10">
            {/* Tech Theme Background Animations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-[-1]">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3"></div>
                <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] -translate-y-1/2"></div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 0.08, scale: 1, y: [0, -40, 0], x: [0, 20, 0], rotate: [0, 5, 0] }}
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[5%] right-[10%] text-emerald-400"
                >
                    <Bot className="w-80 h-80" strokeWidth={0.5} />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, rotate: -15 }}
                    animate={{ opacity: 0.08, rotate: [-15, -5, -15], y: [0, 50, 0] }}
                    transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute bottom-[10%] left-[5%] text-emerald-400"
                >
                    <BrainCircuit className="w-96 h-96" strokeWidth={0.5} />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.05, y: [0, -30, 0], x: [0, -30, 0], rotate: [0, -10, 0] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 4 }}
                    className="absolute top-[30%] left-[20%] text-purple-400"
                >
                    <Cpu className="w-72 h-72" strokeWidth={0.5} />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.06, y: [0, 60, 0], x: [0, 40, 0], rotate: [0, 15, 0] }}
                    transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute top-[40%] right-[30%] text-blue-400"
                >
                    <Network className="w-[400px] h-[400px]" strokeWidth={0.5} />
                </motion.div>
            </div>

            {/* Top Navigation */}
            <div className="flex justify-between items-center">
                <Link href={backLink.href} className="inline-flex items-center text-slate-400 hover:text-white transition-colors group">
                    <div className="w-10 h-10 rounded-full bg-slate-800/80 border border-slate-700/50 flex items-center justify-center mr-4 group-hover:bg-emerald-600 group-hover:border-emerald-500 transition-all shadow-lg backdrop-blur-sm">
                        <ArrowLeft className="w-5 h-5 text-slate-300 group-hover:text-white" />
                    </div>
                    <span className="text-sm font-bold tracking-wide">{backLink.text}</span>
                </Link>

                <Link href={dashboardLink.href} className="px-5 py-2.5 bg-slate-800/50 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full border border-slate-700/50 text-xs font-black transition-all flex items-center gap-2 group backdrop-blur-sm">
                    {dashboardLink.text}
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            {/* Hero Section Content */}
            <motion.div initial="hidden" animate="visible" variants={itemVariants} className="max-w-3xl">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20 mb-8">
                    <TagIcon className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 font-bold text-[11px] uppercase tracking-[0.2em]">{tag.text}</span>
                </div>
                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-black mb-6 text-white tracking-tight leading-[1.15]">
                    {title}<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500">{highlight}</span>
                </h1>
                <p className="text-lg text-slate-400 font-medium leading-relaxed max-w-2xl">
                    {description}
                </p>
            </motion.div>
        </div>
    );
}
