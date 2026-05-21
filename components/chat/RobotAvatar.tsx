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
    const [clickCount, setClickCount] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);
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

    // Click handler for Easter Egg
    const handleInternalClick = () => {
        const nextCount = clickCount + 1;
        setClickCount(nextCount);
        
        if (nextCount >= 4) {
            setIsSpinning(true);
            setTimeout(() => {
                setIsSpinning(false);
                setClickCount(0);
            }, 1000);
        }

        // Reset click count after 3 seconds of inactivity
        const timer = setTimeout(() => setClickCount(0), 3000);
        
        if (onClick) onClick();
    };

    const getDodgeOffset = () => {
        // Shaking logic when talking or dodge logic when idle
        if (!robotRef.current || isTyping || isSaaS || isSpinning) return { x: 0, y: 0, rotateOffset: 0 };
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
            onClick={handleInternalClick}
            animate={{
                x: dodgeX,
                y: dodgeY,
                rotate: isSpinning ? 360 : rotateOffset,
                scale: isMouseDown ? 0.95 : 1
            }}
            transition={isSpinning ? { duration: 0.8, ease: "backOut" } : { type: "spring", stiffness: 120, damping: 15, mass: 0.8 }}
            className={cn("z-30 cursor-grab active:cursor-grabbing group", className)}
        >
            <div className="relative">
                <motion.div
                    animate={
                        isTyping 
                        ? { 
                            scale: [1, 1.02, 0.98, 1.01, 1],
                            rotate: [0, -1, 1, -0.5, 0.5, 0],
                            y: [0, -3, 0, -2, 0]
                        }
                        : { 
                            scale: [1, 1.08, 1], 
                            rotate: [0, 3, -3, 0] 
                        }
                    }
                    transition={
                        isTyping 
                        ? { duration: 2.0, repeat: Infinity, ease: "easeInOut" }
                        : { duration: 5, repeat: Infinity, ease: "easeInOut" }
                    }
                    className="w-[230px] h-[230px] drop-shadow-2xl relative"
                >
                    <img 
                        src={botPath} 
                        className={cn(
                            "w-full h-full object-contain filter transition-all duration-300",
                            isTyping ? "drop-shadow-[0_0_25px_rgba(6,199,85,0.8)]" : "drop-shadow-[0_0_15px_rgba(6,199,85,0.4)]"
                        )} 
                        alt="Robot Avatar" 
                    />
                </motion.div>
                
                {/* Speech Bubble */}
                <div className={cn(
                    "absolute -top-12 left-0 bg-white px-3 py-1.5 rounded-xl shadow-lg border border-zinc-100 transition-all duration-300 whitespace-nowrap pointer-events-none",
                    (clickCount > 0 || isTyping) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
                )}>
                    <p className="text-[10px] font-black text-zinc-600">
                        {isSpinning ? "哎呀！頭好暈喔～💫" : 
                         clickCount >= 3 ? "再點一下試試？🤭" :
                         clickCount > 0 ? `點我 ${clickCount} 次了！` :
                         isTyping ? "正在組織老闆的指令... 🤖" : "抓不到我吧！😏"}
                    </p>
                    <div className="absolute -bottom-1 left-4 w-2 h-2 bg-white border-r border-b border-zinc-100 rotate-45" />
                </div>
            </div>
        </motion.div>
    );
};
