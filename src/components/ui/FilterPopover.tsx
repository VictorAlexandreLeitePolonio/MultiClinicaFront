"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Filter, X } from "lucide-react";
import { slideDown } from "@/lib/motion";
import { Button } from "./Button";

export interface FilterOption {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

export interface FilterValues {
  [key: string]: string;
}

interface FilterPopoverProps {
  filters: FilterOption[];
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  onApply: () => void;
  onClear: () => void;
}

export function FilterPopover({
  filters,
  values,
  onChange,
  onApply,
  onClear,
}: FilterPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);

  const hasActiveFilters = Object.values(values).some((v) => v !== "");

  const handleSelectChange = (key: string, value: string) => {
    onChange({ ...values, [key]: value });
  };

  const handleClear = () => {
    onClear();
    setIsOpen(false);
  };

  const handleApply = () => {
    onApply();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Filter size={16} className="mr-2" />
        Filtros
        {hasActiveFilters && (
          <span className="ml-2 w-5 h-5 rounded-full bg-[#5a9c94] text-white text-xs flex items-center justify-center">
            {Object.values(values).filter((v) => v !== "").length}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              variants={slideDown}
              initial="hidden"
              animate="show"
              exit="exit"
              className="absolute top-full right-0 mt-2 w-80 bg-white rounded-sm border-2 border-[#1a2a4a] shadow-[6px_6px_0_0_#1a2a4a] z-50 p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 
                  className="text-lg font-bold text-[#1a2a4a]"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  Filtros
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-sm hover:bg-[#f0f4f2] transition-colors"
                >
                  <X size={18} className="text-[#1a2a4a]" />
                </button>
              </div>

              <div className="space-y-4">
                {filters.map((filter) => (
                  <div key={filter.key} className="space-y-2">
                    <label 
                      className="text-xs font-bold text-[#1a2a4a] uppercase tracking-wider"
                      style={{ fontFamily: "var(--font-serif)" }}
                    >
                      {filter.label}
                    </label>
                    <select
                      value={values[filter.key] || ""}
                      onChange={(e) => handleSelectChange(filter.key, e.target.value)}
                      className="w-full px-3 py-2 bg-[#fdfcfa] border-2 border-[#e2ebe6] rounded-sm text-[#1a2a4a]
                        focus:border-[#5a9c94] focus:shadow-[2px_2px_0_0_#5a9c94] focus:outline-none transition-all"
                      style={{ fontFamily: "var(--font-serif)" }}
                    >
                      <option value="">Todos</option>
                      {filter.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mt-6 pt-4 border-t-2 border-[#e2ebe6]">
                <Button variant="outline" onClick={handleClear}>
                  Limpar
                </Button>
                <Button onClick={handleApply}>Aplicar</Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
