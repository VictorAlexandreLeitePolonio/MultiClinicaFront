import api from './api'
import publicApi from './publicApi'

// Contrato com o back (spec 2026-10-30-planos-plataforma). Enums chegam como string.
export type ClinicPlan = 'Free' | 'Pro' | 'Premium'
export type BillingCycle = 'Monthly' | 'Annual'
export type PlanFeature = 'OwnerCopilot' | 'OnlinePayments' | 'WhatsAppReminders' | 'PatientChatbot' | 'Transcription'
export type UsageMetric = 'WhatsAppConversations' | 'TranscriptionMinutes'
export type HubBadge = 'Featured' | 'Founder' | null

export interface PublicPlan {
  plan: ClinicPlan
  monthlyPrice: number
  annualPrice: number
  /** null = ilimitado */
  includedProfessionals: number | null
  maxExtraProfessionals: number
  features: PlanFeature[]
  quotas: Record<UsageMetric, number>
  hubRank: number
}

export interface UsagePack {
  id: string
  plan: ClinicPlan
  metric: UsageMetric
  amount: number
  price: number
}

export interface PublicPlansResponse {
  plans: PublicPlan[]
  extraProfessionalPrice: number
  packs: UsagePack[]
}

export interface BillingStatus {
  plan: ClinicPlan
  billingCycle: BillingCycle | null
  isFounder: boolean
  extraProfessionals: number
  /** null = ilimitado */
  professionalLimit: number | null
  activeProfessionals: number
  hasSubscription: boolean
}

export interface UsageMetricStatus {
  metric: UsageMetric
  used: number
  planLimit: number
  extraGranted: number
  total: number
}

export interface UsageResponse {
  /** "yyyy-MM" */
  period: string
  metrics: UsageMetricStatus[]
}

export type PurchaseItem = 'extra-professional' | `pack:${string}`

export interface PlanRequiredError {
  code: 'PLAN_REQUIRED'
  feature: PlanFeature
  requiredPlan: ClinicPlan
  message: string
}

export interface ProfessionalLimitError {
  code: 'PROFESSIONAL_LIMIT'
  limit: number
  message: string
}

export type BillingLimitError = PlanRequiredError | ProfessionalLimitError

export interface SignupRequest {
  clinicName: string
  ownerName: string
  email: string
  phone: string
  password: string
}

export interface HubApprovalItem {
  clinicaId: number
  name: string
  publicSlug: string | null
  city: string
  updatedAt: string
}

/** Disparado em window pelo interceptor de 402 de src/lib/api.ts; detail: BillingLimitError. */
export const PLAN_REQUIRED_EVENT = 'cliniq:plan-required'

export const planQueryKeys = {
  publicPlans: ['plans', 'public'] as const,
  status: ['billing', 'status'] as const,
  usage: ['billing', 'usage'] as const,
  hubApprovals: ['superadmin', 'hub-approvals'] as const,
}

export const PLAN_LABELS: Record<ClinicPlan, string> = { Free: 'Free', Pro: 'Pro', Premium: 'Premium' }

export const FEATURE_LABELS: Record<PlanFeature, string> = {
  OwnerCopilot: 'Copiloto no WhatsApp para o profissional',
  OnlinePayments: 'Pagamento online do paciente',
  WhatsAppReminders: 'Lembretes automáticos no WhatsApp',
  PatientChatbot: 'Chatbot de IA para o paciente',
  Transcription: 'Transcrição e resumo de consultas',
}

export const METRIC_LABELS: Record<UsageMetric, string> = {
  WhatsAppConversations: 'Conversas de WhatsApp',
  TranscriptionMinutes: 'Minutos de transcrição',
}

export const formatBRL = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

// Planos públicos (LP e tela de plano)
export const fetchPublicPlans = async () =>
  (await publicApi.get<PublicPlansResponse>('/api/public/plans')).data

// Assinatura da clínica logada
export const fetchBillingStatus = async () => (await api.get<BillingStatus>('/api/billing/me')).data
export const fetchUsage = async () => (await api.get<UsageResponse>('/api/billing/usage')).data
export const startCheckout = async (plan: Exclude<ClinicPlan, 'Free'>, cycle: BillingCycle) =>
  (await api.post<{ url: string }>('/api/billing/subscription/checkout', { plan, cycle })).data
export const changeSubscription = async (plan: Exclude<ClinicPlan, 'Free'>, cycle: BillingCycle) => {
  await api.post('/api/billing/subscription/change', { plan, cycle })
}
export const cancelSubscription = async () => {
  await api.post('/api/billing/subscription/cancel')
}
export const purchase = async (item: PurchaseItem) =>
  (await api.post<{ url: string }>('/api/billing/purchase', { item })).data

// Cadastro self-service (anônimo)
export const signup = async (body: SignupRequest) => {
  await publicApi.post('/api/public/signup', body)
}
export const resendSignupEmail = async (email: string) => {
  await publicApi.post('/api/public/signup/resend', { email })
}
export const confirmSignup = async (token: string) =>
  (await publicApi.post<{ email: string }>('/api/public/signup/confirm', { token })).data

// SuperAdmin
export const fetchHubApprovals = async () =>
  (await api.get<HubApprovalItem[]>('/api/superadmin/hub-approvals')).data
export const decideHubApproval = async (clinicaId: number, approved: boolean, reason?: string) => {
  await api.post(`/api/superadmin/clinicas/${clinicaId}/hub-approval`, { approved, reason })
}
export const setClinicPlan = async (clinicaId: number, plan: ClinicPlan, isFounder: boolean) => {
  await api.put(`/api/superadmin/clinicas/${clinicaId}/plan`, { plan, isFounder })
}
