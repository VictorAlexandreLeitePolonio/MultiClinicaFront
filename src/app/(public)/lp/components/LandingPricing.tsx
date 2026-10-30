"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Check, Minus } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  FEATURE_LABELS,
  METRIC_LABELS,
  PLAN_LABELS,
  fetchPublicPlans,
  formatBRL,
  planQueryKeys,
  type BillingCycle,
  type ClinicPlan,
  type PlanFeature,
  type PublicPlan,
} from "@/lib/plans";

const planOrder: ClinicPlan[] = ["Free", "Pro", "Premium"];
const features = Object.keys(FEATURE_LABELS) as PlanFeature[];

function includedProfessionalsLabel(plan: PublicPlan) {
  return plan.includedProfessionals === null
    ? "Profissionais ilimitados"
    : `${plan.includedProfessionals} profissional(is) incluído(s)`;
}

function PlanCard({
  plan,
  cycle,
}: {
  plan: PublicPlan;
  cycle: BillingCycle;
}) {
  const isPremium = plan.plan === "Premium";
  const isAnnual = cycle === "Annual";
  const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
  const quotaEntries = (Object.keys(METRIC_LABELS) as (keyof typeof METRIC_LABELS)[])
    .map((metric) => ({ metric, value: plan.quotas[metric] }))
    .filter((entry) => entry.value > 0);
  const href =
    plan.plan === "Free" ? "/cadastro" : `/cadastro?plano=${plan.plan}&ciclo=${cycle}`;

  return (
    <article
      className={`relative flex h-full flex-col rounded-3xl border bg-white p-7 ${
        isPremium
          ? "border-teal-500 shadow-[0_24px_60px_-36px_rgba(15,118,110,0.55)] ring-4 ring-teal-50"
          : "border-slate-200"
      }`}
    >
      {isPremium && (
        <span className="absolute -top-3 left-7 rounded-full bg-teal-700 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
          Mais completo
        </span>
      )}

      <h3 className="text-lg font-bold text-slate-950">{PLAN_LABELS[plan.plan]}</h3>

      <div className="mt-4 min-h-[76px]">
        {price === 0 ? (
          <strong className="text-4xl font-bold tracking-tight text-slate-950">Grátis</strong>
        ) : (
          <p>
            <strong className="text-4xl font-bold tracking-tight text-slate-950">{formatBRL(price)}</strong>
            <span className="text-sm font-medium text-slate-500">{isAnnual ? "/ano" : "/mês"}</span>
          </p>
        )}
        {isAnnual && price > 0 && (
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Equivale a {formatBRL(price / 12)}/mês ·{" "}
            <span className="font-semibold text-teal-700">2 meses grátis</span>
          </p>
        )}
      </div>

      <p className="mt-3 text-sm font-medium text-slate-700">{includedProfessionalsLabel(plan)}</p>

      {isPremium && (
        <p className="mt-2 text-xs font-semibold text-teal-700">Destaque no topo do hub</p>
      )}

      <ul className="mt-6 space-y-3 border-t border-slate-100 pt-6 text-sm text-slate-600">
        {features.map((feature) => {
          const included = plan.features.includes(feature);
          return (
            <li key={feature} className="flex items-start gap-2.5">
              {included ? (
                <Check size={16} className="mt-0.5 shrink-0 text-teal-700" aria-hidden="true" />
              ) : (
                <Minus size={16} className="mt-0.5 shrink-0 text-slate-300" aria-hidden="true" />
              )}
              <span className={included ? "text-slate-700" : "text-slate-400"}>
                {FEATURE_LABELS[feature]}
                <span className="sr-only">{included ? " (incluído)" : " (não incluído)"}</span>
              </span>
            </li>
          );
        })}
      </ul>

      {quotaEntries.length > 0 && (
        <ul className="mt-5 space-y-2 border-t border-slate-100 pt-5 text-sm text-slate-600">
          {quotaEntries.map(({ metric, value }) => (
            <li key={metric} className="flex items-center justify-between gap-3">
              <span>{METRIC_LABELS[metric]}</span>
              <strong className="font-semibold text-slate-800">
                {value.toLocaleString("pt-BR")}/mês
              </strong>
            </li>
          ))}
        </ul>
      )}

      <Link
        href={href}
        className={`mt-8 inline-flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-200 ${
          isPremium
            ? "bg-teal-700 text-white hover:bg-teal-800"
            : "border border-slate-300 text-slate-800 hover:border-teal-500 hover:text-teal-700"
        }`}
      >
        {plan.plan === "Free" ? "Começar grátis" : `Assinar ${PLAN_LABELS[plan.plan]}`}
      </Link>
    </article>
  );
}

function FallbackCard({ plan }: { plan: ClinicPlan }) {
  return (
    <article className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-7">
      <h3 className="text-lg font-bold text-slate-950">{PLAN_LABELS[plan]}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-500">
        Consulte os detalhes deste plano e comece sem custo.
      </p>
      <Link
        href="/cadastro"
        className="mt-8 inline-flex w-full items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 transition-colors hover:border-teal-500 hover:text-teal-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-200"
      >
        Começar grátis
      </Link>
    </article>
  );
}

export function LandingPricing() {
  const [cycle, setCycle] = useState<BillingCycle>("Monthly");
  const { data, isLoading, isError } = useQuery({
    queryKey: planQueryKeys.publicPlans,
    queryFn: fetchPublicPlans,
  });

  const showFallback = isError || (!isLoading && !data);

  return (
    <section
      id="planos"
      data-mascot-anchor="planos"
      data-landing-reveal
      className="border-y border-slate-200 bg-white py-24 sm:py-28"
    >
      <div className="mx-auto max-w-[88rem] px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Planos para cada momento da clínica.
          </h2>
          <p className="mt-3 text-sm text-slate-500 sm:text-base">
            Comece grátis e evolua quando a operação pedir mais recursos. Sem fidelidade e sem
            surpresa no preço.
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <div
            role="group"
            aria-label="Ciclo de cobrança"
            className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1"
          >
            <button
              type="button"
              aria-pressed={cycle === "Monthly"}
              onClick={() => setCycle("Monthly")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                cycle === "Monthly" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
            >
              Mensal
            </button>
            <button
              type="button"
              aria-pressed={cycle === "Annual"}
              onClick={() => setCycle("Annual")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                cycle === "Annual" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
            >
              Anual
            </button>
          </div>
        </div>
        <p className="mt-2 text-center text-xs font-medium text-teal-700">
          No anual, você ganha 2 meses grátis.
        </p>

        {isLoading && (
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-[34rem] rounded-3xl" />
            ))}
          </div>
        )}

        {!isLoading && (
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {showFallback
              ? planOrder.map((plan) => <FallbackCard key={plan} plan={plan} />)
              : planOrder.map((plan) => {
                  const planData = data?.plans.find((item) => item.plan === plan);
                  return planData ? <PlanCard key={plan} plan={planData} cycle={cycle} /> : null;
                })}
          </div>
        )}

        <p className="mt-8 text-center text-sm text-slate-500">
          Profissional extra: {formatBRL(data?.extraProfessionalPrice ?? 59)} (pagamento único)
        </p>
      </div>
    </section>
  );
}
