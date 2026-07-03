"use client";

import { motion } from "motion/react";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div 
      className={`relative overflow-hidden rounded-xl border border-gray-200 bg-gray-100 dark:bg-slate-800 dark:border-slate-700 ${className}`}
    >
      {/* Shimmer effect — gradiente animado */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)",
        }}
        animate={{
          x: ["-100%", "100%"],
        }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: "easeInOut",
          repeatDelay: 0.5,
        }}
      />
    </div>
  );
}
