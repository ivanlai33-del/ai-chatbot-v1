"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface RobotAvatarProps {
    isTyping: boolean;
    isSaaS?: boolean;
    onClick?: () => void;
    botPath?: string;
    className?: string; // Support custom positioning
}

export const RobotAvatar: React.FC<RobotAvatarProps> = ({ isTyping, isSaaS = false, onClick, botPath = '/bot_01.svg', className }) => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isMouseDown, setIsMouseDown] = useState(false);
    const robotRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let lastUpdate = 0;
        const handleMouseMove = (e: MouseEvent) => {
            const now = Date.now();
            if (now - lastUpdate > 100) {
                setMousePos({ x: e.clientX, y: e.clientY });
                lastUpdate = now;
            }
        };
        const handleMouseUp = () => setIsMouseDown(false);

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    const getDodgeOffset = () => {
        if (!robotRef.current || isTyping || isSaaS) return { x: 0, y: 0, rotateOffset: 0 };
        const rect = robotRef.current.getBoundingClientRect();

        const currentScreenX = rect.left + rect.width / 2;
        const currentScreenY = rect.top + rect.height / 2;

        const dx = mousePos.x - currentScreenX;
        const dy = mousePos.y - currentScreenY;
        const distance = Math.max(Math.sqrt(dx * dx + dy * dy), 1);

        if (isMouseDown) {
            let currentTranslateX = 0;
            let currentTranslateY = 0;
            const transform = window.getComputedStyle(robotRef.current).transform;
            if (transform && transform !== 'none') {
                const match = transform.match(/matrix\((.+)\)/);
                if (match) {
                    const values = match[1].split(', ');
                    currentTranslateX = parseFloat(values[4]);
                    currentTranslateY = parseFloat(values[5]);
                }
            }

            const layoutCenterX = currentScreenX - currentTranslateX;
            const layoutCenterY = currentScreenY - currentTranslateY;

            const targetScreenX = mousePos.x;
            const targetScreenY = mousePos.y - rect.height - 80;

            const pullX = targetScreenX - layoutCenterX;
            const pullY = targetScreenY - layoutCenterY;

            const rotateOffset = -dx * 0.15;

            return { x: pullX, y: pullY, rotateOffset };
        }

        const radius = 150;
        if (distance < radius) {
            const force = (radius - distance) / radius;
            const pushX = -(dx / distance) * force * 100;
            const pushY = -(dy / distance) * force * 100;
            return { x: pushX, y: pushY, rotateOffset: pushX * 0.15 };
        }

        return { x: 0, y: 0, rotateOffset: 0 };
    };

    const { x: dodgeX, y: dodgeY, rotateOffset } = getDodgeOffset();

    return (
        <motion.div
            ref={robotRef}
            aria-label="AI 店長機器人"
            onMouseDown={() => setIsMouseDown(true)}
            onClick={onClick}
            animate={{
                x: dodgeX,
                y: dodgeY,
                rotate: rotateOffset,
                scale: isMouseDown ? 0.95 : 1
            }}
            transition={{ type: "spring", stiffness: 120, damping: 15, mass: 0.8 }}
            className={cn("z-30 cursor-grab active:cursor-grabbing group", className)}
        >
            <div className="relative">
                <motion.div
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="w-[230px] h-[230px] drop-shadow-2xl relative"
                >
                    <img 
                        src={botPath} 
                        className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(6,199,85,0.4)]" 
                        alt="Robot Avatar" 
                    />
                </motion.div>
                
                {/* Speech Bubble when hovering */}
                <div className="absolute -top-12 left-0 bg-white px-3 py-1.5 rounded-xl shadow-lg border border-zinc-100 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    <p className="text-[10px] font-black text-zinc-600">抓不到我吧！😏</p>
                    <div className="absolute -bottom-1 left-4 w-2 h-2 bg-white border-r border-b border-zinc-100 rotate-45" />
                </div>
            </div>
        </motion.div>
    );
};
