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
          <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#14b8a6] text-xs text-white">
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
              className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-[#d7f3ea] bg-white p-4 shadow-[0_24px_70px_-32px_rgba(15,23,42,0.42)] dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 
                  className="text-lg font-bold text-[#0f172a] dark:text-white"
                >
                  Filtros
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1 transition-colors hover:bg-[#ecfdf5] dark:hover:bg-slate-800"
                >
                  <X size={18} className="text-[#64748b] dark:text-slate-300" />
                </button>
              </div>

              <div className="space-y-4">
                {filters.map((filter) => (
                  <div key={filter.key} className="space-y-2">
                    <label 
                      className="text-sm font-semibold text-[#0f172a] dark:text-white"
                    >
                      {filter.label}
                    </label>
                    <select
                      value={values[filter.key] || ""}
                      onChange={(e) => handleSelectChange(filter.key, e.target.value)}
                      className="w-full rounded-xl border border-[#d7f3ea] bg-white px-3 py-2 text-[#0f172a] transition-all focus:border-[#14b8a6] focus:outline-none focus:ring-4 focus:ring-[#99f6e4]/50 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
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

              <div className="mt-6 flex gap-2 border-t border-[#d7f3ea] pt-4 dark:border-slate-800">
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
