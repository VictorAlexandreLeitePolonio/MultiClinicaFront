"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { getContasFinanceiras } from "@/app/(authenticated)/app/financeiro/configuracoes/services/contasFinanceiras.service";
import { getFormasPagamento } from "@/app/(authenticated)/app/financeiro/configuracoes/services/formasPagamento.service";
import type { ContaFinanceira, FormaPagamento } from "@/types";
import {
  RegistrarPagamentoFormData,
  RegistrarPagamentoSchema,
} from "../schemas/pagamento.schema";

interface RegistrarPagamentoDialogProps {
  open: boolean;
  saldoRestante: number;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (data: RegistrarPagamentoFormData) => Promise<void> | void;
}

export function RegistrarPagamentoDialog({
  open,
  saldoRestante,
  loading,
  onClose,
  onSubmit,
}: RegistrarPagamentoDialogProps) {
  const [contas, setContas] = useState<ContaFinanceira[]>([]);
  const [formas, setFormas] = useState<FormaPagamento[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<RegistrarPagamentoFormData>({
    resolver: zodResolver(RegistrarPagamentoSchema),
    values: {
      contaFinanceiraId: 0,
      formaPagamentoId: 0,
      valor: saldoRestante,
      dataPagamento: new Date().toISOString().slice(0, 10),
      observacao: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    getContasFinanceiras({ page: 1, pageSize: 100 }).then((result) => setContas(result.data)).catch(() => setContas([]));
    getFormasPagamento({ page: 1, pageSize: 100 }).then((result) => setFormas(result.data)).catch(() => setFormas([]));
  }, [open]);

  if (!open) return null;

  const submitForm = async (data: RegistrarPagamentoFormData) => {
    setSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = Boolean(loading || submitting);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <form onSubmit={handleSubmit(submitForm)} className="w-full max-w-md rounded-2xl border border-[#d7f3ea] bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-[#0f172a] dark:text-white">Registrar Pagamento</h2>
        <div className="mt-5 space-y-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="pagamento-conta-financeira" className="text-sm font-semibold text-[#0f172a] dark:text-white">Conta Financeira</label>
            <select id="pagamento-conta-financeira" {...register("contaFinanceiraId", { valueAsNumber: true })} className="w-full rounded-xl border border-[#d7f3ea] bg-white px-4 py-3 text-[#0f172a] dark:border-slate-800 dark:bg-slate-900 dark:text-white">
              <option value={0}>Selecione</option>
              {contas.filter((conta) => conta.isActive).map((conta) => <option key={conta.id} value={conta.id}>{conta.nome}</option>)}
            </select>
            {errors.contaFinanceiraId && <span className="text-xs text-red-600">{errors.contaFinanceiraId.message}</span>}
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="pagamento-forma-pagamento" className="text-sm font-semibold text-[#0f172a] dark:text-white">Forma de Pagamento</label>
            <select id="pagamento-forma-pagamento" {...register("formaPagamentoId", { valueAsNumber: true })} className="w-full rounded-xl border border-[#d7f3ea] bg-white px-4 py-3 text-[#0f172a] dark:border-slate-800 dark:bg-slate-900 dark:text-white">
              <option value={0}>Selecione</option>
              {formas.filter((forma) => forma.isActive).map((forma) => <option key={forma.id} value={forma.id}>{forma.nome}</option>)}
            </select>
            {errors.formaPagamentoId && <span className="text-xs text-red-600">{errors.formaPagamentoId.message}</span>}
          </div>
          <FormField id="pagamento-valor" label={`Valor (saldo restante: ${saldoRestante.toFixed(2)})`} type="number" step="0.01" error={errors.valor?.message} {...register("valor", { valueAsNumber: true })} />
          <FormField id="pagamento-data" label="Data do Pagamento" type="date" error={errors.dataPagamento?.message} {...register("dataPagamento")} />
          <FormField id="pagamento-observacao" label="Observação" error={errors.observacao?.message} {...register("observacao")} />
        </div>
        <div className="mt-6 flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancelar</Button>
          <Button type="submit" loading={isLoading}>Registrar</Button>
        </div>
      </form>
    </div>
  );
}
