"use client";

import { motion } from "motion/react";
import { slideFromLeft } from "@/lib/motion";
import { Button } from "./Button";

interface PageHeaderProps {
  title: string;
  onBack?: () => void;
  actions?: React.ReactNode;
}

export function PageHeader({ title, onBack, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <motion.div 
        className="flex items-center gap-3"
        variants={slideFromLeft}
        initial="hidden"
        animate="show"
      >
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            ← Voltar
          </Button>
        )}
        <div>
          <h1 
            className="text-2xl font-bold tracking-tight text-[#0f172a] dark:text-white"
          >
            {title}
          </h1>
          <div className="mt-2 h-1 w-14 rounded-full bg-gradient-to-r from-[#14b8a6] to-[#67e8f9]" />
        </div>
      </motion.div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}
