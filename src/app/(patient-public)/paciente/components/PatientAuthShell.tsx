"use client";

import { motion } from "motion/react";
import { ReactNode } from "react";
import { Logo } from "@/components/ui/Logo";

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

/** Cartão centralizado usado nas telas públicas do portal do paciente. */
export function PatientAuthShell({ title, subtitle, children, footer }: Props) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f0fdf9] px-4 py-10 dark:bg-slate-950">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md rounded-2xl border border-[#d7f3ea] bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="mb-6 flex flex-col items-center gap-4 text-center">
          <Logo light />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#0f172a] dark:text-white">
              {title}
            </h1>
            {subtitle && <p className="mt-1 text-sm text-[#64748b] dark:text-slate-400">{subtitle}</p>}
          </div>
        </div>

        {children}

        {footer && <div className="mt-6 text-center text-sm">{footer}</div>}
      </motion.div>
    </div>
  );
}
