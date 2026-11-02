import type { ClinicPlan, PlanFeature, PublicPlan, UsageMetric } from "@/types/plans";

export const PLAN_LABELS: Record<ClinicPlan, string> = {
  Free: "Free",
  Pro: "Pro",
  Premium: "Premium",
};

export const FEATURE_LABELS: Record<PlanFeature, string> = {
  OwnerCopilot: "Copiloto no WhatsApp para o profissional",
  OnlinePayments: "Pagamento online do paciente",
  WhatsAppReminders: "Lembretes automáticos no WhatsApp",
  PatientChatbot: "Chatbot de IA para o paciente",
  Transcription: "Transcrição e resumo de consultas",
};

export const METRIC_LABELS: Record<UsageMetric, string> = {
  WhatsAppConversations: "Conversas de WhatsApp",
  TranscriptionMinutes: "Minutos de transcrição",
};

export function annualSavings(plan: PublicPlan): number {
  const monthlyCents = Math.round(plan.monthlyPrice * 100);
  const annualCents = Math.round(plan.annualPrice * 100);
  const savingsCents = monthlyCents * 12 - annualCents;
  return savingsCents > 0 ? savingsCents / 100 : 0;
}
