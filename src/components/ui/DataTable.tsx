"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { motion } from "motion/react";
import { staggerContainerSlow, fadeSlideUp } from "@/lib/motion";
import { Button } from "./Button";
import { Skeleton } from "./Skeleton";

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
  const tableColumns: ColumnDef<T>[] = columns.map((column) => ({
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
  }));

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => String(keyExtractor(row)),
    manualPagination: true,
  });

  if (loading) {
    return (
      <div className="overflow-hidden border-2 border-[#d0e8e6] rounded-sm">
        <div className="grid gap-3 p-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-sm border-2 border-red-200 bg-red-50 p-6 text-center">
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
            {table.getHeaderGroups().map((headerGroup) =>
              headerGroup.headers.map((header) => (
              <th
                key={header.id}
                className={`text-left py-3 px-4 font-semibold text-[#1e2d4a] uppercase text-xs tracking-wider ${(header.column.columnDef.meta as { className?: string } | undefined)?.className || ""}`}
                style={{ fontFamily: "var(--font-serif)" }}
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
              className={`border-b border-[#d0e8e6] hover:bg-[#f0f9f8] transition-colors ${onRowClick ? "cursor-pointer" : ""}`}
              onClick={() => onRowClick?.(row.original)}
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className={`py-3 px-4 text-[#1a2a4a] ${(cell.column.columnDef.meta as { className?: string } | undefined)?.className || ""}`}
                  style={{ fontFamily: "var(--font-serif)" }}
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
