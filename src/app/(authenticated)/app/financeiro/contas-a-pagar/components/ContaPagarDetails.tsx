"use client";

import { useState } from "react";
import { Ban, Pencil, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { ActionsDropdown } from "@/components/ui/ActionsDropdown";
import { Button } from "@/components/ui/Button";
import { Column, DataTable } from "@/components/ui/DataTable";
import { MotivoDialog } from "@/components/ui/MotivoDialog";
import { PageHeader } from "@/components/ui/PageHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { getApiErrorMessage } from "@/utils/apiError";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { useFornecedores } from "../../fornecedores/hooks/useFornecedores";
import { useContaPagar, useContaPagarMutations } from "../hooks/useContaPagar";
import { usePagamentoMutations } from "../hooks/usePagamento";
import type { ContaPagar, PagamentoContaPagar } from "../services/contasPagar.service";
import type { RegistrarPagamentoFormData } from "../schemas/pagamento.schema";
import { RegistrarPagamentoDialog } from "./RegistrarPagamentoDialog";

interface ContaPagarDetailsProps {
  id: number;
  onBack: () => void;
  onEdit: (conta: ContaPagar) => void;
}

export function ContaPagarDetails({ id, onBack, onEdit }: ContaPagarDetailsProps) {
  const { can } = useAuth();
  const query = useContaPagar(id);
  const fornecedoresQuery = useFornecedores({ page: 1, pageSize: 100 });
  const { cancelarContaPagar, isCanceling } = useContaPagarMutations();
  const { registrarPagamento, estornarPagamento, isRegistering, isReversing } = usePagamentoMutations();
  const [registrarOpen, setRegistrarOpen] = useState(false);
  const [cancelarOpen, setCancelarOpen] = useState(false);
  const [estornando, setEstornando] = useState<PagamentoContaPagar | null>(null);
  const [pagamentos, setPagamentos] = useState<PagamentoContaPagar[]>([]);
  const conta = query.data;
  const fornecedor = fornecedoresQuery.data?.data.find((item) => item.id === conta?.fornecedorId);

  const handleRegistrar = async (data: RegistrarPagamentoFormData) => {
    try {
      const pagamento = await registrarPagamento({
        ...data,
        contaPagarId: id,
        observacao: data.observacao || null,
      });
      setPagamentos((current) => [...current, pagamento]);
      setRegistrarOpen(false);
      await query.refetch();
      toast.success("Pagamento registrado!");
    } catch {
      // o hook já exibe o erro da API
    }
  };

  const handleEstornar = async (motivo: string) => {
    if (!estornando) return;
    try {
      const pagamento = await estornarPagamento(estornando.id, { motivo });
      setPagamentos((current) => current.map((item) => item.id === pagamento.id ? pagamento : item));
      setEstornando(null);
      await query.refetch();
      toast.success("Pagamento estornado!");
    } catch {
      // o hook já exibe o erro da API
    }
  };

  const handleCancelar = async (motivo: string) => {
    try {
      await cancelarContaPagar(id, motivo);
      setCancelarOpen(false);
      await query.refetch();
      toast.success("Conta a pagar cancelada!");
    } catch {
      // o hook já exibe o erro da API
    }
  };

  if (query.isLoading) {
    return (
      <div className="space-y-4">
        <PageHeader title="Conta a Pagar" onBack={onBack} />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (query.isError || !conta) {
    return (
      <div className="space-y-4">
        <PageHeader title="Conta a Pagar" onBack={onBack} />
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm font-semibold text-red-700">
          {getApiErrorMessage(query.error, "Erro ao carregar conta a pagar.")}
        </div>
      </div>
    );
  }

  const saldoRestante = Math.max(0, conta.valorTotal - conta.valorPago);
  const podePagar = saldoRestante > 0 && conta.status !== "Cancelada" && can("financeiro.contas_pagar.registrar_pagamento");
  const podeCancelar = conta.status !== "Cancelada" && conta.valorPago === 0 && can("financeiro.contas_pagar.cancelar");
  const columns: Column<PagamentoContaPagar>[] = [
    { key: "valor", label: "Valor", render: (pagamento) => formatCurrency(pagamento.valor) },
    { key: "dataPagamento", label: "Data", render: (pagamento) => formatDate(pagamento.dataPagamento) },
    {
      key: "isEstornado",
      label: "Status",
      render: (pagamento) => (
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${pagamento.isEstornado ? "bg-red-50 text-red-700" : "bg-[#ecfdf5] text-[#0f766e]"}`}>
          {pagamento.isEstornado ? "Estornado" : "Ativo"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      className: "text-right",
      render: (pagamento) => !pagamento.isEstornado && can("financeiro.contas_pagar.estornar_pagamento") ? (
        <ActionsDropdown actions={[{ label: "Estornar", onClick: () => setEstornando(pagamento), variant: "danger", icon: <RotateCcw size={14} /> }]} />
      ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Conta a Pagar #${conta.id}`}
        onBack={onBack}
        actions={
          <div className="flex gap-2">
            {can("financeiro.contas_pagar.editar") && conta.status !== "Paga" && conta.status !== "Cancelada" && <Button variant="outline" onClick={() => onEdit(conta)}><Pencil size={16} className="mr-2" />Editar</Button>}
            {podePagar && <Button onClick={() => setRegistrarOpen(true)}>Registrar Pagamento</Button>}
            {podeCancelar && <Button variant="danger" onClick={() => setCancelarOpen(true)}><Ban size={16} className="mr-2" />Cancelar Conta</Button>}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-[#d7f3ea] bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2 lg:grid-cols-4">
        <div><p className="text-xs font-medium text-[#64748b]">Fornecedor</p><p className="mt-1 font-semibold text-[#0f172a] dark:text-white">{fornecedor?.nome ?? `#${conta.fornecedorId}`}</p></div>
        <div><p className="text-xs font-medium text-[#64748b]">Valor Total</p><p className="mt-1 font-semibold text-[#0f172a] dark:text-white">{formatCurrency(conta.valorTotal)}</p></div>
        <div><p className="text-xs font-medium text-[#64748b]">Pago</p><p className="mt-1 font-semibold text-[#0f172a] dark:text-white">{formatCurrency(conta.valorPago)}</p></div>
        <div><p className="text-xs font-medium text-[#64748b]">Status</p><p className="mt-1 font-semibold text-[#0f172a] dark:text-white">{conta.vencida && (conta.status === "Aberta" || conta.status === "Parcial") ? "Vencida" : conta.status}</p></div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#64748b]">Pagamentos registrados nesta sessão</h3>
        <DataTable columns={columns} data={pagamentos} loading={false} emptyMessage="Nenhum pagamento registrado nesta sessão." keyExtractor={(pagamento) => pagamento.id} />
      </div>

      <RegistrarPagamentoDialog open={registrarOpen} saldoRestante={saldoRestante} loading={isRegistering} onClose={() => setRegistrarOpen(false)} onSubmit={handleRegistrar} />
      <MotivoDialog open={!!estornando} title="Estornar pagamento" description={`Informe o motivo do estorno de ${estornando ? formatCurrency(estornando.valor) : ""}.`} confirmLabel="Estornar" loading={isReversing} onCancel={() => setEstornando(null)} onConfirm={handleEstornar} />
      <MotivoDialog open={cancelarOpen} title="Cancelar conta a pagar" description="Informe o motivo do cancelamento. Essa ação não pode ser desfeita." confirmLabel="Cancelar Conta" loading={isCanceling} onCancel={() => setCancelarOpen(false)} onConfirm={handleCancelar} />
    </div>
  );
}
