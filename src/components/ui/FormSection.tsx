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
      className="space-y-4 rounded-2xl border border-[#d7f3ea] bg-white p-5 shadow-[0_18px_50px_-44px_rgba(15,23,42,0.42)] dark:border-slate-800 dark:bg-slate-900"
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
        className="flex items-center border-b border-[#d7f3ea] pb-3 text-sm font-bold text-[#0f172a] dark:border-slate-800 dark:text-white"
      >
        <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#14b8a6]" />
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
