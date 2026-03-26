"use client";

import { GameEngine } from "@/game/GameEngine";
import { Activity, Shield, Target, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [stats, setStats] = useState({ score: 0, destroyed: 0, missed: 0 });

  useEffect(() => {
    if (canvasRef.current) {
      engineRef.current = new GameEngine(canvasRef.current);

      const interval = setInterval(() => {
        if (engineRef.current) {
          setStats({
            score: engineRef.current.score,
            destroyed: engineRef.current.destroyedCount,
            missed: engineRef.current.missedCount,
          });
        }
      }, 100);

      return () => {
        clearInterval(interval);
        engineRef.current?.destroy();
      };
    }
  }, []);

  return (
    <div className="relative w-full h-screen bg-[#0a0a0a] overflow-hidden font-mono text-white select-none">
      <canvas ref={canvasRef} className="block w-full h-full" />

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none p-8 flex flex-col justify-between">
        {/* Top Bar */}
        <div className="flex justify-between items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-2"
          >
            <div className="flex items-center gap-3 text-zinc-500 text-xs uppercase tracking-[0.2em]">
              <Activity size={14} />
              <span>System Status: Active</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tighter">CHILL\CIWS</h1>
            <div className="h-1 w-32 bg-white/10 mt-2 overflow-hidden">
              <motion.div
                className="h-full bg-white"
                animate={{ x: [-128, 128] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-right"
          >
            <div className="text-zinc-500 text-xs uppercase tracking-[0.2em] mb-1">
              Combat Score
            </div>
            <div className="text-5xl font-bold tabular-nums tracking-tighter">
              {stats.score.toLocaleString()}
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="flex justify-between items-end">
          <div className="flex gap-8">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-zinc-500 text-[10px] uppercase tracking-widest">
                <Target size={12} />
                <span>Targets Neutralized</span>
              </div>
              <div className="text-2xl font-bold">{stats.destroyed}</div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-zinc-500 text-[10px] uppercase tracking-widest">
                <Shield size={12} />
                <span>Targets Missed</span>
              </div>
              <div className="text-2xl font-bold">{stats.missed}</div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-4">
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                  className="w-1 h-8 bg-white"
                />
              ))}
            </div>
            <div className="text-zinc-500 text-[10px] uppercase tracking-widest flex items-center gap-2">
              <Zap size={12} className="text-white" />
              <span>Auto-Pilot Enable</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-50" />

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]" />
    </div>
  );
}
