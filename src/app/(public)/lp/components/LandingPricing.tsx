"use client";

import Link from "next/link";
import NumberFlow from "@number-flow/react";
import { useQuery } from "@tanstack/react-query";
import { Check, Minus } from "lucide-react";
import { useState } from "react";
import { BorderBeam } from "@/components/magicui/border-beam";
import { Skeleton } from "@/components/ui/Skeleton";
import { queryKeys } from "@/lib/queryKeys";
import { cn } from "@/lib/utils";
import type { BillingCycle, ClinicPlan, PlanFeature, PublicPlan } from "@/types/plans";
import { formatCurrency } from "@/utils/formatters";
import { FEATURE_LABELS, METRIC_LABELS, PLAN_LABELS, annualSavings } from "@/utils/plans";
import { fetchPublicPlans } from "../services/plans.service";

const planOrder: ClinicPlan[] = ["Free", "Pro", "Premium"];
const features = Object.keys(FEATURE_LABELS) as PlanFeature[];

const planDescriptions: Record<ClinicPlan, string> = {
  Free: "Para organizar a clínica e começar sem custo.",
  Pro: "Para a rotina que já pede automação e cobrança.",
  Premium: "Para operações que vivem de IA e WhatsApp.",
};

const buttonClassName =
  "mt-auto inline-flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition-transform duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--lp-bg)] active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100";

function includedProfessionalsLabel(plan: PublicPlan) {
  return plan.includedProfessionals === null
    ? "Profissionais ilimitados"
    : `${plan.includedProfessionals} profissional(is) incluído(s)`;
}

function PlanPrice({ plan, cycle }: { plan: PublicPlan; cycle: BillingCycle }) {
  const isAnnual = cycle === "Annual";
  const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
  const savings = annualSavings(plan);

  return (
    <div className="mt-5 min-h-[88px]">
      {price === 0 ? (
        <p className="font-mono text-4xl font-semibold tracking-tight text-[var(--lp-ink)]">
          Grátis
        </p>
      ) : (
        <p className="flex flex-wrap items-baseline gap-1.5 text-[var(--lp-ink)]">
          <NumberFlow
            value={price}
            locales="pt-BR"
            format={{ style: "currency", currency: "BRL" }}
            className="font-mono text-4xl font-semibold tracking-tight sm:text-[2.75rem]"
          />
          <span className="text-sm font-medium text-[var(--lp-muted)]">
            {isAnnual ? "/ano" : "/mês"}
          </span>
        </p>
      )}

      {isAnnual && price > 0 && (
        <p className="mt-2 text-xs leading-5 text-[var(--lp-muted)]">
          Equivale a <span className="font-mono">{formatCurrency(price / 12)}</span>/mês
          {savings > 0 && (
            <>
              <span aria-hidden="true"> · </span>
              <span className="font-semibold text-[var(--color-primary)]">
                Economize {formatCurrency(savings)}
              </span>
            </>
          )}
        </p>
      )}
    </div>
  );
}

function PlanCard({ plan, cycle }: { plan: PublicPlan; cycle: BillingCycle }) {
  const isPro = plan.plan === "Pro";
  const isPremium = plan.plan === "Premium";
  const quotaEntries = (Object.keys(METRIC_LABELS) as (keyof typeof METRIC_LABELS)[])
    .map((metric) => ({ metric, value: plan.quotas[metric] }))
    .filter((entry) => entry.value > 0);
  const href =
    plan.plan === "Free" ? "/cadastro" : `/cadastro?plano=${plan.plan}&ciclo=${cycle}`;

  return (
    <article
      className={cn(
        "relative flex h-full flex-col rounded-2xl border bg-[var(--lp-surface)] p-6 sm:p-7",
        isPro
          ? "border-[var(--color-primary)] shadow-[0_24px_70px_-48px_var(--color-primary)]"
          : "border-[var(--lp-line)]",
      )}
    >
      {isPro && (
        <>
          <BorderBeam
            className="motion-reduce:hidden"
            colorFrom="var(--color-primary)"
            colorTo="var(--signal)"
            size={56}
            duration={7}
            borderWidth={1}
          />
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[var(--color-primary)] px-3 py-1 text-[11px] font-semibold text-[var(--lp-bg)]">
            Mais escolhido
          </span>
        </>
      )}

      <h3 className="text-base font-semibold text-[var(--lp-ink)]">{PLAN_LABELS[plan.plan]}</h3>
      <p className="mt-1 min-h-[2.5rem] text-sm leading-5 text-[var(--lp-muted)]">
        {planDescriptions[plan.plan]}
      </p>

      <PlanPrice plan={plan} cycle={cycle} />

      <p className="mt-3 text-sm font-medium text-[var(--lp-ink)]">
        {includedProfessionalsLabel(plan)}
      </p>

      {isPremium && (
        <p className="mt-2 text-xs font-semibold text-[var(--color-primary)]">
          Destaque no topo do Hub
        </p>
      )}

      <ul className="mt-6 space-y-2.5 border-t border-[var(--lp-line)] pt-6 text-sm">
        {features.map((feature) => {
          const included = plan.features.includes(feature);
          return (
            <li key={feature} className="flex items-start gap-2.5">
              {included ? (
                <Check
                  size={15}
                  className="mt-0.5 shrink-0 text-[var(--color-primary)]"
                  aria-hidden="true"
                />
              ) : (
                <Minus
                  size={15}
                  className="mt-0.5 shrink-0 text-[var(--lp-line)]"
                  aria-hidden="true"
                />
              )}
              <span className={included ? "text-[var(--lp-ink)]" : "text-[var(--lp-muted)]"}>
                {FEATURE_LABELS[feature]}
                <span className="sr-only">{included ? " (incluído)" : " (não incluído)"}</span>
              </span>
            </li>
          );
        })}
      </ul>

      {quotaEntries.length > 0 && (
        <ul className="mt-5 space-y-2 border-t border-[var(--lp-line)] pt-5 text-sm">
          {quotaEntries.map(({ metric, value }) => (
            <li key={metric} className="flex items-baseline justify-between gap-3">
              <span className="text-[var(--lp-muted)]">{METRIC_LABELS[metric]}</span>
              <span className="font-mono font-medium text-[var(--lp-ink)]">
                {value.toLocaleString("pt-BR")}
                <span className="text-[var(--lp-muted)]">/mês</span>
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto pt-8">
        <Link
          href={href}
          className={cn(
            buttonClassName,
            isPro
              ? "bg-[var(--color-primary)] text-[var(--lp-bg)] hover:bg-[var(--color-primary-light)]"
              : "border border-[var(--lp-line)] text-[var(--lp-ink)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]",
          )}
        >
          {plan.plan === "Free" ? "Começar grátis" : `Assinar ${PLAN_LABELS[plan.plan]}`}
        </Link>
      </div>
    </article>
  );
}

function FallbackCard({ plan }: { plan: ClinicPlan }) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-[var(--lp-line)] bg-[var(--lp-surface)] p-6 sm:p-7">
      <h3 className="text-base font-semibold text-[var(--lp-ink)]">{PLAN_LABELS[plan]}</h3>
      <p className="mt-3 text-sm leading-6 text-[var(--lp-muted)]">
        Consulte os detalhes deste plano e comece sem custo.
      </p>
      <div className="mt-auto pt-8">
        <Link
          href="/cadastro"
          className={cn(
            buttonClassName,
            "border border-[var(--lp-line)] text-[var(--lp-ink)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]",
          )}
        >
          Começar grátis
        </Link>
      </div>
    </article>
  );
}

export function LandingPricing() {
  const [cycle, setCycle] = useState<BillingCycle>("Monthly");
  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.plans.public,
    queryFn: fetchPublicPlans,
  });

  const showFallback = isError || (!isLoading && !data);
  const maxSavings = data
    ? data.plans.reduce((max, plan) => Math.max(max, annualSavings(plan)), 0)
    : 0;

  return (
    <section id="planos" className="bg-[var(--lp-bg)] py-24 sm:py-28">
      <div className="mx-auto max-w-[88rem] px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-wide text-balance text-[clamp(2rem,4vw,3.25rem)] leading-[1.05] tracking-[-0.03em] text-[var(--lp-ink)]">
            Planos para cada momento da clínica.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[var(--lp-muted)] sm:text-base">
            Comece grátis e evolua quando a operação pedir mais recursos. Sem fidelidade e sem
            surpresa no preço.
          </p>
        </div>

        <div className="mt-9 flex justify-center">
          <div
            role="group"
            aria-label="Ciclo de cobrança"
            className="inline-flex rounded-full border border-[var(--lp-line)] bg-[var(--lp-surface)] p-1"
          >
            <button
              type="button"
              aria-pressed={cycle === "Monthly"}
              onClick={() => setCycle("Monthly")}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition-transform duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100",
                cycle === "Monthly"
                  ? "bg-[var(--color-primary)] text-[var(--lp-bg)]"
                  : "text-[var(--lp-muted)] hover:text-[var(--lp-ink)]",
              )}
            >
              Mensal
            </button>
            <button
              type="button"
              aria-pressed={cycle === "Annual"}
              onClick={() => setCycle("Annual")}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition-transform duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100",
                cycle === "Annual"
                  ? "bg-[var(--color-primary)] text-[var(--lp-bg)]"
                  : "text-[var(--lp-muted)] hover:text-[var(--lp-ink)]",
              )}
            >
              Anual
            </button>
          </div>
        </div>

        <p className="mt-3 text-center font-mono text-xs text-[var(--color-primary)]">
          {maxSavings > 0
            ? `No anual, você economiza até ${formatCurrency(maxSavings)}.`
            : "Pague anual e economize."}
        </p>

        {isLoading && (
          <div className="mt-12 grid gap-5 lg:grid-cols-3 lg:gap-6">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-[34rem] rounded-2xl" />
            ))}
          </div>
        )}

        {!isLoading && (
          <div className="mt-12 grid gap-5 lg:grid-cols-3 lg:gap-6">
            {showFallback
              ? planOrder.map((plan) => <FallbackCard key={plan} plan={plan} />)
              : planOrder.map((plan) => {
                  const planData = data?.plans.find((item) => item.plan === plan);
                  return planData ? <PlanCard key={plan} plan={planData} cycle={cycle} /> : null;
                })}
          </div>
        )}

        <p className="mt-8 text-center text-sm text-[var(--lp-muted)]">
          Profissional extra: {formatCurrency(data?.extraProfessionalPrice ?? 59)} (pagamento único)
        </p>
      </div>
    </section>
  );
}
