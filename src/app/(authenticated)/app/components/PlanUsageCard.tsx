"use client";

import Link from "next/link";
import { Gauge } from "lucide-react";
import { METRIC_LABELS, PLAN_LABELS } from "@/utils/plans";
import type { UsageMetricStatus } from "@/types/plans";
import { useBillingStatus, useUsage } from "../configuracoes/plano/hooks/useBilling";
import { toPercent } from "./dashboard/dashboardData";

interface CapacityRow {
  key: string;
  label: string;
  used: number;
  total: number;
  extraGranted?: number;
}

function formatLimit(used: number, total: number): string {
  return `${used} de ${total}`;
}

export function PlanUsageCard() {
  const statusQuery = useBillingStatus();
  const usageQuery = useUsage();

  if (statusQuery.isLoading || usageQuery.isLoading) return null;
  if (statusQuery.isError || usageQuery.isError) return null;
  if (!statusQuery.data || !usageQuery.data) return null;

  const status = statusQuery.data;
  const usage = usageQuery.data;
  const quotaRows: CapacityRow[] = usage.metrics
    .filter((metric) => metric.total > 0)
    .map((metric: UsageMetricStatus) => ({
      key: metric.metric,
      label: METRIC_LABELS[metric.metric],
      used: metric.used,
      total: metric.total,
      extraGranted: metric.extraGranted,
    }));

  const hasQuotas = quotaRows.length > 0;
  const rows: CapacityRow[] = [...quotaRows];

  if (hasQuotas && status.professionalLimit !== null && status.professionalLimit > 0) {
    rows.push({
      key: "team",
      label: "Equipe",
      used: status.activeProfessionals,
      total: status.professionalLimit,
    });
  }

  const nearLimit = rows.some((row) => row.used / row.total >= 0.8);

  return (
    <section
      aria-labelledby="dashboard-plan-usage"
      className="min-w-0 overflow-hidden rounded-2xl border border-[var(--color-gray-200)] bg-[var(--color-card)] shadow-[var(--shadow-sm)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-gray-200)] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-[var(--color-primary-muted)] text-[var(--color-primary-dark)]">
            <Gauge size={16} aria-hidden="true" />
          </div>
          <div>
            <h2
              id="dashboard-plan-usage"
              className="text-lg font-bold tracking-tight text-[var(--color-secondary)]"
            >
              Uso do plano
            </h2>
            <p className="text-sm text-[var(--color-gray-600)]">
              Plano{" "}
              <span className="font-semibold text-[var(--color-primary-dark)]">
                {PLAN_LABELS[status.plan]}
              </span>
            </p>
          </div>
        </div>

        {nearLimit && (
          <Link
            href="/app/configuracoes/plano"
            className="rounded-lg border border-[var(--color-primary-dark)] bg-[var(--color-primary-dark)] px-4 py-2 text-sm font-semibold text-white transition-[background-color,transform] duration-150 hover:brightness-110 active:scale-[0.97] motion-reduce:active:scale-100"
          >
            Comprar pacote
          </Link>
        )}
      </div>

      <div className="p-5 sm:p-6">
        {!hasQuotas ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-[var(--color-gray-50)] text-[var(--color-gray-600)]">
                <Gauge size={18} aria-hidden="true" />
              </span>
              <p className="text-sm text-[var(--color-gray-600)]">
                Seu plano não inclui cotas de uso.
              </p>
            </div>
            <Link
              href="/app/configuracoes/plano"
              className="rounded-lg border border-[var(--color-gray-200)] px-4 py-2 text-sm font-semibold text-[var(--color-primary-dark)] transition-colors hover:bg-[var(--color-primary-muted)]"
            >
              Conheça os planos
            </Link>
          </div>
        ) : (
          <div>
            <div className="space-y-4">
              {rows.map((row) => {
                const ratio = row.used / row.total;
                const percent = toPercent(ratio * 100);
                const alert = ratio >= 0.8;

                return (
                  <div key={row.key}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-sm font-medium text-[var(--color-secondary)]">
                        {row.label}
                      </span>
                      <span
                        className={
                          alert
                            ? "font-mono text-xs font-semibold text-amber-700 dark:text-amber-300"
                            : "font-mono text-xs text-[var(--color-gray-600)]"
                        }
                      >
                        {formatLimit(row.used, row.total)}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--color-gray-100)]">
                      <div
                        role="progressbar"
                        aria-label={row.label}
                        aria-valuemin={0}
                        aria-valuemax={row.total}
                        aria-valuenow={row.used}
                        aria-valuetext={formatLimit(row.used, row.total)}
                        className="dashboard-fill h-full rounded-full"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: alert ? "var(--color-signal)" : "var(--color-primary)",
                        }}
                      />
                    </div>
                    {row.extraGranted ? (
                      <p className="mt-1 font-mono text-[9px] text-[var(--color-gray-600)]">
                        inclui +{row.extraGranted} de pacote
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
