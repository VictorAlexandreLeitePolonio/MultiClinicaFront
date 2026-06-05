"use client";

import { motion, AnimatePresence } from "motion/react";

interface ButtonProps {
  children: React.ReactNode;
  loading?: boolean;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline" | "danger";
}

export function Button({ 
  children, 
  loading, 
  type = "button", 
  disabled, 
  onClick,
  variant = "primary"
}: ButtonProps) {
  const baseStyles = "w-full rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#99f6e4] disabled:cursor-not-allowed disabled:opacity-60";
  
  const variants = {
    primary: "border border-[#14b8a6] bg-[#14b8a6] text-white shadow-[0_18px_32px_-24px_rgba(20,184,166,0.9)] hover:bg-[#0f766e] hover:shadow-[0_20px_42px_-24px_rgba(20,184,166,0.95)]",
    secondary: "border border-[#0f172a] bg-[#0f172a] text-white shadow-[0_18px_34px_-28px_rgba(15,23,42,0.9)] hover:bg-[#020617] dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700",
    outline: "border border-[#99f6e4] bg-white text-[#0f766e] shadow-sm hover:border-[#14b8a6] hover:bg-[#ecfdf5] dark:border-slate-700 dark:bg-slate-900 dark:text-[#67e8f9] dark:hover:bg-slate-800",
    danger: "border border-red-500 bg-red-500 text-white shadow-[0_18px_34px_-28px_rgba(239,68,68,0.9)] hover:bg-red-600",
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      whileHover={{ x: -2, y: -2 }}
      whileTap={{ y: 1 }}
      disabled={loading || disabled}
      className={`${baseStyles} ${variants[variant]}`}
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="spinner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-2"
          >
            <svg
              className="animate-spin h-5 w-5 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Carregando...</span>
          </motion.div>
        ) : (
          <motion.span
            key="text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {children}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
