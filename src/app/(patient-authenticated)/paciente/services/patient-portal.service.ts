import patientApi from "@/lib/patientApi";
import {
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

/** Lista de solicitações do paciente. O fluxo completo é construído na FRONT-4;
 *  aqui é usada apenas para o indicador de pendentes na dashboard. */
export async function getMyAppointmentRequests(): Promise<PatientAppointmentRequest[]> {
  const response = await patientApi.get<PatientAppointmentRequest[]>("/api/patient/appointment-requests");
  return response.data;
}
