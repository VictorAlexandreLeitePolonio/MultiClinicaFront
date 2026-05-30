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
  const baseStyles = "w-full py-3 px-6 rounded-sm font-semibold uppercase tracking-wider text-sm border-2 transition-all duration-150";
  
  const variants = {
    primary: "bg-[#5a9c94] text-white border-[#4a8880] shadow-[4px_4px_0_0_#4a8880] hover:bg-[#4a8880]",
    secondary: "bg-[#1a2a4a] text-white border-[#121d33] shadow-[4px_4px_0_0_#121d33] hover:bg-[#121d33]",
    outline: "bg-white text-[#5a9c94] border-[#5a9c94] shadow-[4px_4px_0_0_#5a9c94] hover:bg-[#e8f4f3]",
    danger: "bg-red-700 text-white border-red-800 shadow-[4px_4px_0_0_#7f1d1d] hover:bg-red-800",
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      whileHover={{ x: -2, y: -2 }}
      whileTap={{ x: 4, y: 4, boxShadow: "0 0 0 0 transparent" }}
      disabled={loading || disabled}
      className={`${baseStyles} ${variants[variant]} 
        disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-[#5a9c94]
        disabled:transform-none disabled:shadow-[4px_4px_0_0_#4a8880]`}
      style={{ fontFamily: "var(--font-serif)" }}
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
