"use client";

import { motion } from "motion/react";
import Lottie from "lottie-react";
import { fadeIn } from "@/lib/motion";
import animationData from "@/../public/animations/lotties/Doctor Prescription.json";

export function AuthRightPanel() {
  return (
    <div
      className="hidden md:flex w-1/2 min-h-screen relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #5a9c94 0%, #4a8880 100%)",
      }}
    >
      {/* Pattern overlay */}
      <div 
        className="absolute inset-0 opacity-5"
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
      <div className="absolute inset-8 border-2 border-white/20 rounded-sm pointer-events-none" />
      <div className="absolute inset-12 border border-white/10 rounded-sm pointer-events-none" />
      
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-center"
      >
        {/* Lottie Animation */}
        <div className="w-80 h-80 mb-8 bg-white/10 rounded-sm border border-white/20 p-6 backdrop-blur-sm">
          <Lottie
            animationData={animationData}
            loop={true}
            autoplay={true}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
        
        {/* Panel Text */}
        <h2 
          className="text-3xl font-bold text-white mb-4"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Bem-vindo de volta
        </h2>
        <p 
          className="text-white/70 text-lg max-w-sm"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Gerencie sua clínica de fisioterapia de forma simples e eficiente.
        </p>
        
        {/* Decorative dots */}
        <div className="flex gap-2 mt-8">
          <div className="w-2 h-2 bg-white/40 rotate-45" />
          <div className="w-2 h-2 bg-white/60 rotate-45" />
          <div className="w-2 h-2 bg-white/40 rotate-45" />
        </div>
      </motion.div>
    </div>
  );
}
