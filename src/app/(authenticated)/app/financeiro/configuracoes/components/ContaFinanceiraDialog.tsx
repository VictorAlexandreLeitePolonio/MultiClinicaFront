"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { ContaFinanceiraFormData, ContaFinanceiraSchema } from "../schemas/contaFinanceira.schema";

interface ContaFinanceiraDialogProps {
  open: boolean;
  defaultValues: ContaFinanceiraFormData;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (data: ContaFinanceiraFormData) => Promise<void> | void;
}

const tipoOptions: { value: ContaFinanceiraFormData["tipo"]; label: string }[] = [
  { value: "Caixa", label: "Caixa" },
  { value: "Banco", label: "Banco" },
  { value: "Cartao", label: "Cartão" },
  { value: "Outro", label: "Outro" },
];

export function ContaFinanceiraDialog({
  open,
  defaultValues,
  loading,
  onClose,
  onSubmit,
}: ContaFinanceiraDialogProps) {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<ContaFinanceiraFormData>({
    resolver: zodResolver(ContaFinanceiraSchema),
    values: defaultValues,
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md rounded-2xl border border-[#d7f3ea] bg-white p-6 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.42)] dark:border-slate-800 dark:bg-slate-900"
      >
        <h2 className="text-lg font-bold text-[#0f172a] dark:text-white">Conta Financeira</h2>
        <div className="mt-5 space-y-4">
          <FormField
            id="conta-financeira-nome"
            label="Nome"
            required
            error={errors.nome?.message}
            {...register("nome")}
          />
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#0f172a] dark:text-white">Tipo</label>
            <select
              {...register("tipo")}
              className="w-full rounded-xl border border-[#d7f3ea] bg-white px-4 py-3 text-[#0f172a] transition-all focus:border-[#14b8a6] focus:outline-none focus:ring-4 focus:ring-[#99f6e4]/50 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            >
              {tipoOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <FormField
            id="conta-financeira-saldo-inicial"
            label="Saldo inicial"
            type="number"
            step="0.01"
            error={errors.saldoInicial?.message}
            {...register("saldoInicial", { valueAsNumber: true })}
          />
        </div>
        <div className="mt-6 flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            Salvar
          </Button>
        </div>
      </form>
    </div>
  );
}
