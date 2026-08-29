'use client'

import { toast } from 'sonner'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Skeleton } from '@/components/ui/Skeleton'
import { getApiErrorMessage } from '@/utils/apiError'
import { ClinicSettingsForm } from '../../../app/configuracoes/components/ClinicSettingsForm'
import {
  useSuperAdminClinicSettings,
  useUpdateSuperAdminClinicSettings,
} from '../../hooks/useSuperAdminClinicSettings'

interface SuperAdminClinicSettingsPanelProps {
  clinicId: number
}

export function SuperAdminClinicSettingsPanel({
  clinicId,
}: SuperAdminClinicSettingsPanelProps) {
  const settingsQuery = useSuperAdminClinicSettings(clinicId, true)
  const updateMutation = useUpdateSuperAdminClinicSettings()

  if (settingsQuery.isLoading) return <Skeleton className="h-72" />

  if (settingsQuery.isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(
          settingsQuery.error,
          'Não foi possível carregar as configurações da clínica.',
        )}
        onRetry={() => void settingsQuery.refetch()}
      />
    )
  }

  if (!settingsQuery.data)
    return <EmptyState title="Configurações não encontradas" />

  const handleSubmit = async (
    payload: Parameters<typeof updateMutation.mutateAsync>[0]['payload'],
  ) => {
    try {
      await updateMutation.mutateAsync({ clinicId, payload })
      toast.success('Configurações da clínica atualizadas com sucesso.')
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, 'Não foi possível salvar as configurações.'),
      )
    }
  }

  return (
    <ClinicSettingsForm
      settings={settingsQuery.data}
      loading={updateMutation.isPending}
      onSubmit={handleSubmit}
    />
  )
}
