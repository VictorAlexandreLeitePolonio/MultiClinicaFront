"use client";

import { CreditCard } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PatientCharge } from "@/types/mercadoPago";
import { formatCurrency, formatReferenceMonth } from "@/utils/formatters";

export const chargeStatusMapping = {
  Pending: { label: "Pendente", className: "bg-amber-100 text-amber-700 border-amber-200" },
  Paid: { label: "Paga", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
};

/** Cartão de cobrança do portal, com o botão de pagar quando ainda está pendente. */
export function ChargeCard({ charge }: { charge: PatientCharge }) {
  const handlePay = () => {
    window.open(charge.payUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <article
      data-testid="patient-charge"
      className="flex flex-col gap-3 rounded-2xl border border-[#d7f3ea] bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="space-y-1">
        <p className="font-semibold text-[#0f172a] dark:text-white">{charge.clinicName}</p>
        <p className="flex items-center gap-1.5 text-sm text-[#64748b] dark:text-slate-300">
          <CreditCard size={14} />
          {charge.planName} · {formatReferenceMonth(charge.referenceMonth)}
        </p>
        <p className="text-lg font-bold text-[#0f172a] dark:text-white">
          {formatCurrency(charge.amount)}
        </p>
      </div>

      <div className="flex items-center gap-3 sm:flex-col sm:items-end">
        <StatusBadge status={charge.status} mapping={chargeStatusMapping} />
        {charge.status === "Pending" && (
          <button
            type="button"
            onClick={handlePay}
            className="rounded-xl border border-[#14b8a6] bg-[#14b8a6] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0f766e]"
          >
            Pagar
          </button>
        )}
      </div>
    </article>
  );
}
