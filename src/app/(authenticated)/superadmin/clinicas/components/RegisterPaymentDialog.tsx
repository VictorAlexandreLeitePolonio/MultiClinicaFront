"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { SuperAdminBillingCharge } from "@/types";

const RegisterPaymentSchema = z.object({
  chargeId: z.number().positive("Selecione uma cobrança"),
  paymentMethod: z.string().min(2, "Informe a forma de pagamento"),
  paidAt: z.string().optional(),
  notes: z.string().optional(),
});

export type RegisterPaymentFormData = z.infer<typeof RegisterPaymentSchema>;

interface RegisterPaymentDialogProps {
  open: boolean;
  loading?: boolean;
  charges: SuperAdminBillingCharge[];
  onClose: () => void;
  onSubmit: (data: RegisterPaymentFormData) => Promise<void> | void;
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

export function RegisterPaymentDialog({
  open,
  loading,
  charges,
  onClose,
  onSubmit,
}: RegisterPaymentDialogProps) {
  const pendingCharges = charges.filter((charge) => charge.status === "Pending");
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<RegisterPaymentFormData>({
    resolver: zodResolver(RegisterPaymentSchema),
    values: {
      chargeId: pendingCharges[0]?.id ?? 0,
      paymentMethod: "",
      paidAt: getTodayDate(),
      notes: "",
    },
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl border border-gray-200 bg-white p-6 shadow-[0_18px_50px_-44px_rgba(15,23,42,0.42)] dark:border-slate-700 dark:bg-slate-900"
      >
        <h2 className="text-lg font-bold text-secondary dark:text-slate-50">
          Registrar pagamento
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-slate-300">
          Registre uma atualização comercial de pagamento para esta clínica.
        </p>

        <div className="mt-5 space-y-4">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="payment-charge-id"
              className="text-sm font-semibold uppercase tracking-wide text-secondary dark:text-white"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Cobrança
            </label>
            <select
              id="payment-charge-id"
              className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-secondary dark:text-white transition-all duration-150 focus:border-primary focus:ring-4 focus:ring-primary/20 focus:outline-none"
              style={{ fontFamily: "var(--font-serif)" }}
              {...register("chargeId", { valueAsNumber: true })}
            >
              {pendingCharges.map((charge) => (
                <option key={charge.id} value={charge.id}>
                  {charge.referenceMonth} - R$ {charge.amount.toFixed(2)}
                </option>
              ))}
            </select>
            {errors.chargeId?.message && (
              <span className="text-xs font-medium text-red-600">{errors.chargeId.message}</span>
            )}
          </div>
          <FormField id="payment-method" label="Forma de pagamento" error={errors.paymentMethod?.message} {...register("paymentMethod")} />
          <FormField id="payment-paid-at" label="Data de pagamento" type="date" error={errors.paidAt?.message} {...register("paidAt")} />
          <FormField id="payment-notes" label="Observações" error={errors.notes?.message} {...register("notes")} />
        </div>

        <div className="mt-6 flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading} disabled={pendingCharges.length === 0 || loading}>
            Registrar
          </Button>
        </div>
      </form>
    </div>
  );
}
