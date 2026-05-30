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
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a9c94]"
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
        className="w-full max-w-sm pl-10 pr-4 py-2 bg-[#fdfcfa] border-2 border-[#e2ebe6] rounded-sm text-[#1a2a4a] placeholder:text-gray-400
          focus:border-[#5a9c94] focus:shadow-[3px_3px_0_0_#5a9c94] focus:outline-none transition-all"
        style={{ fontFamily: "var(--font-serif)" }}
      />
    </div>
  );
}
