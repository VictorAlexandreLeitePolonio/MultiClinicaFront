import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WhatsAppLinkSection } from "./WhatsAppLinkSection";
import { createWhatsAppLink, getWhatsAppLinkStatus } from "../services/whatsapp-link.service";

vi.mock("../services/whatsapp-link.service", () => ({
  getWhatsAppLinkStatus: vi.fn(),
  createWhatsAppLink: vi.fn(),
  deleteWhatsAppLink: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { info: vi.fn(), success: vi.fn(), error: vi.fn() },
}));

function renderSection() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <WhatsAppLinkSection />
    </QueryClientProvider>,
  );
}

describe("WhatsAppLinkSection", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("mostra erro com 'Tentar novamente' quando o status não carrega", async () => {
    vi.mocked(getWhatsAppLinkStatus)
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce({ connected: true });
    renderSection();

    expect(await screen.findByText("Não foi possível verificar a conexão com o WhatsApp.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Conectar WhatsApp" })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(await screen.findByText("WhatsApp conectado")).toBeInTheDocument();
    expect(getWhatsAppLinkStatus).toHaveBeenCalledTimes(2);
  });

  it("mostra 'WhatsApp conectado' e 'Desconectar' quando a conta já está vinculada", async () => {
    vi.mocked(getWhatsAppLinkStatus).mockResolvedValue({ connected: true });
    renderSection();

    expect(await screen.findByText("WhatsApp conectado")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Desconectar" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Conectar WhatsApp" })).not.toBeInTheDocument();
  });

  it("com pop-up bloqueado, gera o link sem navegar a aba atual", async () => {
    vi.mocked(getWhatsAppLinkStatus).mockResolvedValue({ connected: false });
    vi.mocked(createWhatsAppLink).mockResolvedValue({ url: "https://wa.me/5511999998888?text=conectar%20abc" });
    const openSpy = vi.spyOn(window, "open").mockReturnValue(null);
    const hrefBefore = window.location.href;
    renderSection();

    await userEvent.click(await screen.findByRole("button", { name: "Conectar WhatsApp" }));

    await waitFor(() =>
      expect(toast.info).toHaveBeenCalledWith(
        "Seu navegador bloqueou a nova aba.",
        expect.objectContaining({ action: expect.objectContaining({ label: "Abrir WhatsApp" }) }),
      ),
    );
    expect(openSpy).toHaveBeenCalledWith("", "_blank");
    expect(createWhatsAppLink).toHaveBeenCalledTimes(1);
    expect(window.location.href).toBe(hrefBefore);
  });
});
