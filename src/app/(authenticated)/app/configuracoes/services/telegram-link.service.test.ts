import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "@/lib/api";
import { createTelegramLink, deleteTelegramLink, getTelegramLinkStatus } from "./telegram-link.service";

vi.mock("@/lib/api", () => ({ default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() } }));

describe("telegram link service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reads the connection status", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { connected: true } });
    await expect(getTelegramLinkStatus()).resolves.toEqual({ connected: true });
    expect(api.get).toHaveBeenCalledWith("/api/me/telegram-link");
  });

  it("creates a deep link", async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { url: "https://t.me/Bot?start=abc" } });
    await expect(createTelegramLink()).resolves.toEqual({ url: "https://t.me/Bot?start=abc" });
    expect(api.post).toHaveBeenCalledWith("/api/me/telegram-link");
  });

  it("disconnects", async () => {
    vi.mocked(api.delete).mockResolvedValue({ data: undefined });
    await deleteTelegramLink();
    expect(api.delete).toHaveBeenCalledWith("/api/me/telegram-link");
  });
});
