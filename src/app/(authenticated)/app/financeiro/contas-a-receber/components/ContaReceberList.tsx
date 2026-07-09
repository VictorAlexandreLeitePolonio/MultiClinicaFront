"use client";

import { Eye } from "lucide-react";
import { ActionsDropdown } from "@/components/ui/ActionsDropdown";
import { Button } from "@/components/ui/Button";
import { Column, DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { ContaReceber, StatusContaReceber } from "@/types";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { useContasReceberPaginated } from "../hooks/useContaReceber";

interface ContaReceberListProps {
  onCreate: () => void;
  onViewDetails: (id: number) => void;
}

const statusOptions: { value: StatusContaReceber | ""; label: string }[] = [
  { value: "", label: "Todos os status" },
  { value: "Aberta", label: "Aberta" },
  { value: "Parcial", label: "Parcial" },
  { value: "Paga", label: "Paga" },
  { value: "Vencida", label: "Vencida" },
  { value: "Cancelada", label: "Cancelada" },
];

const statusStyles: Record<StatusContaReceber, string> = {
  Aberta: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  Parcial: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  Paga: "bg-[#ecfdf5] text-[#0f766e] dark:bg-slate-800 dark:text-[#67e8f9]",
  Vencida: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
  Cancelada: "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500",
};

export function ContaReceberList({ onCreate, onViewDetails }: ContaReceberListProps) {
  const { data, page, setPage, pageSize, setPageSize, totalPages, loading, error, status, setStatus, refetch } =
    useContasReceberPaginated();

  const columns: Column<ContaReceber>[] = [
    { key: "pacienteId", label: "Paciente", render: (conta) => `Paciente #${conta.pacienteId}` },
    { key: "descricao", label: "Descrição" },
    { key: "valorTotal", label: "Valor Total", render: (conta) => formatCurrency(conta.valorTotal) },
    { key: "valorRecebido", label: "Recebido", render: (conta) => formatCurrency(conta.valorRecebido) },
    { key: "dataVencimento", label: "Vencimento", render: (conta) => formatDate(conta.dataVencimento) },
    {
      key: "status",
      label: "Status",
      render: (conta) => (
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[conta.status]}`}>
          {conta.status}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      className: "text-right",
      render: (conta) => (
        <ActionsDropdown
          actions={[
            { label: "Ver Detalhes", onClick: () => onViewDetails(conta.id), icon: <Eye size={14} /> },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Contas a Receber" actions={<Button onClick={onCreate}>Nova Conta</Button>} />

      <select
        value={status}
        onChange={(event) => setStatus(event.target.value as StatusContaReceber | "")}
        className="w-full max-w-xs rounded-xl border border-[#d7f3ea] bg-white px-4 py-2.5 text-[#0f172a] transition-all focus:border-[#14b8a6] focus:outline-none focus:ring-4 focus:ring-[#99f6e4]/50 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
      >
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        error={error}
        onRetry={refetch}
        emptyMessage="Nenhuma conta a receber encontrada."
        keyExtractor={(conta) => conta.id}
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
}
