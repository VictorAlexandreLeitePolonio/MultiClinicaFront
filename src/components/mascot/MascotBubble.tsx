"use client";

import { motion } from "motion/react";
import { scaleIn } from "@/lib/motion";
import { Button } from "@/components/ui/Button";

interface MascotBubbleProps {
  moduleTitle: string;
  onStart: () => void;
  onDismiss: () => void;
}

export function MascotBubble({ moduleTitle, onStart, onDismiss }: MascotBubbleProps) {
  return (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      animate="show"
      exit="exit"
      role="dialog"
      aria-label={`Convite para tutorial de ${moduleTitle}`}
      className="w-64 rounded-2xl border border-[#b7eee1] bg-white p-4 shadow-[0_24px_70px_-32px_rgba(15,23,42,0.42)] dark:border-slate-800 dark:bg-slate-900"
    >
      <p className="text-sm font-semibold text-[#0f172a] dark:text-white">
        Quer conhecer a {moduleTitle}?
      </p>
      <div className="mt-3 flex gap-2">
        <Button onClick={onStart} fullWidth={false}>
          Começar tutorial
        </Button>
        <Button variant="outline" onClick={onDismiss} fullWidth={false}>
          Agora não
        </Button>
      </div>
    </motion.div>
  );
}
