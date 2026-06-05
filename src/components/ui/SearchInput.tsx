"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Search } from "lucide-react";
import { pulse } from "@/lib/motion";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder = "Buscar...", className }: SearchInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <motion.div
        animate={isFocused ? pulse : { scale: 1 }}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#14b8a6]"
      >
        <Search size={18} />
      </motion.div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="w-full max-w-sm rounded-xl border border-[#d7f3ea] bg-white py-2.5 pl-10 pr-4 text-[#0f172a] shadow-sm transition-all placeholder:text-slate-400 focus:border-[#14b8a6] focus:outline-none focus:ring-4 focus:ring-[#99f6e4]/50 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
      />
    </div>
  );
}
