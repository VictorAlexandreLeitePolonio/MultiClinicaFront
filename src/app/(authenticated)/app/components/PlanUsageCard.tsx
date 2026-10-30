"use client";

import Link from "next/link";
import { Gauge } from "lucide-react";
import { PLAN_LABELS } from "@/lib/plans";
import { UsageBars } from "../configuracoes/plano/components/UsageBars";
import { useBillingStatus, useUsage } from "../configuracoes/plano/hooks/useBilling";

export function PlanUsageCard() {
  const statusQuery = useBillingStatus();
  const usageQuery = useUsage();

  if (statusQuery.isLoading || usageQuery.isLoading) return null;
  if (statusQuery.isError || usageQuery.isError) return null;
  if (!statusQuery.data || !usageQuery.data) return null;

  const status = statusQuery.data;
  const usage = usageQuery.data;
  const metrics = usage.metrics.filter((metric) => metric.total > 0);
  const nearLimit = metrics.some((metric) => metric.used / metric.total >= 0.8);

  return (
    <section aria-labelledby="dashboard-plan-usage" className="mt-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ecfdf5] text-[#0f766e] ring-1 ring-[#a7f3d0]">
            <Gauge size={16} />
          </div>
          <div>
            <h2
              id="dashboard-plan-usage"
              className="text-lg font-bold text-[#0f172a] dark:text-white"
            >
              Uso do plano
            </h2>
            <p className="text-sm text-[#64748b] dark:text-slate-400">
              Plano <span className="font-semibold text-[#0f766e] dark:text-[#67e8f9]">{PLAN_LABELS[status.plan]}</span>
            </p>
          </div>
        </div>

        {nearLimit && (
          <Link
            href="/app/configuracoes/plano"
            className="rounded-lg bg-[#0f766e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#115e59]"
          >
            Comprar pacote
          </Link>
        )}
      </div>

      <div className="rounded-2xl border border-[#d7f3ea] bg-white p-6 shadow-[0_18px_50px_-44px_rgba(15,23,42,0.42)] dark:border-slate-800 dark:bg-slate-900">
        {metrics.length === 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[#64748b] dark:text-slate-300">
              Seu plano não inclui cotas de uso.
            </p>
            <Link
              href="/app/configuracoes/plano"
              className="rounded-lg border border-[#99f6e4] px-4 py-2 text-sm font-semibold text-[#0f766e] hover:bg-[#ecfdf5] dark:border-slate-700 dark:text-[#67e8f9] dark:hover:bg-slate-800"
            >
              Conheça os planos
            </Link>
          </div>
        ) : (
          <UsageBars usage={usage} />
        )}
      </div>
    </section>
  );
}
