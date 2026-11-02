"use client";

import Link from "next/link";
import { Activity, ArrowRight, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useEvolutionSummary } from "../hooks/useEvolutionSummary";
import { CLINICAL_STATUS, toPercent } from "./dashboard/dashboardData";

function formatPercent(value: number | null | undefined): string {
  return value === null || value === undefined ? "—" : `${value.toFixed(1)}%`;
}

export function EvolutionSummaryCard() {
  const { data, isLoading, error, refetch } = useEvolutionSummary();

  return (
    <section
      data-tutorial="dashboard-evolutions"
      aria-labelledby="clinical-pulse-title"
      className="min-w-0 rounded-2xl border border-[var(--color-gray-200)] bg-[var(--color-card)] p-5 shadow-[var(--shadow-sm)] sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-muted)] text-[var(--color-primary-dark)]">
            <Activity size={17} aria-hidden="true" />
          </span>
          <div>
            <h2
              id="clinical-pulse-title"
              className="text-lg font-bold tracking-tight text-[var(--color-secondary)]"
            >
              Pulso clínico
            </h2>
            <p className="mt-0.5 text-sm text-[var(--color-gray-600)]">
              Como os pacientes em acompanhamento estão evoluindo.
            </p>
          </div>
        </div>

        <Link
          href="/app/pacientes"
          className="inline-flex items-center gap-1.5 rounded-lg px-1 py-1 text-sm font-semibold text-[var(--color-primary-dark)] transition-colors hover:text-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
        >
          Ver pacientes
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>

      {isLoading ? (
        <div className="mt-6 space-y-4">
          <Skeleton className="h-16" />
          <Skeleton className="h-24" />
          <Skeleton className="h-20" />
        </div>
      ) : error ? (
        <div className="mt-6 flex flex-col items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
          <p>Não foi possível carregar o resumo clínico.</p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200"
          >
            <RefreshCw size={13} aria-hidden="true" />
            Tentar novamente
          </button>
        </div>
      ) : !data ? (
        <p className="mt-6 text-sm text-[var(--color-gray-600)]">
          Nenhum dado de evolução disponível.
        </p>
      ) : (
        <div className="mt-6 space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-[var(--color-gray-600)]">
                Progresso médio
              </p>
              <p className="mt-1 font-mono text-3xl font-semibold tracking-[-0.04em] text-[var(--color-secondary)]">
                {formatPercent(data.averageProgress)}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-right">
              <div>
                <p className="text-xs font-medium text-[var(--color-gray-600)]">
                  Em acompanhamento
                </p>
                <p className="mt-1 font-mono text-xl font-semibold text-[var(--color-secondary)]">
                  {data.patientsInFollowUp}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-[var(--color-gray-600)]">
                  No mês
                </p>
                <p className="mt-1 font-mono text-xl font-semibold text-[var(--color-secondary)]">
                  {data.completedEvolutionsThisMonth}
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="relative h-2 overflow-hidden rounded-full bg-[var(--color-gray-100)]">
              <div
                className="dashboard-fill h-full rounded-full bg-[var(--color-primary)]"
                style={{ width: `${toPercent(data.averageProgress ?? 0)}%` }}
              />
            </div>
            <div className="mt-1 flex justify-between font-mono text-[9px] text-[var(--color-gray-600)]">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="border-t border-[var(--color-gray-200)] pt-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium text-[var(--color-gray-600)]">
                Distribuição clínica
              </p>
              <span className="font-mono text-[10px] text-[var(--color-gray-600)]">
                {data.patientsImproving + data.patientsStable + data.patientsWorsening} pacientes
              </span>
            </div>

            <div
              role="img"
              aria-label={`${data.patientsImproving} pacientes melhorando, ${data.patientsStable} estáveis e ${data.patientsWorsening} piorando.`}
              className="mt-2 flex h-3 overflow-hidden rounded-full bg-[var(--color-gray-100)]"
            >
              {data.patientsImproving > 0 && (
                <span
                  className="dashboard-fill h-full"
                  style={{
                    width: `${toPercent(
                      (data.patientsImproving /
                        Math.max(
                          data.patientsImproving + data.patientsStable + data.patientsWorsening,
                          1,
                        )) *
                        100,
                    )}%`,
                    backgroundColor: CLINICAL_STATUS.improving.color,
                  }}
                />
              )}
              {data.patientsStable > 0 && (
                <span
                  className="dashboard-fill h-full"
                  style={{
                    width: `${toPercent(
                      (data.patientsStable /
                        Math.max(
                          data.patientsImproving + data.patientsStable + data.patientsWorsening,
                          1,
                        )) *
                        100,
                    )}%`,
                    backgroundColor: CLINICAL_STATUS.stable.color,
                  }}
                />
              )}
              {data.patientsWorsening > 0 && (
                <span
                  className="dashboard-fill h-full"
                  style={{
                    width: `${toPercent(
                      (data.patientsWorsening /
                        Math.max(
                          data.patientsImproving + data.patientsStable + data.patientsWorsening,
                          1,
                        )) *
                        100,
                    )}%`,
                    backgroundColor: CLINICAL_STATUS.worsening.color,
                  }}
                />
              )}
            </div>

            <ul className="mt-3 grid grid-cols-3 gap-2">
              {(
                [
                  ["improving", data.patientsImproving],
                  ["stable", data.patientsStable],
                  ["worsening", data.patientsWorsening],
                ] as const
              ).map(([key, value]) => (
                <li key={key} className="min-w-0">
                  <span className="flex items-center gap-1.5 font-mono text-[10px] text-[var(--color-gray-600)]">
                    <span
                      aria-hidden="true"
                      className="size-1.5 rounded-full"
                      style={{ backgroundColor: CLINICAL_STATUS[key].color }}
                    />
                    <span className="truncate">{CLINICAL_STATUS[key].label}</span>
                  </span>
                  <span className="mt-1 block font-mono text-lg font-semibold text-[var(--color-secondary)]">
                    {value}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-[var(--color-gray-200)] pt-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium text-[var(--color-gray-600)]">
                Modelos mais usados
              </p>
              <Link
                href="/app/modelos-evolucao"
                className="text-xs font-semibold text-[var(--color-primary-dark)] hover:text-[var(--color-primary)]"
              >
                Ver modelos
              </Link>
            </div>

            {data.mostUsedTemplates.length === 0 ? (
              <p className="mt-2 text-sm text-[var(--color-gray-600)]">
                Nenhum modelo usado neste mês.
              </p>
            ) : (
              <ul className="mt-2 space-y-2.5">
                {data.mostUsedTemplates.slice(0, 4).map((template) => {
                  const max = Math.max(...data.mostUsedTemplates.map((item) => item.count), 1);
                  return (
                    <li key={template.templateId} className="grid grid-cols-[minmax(0,1fr)_2.5rem] items-center gap-3">
                      <div className="min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="truncate text-sm font-medium text-[var(--color-secondary)]">
                            {template.name}
                          </span>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--color-gray-100)]">
                          <div
                            className="dashboard-fill h-full rounded-full bg-[var(--color-primary-dark)]"
                            style={{ width: `${toPercent((template.count / max) * 100)}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-right font-mono text-xs font-semibold text-[var(--color-gray-600)]">
                        {template.count}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
