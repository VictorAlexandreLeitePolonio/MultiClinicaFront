import patientApi from "@/lib/patientApi";
import { PatientSession } from "@/types";

export interface PatientLoginPayload {
  email: string;
  password: string;
}

export interface ActivateAccountPayload {
  token: string;
  password: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

interface MessageResponse {
  message: string;
}

export async function login(payload: PatientLoginPayload): Promise<PatientSession> {
  const response = await patientApi.post<PatientSession>("/api/patient-auth/login", payload);
  return response.data;
}

export async function logout(): Promise<void> {
  await patientApi.post("/api/patient-auth/logout");
}

export async function me(): Promise<PatientSession> {
  const response = await patientApi.get<PatientSession>("/api/patient-auth/me");
  return response.data;
}

export async function activate(payload: ActivateAccountPayload): Promise<PatientSession> {
  const response = await patientApi.post<PatientSession>("/api/patient-auth/activate", payload);
  return response.data;
}

export async function resendActivation(email: string): Promise<MessageResponse> {
  const response = await patientApi.post<MessageResponse>("/api/patient-auth/resend-activation", { email });
  return response.data;
}

export async function forgotPassword(email: string): Promise<MessageResponse> {
  const response = await patientApi.post<MessageResponse>("/api/patient-auth/forgot-password", { email });
  return response.data;
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<MessageResponse> {
  const response = await patientApi.post<MessageResponse>("/api/patient-auth/reset-password", payload);
  return response.data;
}

export async function changePassword(payload: ChangePasswordPayload): Promise<MessageResponse> {
  const response = await patientApi.patch<MessageResponse>("/api/patient-auth/change-password", payload);
  return response.data;
}
