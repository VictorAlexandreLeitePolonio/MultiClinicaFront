import type { ClinicPlan, PlanFeature, UsageMetric } from "@/types/plans";

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
