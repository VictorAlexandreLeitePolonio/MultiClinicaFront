import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MercadoPagoStatus } from "@/types/mercadoPago";
import { MercadoPagoSection } from "./MercadoPagoSection";
import {
  connectMercadoPago,
  disconnectMercadoPago,
  getMercadoPagoStatus,
  updateMercadoPagoSettings,
} from "../services/mercadopago.service";

const mockSearchParams = vi.hoisted(() => ({ current: new URLSearchParams() }));
const mockReplace = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => mockSearchParams.current,
}));

vi.mock("../services/mercadopago.service", () => ({
  getMercadoPagoStatus: vi.fn(),
  connectMercadoPago: vi.fn(),
  updateMercadoPagoSettings: vi.fn(),
  disconnectMercadoPago: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const disconnected: MercadoPagoStatus = {
  connected: false,
  liveMode: false,
  revoked: false,
  acceptPix: true,
  acceptCredit: true,
  maxInstallments: 1,
  acceptDebit: true,
  accountId: null,
  nickname: null,
  email: null,
  connectedAt: null,
};

const connected: MercadoPagoStatus = {
  ...disconnected,
  connected: true,
  liveMode: true,
  acceptPix: true,
  acceptCredit: true,
  maxInstallments: 6,
  acceptDebit: false,
};

const connectedAccount: MercadoPagoStatus = {
  ...connected,
  accountId: 987654321,
  nickname: "Clínica Vida",
  email: "financeiro@clinicavida.com.br",
  connectedAt: "2026-10-15T14:30:00Z",
};

function renderSection() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MercadoPagoSection />
    </QueryClientProvider>,
  );
}

describe("MercadoPagoSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.current = new URLSearchParams();
  });

  it("mostra o botão de conectar e o aviso da chave Pix quando não há conta", async () => {
    vi.mocked(getMercadoPagoStatus).mockResolvedValue(disconnected);
    renderSection();

    expect(await screen.findByRole("button", { name: "Conectar Mercado Pago" })).toBeInTheDocument();
    expect(
      screen.getByText("Cadastre uma chave Pix na sua conta Mercado Pago para receber por Pix"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Mercado Pago conectado")).not.toBeInTheDocument();
  });

  it("mostra o status conectado, o modo de teste e desconecta a conta", async () => {
    vi.mocked(getMercadoPagoStatus).mockResolvedValue({ ...connected, liveMode: false });
    vi.mocked(disconnectMercadoPago).mockResolvedValue(undefined);
    renderSection();

    expect(await screen.findByText("Mercado Pago conectado")).toBeInTheDocument();
    expect(screen.getByText("Modo de teste")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Desconectar" }));

    await waitFor(() => expect(disconnectMercadoPago).toHaveBeenCalledTimes(1));
    expect(toast.success).toHaveBeenCalledWith("Mercado Pago desconectado.");
  });

  it("mostra a conta conectada com apelido, e-mail, ID e data de conexão", async () => {
    vi.mocked(getMercadoPagoStatus).mockResolvedValue(connectedAccount);
    renderSection();

    expect(await screen.findByText("Conta conectada")).toBeInTheDocument();
    expect(screen.getByText("Clínica Vida")).toBeInTheDocument();
    expect(screen.getByText("financeiro@clinicavida.com.br")).toBeInTheDocument();
    expect(screen.getByText("987654321")).toHaveClass("font-mono");
    expect(screen.getByText("15/10/2026")).toBeInTheDocument();
  });

  it("usa 'Conta Mercado Pago' quando o apelido da conta não foi informado", async () => {
    vi.mocked(getMercadoPagoStatus).mockResolvedValue({ ...connectedAccount, nickname: null, email: null });
    renderSection();

    expect(await screen.findByText("Conta conectada")).toBeInTheDocument();
    expect(screen.getByText("Conta Mercado Pago")).toBeInTheDocument();
    expect(screen.queryByText("E-mail")).not.toBeInTheDocument();
  });

  it("avisa para entrar com a conta Mercado Pago da clínica antes de conectar", async () => {
    vi.mocked(getMercadoPagoStatus).mockResolvedValue(disconnected);
    renderSection();

    const notice = await screen.findByText(/Entre com a conta Mercado Pago/);
    expect(notice).toHaveTextContent(
      "Entre com a conta Mercado Pago da clínica. O Mercado Pago usa a conta que estiver logada neste navegador.",
    );
    expect(screen.queryByText("Conta conectada")).not.toBeInTheDocument();
  });

  it("mostra a conta conectada e o aviso da clínica ao reconectar uma conta revogada", async () => {
    vi.mocked(getMercadoPagoStatus).mockResolvedValue({ ...connectedAccount, revoked: true });
    renderSection();

    expect(await screen.findByText("Conta conectada")).toBeInTheDocument();
    expect(screen.getByText("Clínica Vida")).toBeInTheDocument();
    expect(screen.getByText(/Entre com a conta Mercado Pago/)).toBeInTheDocument();
  });

  it("pede para reconectar uma conta revogada", async () => {
    vi.mocked(getMercadoPagoStatus).mockResolvedValue({ ...connected, revoked: true });
    renderSection();

    expect(await screen.findByText("Reconecte o Mercado Pago")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reconectar" })).toBeInTheDocument();
  });

  it("salva as formas aceitas com o máximo de parcelas", async () => {
    vi.mocked(getMercadoPagoStatus).mockResolvedValue({ ...connected, acceptDebit: true });
    vi.mocked(updateMercadoPagoSettings).mockResolvedValue(undefined);
    renderSection();

    await screen.findByText("Mercado Pago conectado");
    const installments = screen.getByLabelText("Máximo de parcelas");
    fireEvent.change(installments, { target: { value: "8" } });
    await userEvent.click(screen.getByRole("switch", { name: "Pix" }));
    await userEvent.click(screen.getByRole("switch", { name: "Cartão de débito" }));
    await userEvent.click(screen.getByRole("button", { name: "Salvar formas de pagamento" }));

    await waitFor(() =>
      expect(updateMercadoPagoSettings).toHaveBeenCalledWith({
        acceptPix: false,
        acceptCredit: true,
        maxInstallments: 8,
        acceptDebit: false,
      }, expect.anything()),
    );
    expect(toast.success).toHaveBeenCalledWith("Formas de pagamento atualizadas.");
  });

  it("recusa salvar sem nenhuma forma de pagamento", async () => {
    vi.mocked(getMercadoPagoStatus).mockResolvedValue({ ...connected, acceptDebit: true });
    renderSection();

    await screen.findByText("Mercado Pago conectado");
    await userEvent.click(screen.getByRole("switch", { name: "Pix" }));
    await userEvent.click(screen.getByRole("switch", { name: "Cartão de crédito" }));
    await userEvent.click(screen.getByRole("switch", { name: "Cartão de débito" }));
    await userEvent.click(screen.getByRole("button", { name: "Salvar formas de pagamento" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Escolha ao menos uma forma de pagamento.");
    expect(updateMercadoPagoSettings).not.toHaveBeenCalled();
  });

  it("inicia a conexão e navega para a URL do Mercado Pago", async () => {
    vi.mocked(getMercadoPagoStatus).mockResolvedValue(disconnected);
    vi.mocked(connectMercadoPago).mockResolvedValue({ url: "https://auth.mercadopago.com/authorization?state=abc" });
    const originalLocation = window.location;
    const location = { ...originalLocation, href: "" };
    Object.defineProperty(window, "location", { configurable: true, value: location });

    renderSection();
    await userEvent.click(await screen.findByRole("button", { name: "Conectar Mercado Pago" }));

    await waitFor(() => expect(connectMercadoPago).toHaveBeenCalledTimes(1));
    expect(window.location.href).toBe("https://auth.mercadopago.com/authorization?state=abc");
    Object.defineProperty(window, "location", { configurable: true, value: originalLocation });
  });

  it("mostra erro e permite tentar novamente quando o status não carrega", async () => {
    vi.mocked(getMercadoPagoStatus)
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce(disconnected);
    renderSection();

    expect(
      await screen.findByText("Não foi possível verificar a conexão com o Mercado Pago"),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(await screen.findByRole("button", { name: "Conectar Mercado Pago" })).toBeInTheDocument();
    expect(getMercadoPagoStatus).toHaveBeenCalledTimes(2);
  });

  it("esconde a seção quando o plano não libera pagamentos online", async () => {
    vi.mocked(getMercadoPagoStatus).mockRejectedValue({
      isAxiosError: true,
      response: { status: 402, data: { code: "PLAN_REQUIRED" } },
    });
    renderSection();

    await waitFor(() => expect(getMercadoPagoStatus).toHaveBeenCalled());
    await waitFor(() => expect(screen.queryByRole("heading", { name: "Mercado Pago" })).not.toBeInTheDocument());
  });

  it.each([
    ["conectado", "success", "Mercado Pago conectado."],
    ["erro", "error", "Não foi possível conectar o Mercado Pago. Tente de novo."],
    ["conta-em-uso", "error", "Esta conta Mercado Pago já está ligada a outra clínica."],
  ] as const)("mostra o retorno ?mp=%s e limpa o parâmetro", async (result, kind, message) => {
    mockSearchParams.current = new URLSearchParams(`mp=${result}&tab=formas`);
    vi.mocked(getMercadoPagoStatus).mockResolvedValue(connected);
    renderSection();

    await waitFor(() => expect(toast[kind]).toHaveBeenCalledWith(message));
    expect(mockReplace).toHaveBeenCalledWith(`/app/configuracoes?tab=formas`);
  });
});
