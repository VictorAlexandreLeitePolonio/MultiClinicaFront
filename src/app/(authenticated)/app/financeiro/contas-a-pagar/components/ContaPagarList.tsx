"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import { ActionsDropdown } from "@/components/ui/ActionsDropdown";
import { Button } from "@/components/ui/Button";
import { Column, DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { useAuth } from "@/contexts/AuthContext";
import { getApiErrorMessage } from "@/utils/apiError";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { useFornecedores } from "../../fornecedores/hooks/useFornecedores";
import { useContasPagar } from "../hooks/useContaPagar";
import type { ContaPagar, StatusContaPagar } from "../services/contasPagar.service";

interface ContaPagarListProps {
  onCreate: () => void;
  onViewDetails: (id: number) => void;
}

const statusOptions: { value: StatusContaPagar | ""; label: string }[] = [
  { value: "", label: "Todos os status" },
  { value: "Aberta", label: "Aberta" },
  { value: "Parcial", label: "Parcial" },
  { value: "Paga", label: "Paga" },
  { value: "Cancelada", label: "Cancelada" },
];

const statusStyles: Record<StatusContaPagar, string> = {
  Aberta: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  Parcial: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  Paga: "bg-[#ecfdf5] text-[#0f766e] dark:bg-slate-800 dark:text-[#67e8f9]",
  Cancelada: "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500",
};

export function ContaPagarList({ onCreate, onViewDetails }: ContaPagarListProps) {
  const { can } = useAuth();
  const [status, setStatus] = useState<StatusContaPagar | "">("");
  const [fornecedorId, setFornecedorId] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const query = useContasPagar({
    status: status || undefined,
    fornecedorId: fornecedorId || undefined,
    page,
    pageSize,
  });
  const fornecedoresQuery = useFornecedores({ page: 1, pageSize: 100 });
  const canCreate = can("financeiro.contas_pagar.criar");
  const data = query.data?.data ?? [];
  const fornecedorNames = new Map((fornecedoresQuery.data?.data ?? []).map((fornecedor) => [fornecedor.id, fornecedor.nome]));
  const error = query.isError ? getApiErrorMessage(query.error, "Erro ao carregar contas a pagar.") : null;

  const columns: Column<ContaPagar>[] = [
    { key: "fornecedorId", label: "Fornecedor", render: (conta) => fornecedorNames.get(conta.fornecedorId) ?? `#${conta.fornecedorId}` },
    { key: "descricao", label: "Descrição" },
    { key: "valorTotal", label: "Valor Total", render: (conta) => formatCurrency(conta.valorTotal) },
    { key: "valorPago", label: "Pago", render: (conta) => formatCurrency(conta.valorPago) },
    { key: "dataVencimento", label: "Vencimento", render: (conta) => formatDate(conta.dataVencimento) },
    {
      key: "status",
      label: "Status",
      render: (conta) => {
        const label = conta.vencida && (conta.status === "Aberta" || conta.status === "Parcial") ? "Vencida" : conta.status;
        return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[conta.status]}`}>{label}</span>;
      },
    },
    {
      key: "actions",
      label: "",
      className: "text-right",
      render: (conta) => (
        <ActionsDropdown actions={[{ label: "Ver Detalhes", onClick: () => onViewDetails(conta.id), icon: <Eye size={14} /> }]} />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Contas a Pagar" actions={canCreate ? <Button onClick={onCreate}>Nova Conta</Button> : undefined} />

      <div className="flex flex-col gap-3 sm:flex-row">
        <select value={fornecedorId} onChange={(event) => { setFornecedorId(Number(event.target.value)); setPage(1); }} className="w-full max-w-xs rounded-xl border border-[#d7f3ea] bg-white px-4 py-2.5 text-[#0f172a] dark:border-slate-800 dark:bg-slate-900 dark:text-white">
          <option value={0}>Todos os fornecedores</option>
          {(fornecedoresQuery.data?.data ?? []).map((fornecedor) => <option key={fornecedor.id} value={fornecedor.id}>{fornecedor.nome}</option>)}
        </select>
        <select value={status} onChange={(event) => { setStatus(event.target.value as StatusContaPagar | ""); setPage(1); }} className="w-full max-w-xs rounded-xl border border-[#d7f3ea] bg-white px-4 py-2.5 text-[#0f172a] dark:border-slate-800 dark:bg-slate-900 dark:text-white">
          {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </div>

      <DataTable columns={columns} data={data} loading={query.isLoading} error={error} onRetry={() => void query.refetch()} emptyMessage="Nenhuma conta a pagar encontrada." keyExtractor={(conta) => conta.id} />
      <Pagination page={page} totalPages={query.data?.totalPages ?? 0} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />
    </div>
  );
}
