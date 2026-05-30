"use client";

import { useState, forwardRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { fadeSlideUp } from "@/lib/motion";
import { Eye, EyeOff } from "lucide-react";

interface PasswordFieldProps {
  label: string;
  error?: string;
  id?: string;
  name?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ label, error, id, disabled, value, onChange, onBlur, ...rest }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <motion.div variants={fadeSlideUp} className="flex flex-col gap-2">
        <label 
          htmlFor={id} 
          className={`text-sm font-semibold tracking-wide uppercase ${disabled ? "text-gray-400" : "text-[#1a2a4a]"}`}
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {label}
          {rest.required && <span className="text-red-600 ml-1">*</span>}
        </label>
        <div className="relative">
          <motion.input
            ref={ref}
            id={id}
            name={rest.name}
            type={showPassword ? "text" : "password"}
            disabled={disabled}
            {...(value !== undefined ? { value } : {})}
            onChange={onChange}
            onBlur={onBlur}
            whileFocus={disabled ? undefined : { scale: 1.005 }}
            className={`w-full px-4 py-3 pr-12 border-2 rounded-sm transition-all duration-150
              ${disabled 
                ? "bg-[#f0f4f2] border-[#e2ebe6] text-gray-400 cursor-not-allowed" 
                : "bg-[#fdfcfa] border-[#e2ebe6] text-[#1a2a4a] placeholder:text-gray-400 focus:border-[#5a9c94] focus:shadow-[3px_3px_0_0_#5a9c94] focus:outline-none"
              }
              ${error && !disabled ? "border-red-600 shadow-[3px_3px_0_0_#dc2626]" : ""}
            `}
            style={{ fontFamily: "var(--font-serif)" }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={disabled}
            className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-sm transition-colors
              ${disabled ? "text-gray-300 cursor-not-allowed" : "text-[#4a6354] hover:text-[#5a9c94] hover:bg-[#e8f4f3]"}
            `}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <AnimatePresence mode="wait">
          {error && !disabled && (
            <motion.span
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-xs text-red-600 font-medium flex items-center gap-1"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              <span className="text-[10px]">✕</span> {error}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }
);

PasswordField.displayName = "PasswordField";
