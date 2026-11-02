import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Payment } from "@/types";
import PagamentoDetails from "./PagamentoDetails";
import { usePagamentoById } from "../hooks/getId";

const updatePagamento = vi.fn();

const payment: Payment = {
  id: 7,
  userId: 1,
  patientId: 2,
  patientName: "Ana Souza",
  planId: 4,
  planName: "Mensal",
  planAmount: 150,
  referenceMonth: "2026-10-01",
  paymentMethod: "Boleto",
  status: "Pending",
  paidAt: null,
  paymentDate: "2026-10-10",
  createdAt: "2026-10-01T10:00:00Z",
  paidOnline: false,
  mpStatus: null,
  onlineAlert: null,
  hasPaymentLink: false,
};

vi.mock("../hooks/getId", () => ({
  usePagamentoById: vi.fn(),
}));

vi.mock("../hooks/update", () => ({
  usePagamentoUpdate: () => ({ updatePagamento, isPending: false }),
}));

vi.mock("../hooks/usePlanos", () => ({
  usePlanos: () => ({
    data: [
      {
        id: 4,
        name: "Mensal",
        valor: 150,
        tipoPlano: "Mensal",
        tipoSessaoId: 1,
        tipoSessaoName: "Sessão",
        createdAt: "2026-01-01T00:00:00Z",
      },
    ],
    loading: false,
    error: null,
  }),
}));

vi.mock("@/app/(authenticated)/app/pacientes/services/patients.service", () => ({
  getPatients: () =>
    Promise.resolve({
      data: [
        {
          id: 2,
          name: "Ana Souza",
          email: "ana@example.com",
          cpf: null,
          rg: null,
          phone: null,
          rua: null,
          numero: null,
          bairro: null,
          cidade: null,
          estado: null,
          cep: null,
          birthDate: null,
          isActive: true,
          appointmentStatus: null,
          paymentStatus: null,
        },
      ],
      page: 1,
      pageSize: 20,
      totalCount: 1,
      totalPages: 1,
    }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

function mockPayment(overrides: Partial<Payment> = {}) {
  vi.mocked(usePagamentoById).mockReturnValue({
    data: { ...payment, ...overrides },
    loading: false,
    error: null,
    refetch: vi.fn(),
  } as never);
}

describe("PagamentoDetails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPayment();
  });

  it("mantém a forma antiga 'Boleto' editável e não oferece Online", async () => {
    render(<PagamentoDetails id={7} onBack={vi.fn()} onSave={vi.fn()} />);

    await userEvent.click(screen.getAllByRole("button", { name: "Editar" })[0]);

    const select = screen.getByLabelText(/Forma de Pagamento/);
    expect(select).toBeEnabled();
    expect(select).toHaveValue("Boleto");
    expect(within(select).getByRole("option", { name: "Boleto" })).toBeInTheDocument();
    expect(
      within(select).queryByRole("option", { name: "Online (Mercado Pago)" }),
    ).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Salvar Alterações" }));

    await waitFor(() =>
      expect(updatePagamento).toHaveBeenCalledWith(
        7,
        expect.objectContaining({ paymentMethod: "Boleto" }),
      ),
    );
  });

  it("não permite editar a forma de uma cobrança online pendente", async () => {
    mockPayment({
      paymentMethod: "Online (Mercado Pago)",
      mpStatus: "pending",
    });
    render(<PagamentoDetails id={7} onBack={vi.fn()} onSave={vi.fn()} />);

    await userEvent.click(screen.getAllByRole("button", { name: "Editar" })[0]);

    const select = screen.getByLabelText(/Forma de Pagamento/);
    expect(select).toBeDisabled();
    expect(select).toHaveValue("Online (Mercado Pago)");
    expect(
      screen.getByText(
        "A forma de pagamento de uma cobrança online pendente não pode ser alterada.",
      ),
    ).toBeInTheDocument();
  });

  it("no painel, não repete o cabeçalho e mantém a ação de editar", () => {
    render(
      <PagamentoDetails
        id={7}
        variant="sheet"
        onBack={vi.fn()}
        onSave={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("heading", { name: "Detalhes do Pagamento" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Editar" }),
    ).toBeInTheDocument();
  });
});
