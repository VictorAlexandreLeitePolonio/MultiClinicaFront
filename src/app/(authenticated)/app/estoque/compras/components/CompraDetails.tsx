"use client";

import { useState } from "react";
import { Ban, Check, PackageCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { MotivoDialog } from "@/components/ui/MotivoDialog";
import { PageHeader } from "@/components/ui/PageHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getApiErrorMessage } from "@/utils/apiError";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { useFornecedores } from "../../../financeiro/fornecedores/hooks/useFornecedores";
import { useProdutos } from "../../produtos/hooks/useProdutos";
import { useCompra, useCompraMutations } from "../hooks/useCompras";
import type { Compra, CompraItem } from "../services/compras.service";

const statusMapping = {
  Aberta: { label: "Aberta", className: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300" },
  Aprovada: { label: "Aprovada", className: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300" },
  Recebida: { label: "Recebida", className: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300" },
  Cancelada: { label: "Cancelada", className: "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300" },
};

interface CompraDetailsProps {
  id: number;
  onBack: () => void;
  onEdit: (compra: Compra) => void;
}

export function CompraDetails({ id, onBack, onEdit }: CompraDetailsProps) {
  const { can } = useAuth();
  const query = useCompra(id);
  const fornecedores = useFornecedores({ page: 1, pageSize: 100 });
  const produtos = useProdutos({ page: 1, pageSize: 100 });
  const mutations = useCompraMutations();
  const [cancelar, setCancelar] = useState(false);
  const compra = query.data;
  const produtoNomes = new Map((produtos.data?.data ?? []).map((item) => [item.id, item.nome]));

  if (query.isLoading) {
    return <><PageHeader title="Compra" onBack={onBack} /><Skeleton className="h-40" /></>;
  }

  if (query.isError || !compra) {
    return <><PageHeader title="Compra" onBack={onBack} /><p className="rounded-2xl bg-red-50 p-6 text-center text-sm text-red-700">{getApiErrorMessage(query.error, "Erro ao carregar compra.")}</p></>;
  }

  const fornecedor = fornecedores.data?.data.find((item) => item.id === compra.fornecedorId);
  const run = async (action: () => Promise<Compra>, message: string) => {
    try {
      await action();
      toast.success(message);
      await query.refetch();
    } catch {
      // useApiMutation exibe o erro.
    }
  };
  const columns: Column<CompraItem>[] = [
    { key: "produtoId", label: "Produto", render: (row) => produtoNomes.get(row.produtoId) ?? `#${row.produtoId}` },
    { key: "quantidade", label: "Quantidade" },
    { key: "valorUnitario", label: "Valor unitário", render: (row) => formatCurrency(row.valorUnitario) },
    { key: "valorTotal", label: "Total", render: (row) => formatCurrency(row.valorTotal ?? row.quantidade * row.valorUnitario) },
  ];

  return (
    <div className="space-y-5 p-8">
      <PageHeader
        title={`Compra #${compra.id}`}
        onBack={onBack}
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            {can("compras.editar") && compra.status === "Aberta" && <Button variant="outline" fullWidth={false} onClick={() => onEdit(compra)}>Editar</Button>}
            {can("compras.aprovar") && compra.status === "Aberta" && <Button fullWidth={false} onClick={() => void run(() => mutations.aprovarCompra(id), "Compra aprovada!")}><Check size={16} />Aprovar</Button>}
            {can("compras.receber_produtos") && compra.status === "Aprovada" && <Button fullWidth={false} onClick={() => void run(() => mutations.receberCompra(id), "Compra recebida!")}><PackageCheck size={16} />Receber</Button>}
            {can("compras.cancelar") && compra.status !== "Cancelada" && compra.status !== "Recebida" && <Button variant="danger" fullWidth={false} onClick={() => setCancelar(true)}><Ban size={16} />Cancelar</Button>}
          </div>
        }
      />
      <div className="grid gap-5 rounded-2xl border border-[#d7f3ea] bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-4">
        <div className="flex flex-col gap-1"><p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Fornecedor</p><p className="font-semibold text-[#0f172a] dark:text-white">{fornecedor?.nome ?? `#${compra.fornecedorId}`}</p></div>
        <div className="flex flex-col gap-1"><p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Data</p><p className="font-semibold text-[#0f172a] dark:text-white">{formatDate(compra.dataCompra)}</p></div>
        <div className="flex flex-col gap-1"><p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Status</p><div><StatusBadge status={compra.status} mapping={statusMapping} /></div></div>
        <div className="flex flex-col gap-1"><p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Total</p><p className="text-lg font-bold text-[#0f766e] dark:text-[#67e8f9]">{formatCurrency(compra.valorTotal ?? 0)}</p></div>
      </div>
      <DataTable columns={columns} data={compra.itens} keyExtractor={(row) => row.id ?? row.produtoId} emptyMessage="Compra sem itens." />
      <MotivoDialog
        open={cancelar}
        title="Cancelar compra"
        description="Informe o motivo do cancelamento."
        confirmLabel="Cancelar"
        loading={mutations.isCanceling}
        onCancel={() => setCancelar(false)}
        onConfirm={(motivo) => run(() => mutations.cancelarCompra(id, motivo), "Compra cancelada!").then(() => setCancelar(false))}
      />
    </div>
  );
}
