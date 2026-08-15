"use client";

import { motion } from "motion/react";
import { slideDown } from "@/lib/motion";

interface MascotMenuProps {
  contextualLabel?: string;
  onContextual?: () => void;
  onOpenCatalog: () => void;
  onClose: () => void;
}

export function MascotMenu({
  contextualLabel,
  onContextual,
  onOpenCatalog,
  onClose,
}: MascotMenuProps) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[999998]"
        onClick={onClose}
      />
      <motion.div
        variants={slideDown}
        initial="hidden"
        animate="show"
        exit="exit"
        role="menu"
        aria-label="Menu do assistente"
        className="absolute bottom-full right-0 z-[999999] mb-3 w-56 overflow-hidden rounded-2xl border border-[#d7f3ea] bg-white py-1.5 shadow-[0_24px_70px_-32px_rgba(15,23,42,0.42)] dark:border-slate-800 dark:bg-slate-900"
      >
        {contextualLabel && (
          <button
            type="button"
            role="menuitem"
            onClick={onContextual}
            className="block w-full px-4 py-2.5 text-left text-sm font-semibold text-[#0f172a] transition-colors hover:bg-[#ecfdf5] dark:text-white dark:hover:bg-slate-800"
          >
            {contextualLabel}
          </button>
        )}
        <button
          type="button"
          role="menuitem"
          onClick={onOpenCatalog}
          className="block w-full px-4 py-2.5 text-left text-sm font-semibold text-[#0f172a] transition-colors hover:bg-[#ecfdf5] dark:text-white dark:hover:bg-slate-800"
        >
          Ver todos os tutoriais
        </button>
      </motion.div>
    </>
  );
}
