import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "@/lib/api";
import {
  connectMercadoPago,
  disconnectMercadoPago,
  getMercadoPagoStatus,
  updateMercadoPagoSettings,
} from "./mercadopago.service";

vi.mock("@/lib/api", () => ({ default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }));

const status = {
  connected: true,
  liveMode: false,
  revoked: false,
  acceptPix: true,
  acceptCredit: true,
  maxInstallments: 6,
  acceptDebit: false,
};

describe("mercadopago service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reads the connection status", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: status });
    await expect(getMercadoPagoStatus()).resolves.toEqual(status);
    expect(api.get).toHaveBeenCalledWith("/api/mercadopago/status");
  });

  it("starts the OAuth connection", async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { url: "https://auth.mercadopago.com/authorization?state=abc" } });
    await expect(connectMercadoPago()).resolves.toEqual({
      url: "https://auth.mercadopago.com/authorization?state=abc",
    });
    expect(api.post).toHaveBeenCalledWith("/api/mercadopago/connect");
  });

  it("saves the accepted payment methods", async () => {
    vi.mocked(api.put).mockResolvedValue({ data: undefined });
    const settings = { acceptPix: true, acceptCredit: true, maxInstallments: 6, acceptDebit: false };
    await updateMercadoPagoSettings(settings);
    expect(api.put).toHaveBeenCalledWith("/api/mercadopago/settings", settings);
  });

  it("disconnects the account", async () => {
    vi.mocked(api.delete).mockResolvedValue({ data: undefined });
    await disconnectMercadoPago();
    expect(api.delete).toHaveBeenCalledWith("/api/mercadopago");
  });
});
