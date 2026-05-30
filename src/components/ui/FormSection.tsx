"use client";

import { motion } from "motion/react";
import { fadeSlideUp } from "@/lib/motion";

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
  delay?: number;
}

const gridCols = { 1: "grid-cols-1", 2: "grid-cols-1 md:grid-cols-2", 3: "grid-cols-1 md:grid-cols-3" };

export function FormSection({ title, children, columns = 2, delay = 0 }: FormSectionProps) {
  return (
    <motion.section 
      className="space-y-4"
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: 0.1,
            delayChildren: delay,
          },
        },
      }}
    >
      <motion.h2 
        variants={fadeSlideUp}
        className="text-xs font-bold text-[#1a2a4a] uppercase tracking-wider border-b-2 border-[#5a9c94]/30 pb-2 flex items-center"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        <span className="inline-block w-2 h-2 rounded-full bg-[#5a9c94] mr-2" />
        {title}
      </motion.h2>
      <motion.div 
        variants={fadeSlideUp}
        className={`grid gap-4 ${gridCols[columns]}`}
      >
        {children}
      </motion.div>
    </motion.section>
  );
}
