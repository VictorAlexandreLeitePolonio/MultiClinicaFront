"use client";

import { motion } from "motion/react";
import { fadeSlideUp } from "@/lib/motion";
import { BrandLogo } from "./BrandLogo";

interface LogoProps {
  light?: boolean;
}

export function Logo({ light = false }: LogoProps) {
  return (
    <motion.div
      variants={fadeSlideUp}
      initial="hidden"
      animate="show"
      className="flex flex-col items-center gap-1"
    >
      <BrandLogo variant="lockup" size={112} priority />
      <p
        className={`text-sm font-medium ${light ? "text-[#0f766e]" : "text-[#0f766e] dark:text-[#67e8f9]"}`}
      >
        A clínica, inteligente.
      </p>
    </motion.div>
  );
}
