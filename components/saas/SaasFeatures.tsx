'use client';

import { motion } from 'framer-motion';
import { SAAS_FEATURES } from '@/config/saas_config';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

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

export default function SaasFeatures() {
    return (
        <div className="relative">
            {/* Random Signal Flashes (Simulating Data Transfer) */}
            <div className="absolute inset-0 pointer-events-none z-[-1]">
                <motion.div
                    animate={{ opacity: [0, 0.9, 0], scale: [0.5, 1.5, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 4, ease: "circIn" }}
                    className="absolute top-[35%] left-[28%] w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_20px_10px_rgba(52,211,153,0.6)]"
                />
                <motion.div
                    animate={{ opacity: [0, 1, 0], scale: [0.5, 1.8, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 7, ease: "circIn" }}
                    className="absolute bottom-[35%] right-[35%] w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_15px_8px_rgba(52,211,153,0.6)]"
                />
                <motion.div
                    animate={{ opacity: [0, 0.8, 0], scale: [0.5, 1.2, 0.5] }}
                    transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 5.5, ease: "circIn" }}
                    className="absolute top-[60%] left-[15%] w-2 h-2 bg-purple-400 rounded-full shadow-[0_0_18px_8px_rgba(192,132,252,0.6)]"
                />
                <motion.div
                    animate={{ opacity: [0, 0.9, 0], scale: [0.5, 1.6, 0.5] }}
                    transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 6.2, ease: "circIn" }}
                    className="absolute top-[20%] right-[45%] w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_15px_8px_rgba(96,165,250,0.6)]"
                />
            </div>

            <motion.div initial="hidden" animate="visible" variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {SAAS_FEATURES.map((feature, idx) => {
                    const Icon = feature.icon;
                    return (
                        <motion.div key={idx} variants={itemVariants} className="p-8 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10 hover:bg-slate-800/50 transition-colors">
                            <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-6">
                                <Icon className="w-6 h-6 text-emerald-400" />
                            </div>
                            <h3 className="text-lg font-black text-white mb-3">{feature.title}</h3>
                            <p className="text-sm text-slate-400 leading-relaxed font-medium">
                                {feature.description}
                            </p>
                        </motion.div>
                    );
                })}
            </motion.div>
        </div>
    );
}
