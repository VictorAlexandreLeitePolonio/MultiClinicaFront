'use client'

import { useState } from 'react'
import {
  Building2,
  CreditCard,
  Eye,
  History,
  LockOpen,
  Settings,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ActionsDropdown } from '@/components/ui/ActionsDropdown'
import { Button } from '@/components/ui/Button'
import { DataTable, Column } from '@/components/ui/DataTable'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import { Pagination } from '@/components/ui/Pagination'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { SuperAdminClinic } from '@/types'
import { formatDate } from '@/utils/formatters'
import { useSuperAdminClinics } from '../hooks/useSuperAdminClinics'

export default function SuperAdminClinicsPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const { data, isLoading, error, refetch } = useSuperAdminClinics({
    page,
    pageSize,
  })

  const columns: Column<SuperAdminClinic>[] = [
    { key: 'nome', label: 'Clínica' },
    {
      key: 'cnpj',
      label: 'Documento',
      render: (clinic) => clinic.cnpj || '-',
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (clinic) => (
        <StatusBadge
          status={clinic.isActive ? 'Active' : 'Inactive'}
          mapping={{
            Active: {
              label: 'Ativa',
              className: 'bg-green-100 text-green-700 border-green-200',
            },
            Inactive: {
              label: 'Inativa',
              className: 'bg-gray-100 text-gray-700 border-gray-200',
            },
          }}
        />
      ),
    },
    {
      key: 'cobrancaAtiva',
      label: 'Cobrança',
      render: (clinic) => (
        <StatusBadge
          status={clinic.isBlockedByBilling ? 'Blocked' : clinic.cobrancaAtiva ? 'Enabled' : 'Disabled'}
          mapping={{
            Enabled: {
              label: 'Ativa',
              className: 'bg-blue-100 text-blue-700 border-blue-200',
            },
            Blocked: {
              label: 'Bloqueada',
              className: 'bg-red-100 text-red-700 border-red-200',
            },
            Disabled: {
              label: 'Desativada',
              className: 'bg-gray-100 text-gray-700 border-gray-200',
            },
          }}
        />
      ),
    },
    {
      key: 'createdAt',
      label: 'Cadastro',
      render: (clinic) => formatDate(clinic.createdAt),
    },
    {
      key: 'actions',
      label: '',
      className: 'text-right',
      render: (clinic) => (
        <ActionsDropdown
          actions={[
            {
              label: 'Ver detalhes',
              onClick: () => router.push(`/superadmin/clinicas/${clinic.id}`),
              icon: <Eye size={14} />,
            },
            {
              label: 'Configurar cobrança',
              onClick: () =>
                router.push(`/superadmin/clinicas/${clinic.id}?action=billing`),
              icon: <CreditCard size={14} />,
            },
            {
              label: 'Registrar pagamento',
              onClick: () =>
                router.push(`/superadmin/clinicas/${clinic.id}?action=payment`),
              icon: <CreditCard size={14} />,
            },
            {
              label: 'Gerenciar usuários',
              onClick: () =>
                router.push(`/superadmin/clinicas/${clinic.id}?tab=users`),
              icon: <Users size={14} />,
            },
            {
              label: 'Histórico',
              onClick: () =>
                router.push(`/superadmin/clinicas/${clinic.id}?tab=history`),
              icon: <History size={14} />,
            },
            {
              label: 'Desbloquear cobrança',
              onClick: () =>
                router.push(`/superadmin/clinicas/${clinic.id}?action=unblock`),
              icon: <LockOpen size={14} />,
              disabled: !clinic.isBlockedByBilling,
            },
          ]}
        />
      ),
    },
  ]

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-8">
      <PageHeader
        title="Clínicas"
        actions={
          <Link href="/superadmin/clinicas/nova" className="block w-44">
            <Button type="button">
              <Building2 size={16} className="mr-2" />
              Nova Clínica
            </Button>
          </Link>
        }
      />

      {!isLoading && !error && data?.data?.length === 0 ? (
        <EmptyState
          icon={Settings}
          title="Nenhuma clínica encontrada"
          description="Use a criação guiada para cadastrar a primeira clínica."
        />
      ) : (
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          loading={isLoading}
          error={error ? 'Erro ao carregar clínicas.' : null}
          keyExtractor={(clinic) => clinic.id}
          onRetry={() => void refetch()}
        />
      )}

      {data && data.totalPages > 0 && (
        <Pagination
          page={page}
          totalPages={data.totalPages}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}
    </div>
  )
}
