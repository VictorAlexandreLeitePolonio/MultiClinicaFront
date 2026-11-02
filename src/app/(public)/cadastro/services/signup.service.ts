import publicApi from "@/lib/publicApi";
import type { SignupRequest } from "@/types/plans";

export async function signup(body: SignupRequest): Promise<void> {
  await publicApi.post("/api/public/signup", body);
}

export async function resendSignupEmail(email: string): Promise<void> {
  await publicApi.post("/api/public/signup/resend", { email });
}

export async function confirmSignup(token: string): Promise<{ email: string }> {
  const response = await publicApi.post<{ email: string }>("/api/public/signup/confirm", { token });
  return response.data;
}
