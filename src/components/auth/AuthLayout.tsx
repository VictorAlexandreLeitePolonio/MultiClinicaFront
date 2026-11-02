"use client";

import { motion, useReducedMotion } from "motion/react";
import { ease } from "@/lib/motion";
import { AuthBrandPanel, type AuthBrandVariant } from "./AuthBrandPanel";

interface AuthLayoutProps {
  children: React.ReactNode;
  variant?: AuthBrandVariant;
}

/**
 * Split das telas de autenticação: painel escuro à esquerda (≥1024px) e
 * formulário claro, centralizado, à direita.
 */
export function AuthLayout({ children, variant = "staff" }: AuthLayoutProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex min-h-screen bg-[var(--color-bg-warm)]">
      <AuthBrandPanel variant={variant} />

      <main className="theme-light flex min-h-screen flex-1 items-center justify-center px-5 py-10 sm:px-8 lg:py-16">
        <motion.div
          data-auth-form
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, ease: ease.out }}
          className="flex w-full max-w-[400px] flex-col gap-6"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
