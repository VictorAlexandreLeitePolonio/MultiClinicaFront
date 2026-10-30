import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PublicPayment } from "@/types/mercadoPago";
import PublicPaymentPage from "./page";
import { getPublicPayment, payPublicPayment } from "./services/public-payment.service";

vi.mock("next/navigation", () => ({
  useParams: () => ({ token: "abc123" }),
}));

vi.mock("./services/public-payment.service", () => ({
  getPublicPayment: vi.fn(),
  payPublicPayment: vi.fn(),
}));

vi.mock("./components/PaymentBricks", async () => {
  const React = await import("react");

  type Props = {
    onSubmit?: (formData: {
      payment_method_id: string;
      payer: { email: string };
    }) => Promise<void>;
  };

  return {
    default: (props: Props) =>
      React.createElement(
        "div",
        { "data-testid": "payment-bricks" },
        props.onSubmit
          ? React.createElement(
              "button",
              {
                type: "button",
                onClick: () => {
                  void props.onSubmit?.({
                    payment_method_id: "pix",
                    payer: { email: "ana@example.com" },
                  });
                },
              },
              "Pagar Brick",
            )
          : null,
      ),
  };
});

vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const payment: PublicPayment = {
  clinicName: "Clínica Centro",
  clinicLogoUrl: null,
  patientFirstName: "Ana",
  amount: 250,
  referenceMonth: "2026-03-01",
  planName: "Plano Mensal",
  status: "Pending",
  mpStatus: null,
  mpPaymentId: null,
  publicKey: "pub-key",
  acceptPix: true,
  acceptCredit: true,
  maxInstallments: 6,
  acceptDebit: true,
};

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <PublicPaymentPage />
    </QueryClientProvider>,
  );
}

describe("PublicPaymentPage", () => {
  beforeEach(() => {
    vi.mocked(getPublicPayment).mockReset();
    vi.mocked(payPublicPayment).mockReset();
  });

  it("mostra o cabeçalho da clínica e o Payment Brick na cobrança pendente", async () => {
    vi.mocked(getPublicPayment).mockResolvedValue(payment);

    renderPage();

    expect(await screen.findByText("Clínica Centro")).toBeInTheDocument();
    expect(screen.getByText("Olá, Ana!")).toBeInTheDocument();
    expect(screen.getByText(/250,00/)).toBeInTheDocument();
    expect(screen.getByText(/Plano Mensal · 03\/2026/)).toBeInTheDocument();
    expect(screen.getByText("Escolha como pagar")).toBeInTheDocument();
  });

  it("depois de pagar com Pix em andamento, mostra o Status Screen e segue aguardando", async () => {
    vi.mocked(getPublicPayment)
      .mockResolvedValueOnce(payment)
      .mockResolvedValue({
        ...payment,
        mpStatus: "pending",
        mpPaymentId: 987654,
      });
    vi.mocked(payPublicPayment).mockResolvedValue({ paymentId: 987654, status: "pending" });

    renderPage();

    await userEvent.click(await screen.findByRole("button", { name: "Pagar Brick" }));

    expect(payPublicPayment).toHaveBeenCalledWith("abc123", {
      payment_method_id: "pix",
      payer: { email: "ana@example.com" },
    });
    expect(await screen.findByText("Finalize seu pagamento")).toBeInTheDocument();
    expect(
      screen.getByText("Aguardando a confirmação do Mercado Pago. Esta página atualiza sozinha."),
    ).toBeInTheDocument();
  });

  it("mostra o Status Screen e o aviso de espera quando o Pix está em andamento", async () => {
    vi.mocked(getPublicPayment).mockResolvedValue({
      ...payment,
      mpStatus: "pending",
      mpPaymentId: 987654,
    });

    renderPage();

    expect(await screen.findByText("Finalize seu pagamento")).toBeInTheDocument();
    expect(
      screen.getByText("Aguardando a confirmação do Mercado Pago. Esta página atualiza sozinha."),
    ).toBeInTheDocument();
  });

  it("mostra 'Pagamento confirmado' quando a cobrança foi paga", async () => {
    vi.mocked(getPublicPayment).mockResolvedValue({ ...payment, status: "Paid" });

    renderPage();

    expect(await screen.findByText("Pagamento confirmado")).toBeInTheDocument();
    expect(screen.queryByTestId("payment-bricks")).not.toBeInTheDocument();
  });

  it("mostra que a cobrança não está mais disponível", async () => {
    vi.mocked(getPublicPayment).mockResolvedValue({ ...payment, status: "Unavailable" });

    renderPage();

    expect(await screen.findByText("Esta cobrança não está mais disponível")).toBeInTheDocument();
  });

  it("mostra 'Link de pagamento inválido.' quando o token não existe", async () => {
    vi.mocked(getPublicPayment).mockRejectedValue({ response: { status: 404 } });

    renderPage();

    expect(await screen.findByText("Link de pagamento inválido.")).toBeInTheDocument();
  });
});
