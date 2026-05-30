"use client";

import { motion } from "motion/react";
import { slideFromLeft, staggerContainer } from "@/lib/motion";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <motion.div
      variants={slideFromLeft}
      initial="hidden"
      animate="show"
      className="w-full md:w-1/2 min-h-screen bg-[#f7f5f1] flex items-center justify-center p-6"
    >
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="w-full max-w-sm flex flex-col gap-6 bg-white p-8 rounded-sm border-2 border-[#1a2a4a] shadow-[6px_6px_0_0_#1a2a4a]"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
