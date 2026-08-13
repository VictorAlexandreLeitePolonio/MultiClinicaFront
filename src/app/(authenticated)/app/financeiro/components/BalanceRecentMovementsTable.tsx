"use client";

import { DataTable, type Column } from "@/components/ui/DataTable";
import { formatCurrency, formatDateTime } from "@/utils/formatters";
import type { BalanceRecentMovement, BalanceRecentMovementType } from "@/types";

interface BalanceRecentMovementsTableProps {
  movements: BalanceRecentMovement[];
}

const typeLabels: Record<BalanceRecentMovementType, string> = {
  AppointmentPayment: "Pagamento de consulta",
  ProductSale: "Venda de produto",
  ProductPurchase: "Compra de produto",
  ProductOutput: "Saída de produto",
  ProductLoss: "Perda de produto",
  InternalUse: "Uso interno",
  ClinicExpense: "Despesa manual",
};

const columns: Column<BalanceRecentMovement>[] = [
  { key: "description", label: "Descrição" },
  { key: "type", label: "Tipo", render: (movement) => typeLabels[movement.type] },
  { key: "amount", label: "Valor", render: (movement) => movement.amount === null ? "—" : formatCurrency(movement.amount) },
  { key: "quantity", label: "Quantidade", render: (movement) => movement.quantity ?? "—" },
  { key: "date", label: "Data", render: (movement) => formatDateTime(movement.date) },
];

export function BalanceRecentMovementsTable({ movements }: BalanceRecentMovementsTableProps) {
  return <DataTable columns={columns} data={movements} keyExtractor={(movement) => `${movement.source}-${movement.id}`} emptyMessage="Nenhuma movimentação recente." />;
}
