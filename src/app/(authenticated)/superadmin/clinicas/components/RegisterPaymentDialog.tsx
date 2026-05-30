"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";

const RegisterPaymentSchema = z.object({
  referenceMonth: z.string().min(7, "Informe o mês de referência"),
  amount: z.number().positive("Valor deve ser maior que zero"),
  paidAt: z.string().min(10, "Informe a data de pagamento"),
  notes: z.string().optional(),
});

export type RegisterPaymentFormData = z.infer<typeof RegisterPaymentSchema>;

interface RegisterPaymentDialogProps {
  open: boolean;
  loading?: boolean;
  defaultAmount: number;
  onClose: () => void;
  onSubmit: (data: RegisterPaymentFormData) => Promise<void> | void;
}

function getCurrentReferenceMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

export function RegisterPaymentDialog({
  open,
  loading,
  defaultAmount,
  onClose,
  onSubmit,
}: RegisterPaymentDialogProps) {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<RegisterPaymentFormData>({
    resolver: zodResolver(RegisterPaymentSchema),
    defaultValues: {
      referenceMonth: getCurrentReferenceMonth(),
      amount: defaultAmount,
      paidAt: getTodayDate(),
      notes: "",
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
          Registrar pagamento
        </h2>
        <p className="mt-2 text-sm text-[#4a6354] dark:text-slate-300">
          Registre uma atualização comercial de pagamento para esta clínica.
        </p>

        <div className="mt-5 space-y-4">
          <FormField id="payment-reference-month" label="Mês de referência" type="month" error={errors.referenceMonth?.message} {...register("referenceMonth")} />
          <FormField id="payment-amount" label="Valor" type="number" step="0.01" error={errors.amount?.message} {...register("amount", { valueAsNumber: true })} />
          <FormField id="payment-paid-at" label="Data de pagamento" type="date" error={errors.paidAt?.message} {...register("paidAt")} />
          <FormField id="payment-notes" label="Observações" error={errors.notes?.message} {...register("notes")} />
        </div>

        <div className="mt-6 flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            Registrar
          </Button>
        </div>
      </form>
    </div>
  );
}
