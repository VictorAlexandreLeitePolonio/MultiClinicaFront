// Contrato da consulta gravada (transcrição + relatório SOAP). Espelha os DTOs do back.

export type ConsultationStatus = "Recording" | "Processing" | "Ready" | "Interrupted" | "Failed";

// GET /api/appointments/{id}/consultation
export interface ConsultationReport {
  id: number;
  appointmentId: number;
  patientId: number;
  professionalId: number;
  status: ConsultationStatus;
  failureReason: string | null;
  startedAt: string;
  endedAt: string | null;
  chunkCount: number;
  durationSeconds: number | null;
  transcript: string | null;
  subjective: string | null;
  objective: string | null;
  assessment: string | null;
  plan: string | null;
  suggestedReturnDays: number | null;
  reportPending: boolean;
  minutesCharged: number;
  reviewedAt: string | null;
  reviewedByUserId: number | null;
}

export interface UpdateConsultationReportPayload {
  subjective: string | null;
  objective: string | null;
  assessment: string | null;
  plan: string | null;
}

// GET /api/appointments/{id}/consultation/charge-suggestion
export interface ChargeSuggestion {
  planId: number | null;
  planName: string | null;
  planType: "Mensal" | "Avulso" | null;
  alreadyChargedThisMonth: boolean;
}

export interface ConsultationCharge {
  planId: number;
  paymentMethod: string;
  sendOnline: boolean;
}

export interface FinishConsultationPayload {
  charge: ConsultationCharge | null;
}

export interface FinishConsultationResponse {
  status: ConsultationStatus;
  paymentId: number | null;
  chargeError: string | null;
}

// GET /api/patients/{patientId}/consultation-reports
export interface ConsultationReportSummary {
  id: number;
  appointmentId: number;
  appointmentDate: string;
  professionalName: string;
  status: ConsultationStatus;
  reviewed: boolean;
}
