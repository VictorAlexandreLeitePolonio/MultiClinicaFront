"use client";

import { motion } from "motion/react";
import { fadeSlideUp } from "@/lib/motion";

interface LogoProps {
  light?: boolean;
}

export function Logo({ light = false }: LogoProps) {
  return (
    <motion.div
      variants={fadeSlideUp}
      initial="hidden"
      animate="show"
      className="flex flex-col items-center gap-3"
    >
      <div 
        className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-[#a7f3d0] bg-gradient-to-br from-[#14b8a6] via-[#10b981] to-[#06b6d4] text-white shadow-[0_24px_60px_-32px_rgba(20,184,166,0.95)]"
      >
        <svg width="38" height="38" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <circle cx="24" cy="24" r="13" stroke="white" strokeWidth="5" fill="none" />
          <path d="M32 32 L41 41" stroke="#a5f3fc" strokeWidth="5" strokeLinecap="round" />
        </svg>
        <div className="absolute -right-1 -top-1 h-5 w-5 rounded-full border-4 border-white bg-[#67e8f9]" />
      </div>
      
      <div className="text-center">
        <h1 
          className={`text-2xl font-bold tracking-tight ${light ? "text-[#0f172a]" : "text-[#0f172a] dark:text-white"}`}
        >
          Cliniq
        </h1>
        <p 
          className={`mt-1 text-sm font-medium ${light ? "text-[#0f766e]" : "text-[#0f766e] dark:text-[#67e8f9]"}`}
        >
          A clínica, inteligente.
        </p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <div className="h-px w-8 bg-[#a7f3d0]" />
          <div className="h-1.5 w-1.5 rounded-full bg-[#14b8a6]" />
          <div className="h-px w-8 bg-[#a7f3d0]" />
        </div>
      </div>
    </motion.div>
  );
}
