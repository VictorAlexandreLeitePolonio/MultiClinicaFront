"use client";

import { motion } from "motion/react";
import { staggerContainerSlow, fadeSlideUp } from "@/lib/motion";

export interface Column<T> {
  key: string;
  label: string;
  className?: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  keyExtractor: (row: T) => string | number;
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({
  columns,
  data,
  loading,
  emptyMessage = "Nenhum item encontrado.",
  keyExtractor,
  onRowClick,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <p 
        className="text-[#4a6354] py-8 text-center"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Carregando...
      </p>
    );
  }

  if (data.length === 0) {
    return (
      <p 
        className="text-[#4a6354] py-8 text-center"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto border-2 border-[#d0e8e6] rounded-sm">
      <table className="w-full text-sm">
        <thead className="bg-[#e8f4f3]">
          <tr className="border-b-2 border-[#d0e8e6]">
            {columns.map((col) => (
              <th 
                key={col.key} 
                className={`text-left py-3 px-4 font-semibold text-[#1e2d4a] uppercase text-xs tracking-wider ${col.className || ""}`}
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <motion.tbody
          variants={staggerContainerSlow}
          initial="hidden"
          animate="show"
        >
          {data.map((row) => (
            <motion.tr 
              key={keyExtractor(row)} 
              variants={fadeSlideUp}
              className={`border-b border-[#d0e8e6] hover:bg-[#f0f9f8] transition-colors ${onRowClick ? "cursor-pointer" : ""}`}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <td 
                  key={col.key} 
                  className={`py-3 px-4 text-[#1a2a4a] ${col.className || ""}`}
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {/*eslint-disable-next-line @typescript-eslint/no-explicit-any*/} 
                  {col.render ? col.render(row) : String((row as any)[col.key] ?? "")}
                </td>
              ))}
            </motion.tr>
          ))}
        </motion.tbody>
      </table>
    </div>
  );
}
