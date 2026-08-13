"use client";

import { DataTable, type Column } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import type { BalanceLowStockProduct } from "@/types";

interface LowStockProductsTableProps {
  products: BalanceLowStockProduct[];
}

const columns: Column<BalanceLowStockProduct>[] = [
  { key: "name", label: "Produto" },
  { key: "currentQuantity", label: "Atual" },
  { key: "minimumQuantity", label: "Mínimo" },
];

export function LowStockProductsTable({ products }: LowStockProductsTableProps) {
  if (products.length === 0) {
    return <EmptyState title="Nenhum produto abaixo do mínimo" description="O estoque não possui alertas para o período." />;
  }

  return <DataTable columns={columns} data={products} keyExtractor={(product) => product.productId} emptyMessage="Nenhum produto abaixo do mínimo." />;
}
