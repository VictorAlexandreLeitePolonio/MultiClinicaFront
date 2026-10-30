"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Column, DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SuperAdminClinic } from "@/types";
import { useSuperAdminClinics } from "../hooks/useSuperAdminClinics";

const columns = (onOpenBilling: (clinicId: number) => void): Column<SuperAdminClinic>[] => [
  { key: "nome", label: "Clínica" },
  { key: "plan", label: "Plano", render: (clinic) => clinic.plan },
  {
    key: "isBlockedByBilling",
    label: "Cobrança",
    render: (clinic) => (
      <StatusBadge
        status={clinic.isBlockedByBilling ? "Blocked" : "Enabled"}
        mapping={{
          Enabled: { label: "Em dia", className: "bg-blue-100 text-blue-700 border-blue-200" },
          Blocked: { label: "Bloqueada", className: "bg-red-100 text-red-700 border-red-200" },
        }}
      />
    ),
  },
  {
    key: "actions",
    label: "",
    className: "text-right",
    render: (clinic) => (
      <div className="ml-auto w-40">
        <Button type="button" variant="outline" onClick={() => onOpenBilling(clinic.id)}>
          Ver cobranças
        </Button>
      </div>
    ),
  },
];

export default function SuperAdminBillingPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data, isLoading, error, refetch } = useSuperAdminClinics({
    page,
    pageSize,
  });

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-8">
      <PageHeader title="Cobranças Comerciais" />

      {!isLoading && !error && data?.data?.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="Nenhuma clínica cadastrada"
          description="As cobranças são consultadas pelo detalhe de cada clínica."
        />
      ) : (
        <DataTable
          columns={columns((clinicId) => router.push(`/superadmin/clinicas/${clinicId}?action=payment`))}
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
