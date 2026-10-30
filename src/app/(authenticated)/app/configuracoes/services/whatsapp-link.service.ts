import api from "@/lib/api";

export interface WhatsAppLinkStatus {
  connected: boolean;
}

export async function getWhatsAppLinkStatus(): Promise<WhatsAppLinkStatus> {
  const response = await api.get<WhatsAppLinkStatus>("/api/me/whatsapp-link");
  return response.data;
}

export async function createWhatsAppLink(): Promise<{ url: string }> {
  const response = await api.post<{ url: string }>("/api/me/whatsapp-link");
  return response.data;
}

export async function deleteWhatsAppLink(): Promise<void> {
  await api.delete("/api/me/whatsapp-link");
}
