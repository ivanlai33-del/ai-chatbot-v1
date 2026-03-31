"use client";

import React, { useRef, useEffect, useState } from 'react';
import { useScroll, useSpring } from 'framer-motion';

interface LiffScrollSequenceProps {
  frameFolder: string;
  frameCount: number;
  prefix: string;
  extension: string;
  children?: React.ReactNode;
}

export default function LiffScrollSequence({ 
  frameFolder, 
  frameCount, 
  prefix,
  extension,
  children 
}: LiffScrollSequenceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Track scroll progress
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 150,
    damping: 30,
    restDelta: 0.001
  });

  // Preload Images
  useEffect(() => {
    let loadedCount = 0;
    const imgArray: HTMLImageElement[] = [];
    
    for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        const paddedIndex = i.toString().padStart(3, '0');
        img.src = `${frameFolder}/${prefix}${paddedIndex}.${extension}`;
        img.onload = () => {
            loadedCount++;
            if (loadedCount === frameCount) {
                setLoaded(true);
            }
        };
        imgArray.push(img);
    }
    setImages(imgArray);
  }, [frameFolder, frameCount, prefix, extension]);

  // Sync scroll to canvas frame
  useEffect(() => {
    if (!loaded || !canvasRef.current || images.length === 0) return;

    let frameId: number;
    const canvas = canvasRef.current;
    
    // Resize canvas to match display size exactly once (or on resize)
    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
        const maxFrame = frameCount - 1;
        const p = Math.min(Math.max(smoothProgress.get() / 0.8, 0), 1); // Map to 80% scroll
        const targetFrame = Math.round(p * maxFrame);
        
        const img = images[targetFrame];
        if (img && img.width > 0) {
            const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
            const w = img.width * scale;
            const h = img.height * scale;
            const x = (canvas.width - w) / 2;
            const y = (canvas.height - h) / 2;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, x, y, w, h);
        }
        
        frameId = requestAnimationFrame(render);
    };

    frameId = requestAnimationFrame(render);
    
    return () => {
        cancelAnimationFrame(frameId);
        window.removeEventListener('resize', resizeCanvas);
    };
  }, [smoothProgress, loaded, images, frameCount]);

  return (
    <div ref={containerRef} className="relative min-h-screen w-full bg-transparent">
      {/* 🎬 FIXED Canvas Background */}
      <div className="fixed inset-0 w-full h-full z-[-1] overflow-hidden bg-[#0f172a]">
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover opacity-60 mix-blend-screen"
        />
        {/* Fallback loading indicator */}
        {!loaded && (
           <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
           </div>
        )}
      </div>

      {/* 📝 Scrolling Content Layer */}
      <div className="relative z-20 w-full">
        {children}
      </div>
    </div>
  );
}
