"use client";

import { useState } from "react";
import { History } from "lucide-react";
import { DataTable, Column } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { SearchInput } from "@/components/ui/SearchInput";
import { SuperAdminCommercialHistoryItem } from "@/types";
import { formatDateTime } from "@/utils/formatters";
import { useSuperAdminHistory } from "../hooks/useSuperAdminHistory";

const columns: Column<SuperAdminCommercialHistoryItem>[] = [
  { key: "clinicName", label: "Clínica" },
  { key: "action", label: "Ação" },
  { key: "description", label: "Descrição" },
  { key: "createdByName", label: "Responsável", render: (item) => item.createdByName ?? "-" },
  { key: "createdAt", label: "Data", render: (item) => formatDateTime(item.createdAt) },
];

export default function SuperAdminHistoryPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data, isLoading, error, refetch } = useSuperAdminHistory({
    page,
    pageSize,
    search,
  });

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-8">
      <PageHeader title="Histórico Comercial" />
      <SearchInput value={search} onChange={setSearch} placeholder="Buscar no histórico..." />

      {!isLoading && !error && data?.data.length === 0 ? (
        <EmptyState
          icon={History}
          title="Nenhum evento comercial encontrado"
          description="Ativações, bloqueios, pagamentos e ajustes aparecerão nesta linha do tempo."
        />
      ) : (
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          loading={isLoading}
          error={error ? "Erro ao carregar histórico comercial." : null}
          keyExtractor={(item) => item.id}
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
