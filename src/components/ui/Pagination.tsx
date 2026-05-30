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
    <div className="flex items-center justify-center gap-4 py-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-[#4a6354]">Itens por página:</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
          className="h-8 px-2 text-sm rounded-sm border-2 border-[#e2ebe6] bg-white text-[#1a2a4a] focus:border-[#1a4a3a] focus:outline-none cursor-pointer"
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
          className="flex items-center justify-center w-8 h-8 rounded-sm border-2 border-[#e2ebe6] bg-white text-[#4a6354] hover:border-[#1a4a3a] hover:text-[#1a4a3a] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[#e2ebe6] disabled:hover:text-[#4a6354] transition-colors"
          aria-label="Página anterior"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex items-center gap-1 px-3 py-1.5 bg-[#f8faf9] rounded-sm border border-[#e2ebe6]">
          <span className="text-sm font-medium text-[#1a2a4a]">{page}</span>
          <span className="text-sm text-[#4a6354]">/</span>
          <span className="text-sm text-[#4a6354]">{totalPages}</span>
        </div>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="flex items-center justify-center w-8 h-8 rounded-sm border-2 border-[#e2ebe6] bg-white text-[#4a6354] hover:border-[#1a4a3a] hover:text-[#1a4a3a] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[#e2ebe6] disabled:hover:text-[#4a6354] transition-colors"
          aria-label="Próxima página"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
