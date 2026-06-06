"use client";

import { Activity, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/Skeleton";
import { useEvolutionSummary } from "../hooks/useEvolutionSummary";

function formatPercent(value: number | null | undefined): string {
  return value === null || value === undefined ? "-" : `${value.toFixed(1)}%`;
}

export function EvolutionSummaryCard() {
  const { data, isLoading, error } = useEvolutionSummary();

  return (
    <section className="mt-4">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ecfdf5] text-[#0f766e] ring-1 ring-[#a7f3d0]">
          <Activity size={16} />
        </div>
        <h2 className="text-lg font-bold text-[#0f172a] dark:text-white">Evoluções</h2>
      </div>

      <div className="rounded-2xl border border-[#d7f3ea] bg-white p-6 shadow-[0_18px_50px_-44px_rgba(15,23,42,0.42)] dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#0f172a] dark:text-white">Resumo clínico</h3>
          <Link
            href="/app/pacientes"
            className="flex items-center gap-1 text-sm font-semibold text-[#0f766e] transition-colors hover:text-[#14b8a6] dark:text-[#67e8f9]"
          >
            Ver pacientes
            <ArrowRight size={16} />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-20" />
            ))}
          </div>
        ) : error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Erro ao carregar resumo de evoluções.
          </p>
        ) : data ? (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {[
                { label: "Tratamentos ativos", value: data.activeTreatments },
                { label: "Concluídas no mês", value: data.completedEvolutionsThisMonth },
                { label: "Melhorando", value: data.patientsImproving },
                { label: "Estáveis", value: data.patientsStable },
                { label: "Piorando", value: data.patientsWorsening },
                { label: "Progresso médio", value: formatPercent(data.averageProgress) },
              ].map((metric) => (
                <div key={metric.label} className="rounded-2xl border border-[#d7f3ea] bg-[#f8fffc] p-4 dark:border-slate-800 dark:bg-slate-950/50">
                  <p className="text-xs font-semibold uppercase text-[#64748b] dark:text-slate-300">{metric.label}</p>
                  <p className="mt-2 text-xl font-bold text-[#0f172a] dark:text-white">{metric.value}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-[#0f172a] dark:text-white">Modelos mais usados</p>
              {data.mostUsedTemplates.length === 0 ? (
                <p className="text-sm text-[#64748b] dark:text-slate-300">Nenhum modelo usado neste mês.</p>
              ) : (
                <div className="grid gap-2 md:grid-cols-3">
                  {data.mostUsedTemplates.map((template) => (
                    <div key={template.templateId} className="flex items-center justify-between rounded-xl border border-[#d7f3ea] px-3 py-2 text-sm dark:border-slate-800">
                      <span className="font-medium text-[#0f172a] dark:text-white">{template.name}</span>
                      <span className="rounded-full bg-[#ecfdf5] px-2 py-0.5 text-xs font-semibold text-[#0f766e] dark:bg-slate-800 dark:text-[#67e8f9]">
                        {template.count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="py-4 text-center text-[#64748b] dark:text-slate-300">
            Nenhum dado de evolução disponível.
          </p>
        )}
      </div>
    </section>
  );
}
