"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { FecharCaixaFormData, FecharCaixaSchema } from "../schemas/caixa.schema";

interface FecharCaixaDialogProps {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (data: FecharCaixaFormData) => Promise<void> | void;
}

export function FecharCaixaDialog({ open, loading, onClose, onSubmit }: FecharCaixaDialogProps) {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FecharCaixaFormData>({
    resolver: zodResolver(FecharCaixaSchema),
    defaultValues: { saldoFinalInformado: 0, observacao: "" },
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md rounded-2xl border border-[#d7f3ea] bg-white p-6 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.42)] dark:border-slate-800 dark:bg-slate-900"
      >
        <h2 className="text-lg font-bold text-[#0f172a] dark:text-white">Fechar Caixa</h2>
        <div className="mt-5 space-y-4">
          <FormField
            id="fechar-caixa-saldo"
            label="Saldo Final Informado (contagem física)"
            type="number"
            step="0.01"
            error={errors.saldoFinalInformado?.message}
            {...register("saldoFinalInformado", { valueAsNumber: true })}
          />
          <FormField id="fechar-caixa-observacao" label="Observação" error={errors.observacao?.message} {...register("observacao")} />
        </div>
        <div className="mt-6 flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            Fechar Caixa
          </Button>
        </div>
      </form>
    </div>
  );
}
