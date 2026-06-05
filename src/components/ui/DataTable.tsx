"use client";

import { useMemo } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { staggerContainerSlow, fadeSlideUp } from "@/lib/motion";
import { Button } from "./Button";

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
  error?: string | null;
  emptyMessage?: string;
  keyExtractor: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  onRetry?: () => void;
}

export function DataTable<T>({
  columns,
  data,
  loading,
  error,
  emptyMessage = "Nenhum item encontrado.",
  keyExtractor,
  onRowClick,
  onRetry,
}: DataTableProps<T>) {
  const tableColumns: ColumnDef<T>[] = useMemo(
    () =>
      columns.map((column) => ({
        id: column.key,
        header: column.label,
        cell: ({ row }) => {
          if (column.render) {
            return column.render(row.original);
          }

          const value = (row.original as Record<string, unknown>)[column.key];
          return String(value ?? "");
        },
        meta: {
          className: column.className,
        },
      })),
    [columns],
  );

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => String(keyExtractor(row)),
  });

  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-[#d7f3ea] bg-white shadow-[0_18px_50px_-44px_rgba(15,23,42,0.42)] dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-[#d7f3ea] bg-[#f0fdf9] px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
          <div className="h-3 w-40 animate-pulse rounded-full bg-[#a7f3d0]/70 dark:bg-slate-700" />
        </div>
        <div className="divide-y divide-[#e6fbf4] dark:divide-slate-800">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="grid grid-cols-4 gap-4 px-4 py-4">
              <div className="h-3 animate-pulse rounded-full bg-[#d7f3ea] dark:bg-slate-800" />
              <div className="h-3 animate-pulse rounded-full bg-[#d7f3ea] dark:bg-slate-800" />
              <div className="h-3 animate-pulse rounded-full bg-[#d7f3ea] dark:bg-slate-800" />
              <div className="h-3 animate-pulse rounded-full bg-[#d7f3ea] dark:bg-slate-800" />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-2 border-t border-[#d7f3ea] px-4 py-4 text-sm font-medium text-[#0f766e] dark:border-slate-800 dark:text-[#67e8f9]">
          <Loader2 size={18} className="animate-spin" aria-hidden="true" />
          <span>Carregando dados...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center shadow-sm dark:border-red-900 dark:bg-red-950/40">
        <p className="text-sm font-semibold text-red-700">{error}</p>
        {onRetry && (
          <div className="mx-auto mt-4 max-w-48">
            <Button type="button" variant="danger" onClick={onRetry}>
              Tentar novamente
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#a7f3d0] bg-white/75 px-6 py-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/75">
        <p className="text-sm font-medium text-[#64748b] dark:text-slate-300">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-[#d7f3ea] bg-white shadow-[0_18px_50px_-44px_rgba(15,23,42,0.42)] dark:border-slate-800 dark:bg-slate-900">
      <table className="w-full text-sm">
        <thead className="bg-[#f0fdf9] dark:bg-slate-900">
          <tr className="border-b border-[#d7f3ea] dark:border-slate-800">
            {table.getHeaderGroups().map((headerGroup) =>
              headerGroup.headers.map((header) => (
              <th
                key={header.id}
                className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#64748b] dark:text-slate-300 ${(header.column.columnDef.meta as { className?: string } | undefined)?.className || ""}`}
              >
                {flexRender(header.column.columnDef.header, header.getContext())}
              </th>
              ))
            )}
          </tr>
        </thead>
        <motion.tbody
          variants={staggerContainerSlow}
          initial="hidden"
          animate="show"
        >
          {table.getRowModel().rows.map((row) => (
            <motion.tr
              key={row.id}
              variants={fadeSlideUp}
              className={`border-b border-[#e6fbf4] transition-colors last:border-b-0 hover:bg-[#ecfdf5] dark:border-slate-800 dark:hover:bg-slate-800/70 ${onRowClick ? "cursor-pointer" : ""}`}
              onClick={() => onRowClick?.(row.original)}
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className={`px-4 py-3 text-[#0f172a] dark:text-white ${(cell.column.columnDef.meta as { className?: string } | undefined)?.className || ""}`}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </motion.tr>
          ))}
        </motion.tbody>
      </table>
    </div>
  );
}
