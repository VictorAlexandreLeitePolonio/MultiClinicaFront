"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";

const UnblockBillingSchema = z.object({
  reason: z.string().min(5, "Informe um motivo para desbloquear a cobrança"),
});

export type UnblockBillingFormData = z.infer<typeof UnblockBillingSchema>;

interface UnblockBillingDialogProps {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (data: UnblockBillingFormData) => Promise<void> | void;
}

export function UnblockBillingDialog({
  open,
  loading,
  onClose,
  onSubmit,
}: UnblockBillingDialogProps) {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<UnblockBillingFormData>({
    resolver: zodResolver(UnblockBillingSchema),
    defaultValues: {
      reason: "",
    },
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md rounded-sm border-2 border-[#1a2a4a] bg-white p-6 shadow-[6px_6px_0_0_rgba(26,42,74,0.25)] dark:border-slate-700 dark:bg-slate-900"
      >
        <h2 className="text-lg font-bold text-[#1a2a4a] dark:text-slate-50">
          Desbloquear cobrança
        </h2>
        <p className="mt-2 text-sm text-[#4a6354] dark:text-slate-300">
          Informe o motivo da exceção comercial antes de liberar o acesso da clínica.
        </p>

        <div className="mt-5">
          <FormField
            id="unblock-reason"
            label="Motivo"
            error={errors.reason?.message}
            {...register("reason")}
          />
        </div>

        <div className="mt-6 flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="danger" loading={loading}>
            Desbloquear
          </Button>
        </div>
      </form>
    </div>
  );
}
