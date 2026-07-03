'use client'

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDate } from '@/utils/formatters'
import { TreatmentProgressResponse } from '@/types/evolution'

interface TreatmentProgressPanelProps {
  data?: TreatmentProgressResponse
  loading?: boolean
  error?: boolean
}

function formatPercent(value: number | null | undefined): string {
  return value === null || value === undefined ? '-' : `${value.toFixed(1)}%`
}

export function TreatmentProgressPanel({
  data,
  loading,
  error,
}: TreatmentProgressPanelProps) {
  if (loading) {
    return (
      <div className="grid gap-3 md:grid-cols-4">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Erro ao carregar progresso do acompanhamento.
      </div>
    )
  }

  if (!data) return null

  const metrics = [
    { label: 'Evoluções concluídas', value: data.summary.totalEvolutions },
    {
      label: 'Progresso geral',
      value: formatPercent(data.summary.overallProgress),
    },
    { label: 'Campos melhorando', value: data.summary.improvingFields },
    {
      label: 'Última evolução',
      value: formatDate(data.summary.lastEvolutionDate) || '-',
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <p className="text-xs font-semibold uppercase text-gray-600 dark:text-slate-300">
              {metric.label}
            </p>
            <p className="mt-2 text-xl font-bold text-secondary dark:text-white">
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      {data.charts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-primary/40 bg-white/75 p-6 text-center text-sm text-gray-600 dark:border-slate-700 dark:bg-slate-900/75 dark:text-slate-300">
          Nenhum dado numérico concluído para gráfico.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {data.charts.map((chart) => (
            <div
              key={chart.fieldId}
              className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-secondary dark:text-white">
                    {chart.label}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-slate-300">
                    Atual: {chart.currentValue}{' '}
                    {chart.unit !== 'None' ? chart.unit : ''}
                  </p>
                </div>
                <span className="rounded-full bg-sidebar-active px-2.5 py-1 text-xs font-semibold text-primary-dark dark:bg-slate-800 dark:text-primary-light">
                  {formatPercent(chart.progress)}
                </span>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chart.data.map((point) => ({
                      ...point,
                      label: formatDate(point.date),
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-200)" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="var(--color-primary)"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
