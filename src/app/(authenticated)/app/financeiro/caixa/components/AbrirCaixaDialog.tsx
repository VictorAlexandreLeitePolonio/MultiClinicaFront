"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { getContasFinanceiras } from "@/services/contasFinanceiras/contasFinanceiras.service";
import { ContaFinanceira } from "@/types";
import { AbrirCaixaFormData, AbrirCaixaSchema } from "../schemas/caixa.schema";

interface AbrirCaixaDialogProps {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (data: AbrirCaixaFormData) => Promise<void> | void;
}

export function AbrirCaixaDialog({ open, loading, onClose, onSubmit }: AbrirCaixaDialogProps) {
  const [contas, setContas] = useState<ContaFinanceira[]>([]);

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<AbrirCaixaFormData>({
    resolver: zodResolver(AbrirCaixaSchema),
    defaultValues: { contaFinanceiraId: 0, saldoInicial: 0, observacao: "" },
  });

  useEffect(() => {
    if (!open) return;
    getContasFinanceiras({ pageSize: 100 })
      .then((result) => setContas(result.data))
      .catch(() => {});
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md rounded-2xl border border-[#d7f3ea] bg-white p-6 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.42)] dark:border-slate-800 dark:bg-slate-900"
      >
        <h2 className="text-lg font-bold text-[#0f172a] dark:text-white">Abrir Caixa</h2>
        <div className="mt-5 space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#0f172a] dark:text-white">Conta Financeira</label>
            <select
              {...register("contaFinanceiraId", { valueAsNumber: true })}
              className="w-full rounded-xl border border-[#d7f3ea] bg-white px-4 py-3 text-[#0f172a] focus:border-[#14b8a6] focus:outline-none focus:ring-4 focus:ring-[#99f6e4]/50 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            >
              <option value={0}>Selecione</option>
              {contas.map((conta) => (
                <option key={conta.id} value={conta.id}>
                  {conta.nome}
                </option>
              ))}
            </select>
            {errors.contaFinanceiraId && <span className="text-xs text-red-600">{errors.contaFinanceiraId.message}</span>}
          </div>
          <FormField
            id="abrir-caixa-saldo"
            label="Saldo Inicial"
            type="number"
            step="0.01"
            error={errors.saldoInicial?.message}
            {...register("saldoInicial", { valueAsNumber: true })}
          />
          <FormField id="abrir-caixa-observacao" label="Observação" error={errors.observacao?.message} {...register("observacao")} />
        </div>
        <div className="mt-6 flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            Abrir Caixa
          </Button>
        </div>
      </form>
    </div>
  );
}
