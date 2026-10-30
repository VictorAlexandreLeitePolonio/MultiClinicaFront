import { Building2 } from "lucide-react";
import { PublicPayment } from "@/types/mercadoPago";
import { formatCurrency, formatReferenceMonth } from "@/utils/formatters";

/** Cabeçalho da cobrança: clínica, valor, plano e mês de referência. */
export function PaymentSummary({ payment }: { payment: PublicPayment }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#a7f3d0] bg-[#ecfdf5] text-[#0f766e] dark:border-slate-700 dark:bg-slate-800 dark:text-[#67e8f9]">
          {payment.clinicLogoUrl ? (
            // Logo vem de URL externa cadastrada pela clínica.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={payment.clinicLogoUrl}
              alt={payment.clinicName}
              className="h-full w-full object-contain p-1"
            />
          ) : (
            <Building2 size={24} />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b] dark:text-slate-400">
            Cobrança de
          </p>
          <h1 className="truncate text-lg font-bold text-[#0f172a] dark:text-white">
            {payment.clinicName}
          </h1>
        </div>
      </div>

      <div className="rounded-2xl border border-[#d7f3ea] bg-[#f8fffc] p-5 dark:border-slate-800 dark:bg-slate-950/60">
        <p className="text-sm text-[#64748b] dark:text-slate-300">
          Olá, {payment.patientFirstName}!
        </p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-[#0f172a] dark:text-white">
          {formatCurrency(payment.amount)}
        </p>
        <p className="mt-1 text-sm text-[#475569] dark:text-slate-300">
          {payment.planName} · {formatReferenceMonth(payment.referenceMonth)}
        </p>
      </div>
    </div>
  );
}
