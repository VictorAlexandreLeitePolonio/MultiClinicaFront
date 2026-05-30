"use client";

import { useState } from "react";
import { DataTable, Column } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SuperAdminBillingCharge } from "@/types";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { useSuperAdminBilling } from "../hooks/useSuperAdminBilling";

const columns: Column<SuperAdminBillingCharge>[] = [
  { key: "clinicName", label: "Clínica" },
  { key: "referenceMonth", label: "Referência" },
  { key: "amount", label: "Valor", render: (charge) => formatCurrency(charge.amount) },
  { key: "dueDate", label: "Vencimento", render: (charge) => formatDate(charge.dueDate) },
  {
    key: "status",
    label: "Status",
    render: (charge) => (
      <StatusBadge
        status={charge.status}
        mapping={{
          Pending: { label: "Pendente", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
          Paid: { label: "Pago", className: "bg-green-100 text-green-700 border-green-200" },
          Overdue: { label: "Vencido", className: "bg-red-100 text-red-700 border-red-200" },
          Cancelled: { label: "Cancelado", className: "bg-gray-100 text-gray-700 border-gray-200" },
        }}
      />
    ),
  },
  { key: "paidAt", label: "Pagamento", render: (charge) => formatDate(charge.paidAt) },
];

export default function SuperAdminBillingPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data, isLoading, error, refetch } = useSuperAdminBilling({
    page,
    pageSize,
    search,
  });

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-8">
      <PageHeader title="Cobranças Comerciais" />
      <SearchInput value={search} onChange={setSearch} placeholder="Buscar por clínica..." />

      {!isLoading && !error && data?.data.length === 0 ? (
        <EmptyState
          title="Nenhuma cobrança encontrada"
          description="As cobranças comerciais aparecerão aqui quando o backend retornar dados."
        />
      ) : (
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          loading={isLoading}
          error={error ? "Erro ao carregar cobranças." : null}
          keyExtractor={(charge) => charge.id}
          onRetry={() => void refetch()}
        />
      )}

      {data && data.totalPages > 0 && (
        <Pagination
          page={page}
          totalPages={data.totalPages}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}
    </div>
  );
}
