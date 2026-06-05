"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
}

export function Pagination({
  page,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
}: PaginationProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-4 sm:flex-row sm:gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-[#64748b] dark:text-slate-300">Itens por página:</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
          className="h-9 cursor-pointer rounded-xl border border-[#d7f3ea] bg-white px-3 text-sm text-[#0f172a] shadow-sm focus:border-[#14b8a6] focus:outline-none focus:ring-4 focus:ring-[#99f6e4]/50 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#d7f3ea] bg-white text-[#64748b] transition-colors hover:border-[#14b8a6] hover:bg-[#ecfdf5] hover:text-[#0f766e] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#d7f3ea] disabled:hover:bg-white disabled:hover:text-[#64748b] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label="Página anterior"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex items-center gap-1 rounded-xl border border-[#d7f3ea] bg-[#f8fffc] px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-sm font-semibold text-[#0f172a] dark:text-white">{page}</span>
          <span className="text-sm text-[#64748b] dark:text-slate-400">/</span>
          <span className="text-sm text-[#64748b] dark:text-slate-400">{totalPages}</span>
        </div>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#d7f3ea] bg-white text-[#64748b] transition-colors hover:border-[#14b8a6] hover:bg-[#ecfdf5] hover:text-[#0f766e] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#d7f3ea] disabled:hover:bg-white disabled:hover:text-[#64748b] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label="Próxima página"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
