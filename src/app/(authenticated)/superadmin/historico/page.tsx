"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { History } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Column, DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { SuperAdminClinic } from "@/types";
import { useSuperAdminClinics } from "../hooks/useSuperAdminClinics";

const columns = (onOpenHistory: (clinicId: number) => void): Column<SuperAdminClinic>[] => [
  { key: "nome", label: "Clínica" },
  { key: "cnpj", label: "Documento", render: (clinic) => clinic.cnpj || "-" },
  { key: "email", label: "E-mail", render: (clinic) => clinic.email || "-" },
  {
    key: "actions",
    label: "",
    className: "text-right",
    render: (clinic) => (
      <div className="ml-auto w-40">
        <Button type="button" variant="outline" onClick={() => onOpenHistory(clinic.id)}>
          Ver histórico
        </Button>
      </div>
    ),
  },
];

export default function SuperAdminHistoryPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data, isLoading, error, refetch } = useSuperAdminClinics({ page, pageSize });

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-8">
      <PageHeader title="Histórico Comercial" />

      {!isLoading && !error && data?.data?.length === 0 ? (
        <EmptyState
          icon={History}
          title="Nenhuma clínica encontrada"
          description="O histórico comercial é consultado por clínica, conforme a rota atual da API."
        />
      ) : (
        <DataTable
          columns={columns((clinicId) => router.push(`/superadmin/clinicas/${clinicId}?tab=history`))}
          data={data?.data ?? []}
          loading={isLoading}
          error={error ? "Erro ao carregar clínicas." : null}
          keyExtractor={(clinic) => clinic.id}
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
