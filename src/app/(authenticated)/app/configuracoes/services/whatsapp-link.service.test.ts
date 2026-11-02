import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "@/lib/api";
import { createWhatsAppLink, deleteWhatsAppLink, getWhatsAppLinkStatus } from "./whatsapp-link.service";

vi.mock("@/lib/api", () => ({ default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() } }));

describe("whatsapp link service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reads the connection status", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { connected: true } });
    await expect(getWhatsAppLinkStatus()).resolves.toEqual({ connected: true });
    expect(api.get).toHaveBeenCalledWith("/api/me/whatsapp-link");
  });

  it("creates a deep link", async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { url: "https://wa.me/5511999998888?text=conectar%20abc" } });
    await expect(createWhatsAppLink()).resolves.toEqual({ url: "https://wa.me/5511999998888?text=conectar%20abc" });
    expect(api.post).toHaveBeenCalledWith("/api/me/whatsapp-link");
  });

  it("disconnects", async () => {
    vi.mocked(api.delete).mockResolvedValue({ data: undefined });
    await deleteWhatsAppLink();
    expect(api.delete).toHaveBeenCalledWith("/api/me/whatsapp-link");
  });
});
