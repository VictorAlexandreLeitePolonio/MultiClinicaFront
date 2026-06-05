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
      className="flex min-h-screen w-full items-center justify-center bg-[#f8fffc] bg-[radial-gradient(circle_at_top_left,rgba(103,232,249,0.2),transparent_34%),linear-gradient(180deg,#f8fffc_0%,#f0fdf9_100%)] p-6 md:w-1/2"
    >
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="flex w-full max-w-sm flex-col gap-6 rounded-3xl border border-[#d7f3ea] bg-white/95 p-8 shadow-[0_32px_90px_-48px_rgba(15,23,42,0.45)] backdrop-blur-xl"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
