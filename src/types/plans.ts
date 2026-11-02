// Contrato com o back (spec 2026-10-30-planos-plataforma). Enums chegam como string.
export type ClinicPlan = "Free" | "Pro" | "Premium";
export type BillingCycle = "Monthly" | "Annual";
export type PlanFeature =
  | "OwnerCopilot"
  | "OnlinePayments"
  | "WhatsAppReminders"
  | "PatientChatbot"
  | "Transcription";
export type UsageMetric = "WhatsAppConversations" | "TranscriptionMinutes";
export type HubBadge = "Featured" | "Founder" | null;

export interface PublicPlan {
  plan: ClinicPlan;
  monthlyPrice: number;
  annualPrice: number;
  /** null = ilimitado */
  includedProfessionals: number | null;
  maxExtraProfessionals: number;
  features: PlanFeature[];
  quotas: Record<UsageMetric, number>;
  hubRank: number;
}

export interface UsagePack {
  id: string;
  plan: ClinicPlan;
  metric: UsageMetric;
  amount: number;
  price: number;
}

export interface PublicPlansResponse {
  plans: PublicPlan[];
  extraProfessionalPrice: number;
  packs: UsagePack[];
}

export interface BillingStatus {
  plan: ClinicPlan;
  billingCycle: BillingCycle | null;
  isFounder: boolean;
  extraProfessionals: number;
  /** null = ilimitado */
  professionalLimit: number | null;
  activeProfessionals: number;
  hasSubscription: boolean;
}

export interface UsageMetricStatus {
  metric: UsageMetric;
  used: number;
  planLimit: number;
  extraGranted: number;
  total: number;
}

export interface UsageResponse {
  /** "yyyy-MM" */
  period: string;
  metrics: UsageMetricStatus[];
}

export type PurchaseItem = "extra-professional" | `pack:${string}`;

export interface PlanRequiredError {
  code: "PLAN_REQUIRED";
  feature: PlanFeature;
  requiredPlan: ClinicPlan;
  message: string;
}

export interface ProfessionalLimitError {
  code: "PROFESSIONAL_LIMIT";
  limit: number;
  message: string;
}

export type BillingLimitError = PlanRequiredError | ProfessionalLimitError;

export interface SignupRequest {
  clinicName: string;
  ownerName: string;
  email: string;
  phone: string;
  password: string;
}

export interface HubApprovalItem {
  clinicaId: number;
  name: string;
  publicSlug: string | null;
  city: string;
  updatedAt: string;
}
