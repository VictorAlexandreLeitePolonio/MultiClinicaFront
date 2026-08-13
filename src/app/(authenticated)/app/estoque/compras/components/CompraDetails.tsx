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
import { getApiErrorMessage } from "@/utils/apiError";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { useFornecedores } from "../../../financeiro/fornecedores/hooks/useFornecedores";
import { useCompra, useCompraMutations } from "../hooks/useCompras";
import type { Compra, CompraItem } from "../services/compras.service";

interface CompraDetailsProps {
  id: number;
  onBack: () => void;
  onEdit: (compra: Compra) => void;
}

export function CompraDetails({ id, onBack, onEdit }: CompraDetailsProps) {
  const { can } = useAuth();
  const query = useCompra(id);
  const fornecedores = useFornecedores({ page: 1, pageSize: 100 });
  const mutations = useCompraMutations();
  const [cancelar, setCancelar] = useState(false);
  const compra = query.data;

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
    { key: "produtoId", label: "Produto", render: (row) => `#${row.produtoId}` },
    { key: "quantidade", label: "Quantidade" },
    { key: "valorUnitario", label: "Valor unitário", render: (row) => formatCurrency(row.valorUnitario) },
    { key: "valorTotal", label: "Total", render: (row) => formatCurrency(row.valorTotal ?? row.quantidade * row.valorUnitario) },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title={`Compra #${compra.id}`}
        onBack={onBack}
        actions={
          <div className="flex flex-wrap gap-2">
            {can("compras.editar") && compra.status === "Aberta" && <Button variant="outline" onClick={() => onEdit(compra)}>Editar</Button>}
            {can("compras.aprovar") && compra.status === "Aberta" && <Button onClick={() => void run(() => mutations.aprovarCompra(id), "Compra aprovada!")}><Check size={16} className="mr-1" />Aprovar</Button>}
            {can("compras.receber_produtos") && compra.status === "Aprovada" && <Button onClick={() => void run(() => mutations.receberCompra(id), "Compra recebida!")}><PackageCheck size={16} className="mr-1" />Receber</Button>}
            {can("compras.cancelar") && compra.status !== "Cancelada" && compra.status !== "Recebida" && <Button variant="danger" onClick={() => setCancelar(true)}><Ban size={16} className="mr-1" />Cancelar</Button>}
          </div>
        }
      />
      <div className="grid gap-4 rounded-2xl border border-[#d7f3ea] bg-white p-5 sm:grid-cols-4">
        <div><p className="text-xs text-slate-500">Fornecedor</p><p className="font-semibold">{fornecedor?.nome ?? `#${compra.fornecedorId}`}</p></div>
        <div><p className="text-xs text-slate-500">Data</p><p className="font-semibold">{formatDate(compra.dataCompra)}</p></div>
        <div><p className="text-xs text-slate-500">Status</p><p className="font-semibold">{compra.status}</p></div>
        <div><p className="text-xs text-slate-500">Total</p><p className="font-semibold">{formatCurrency(compra.valorTotal ?? 0)}</p></div>
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
