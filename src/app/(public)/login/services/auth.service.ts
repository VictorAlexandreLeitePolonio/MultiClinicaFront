import api from "@/lib/api";
import { AuthResponse } from "@/types";

export interface LoginPayload {
  email: string;
  password: string;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/api/auth/login", payload);

  return response.data;
}

export async function getCurrentUser(): Promise<AuthResponse> {
  const response = await api.get<AuthResponse>("/api/auth/me");

  return response.data;
}

export async function logout(): Promise<void> {
  await api.post("/api/auth/logout");
}
