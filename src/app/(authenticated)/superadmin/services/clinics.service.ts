import api from '@/lib/api'
import { normalizePagedResult } from '@/lib/pagination'
import {
  PagedResult,
  SuperAdminBillingCharge,
  SuperAdminClinic,
  SuperAdminClinicDetail,
  SuperAdminClinicUser,
  UserRole,
} from '@/types'
import type { ClinicPlan } from '@/types/plans'

export interface GetSuperAdminClinicsParams {
  page: number
  pageSize: number
  isActive?: boolean
  isBlockedByBilling?: boolean
  overdue?: boolean
}

export async function getSuperAdminClinics(
  params: GetSuperAdminClinicsParams,
): Promise<PagedResult<SuperAdminClinic>> {
  const response = await api.get<PagedResult<SuperAdminClinic>>(
    '/api/superadmin/clinicas',
    {
      params,
    },
  )
  console.log('Fetched clinics:', response.data)
  return normalizePagedResult<SuperAdminClinic>(response.data, params.pageSize)
}

export async function getSuperAdminClinicDetail(
  clinicId: number,
): Promise<SuperAdminClinicDetail> {
  const response = await api.get<SuperAdminClinicDetail>(
    `/api/superadmin/clinicas/${clinicId}`,
  )

  return response.data
}

export interface CreateSuperAdminClinicPayload {
  nome: string
  nomeFantasia: string
  nomeResponsavel: string
  cnpj: string
  email: string
  telefone: string
  rua: string
  numero: string
  bairro: string
  cidade: string
  estado: string
  cep: string
  firstAdmin: {
    name: string
    email: string
    password: string
  }
}

export async function createSuperAdminClinic(
  payload: CreateSuperAdminClinicPayload,
): Promise<SuperAdminClinic> {
  const response = await api.post<SuperAdminClinic>(
    '/api/superadmin/clinicas',
    payload,
  )
  console.log('Created clinic:', response.data)
  return response.data
}

export interface GetSuperAdminClinicChildrenParams {
  page: number
  pageSize: number
}

export async function getSuperAdminClinicUsers(
  clinicId: number,
  params: GetSuperAdminClinicChildrenParams,
): Promise<PagedResult<SuperAdminClinicUser>> {
  const response = await api.get<PagedResult<SuperAdminClinicUser>>(
    `/api/superadmin/clinicas/${clinicId}/users`,
    { params },
  )

  return normalizePagedResult<SuperAdminClinicUser>(
    response.data,
    params.pageSize,
  )
}

export interface RegisterClinicPaymentPayload {
  chargeId: number
  paymentMethod: string
  paidAt?: string | null
  notes?: string
}

export async function registerClinicPayment(
  clinicId: number,
  payload: RegisterClinicPaymentPayload,
): Promise<SuperAdminBillingCharge> {
  const { chargeId, ...body } = payload
  const response = await api.post<SuperAdminBillingCharge>(
    `/api/superadmin/clinicas/${clinicId}/charges/${chargeId}/payments`,
    body,
  )

  return response.data
}

export interface UnblockClinicBillingPayload {
  reason: string
}

export async function unblockClinicBilling(
  clinicId: number,
  payload: UnblockClinicBillingPayload,
): Promise<SuperAdminClinicDetail> {
  const response = await api.post<SuperAdminClinicDetail>(
    `/api/superadmin/clinicas/${clinicId}/billing/unblock`,
    payload,
  )

  return response.data
}

export interface CreateSuperAdminClinicUserPayload {
  name: string
  email: string
  password: string
  role: Exclude<UserRole, 'SuperAdmin'>
}

export async function createSuperAdminClinicUser(
  clinicId: number,
  payload: CreateSuperAdminClinicUserPayload,
): Promise<SuperAdminClinicUser> {
  const response = await api.post<SuperAdminClinicUser>(
    '/api/superadmin/clinicas/users',
    {
      clinicaId: clinicId,
      ...payload,
    },
  )

  return response.data
}

export async function setClinicPlan(
  clinicaId: number,
  plan: ClinicPlan,
  isFounder: boolean,
): Promise<void> {
  await api.put(`/api/superadmin/clinicas/${clinicaId}/plan`, { plan, isFounder })
}
