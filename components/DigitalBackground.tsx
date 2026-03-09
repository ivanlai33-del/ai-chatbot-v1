"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function DigitalBackground() {
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch by only rendering after mount
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {/* Ambient Glowing Orbs */}
            <motion.div
                className="absolute top-[15%] left-[10%] w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[100px]"
                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-emerald-400/10 rounded-full blur-[120px]"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            />

            {/* Slow Horizontal Data Streams */}
            {[...Array(8)].map((_, i) => (
                <motion.div
                    key={`stream-${i}`}
                    className="absolute h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent"
                    style={{
                        top: `${15 + i * 10}%`,
                        width: '40%',
                    }}
                    initial={{ x: '-100vw', opacity: 0 }}
                    animate={{
                        x: ['-50vw', '150vw'],
                        opacity: [0, 1, 1, 0]
                    }}
                    transition={{
                        duration: 8 + (i % 5) * 2,
                        repeat: Infinity,
                        ease: "linear",
                        delay: (i % 4) * 1.5,
                    }}
                />
            ))}

            {/* Fast Shooting Packets (Messages) */}
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={`packet-${i}`}
                    className="absolute h-[2px] w-[80px] rounded-full bg-white shadow-[0_0_15px_3px_rgba(56,189,248,0.8)]"
                    style={{
                        top: `${20 + (i % 6) * 12}%`,
                    }}
                    initial={{ x: '-20vw', opacity: 0 }}
                    animate={{
                        x: ['-20vw', '120vw'],
                        opacity: [0, 1, 1, 0]
                    }}
                    transition={{
                        duration: 2 + (i % 3),
                        repeat: Infinity,
                        ease: "linear",
                        delay: (i % 5) * 1.2 + 0.5,
                    }}
                />
            ))}

            {/* Diagonal Passing Lines */}
            {[...Array(4)].map((_, i) => (
                <motion.div
                    key={`diag-${i}`}
                    className="absolute h-[1px] bg-gradient-to-r from-transparent via-blue-400/30 to-transparent origin-left"
                    style={{
                        top: '-10%',
                        width: '100%',
                    }}
                    initial={{ rotate: 35 + i * 5, x: '-50vw', y: '-50vh', opacity: 0 }}
                    animate={{
                        x: ['-50vw', '150vw'],
                        y: ['-50vh', '150vh'],
                        opacity: [0, 1, 1, 0]
                    }}
                    transition={{
                        duration: 10 + i * 2,
                        repeat: Infinity,
                        ease: "linear",
                        delay: i * 2,
                    }}
                />
            ))}

            {/* Floating Connection Nodes */}
            {[...Array(20)].map((_, i) => {
                const isBlue = i % 2 === 0;
                return (
                    <motion.div
                        key={`node-${i}`}
                        className={`absolute w-[2px] h-[2px] rounded-full ${isBlue ? 'bg-blue-300' : 'bg-emerald-300'} shadow-[0_0_8px_1px_rgba(255,255,255,0.4)]`}
                        style={{
                            top: `${(i * 5) % 100}%`,
                            left: `${(i * 13) % 100}%`,
                        }}
                        initial={{ opacity: 0 }}
                        animate={{
                            y: [0, -15, 0],
                            opacity: [0.1, 0.7, 0.1]
                        }}
                        transition={{
                            duration: 3 + (i % 4),
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: (i % 3),
                        }}
                    />
                );
            })}
        </div>
    );
}
