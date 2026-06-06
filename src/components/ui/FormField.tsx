"use client";

import { forwardRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { fadeSlideUp } from "@/lib/motion";

interface FormFieldProps {
  label: string;
  error?: string;
  id?: string;
  name?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  value?: string;
  step?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, id, disabled, value, onChange, onBlur, type = "text", placeholder, ...rest }, ref) => {
    return (
      <motion.div variants={fadeSlideUp} className="flex flex-col gap-2">
        <label
          htmlFor={id}
          className={`text-sm font-semibold ${disabled ? "text-slate-400" : "text-[#0f172a] dark:text-white"}`}
        >
          {label}
          {rest.required && <span className="text-red-600 ml-1">*</span>}
        </label>
        <motion.input
          ref={ref}
          id={id}
          name={rest.name}
          type={type}
          step={rest.step}
          placeholder={placeholder}
          disabled={disabled}
          {...(value !== undefined ? { value } : {})}
          onChange={onChange}
          onBlur={onBlur}
          whileFocus={disabled ? undefined : { scale: 1.005 }}
          className={`w-full rounded-xl border px-4 py-3 transition-all duration-150
            ${disabled 
              ? "cursor-not-allowed border-[#d7f3ea] bg-[#f0fdf9] text-slate-400 dark:border-slate-800 dark:bg-slate-900"
              : "border-[#d7f3ea] bg-white text-[#0f172a] placeholder:text-slate-400 focus:border-[#14b8a6] focus:outline-none focus:ring-4 focus:ring-[#99f6e4]/50 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:border-[#67e8f9] dark:focus:ring-[#134e4a]"
            }
            ${error && !disabled ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""}
          `}
        />
        <AnimatePresence mode="wait">
          {error && !disabled && (
            <motion.span
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-1 text-xs font-medium text-red-600"
            >
              <span className="text-[10px]">✕</span> {error}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }
);

FormField.displayName = "FormField";
