import api from "@/lib/api";
import { User } from "@/types";

export interface LoginPayload {
  email: string;
  password: string;
}

interface AuthUserResponse {
  user: User;
}

interface LoginResponse {
  message?: string;
  user: User;
}

export async function login(payload: LoginPayload): Promise<User> {
  const response = await api.post<LoginResponse>("/api/auth/login", payload);

  return response.data.user;
}

export async function getCurrentUser(): Promise<User> {
  const response = await api.get<AuthUserResponse | User>("/api/auth/me");
  const data = response.data;

  if ("user" in data) {
    return data.user;
  }

  return data;
}

export async function logout(): Promise<void> {
  await api.post("/api/auth/logout");
}
