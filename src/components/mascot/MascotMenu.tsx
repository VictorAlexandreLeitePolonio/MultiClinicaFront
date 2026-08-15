"use client";

import { motion } from "motion/react";
import { slideDown } from "@/lib/motion";

export interface MascotMenuTaskItem {
  id: string;
  label: string;
  onClick: () => void;
}

interface MascotMenuProps {
  contextualLabel?: string;
  onContextual?: () => void;
  taskItems?: MascotMenuTaskItem[];
  onOpenCatalog: () => void;
  onClose: () => void;
}

const menuItemClassName =
  "block w-full px-4 py-2.5 text-left text-sm font-semibold text-[#0f172a] transition-[background-color,transform] duration-150 hover:bg-[#ecfdf5] active:scale-[0.98] dark:text-white dark:hover:bg-slate-800";

export function MascotMenu({
  contextualLabel,
  onContextual,
  taskItems,
  onOpenCatalog,
  onClose,
}: MascotMenuProps) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      <motion.div
        variants={slideDown}
        initial="hidden"
        animate="show"
        exit="exit"
        role="menu"
        aria-label="Menu do assistente"
        className="absolute bottom-full right-0 z-50 mb-3 w-64 origin-bottom-right overflow-hidden rounded-2xl border border-[#d7f3ea] bg-white py-1.5 shadow-[0_24px_70px_-32px_rgba(15,23,42,0.42)] dark:border-slate-800 dark:bg-slate-900"
      >
        {contextualLabel && (
          <button type="button" role="menuitem" onClick={onContextual} className={menuItemClassName}>
            {contextualLabel}
          </button>
        )}

        {taskItems && taskItems.length > 0 && (
          <>
            <p className="mt-1 px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-[#64748b] dark:text-slate-400">
              Ações guiadas
            </p>
            {taskItems.map((item) => (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                onClick={item.onClick}
                className={menuItemClassName}
              >
                {item.label}
              </button>
            ))}
          </>
        )}

        <button type="button" role="menuitem" onClick={onOpenCatalog} className={menuItemClassName}>
          Ver todos os tutoriais
        </button>
      </motion.div>
    </>
  );
}
