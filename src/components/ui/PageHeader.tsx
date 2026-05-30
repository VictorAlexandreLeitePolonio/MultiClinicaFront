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
    <div className="flex items-center justify-between">
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
            className="text-2xl font-bold text-[#1a2a4a]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {title}
          </h1>
          <div className="h-0.5 w-12 bg-[#5a9c94] mt-1 rounded-full" />
        </div>
      </motion.div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}
