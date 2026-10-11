import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TelegramLinkSection } from "./TelegramLinkSection";
import { createTelegramLink, getTelegramLinkStatus } from "../services/telegram-link.service";

vi.mock("../services/telegram-link.service", () => ({
  getTelegramLinkStatus: vi.fn(),
  createTelegramLink: vi.fn(),
  deleteTelegramLink: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { info: vi.fn(), success: vi.fn(), error: vi.fn() },
}));

function renderSection() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <TelegramLinkSection />
    </QueryClientProvider>,
  );
}

describe("TelegramLinkSection", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("mostra erro com 'Tentar novamente' quando o status não carrega", async () => {
    vi.mocked(getTelegramLinkStatus)
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce({ connected: true });
    renderSection();

    expect(await screen.findByText("Não foi possível verificar a conexão com o Telegram.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Conectar Telegram" })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(await screen.findByText("Conectado")).toBeInTheDocument();
    expect(getTelegramLinkStatus).toHaveBeenCalledTimes(2);
  });

  it("mostra 'Conectado' e 'Desconectar' quando a conta já está vinculada", async () => {
    vi.mocked(getTelegramLinkStatus).mockResolvedValue({ connected: true });
    renderSection();

    expect(await screen.findByText("Conectado")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Desconectar" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Conectar Telegram" })).not.toBeInTheDocument();
  });

  it("com pop-up bloqueado, gera o link sem navegar a aba atual", async () => {
    vi.mocked(getTelegramLinkStatus).mockResolvedValue({ connected: false });
    vi.mocked(createTelegramLink).mockResolvedValue({ url: "https://t.me/Bot?start=abc" });
    const openSpy = vi.spyOn(window, "open").mockReturnValue(null);
    const hrefBefore = window.location.href;
    renderSection();

    await userEvent.click(await screen.findByRole("button", { name: "Conectar Telegram" }));

    await waitFor(() =>
      expect(toast.info).toHaveBeenCalledWith(
        "Seu navegador bloqueou a nova aba.",
        expect.objectContaining({ action: expect.objectContaining({ label: "Abrir Telegram" }) }),
      ),
    );
    expect(openSpy).toHaveBeenCalledWith("", "_blank");
    expect(createTelegramLink).toHaveBeenCalledTimes(1);
    expect(window.location.href).toBe(hrefBefore);
  });
});
