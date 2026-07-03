'use client'

import {
  Building2,
  CircleDollarSign,
  ClipboardList,
  ShieldCheck,
} from 'lucide-react'
import { ErrorState } from '@/components/ui/ErrorState'
import { MetricCard } from '@/components/ui/MetricCard'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatCurrency } from '@/utils/formatters'
import { useSuperAdminDashboard } from './hooks/useSuperAdminDashboard'

export default function SuperAdminDashboardPage() {
  const { data, isLoading, error, refetch } = useSuperAdminDashboard()

  const metrics = data
    ? [
        {
          label: 'Clínicas totais',
          value: data.totalClinics,
          description: 'Base cadastrada no produto',
          icon: Building2,
        },
        {
          label: 'Clínicas ativas',
          value: data.activeClinics,
          description: `${data.inactiveClinics} inativas`,
          icon: ShieldCheck,
        },
        {
          label: 'Bloqueadas por cobrança',
          value: data.billingBlocked,
          description: `${data.billingEnabled} com cobrança ativa`,
          icon: ClipboardList,
        },
        {
          label: 'Receita recebida no mês',
          value: formatCurrency(data.monthlyReceived),
          description: `${formatCurrency(data.monthlyPending)} pendente`,
          icon: CircleDollarSign,
        },
      ]
    : []

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-primary-dark">
          SuperAdmin
        </p>
        <h1 className="mt-1 text-2xl font-bold text-secondary dark:text-slate-50">
          Painel global MultiClinica
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-600 dark:text-slate-300">
          Visão inicial para operação comercial e saúde da base de clínicas.
        </p>
      </div>

      {isLoading && (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-32" />
          ))}
        </section>
      )}

      {error && (
        <ErrorState
          message="Não foi possível carregar os indicadores comerciais."
          onRetry={() => void refetch()}
        />
      )}

      {data && (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </section>
      )}
    </div>
  )
}
