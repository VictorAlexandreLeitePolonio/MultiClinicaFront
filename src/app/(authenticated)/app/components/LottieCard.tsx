"use client";

import { motion } from "motion/react";
import { fadeSlideUp } from "@/lib/motion";
import Lottie from "lottie-react";
import animationData from "@/../public/animations/lotties/Doctor Prescription.json";

export function LottieCard() {
  return (
    <motion.div
      variants={fadeSlideUp}
      className="bg-[#1a2a4a] rounded-sm border-2 border-[#121d33] shadow-[4px_4px_0_0_#121d33] p-6 flex flex-col items-center justify-center relative overflow-hidden"
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
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-48 h-48 bg-white/10 rounded-sm border border-white/20 p-4 backdrop-blur-sm">
          <Lottie
            animationData={animationData}
            loop={true}
            autoplay={true}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
        <p 
          className="text-sm text-white/80 text-center mt-4"
          style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}
        >
          Cuidando da sua saúde com excelência
        </p>
        
        {/* Decorative element */}
        <div className="flex items-center gap-2 mt-3">
          <div className="h-px w-8 bg-white/30" />
          <div className="w-1.5 h-1.5 bg-[#1a4a3a] rotate-45 border border-white/50" />
          <div className="h-px w-8 bg-white/30" />
        </div>
      </div>
    </motion.div>
  );
}
