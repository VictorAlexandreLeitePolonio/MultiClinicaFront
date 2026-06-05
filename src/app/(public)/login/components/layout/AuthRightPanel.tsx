"use client";

import { motion } from "motion/react";
import Lottie from "lottie-react";
import { fadeIn } from "@/lib/motion";
import animationData from "@/../public/animations/lotties/Doctor Prescription.json";

export function AuthRightPanel() {
  return (
    <div
      className="relative hidden min-h-screen w-1/2 overflow-hidden md:flex"
      style={{
        background: "linear-gradient(135deg, #0f766e 0%, #14b8a6 48%, #06b6d4 100%)",
      }}
    >
      {/* Pattern overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(255,255,255,0.1) 10px,
            rgba(255,255,255,0.1) 20px
          )`
        }}
      />
      
      {/* Decorative frame */}
      <div className="pointer-events-none absolute inset-8 rounded-3xl border border-white/20" />
      <div className="pointer-events-none absolute inset-12 rounded-3xl border border-white/10" />
      
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="show"
        className="relative z-10 flex w-full flex-col items-center justify-center p-12 text-center"
      >
        {/* Lottie Animation */}
        <div className="mb-8 h-80 w-80 rounded-3xl border border-white/25 bg-white/15 p-6 shadow-[0_28px_80px_-46px_rgba(15,23,42,0.7)] backdrop-blur-sm">
          <Lottie
            animationData={animationData}
            loop={true}
            autoplay={true}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
        
        {/* Panel Text */}
        <h2 
          className="mb-4 text-3xl font-bold tracking-tight text-white"
        >
          Bem-vindo de volta
        </h2>
        <p 
          className="max-w-sm text-lg text-white/80"
        >
          Gerencie sua clínica de fisioterapia de forma simples e eficiente.
        </p>
        
        {/* Decorative dots */}
        <div className="flex gap-2 mt-8">
          <div className="h-2 w-2 rounded-full bg-white/40" />
          <div className="h-2 w-2 rounded-full bg-white/70" />
          <div className="h-2 w-2 rounded-full bg-white/40" />
        </div>
      </motion.div>
    </div>
  );
}
