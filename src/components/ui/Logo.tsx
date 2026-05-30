"use client";

import { motion } from "motion/react";
import { fadeSlideUp } from "@/lib/motion";
import logo from "@/../public/logoLaiza.png";
import Image from "next/image";
export function Logo() {
  return (
    <motion.div
      variants={fadeSlideUp}
      initial="hidden"
      animate="show"
      className="flex flex-col items-center gap-3"
    >
      {/* Selo/Brasão estilo institucional */}
      <div 
        className="w-20 h-20 rounded-sm flex items-center justify-center relative"
        style={{
          background: "linear-gradient(135deg, #1a4a3a 0%, #143d2f 100%)",
          border: "3px solid #1a2a4a",
          boxShadow: "4px 4px 0 0 rgba(26, 42, 74, 0.3)",
        }}
      >
        <Image src={logo} alt="Logo" width={60} height={60} className="object-contain" />
        {/* Detalhe decorativo de canto */}
        <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-white/40" />
        <div className="absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2 border-white/40" />
        <div className="absolute bottom-1 left-1 w-2 h-2 border-b-2 border-l-2 border-white/40" />
        <div className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-white/40" />
      </div>
      
      <div className="text-center">
        <h1 
          className="text-2xl font-bold text-[#1a2a4a] tracking-tight"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          ProjetoLP
        </h1>
        <p 
          className="text-sm text-[#1a4a3a] mt-1"
          style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}
        >
          Clínica de Fisioterapia
        </p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <div className="h-px w-8 bg-[#1a4a3a]" />
          <div className="w-1 h-1 bg-[#1a4a3a] rotate-45" />
          <div className="h-px w-8 bg-[#1a4a3a]" />
        </div>
      </div>
    </motion.div>
  );
}
