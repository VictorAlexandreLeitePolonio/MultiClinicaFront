import api from '@/lib/api'
import { normalizePagedResult } from '@/lib/pagination'
import { PagedResult, SuperAdminBillingCharge } from '@/types'

export interface GetSuperAdminBillingParams {
  page: number
  pageSize: number
  status?: string
}

export async function getSuperAdminClinicCharges(
  clinicId: number,
  params: GetSuperAdminBillingParams,
): Promise<PagedResult<SuperAdminBillingCharge>> {
  const response = await api.get<PagedResult<SuperAdminBillingCharge>>(
    `/api/superadmin/clinicas/${clinicId}/charges`,
    { params },
  )

  return normalizePagedResult<SuperAdminBillingCharge>(response.data, params.pageSize)
}
