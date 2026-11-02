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
      className="flex flex-col items-center gap-2"
    >
      <BrandLogo variant="lockup" size={52} priority />
      <p
        className={`text-sm font-medium text-[var(--color-primary-dark)] ${light ? "" : "dark:text-[var(--color-primary-light)]"}`}
      >
        A clínica, inteligente.
      </p>
    </motion.div>
  );
}
