"use client";

import { useEffect, useState } from "react";
import { Ban, RotateCcw, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { ActionsDropdown } from "@/components/ui/ActionsDropdown";
import { Column, DataTable } from "@/components/ui/DataTable";
import { MotivoDialog } from "@/components/ui/MotivoDialog";
import { Pagination } from "@/components/ui/Pagination";
import { useAuth } from "@/contexts/AuthContext";
import { ajustarCaixa, cancelarCaixa, reabrirCaixa } from "@/services/caixa/caixa.service";
import { Caixa, StatusCaixa } from "@/types";
import { getApiErrorMessage } from "@/utils/apiError";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { useCaixasPaginated } from "../hooks/useCaixasPaginated";
import { AjustarCaixaFormData } from "../schemas/caixa.schema";
import { AjustarCaixaDialog } from "./AjustarCaixaDialog";

interface HistoricoCaixasTableProps {
  refreshKey?: number;
}

const statusStyles: Record<StatusCaixa, string> = {
  Aberto: "bg-[#ecfdf5] text-[#0f766e] dark:bg-slate-800 dark:text-[#67e8f9]",
  Fechado: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  Cancelado: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
};

export function HistoricoCaixasTable({ refreshKey }: HistoricoCaixasTableProps) {
  const { can } = useAuth();
  const { data, page, setPage, pageSize, setPageSize, totalPages, loading, error, status, setStatus, refetch } =
    useCaixasPaginated();

  const [reabrindo, setReabrindo] = useState<Caixa | null>(null);
  const [cancelando, setCancelando] = useState<Caixa | null>(null);
  const [ajustando, setAjustando] = useState<Caixa | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (refreshKey !== undefined) refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const handleReabrir = async (motivo: string) => {
    if (!reabrindo) return;
    setActionLoading(true);
    try {
      await reabrirCaixa(reabrindo.id, motivo);
      toast.success("Caixa reaberto!");
      setReabrindo(null);
      refetch();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Erro ao reabrir caixa"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelar = async (motivo: string) => {
    if (!cancelando) return;
    setActionLoading(true);
    try {
      await cancelarCaixa(cancelando.id, motivo);
      toast.success("Caixa cancelado!");
      setCancelando(null);
      refetch();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Erro ao cancelar caixa"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleAjustar = async (formData: AjustarCaixaFormData) => {
    if (!ajustando) return;
    setActionLoading(true);
    try {
      await ajustarCaixa(ajustando.id, formData);
      toast.success("Caixa ajustado!");
      setAjustando(null);
      refetch();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Erro ao ajustar caixa"));
    } finally {
      setActionLoading(false);
    }
  };

  const columns: Column<Caixa>[] = [
    { key: "dataAbertura", label: "Abertura", render: (caixa) => formatDate(caixa.dataAbertura) },
    { key: "dataFechamento", label: "Fechamento", render: (caixa) => (caixa.dataFechamento ? formatDate(caixa.dataFechamento) : "-") },
    { key: "saldoInicial", label: "Saldo Inicial", render: (caixa) => formatCurrency(caixa.saldoInicial) },
    {
      key: "saldoFinalCalculado",
      label: "Saldo Calculado",
      render: (caixa) => (caixa.saldoFinalCalculado !== null ? formatCurrency(caixa.saldoFinalCalculado) : "-"),
    },
    {
      key: "diferenca",
      label: "Diferença",
      render: (caixa) => (caixa.diferenca !== null ? formatCurrency(caixa.diferenca) : "-"),
    },
    {
      key: "status",
      label: "Status",
      render: (caixa) => (
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[caixa.status]}`}>
          {caixa.status}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      className: "text-right",
      render: (caixa) => {
        if (caixa.status !== "Fechado") return null;

        const actions = [
          can("financeiro.caixa.reabrir")
            ? { label: "Reabrir", onClick: () => setReabrindo(caixa), icon: <RotateCcw size={14} /> }
            : null,
          can("financeiro.caixa.ajustar")
            ? { label: "Ajustar", onClick: () => setAjustando(caixa), icon: <SlidersHorizontal size={14} /> }
            : null,
          can("financeiro.caixa.cancelar")
            ? { label: "Cancelar", onClick: () => setCancelando(caixa), variant: "danger" as const, icon: <Ban size={14} /> }
            : null,
        ].filter((action) => action !== null);

        return actions.length > 0 ? <ActionsDropdown actions={actions} /> : null;
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold text-[#0f172a] dark:text-white">Histórico de Caixas</h2>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as StatusCaixa | "")}
          className="w-full max-w-xs rounded-xl border border-[#d7f3ea] bg-white px-4 py-2 text-sm text-[#0f172a] focus:border-[#14b8a6] focus:outline-none focus:ring-4 focus:ring-[#99f6e4]/50 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
        >
          <option value="">Todos os status</option>
          <option value="Aberto">Aberto</option>
          <option value="Fechado">Fechado</option>
          <option value="Cancelado">Cancelado</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        error={error}
        onRetry={refetch}
        emptyMessage="Nenhum caixa no histórico ainda."
        keyExtractor={(caixa) => caixa.id}
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      <MotivoDialog
        open={!!reabrindo}
        title="Reabrir caixa"
        description="Tem certeza que deseja reabrir este caixa?"
        confirmLabel="Reabrir"
        loading={actionLoading}
        onCancel={() => setReabrindo(null)}
        onConfirm={handleReabrir}
      />

      <MotivoDialog
        open={!!cancelando}
        title="Cancelar caixa"
        description="Tem certeza que deseja cancelar este caixa? Essa ação não pode ser desfeita."
        confirmLabel="Cancelar Caixa"
        loading={actionLoading}
        onCancel={() => setCancelando(null)}
        onConfirm={handleCancelar}
      />

      <AjustarCaixaDialog
        open={!!ajustando}
        loading={actionLoading}
        onClose={() => setAjustando(null)}
        onSubmit={handleAjustar}
      />
    </div>
  );
}
