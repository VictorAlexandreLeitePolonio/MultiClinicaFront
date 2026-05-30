"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";

const BillingConfigSchema = z.object({
  cobrancaAtiva: z.boolean(),
  valorMensalidade: z.number().min(0, "Mensalidade não pode ser negativa"),
  diaVencimento: z.number().min(1, "Dia inválido").max(28, "Dia deve ser até 28"),
  dataInicioCobranca: z.string().optional(),
});

export type BillingConfigFormData = z.infer<typeof BillingConfigSchema>;

interface BillingConfigDialogProps {
  open: boolean;
  defaultValues: BillingConfigFormData;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (data: BillingConfigFormData) => Promise<void> | void;
}

export function BillingConfigDialog({
  open,
  defaultValues,
  loading,
  onClose,
  onSubmit,
}: BillingConfigDialogProps) {
  const {
    handleSubmit,
    register,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BillingConfigFormData>({
    resolver: zodResolver(BillingConfigSchema),
    values: defaultValues,
  });

  if (!open) return null;

  const cobrancaAtiva = watch("cobrancaAtiva");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md rounded-sm border-2 border-[#1a2a4a] bg-white p-6 shadow-[6px_6px_0_0_rgba(26,42,74,0.25)] dark:border-slate-700 dark:bg-slate-900"
      >
        <h2 className="text-lg font-bold text-[#1a2a4a] dark:text-slate-50">
          Configurar cobrança
        </h2>
        <p className="mt-2 text-sm text-[#4a6354] dark:text-slate-300">
          Defina se a cobrança comercial da clínica está ativa e o valor mensal.
        </p>

        <div className="mt-5 space-y-4">
          <label className="flex items-center gap-3 rounded-sm border-2 border-[#e2ebe6] bg-white px-4 py-3 text-sm font-semibold text-[#1a2a4a]">
            <input
              type="checkbox"
              checked={cobrancaAtiva}
              onChange={(event) => setValue("cobrancaAtiva", event.target.checked, { shouldValidate: true })}
            />
            Cobrança ativa
          </label>
          <FormField
            id="billing-monthly-fee"
            label="Mensalidade"
            type="number"
            step="0.01"
            error={errors.valorMensalidade?.message}
            {...register("valorMensalidade", { valueAsNumber: true })}
          />
          <FormField
            id="billing-due-day"
            label="Dia de vencimento"
            type="number"
            min="1"
            max="28"
            error={errors.diaVencimento?.message}
            {...register("diaVencimento", { valueAsNumber: true })}
          />
          <FormField
            id="billing-start-date"
            label="Início da cobrança"
            type="date"
            error={errors.dataInicioCobranca?.message}
            {...register("dataInicioCobranca")}
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
