import api from "@/lib/api";

export interface TelegramLinkStatus {
  connected: boolean;
}

export async function getTelegramLinkStatus(): Promise<TelegramLinkStatus> {
  const response = await api.get<TelegramLinkStatus>("/api/me/telegram-link");
  return response.data;
}

export async function createTelegramLink(): Promise<{ url: string }> {
  const response = await api.post<{ url: string }>("/api/me/telegram-link");
  return response.data;
}

export async function deleteTelegramLink(): Promise<void> {
  await api.delete("/api/me/telegram-link");
}
