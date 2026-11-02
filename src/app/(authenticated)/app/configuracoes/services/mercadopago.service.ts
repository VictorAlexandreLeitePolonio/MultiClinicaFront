import api from "@/lib/api";
import type { MercadoPagoSettings, MercadoPagoStatus } from "@/types/mercadoPago";

export async function getMercadoPagoStatus(): Promise<MercadoPagoStatus> {
  const response = await api.get<MercadoPagoStatus>("/api/mercadopago/status");
  return response.data;
}

export async function connectMercadoPago(): Promise<{ url: string }> {
  const response = await api.post<{ url: string }>("/api/mercadopago/connect");
  return response.data;
}

export async function updateMercadoPagoSettings(settings: MercadoPagoSettings): Promise<void> {
  await api.put("/api/mercadopago/settings", settings);
}

export async function disconnectMercadoPago(): Promise<void> {
  await api.delete("/api/mercadopago");
}
