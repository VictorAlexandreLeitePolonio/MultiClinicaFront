import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Payment } from "@/types";
import { PagamentoOnlineCell } from "./PagamentoOnlineCell";
import {
  getPaymentLink,
  refundDuplicate,
  refundPayment,
  sendPaymentCharge,
} from "../services/online-payment.service";

vi.mock("../services/online-payment.service", () => ({
  sendPaymentCharge: vi.fn(),
  getPaymentLink: vi.fn(),
  refundPayment: vi.fn(),
  refundDuplicate: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const payment: Payment = {
  id: 7,
  userId: 1,
  patientId: 2,
  patientName: "Ana Souza",
  planId: 3,
  planName: "Mensal",
  planAmount: 150,
  referenceMonth: "2026-10",
  paymentMethod: "Pix",
  status: "Pending",
  paidAt: null,
  paymentDate: "2026-10-10",
  createdAt: "2026-10-01T10:00:00Z",
  paidOnline: false,
  mpStatus: null,
  onlineAlert: null,
  hasPaymentLink: false,
};

function renderCell(overrides: Partial<Payment> = {}) {
  const onChanged = vi.fn();
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const view = render(
    <QueryClientProvider client={queryClient}>
      <PagamentoOnlineCell payment={{ ...payment, ...overrides }} onChanged={onChanged} />
    </QueryClientProvider>,
  );
  return { ...view, onChanged };
}

describe("PagamentoOnlineCell", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  it("envia a cobrança de uma cobrança pendente", async () => {
    vi.mocked(sendPaymentCharge).mockResolvedValue(undefined);
    const { onChanged } = renderCell();

    await userEvent.click(screen.getByRole("button", { name: "Enviar cobrança" }));

    await waitFor(() => expect(sendPaymentCharge).toHaveBeenCalledWith(7, expect.anything()));
    expect(toast.success).toHaveBeenCalledWith("Cobrança enviada por e-mail.");
    expect(onChanged).toHaveBeenCalledTimes(1);
  });

  it("mostra Reenviar quando a cobrança já tem link e copia o link", async () => {
    vi.mocked(getPaymentLink).mockResolvedValue({ url: "https://app.cliniq.com/pagar/abc" });
    const { onChanged } = renderCell({ hasPaymentLink: true });

    expect(screen.queryByRole("button", { name: "Enviar cobrança" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Copiar link" }));

    await waitFor(() => expect(getPaymentLink).toHaveBeenCalledWith(7, expect.anything()));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("https://app.cliniq.com/pagar/abc");
    expect(toast.success).toHaveBeenCalledWith("Link copiado.");
    expect(onChanged).toHaveBeenCalledTimes(1);
  });

  it("reembolsa uma cobrança paga online depois da confirmação", async () => {
    vi.mocked(refundPayment).mockResolvedValue(undefined);
    const { onChanged } = renderCell({ status: "Paid", paidOnline: true, paidAt: "2026-10-05" });

    expect(screen.getByText("Pago online")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Reembolsar" }));

    const dialog = await screen.findByRole("dialog");
    expect(
      within(dialog).getByText("O valor de R$ 150,00 volta para o paciente. A cobrança será cancelada."),
    ).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("button", { name: "Reembolsar" }));

    await waitFor(() => expect(refundPayment).toHaveBeenCalledWith(7, expect.anything()));
    expect(toast.success).toHaveBeenCalledWith("Reembolso solicitado.");
    expect(onChanged).toHaveBeenCalledTimes(1);
  });

  it("mostra os alertas de estorno e contestação", () => {
    const { rerender } = renderCell({ onlineAlert: "Estornado" });
    expect(screen.getByText("Estornado")).toBeInTheDocument();

    rerender(
      <QueryClientProvider client={new QueryClient()}>
        <PagamentoOnlineCell payment={{ ...payment, onlineAlert: "Contestado" }} onChanged={vi.fn()} />
      </QueryClientProvider>,
    );
    expect(screen.getByText("Contestado")).toBeInTheDocument();
  });

  it("reembolsa o pagamento duplicado", async () => {
    vi.mocked(refundDuplicate).mockResolvedValue(undefined);
    const { onChanged } = renderCell({
      status: "Paid",
      paidOnline: true,
      onlineAlert: "PagamentoDuplicado:998877",
    });

    expect(screen.getByText("Pagamento duplicado")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Reembolsar pagamento duplicado" }));

    await waitFor(() => expect(refundDuplicate).toHaveBeenCalledWith(7, expect.anything()));
    expect(toast.success).toHaveBeenCalledWith("Pagamento duplicado reembolsado.");
    expect(onChanged).toHaveBeenCalledTimes(1);
  });

  it("mostra a mensagem da API quando o envio falha", async () => {
    vi.mocked(sendPaymentCharge).mockRejectedValue({
      isAxiosError: true,
      response: { data: { message: "Paciente sem e-mail." } },
    });
    renderCell();

    await userEvent.click(screen.getByRole("button", { name: "Enviar cobrança" }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Paciente sem e-mail."));
  });

  it("não mostra ações quando a cobrança não tem dados online", () => {
    renderCell({ status: "Cancelled" });
    expect(screen.getByText("-")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
