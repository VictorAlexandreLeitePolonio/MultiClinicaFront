"use client";

import { useState } from "react";
import { formatCurrency } from "@/utils/formatters";
import { FEATURE_LABELS, PLAN_LABELS } from "@/utils/plans";
import type {
  BillingCycle,
  BillingStatus,
  ClinicPlan,
  PlanFeature,
  PublicPlan,
} from "@/types/plans";

type PaidPlan = Exclude<ClinicPlan, "Free">;

interface PlanComparisonProps {
  plans: PublicPlan[];
  status: BillingStatus;
  onCheckout: (plan: PaidPlan, cycle: BillingCycle) => void;
  onChange: (plan: PaidPlan, cycle: BillingCycle) => void;
  pending?: boolean;
}

const FEATURES = Object.entries(FEATURE_LABELS) as [PlanFeature, string][];

export function PlanComparison({ plans, status, onCheckout, onChange, pending }: PlanComparisonProps) {
  const [cycle, setCycle] = useState<BillingCycle>(status.billingCycle ?? "Monthly");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div
          role="group"
          aria-label="Ciclo de cobrança"
          className="inline-flex rounded-xl border border-[#d7f3ea] bg-white p-1 dark:border-slate-800 dark:bg-slate-900"
        >
          {(["Monthly", "Annual"] as BillingCycle[]).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={cycle === option}
              onClick={() => setCycle(option)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                cycle === option
                  ? "bg-[#0f766e] text-white"
                  : "text-[#64748b] hover:bg-[#ecfdf5] dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              {option === "Monthly" ? "Mensal" : "Anual"}
            </button>
          ))}
        </div>
        {cycle === "Annual" && (
          <span className="text-sm font-medium text-[#0f766e] dark:text-[#67e8f9]">2 meses grátis</span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {plans.map((plan) => {
          const current = plan.plan === status.plan;
          const price = cycle === "Monthly" ? plan.monthlyPrice : plan.annualPrice;
          const professionals =
            plan.includedProfessionals === null
              ? "Profissionais ilimitados"
              : `${plan.includedProfessionals} profissional(is) incluído(s)`;

          return (
            <article
              key={plan.plan}
              aria-label={PLAN_LABELS[plan.plan]}
              className={`flex flex-col rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-900 ${
                current
                  ? "border-[#14b8a6] ring-2 ring-[#99f6e4] dark:border-[#14b8a6] dark:ring-[#0f766e]"
                  : "border-[#d7f3ea] dark:border-slate-800"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-bold text-[#0f172a] dark:text-white">
                  {PLAN_LABELS[plan.plan]}
                </h3>
                {current && (
                  <span className="rounded-full bg-[#ecfdf5] px-2.5 py-1 text-xs font-semibold text-[#0f766e] dark:bg-slate-800 dark:text-[#67e8f9]">
                    {status.isFounder ? "Fundadora" : "Plano atual"}
                  </span>
                )}
              </div>

              <p className="mt-3 text-2xl font-bold text-[#0f172a] dark:text-white">{formatCurrency(price)}</p>
              <p className="text-xs text-[#64748b] dark:text-slate-400">
                {cycle === "Monthly" ? "por mês" : "por ano"}
              </p>

              <p className="mt-4 text-sm font-medium text-[#0f172a] dark:text-white">{professionals}</p>

              <ul className="mt-4 flex-1 space-y-2 text-sm text-[#64748b] dark:text-slate-300">
                {FEATURES.map(([feature, label]) => {
                  const included = plan.features.includes(feature);
                  return (
                    <li key={feature} className="flex gap-2">
                      <span aria-hidden="true" className={included ? "text-[#0f766e]" : "text-slate-400"}>
                        {included ? "✓" : "—"}
                      </span>
                      <span className={included ? "" : "text-slate-400 dark:text-slate-500"}>{label}</span>
                    </li>
                  );
                })}
                {plan.quotas.WhatsAppConversations > 0 && (
                  <li>{plan.quotas.WhatsAppConversations} conversas de WhatsApp/mês</li>
                )}
                {plan.quotas.TranscriptionMinutes > 0 && (
                  <li>{plan.quotas.TranscriptionMinutes} min de transcrição/mês</li>
                )}
              </ul>

              {!status.isFounder && (
                <div className="mt-6">
                  {current ? (
                    <button
                      type="button"
                      disabled
                      className="w-full rounded-xl border border-[#d7f3ea] px-4 py-2.5 text-sm font-semibold text-[#64748b] disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-800 dark:text-slate-400"
                    >
                      Plano atual
                    </button>
                  ) : plan.plan !== "Free" ? (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() =>
                        status.hasSubscription
                          ? onChange(plan.plan as PaidPlan, cycle)
                          : onCheckout(plan.plan as PaidPlan, cycle)
                      }
                      className="w-full rounded-xl bg-[#0f766e] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#115e59] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {status.hasSubscription ? "Trocar" : "Assinar"}
                    </button>
                  ) : null}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
