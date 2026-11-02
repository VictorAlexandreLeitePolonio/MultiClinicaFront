import api from "@/lib/api";
import {
  ChargeSuggestion,
  ConsultationReport,
  ConsultationReportSummary,
  FinishConsultationPayload,
  FinishConsultationResponse,
  UpdateConsultationReportPayload,
} from "@/types/consultation";

const base = (appointmentId: number) => `/api/appointments/${appointmentId}/consultation`;

export async function startConsultation(appointmentId: number): Promise<{ reportId: number }> {
  const response = await api.post<{ reportId: number }>(base(appointmentId), { consentConfirmed: true });
  return response.data;
}

export async function uploadChunk(appointmentId: number, n: number, blob: Blob): Promise<void> {
  await api.put(`${base(appointmentId)}/chunks/${n}`, blob, { headers: { "Content-Type": "audio/webm" } });
}

export async function finishConsultation(
  appointmentId: number,
  payload: FinishConsultationPayload
): Promise<FinishConsultationResponse> {
  const response = await api.post<FinishConsultationResponse>(`${base(appointmentId)}/finish`, payload);
  return response.data;
}

export async function getConsultation(appointmentId: number): Promise<ConsultationReport> {
  const response = await api.get<ConsultationReport>(base(appointmentId));
  return response.data;
}

export async function updateConsultationReport(
  appointmentId: number,
  payload: UpdateConsultationReportPayload
): Promise<void> {
  await api.put(`${base(appointmentId)}/report`, payload);
}

export async function reviewConsultation(appointmentId: number): Promise<void> {
  await api.post(`${base(appointmentId)}/review`);
}

export async function retryConsultation(appointmentId: number): Promise<void> {
  await api.post(`${base(appointmentId)}/retry`);
}

export async function getChargeSuggestion(appointmentId: number): Promise<ChargeSuggestion> {
  const response = await api.get<ChargeSuggestion>(`${base(appointmentId)}/charge-suggestion`);
  return response.data;
}

export async function createEvolutionFromConsultation(appointmentId: number): Promise<{ evolutionId: number }> {
  const response = await api.post<{ evolutionId: number }>(`${base(appointmentId)}/evolution`, {});
  return response.data;
}

export async function getPatientConsultationReports(patientId: number): Promise<ConsultationReportSummary[]> {
  const response = await api.get<ConsultationReportSummary[]>(`/api/patients/${patientId}/consultation-reports`);
  return response.data;
}
