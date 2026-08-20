import patientApi from "@/lib/patientApi";
import {
  ClinicLikeResult,
  CreateAppointmentRequestPayload,
  PatientAppointment,
  PatientAppointmentRequest,
  PatientClinic,
  PatientMe,
  UpdatePatientMePayload,
} from "@/types";

export async function getMe(): Promise<PatientMe> {
  const response = await patientApi.get<PatientMe>("/api/patient/me");
  return response.data;
}

export async function updateMe(payload: UpdatePatientMePayload): Promise<PatientMe> {
  const response = await patientApi.patch<PatientMe>("/api/patient/me", payload);
  return response.data;
}

export async function getUpcomingAppointments(): Promise<PatientAppointment[]> {
  const response = await patientApi.get<PatientAppointment[]>("/api/patient/appointments/upcoming");
  return response.data;
}

export async function getHistoryAppointments(): Promise<PatientAppointment[]> {
  const response = await patientApi.get<PatientAppointment[]>("/api/patient/appointments/history");
  return response.data;
}

export async function getMyClinics(): Promise<PatientClinic[]> {
  const response = await patientApi.get<PatientClinic[]>("/api/patient/clinics");
  return response.data;
}

/** Lista de solicitações do paciente. */
export async function getMyAppointmentRequests(): Promise<PatientAppointmentRequest[]> {
  const response = await patientApi.get<PatientAppointmentRequest[]>("/api/patient/appointment-requests");
  return response.data;
}

export async function createAppointmentRequest(
  payload: CreateAppointmentRequestPayload,
): Promise<PatientAppointmentRequest> {
  const response = await patientApi.post<PatientAppointmentRequest>(
    "/api/patient/appointment-requests",
    payload,
  );
  return response.data;
}

export async function cancelAppointmentRequest(
  id: number,
  reason: string,
): Promise<PatientAppointmentRequest> {
  const response = await patientApi.patch<PatientAppointmentRequest>(
    `/api/patient/appointment-requests/${id}/cancel`,
    { reason },
  );
  return response.data;
}

// ── Likes de clínica (BACK-6) ──────────────────────────────────────────────

export async function likeClinic(clinicId: number): Promise<ClinicLikeResult> {
  const response = await patientApi.post<ClinicLikeResult>(`/api/patient/clinics/${clinicId}/like`);
  return response.data;
}

export async function unlikeClinic(clinicId: number): Promise<ClinicLikeResult> {
  const response = await patientApi.delete<ClinicLikeResult>(`/api/patient/clinics/${clinicId}/like`);
  return response.data;
}
