"use client";

import React, { useRef, useEffect } from 'react';
import { useScroll, useTransform, motion, useSpring } from 'framer-motion';

interface LiffScrollVideoProps {
  videoUrl: string;
  children?: React.ReactNode;
}

export default function LiffScrollVideo({ videoUrl, children }: LiffScrollVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Track scroll progress
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Balanced spring for better scrubbing feel
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 40,
    restDelta: 0.001
  });

  // Performance-focused video sync with lighter threshold for Mobile/Webview
  useEffect(() => {
    let frameId: number;
    let lastUpdateAt = 0;
    
    const syncVideo = (timestamp: number) => {
      // Limit updates to ~30fps for video seeking to save CPU/Battery
      if (timestamp - lastUpdateAt < 32) {
        frameId = requestAnimationFrame(syncVideo);
        return;
      }
      
      if (videoRef.current && videoRef.current.readyState >= 2) {
        const duration = videoRef.current.duration;
        if (duration) {
          // Map 0-0.7 scroll to video duration
          const targetTime = Math.min(smoothProgress.get() / 0.7, 1) * duration;
          
          // Use a slightly larger threshold (0.05s) for mobile friendliness
          if (Math.abs(videoRef.current.currentTime - targetTime) > 0.05) {
            videoRef.current.currentTime = targetTime;
            lastUpdateAt = timestamp;
          }
        }
      }
      frameId = requestAnimationFrame(syncVideo);
    };
    
    frameId = requestAnimationFrame(syncVideo);
    return () => cancelAnimationFrame(frameId);
  }, [smoothProgress]);

  return (
    <div ref={containerRef} className="relative min-h-screen w-full bg-transparent">
      {/* 🎬 FIXED Video Background */}
      <div className="fixed inset-0 w-full h-full z-[-1] overflow-hidden bg-transparent">
        <video
          ref={videoRef}
          src={videoUrl}
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover opacity-100"
        />
      </div>

      {/* 📝 Scrolling Content Layer */}
      <div className="relative z-20 w-full">
        {children}
      </div>
    </div>
  );
}
