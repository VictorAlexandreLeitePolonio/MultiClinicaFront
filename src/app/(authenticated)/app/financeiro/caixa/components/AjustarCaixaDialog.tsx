"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { AjustarCaixaFormData, AjustarCaixaSchema } from "../schemas/caixa.schema";

interface AjustarCaixaDialogProps {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (data: AjustarCaixaFormData) => Promise<void> | void;
}

export function AjustarCaixaDialog({ open, loading, onClose, onSubmit }: AjustarCaixaDialogProps) {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<AjustarCaixaFormData>({
    resolver: zodResolver(AjustarCaixaSchema),
    defaultValues: { saldoFinalInformado: 0, motivo: "" },
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md rounded-2xl border border-[#d7f3ea] bg-white p-6 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.42)] dark:border-slate-800 dark:bg-slate-900"
      >
        <h2 className="text-lg font-bold text-[#0f172a] dark:text-white">Ajustar Caixa</h2>
        <div className="mt-5 space-y-4">
          <FormField
            id="ajustar-caixa-saldo"
            label="Novo Saldo Final Informado"
            type="number"
            step="0.01"
            error={errors.saldoFinalInformado?.message}
            {...register("saldoFinalInformado", { valueAsNumber: true })}
          />
          <FormField id="ajustar-caixa-motivo" label="Motivo" required error={errors.motivo?.message} {...register("motivo")} />
        </div>
        <div className="mt-6 flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            Ajustar
          </Button>
        </div>
      </form>
    </div>
  );
}
