import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Payment, PaymentStatusSummary } from "@/types";
import { PagamentoBoard } from "./PagamentoBoard";

const updatePagamento = vi.fn();

vi.mock("../hooks/update", () => ({
  usePagamentoUpdate: () => ({ updatePagamento, isPending: false }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const basePayment: Payment = {
  id: 1,
  userId: 1,
  patientId: 2,
  patientName: "Ana Souza",
  planId: 4,
  planName: "Mensal",
  planAmount: 150,
  referenceMonth: "2026-10-01",
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

function makePayment(overrides: Partial<Payment>): Payment {
  return { ...basePayment, ...overrides };
}

function renderBoard(
  payments: Payment[],
  onChanged = vi.fn(),
  summary?: PaymentStatusSummary[],
  summaryLoading = false,
) {
  return render(
    <PagamentoBoard
      payments={payments}
      summary={summary}
      summaryLoading={summaryLoading}
      onViewDetails={vi.fn()}
      onChanged={onChanged}
    />,
  );
}

function column(name: string) {
  return screen.getByRole("region", { name });
}

function cardFor(patientName: string) {
  return screen.getByRole("listitem", { name: `Pagamento de ${patientName}` });
}

describe("PagamentoBoard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    updatePagamento.mockResolvedValue(basePayment);
  });

  it("mostra a contagem e a soma de cada coluna", () => {
    renderBoard([
      makePayment({ id: 1, patientName: "Ana Souza", planAmount: 120.5 }),
      makePayment({ id: 2, patientName: "Bruno Lima", planAmount: 79.5 }),
      makePayment({ id: 3, patientName: "Carla Dias", status: "Paid", planAmount: 150 }),
      makePayment({ id: 4, patientName: "Diego Alves", status: "Cancelled", planAmount: 45 }),
    ]);

    const pending = column("Pendente");
    expect(within(pending).getByText("2 pagamentos")).toBeInTheDocument();
    expect(
      within(pending).getByTestId("payments-column-total"),
    ).toHaveTextContent("200,00");

    const paid = column("Pago");
    expect(within(paid).getByText("1 pagamento")).toBeInTheDocument();
    expect(
      within(paid).getByTestId("payments-column-total"),
    ).toHaveTextContent("150,00");

    const cancelled = column("Cancelado");
    expect(within(cancelled).getByText("1 pagamento")).toBeInTheDocument();
    expect(
      within(cancelled).getByTestId("payments-column-total"),
    ).toHaveTextContent("45,00");
  });

  it("usa a contagem e o total do resumo no cabeçalho, não os da página", () => {
    renderBoard(
      [
        makePayment({ id: 1, patientName: "Ana Souza", planAmount: 100 }),
        makePayment({ id: 2, patientName: "Bruno Lima", planAmount: 50 }),
        makePayment({
          id: 3,
          patientName: "Carla Dias",
          status: "Paid",
          planAmount: 80,
        }),
      ],
      vi.fn(),
      [
        { status: "Pending", count: 12, total: 3450.75 },
        { status: "Paid", count: 5, total: 900.5 },
        { status: "Cancelled", count: 0, total: 0 },
      ],
    );

    const pending = column("Pendente");
    expect(within(pending).getByText("12 pagamentos")).toBeInTheDocument();
    expect(
      within(pending).getByTestId("payments-column-total"),
    ).toHaveTextContent("3.450,75");
    expect(within(pending).queryByText("2 pagamentos")).not.toBeInTheDocument();

    const paid = column("Pago");
    expect(within(paid).getByText("5 pagamentos")).toBeInTheDocument();
    expect(within(paid).getByTestId("payments-column-total")).toHaveTextContent(
      "900,50",
    );
    expect(within(paid).queryByText("1 pagamento")).not.toBeInTheDocument();

    const cancelled = column("Cancelado");
    expect(within(cancelled).getByText("0 pagamentos")).toBeInTheDocument();
    expect(
      within(cancelled).getByTestId("payments-column-total"),
    ).toHaveTextContent("0,00");
  });

  it("mostra 'Mostrando N de M' quando o resumo tem mais pagamentos que a página", () => {
    renderBoard(
      [
        makePayment({ id: 1, patientName: "Ana Souza", planAmount: 100 }),
        makePayment({ id: 2, patientName: "Bruno Lima", planAmount: 50 }),
        makePayment({
          id: 3,
          patientName: "Carla Dias",
          status: "Paid",
          planAmount: 80,
        }),
      ],
      vi.fn(),
      [
        { status: "Pending", count: 5, total: 750 },
        { status: "Paid", count: 1, total: 80 },
        { status: "Cancelled", count: 0, total: 0 },
      ],
    );

    expect(
      within(column("Pendente")).getByText(
        "Mostrando 2 de 5 · veja as outras páginas",
      ),
    ).toBeInTheDocument();
    expect(
      within(column("Pago")).queryByText(/Mostrando/),
    ).not.toBeInTheDocument();
  });

  it("mostra '—' no cabeçalho enquanto o resumo carrega", () => {
    renderBoard(
      [makePayment({ id: 1, patientName: "Ana Souza", planAmount: 150 })],
      vi.fn(),
      undefined,
      true,
    );

    const pending = column("Pendente");
    expect(within(pending).getAllByText("—")).toHaveLength(2);
    expect(
      within(pending).getByTestId("payments-column-total"),
    ).toHaveTextContent("—");
  });

  it("pede confirmação antes de mover Pendente para Pago e chama a mutação", async () => {
    const user = userEvent.setup();
    const onChanged = vi.fn();
    renderBoard([makePayment({ id: 7, patientName: "Ana Souza" })], onChanged);

    await user.click(
      within(cardFor("Ana Souza")).getByRole("button", { name: /Mover para/ }),
    );
    await user.click(
      screen.getByRole("menuitem", { name: "Marcar como pago" }),
    );

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Marcar como pago?")).toBeInTheDocument();
    expect(updatePagamento).not.toHaveBeenCalled();

    await user.click(
      within(dialog).getByRole("button", { name: "Marcar como pago" }),
    );

    await waitFor(() =>
      expect(updatePagamento).toHaveBeenCalledWith(
        7,
        expect.objectContaining({
          patientId: 2,
          planId: 4,
          referenceMonth: "2026-10-01",
          paymentMethod: "Pix",
          status: "Paid",
        }),
      ),
    );
    expect(toast.success).toHaveBeenCalledWith("Pagamento marcado como pago.");
    expect(onChanged).toHaveBeenCalledTimes(1);
  });

  it("recusa Pago → Pendente e não chama a mutação", async () => {
    const user = userEvent.setup();
    renderBoard([
      makePayment({
        id: 8,
        patientName: "Ana Souza",
        status: "Paid",
        paidAt: "2026-10-05",
      }),
    ]);

    await user.click(
      within(cardFor("Ana Souza")).getByRole("button", { name: /Mover para/ }),
    );
    await user.click(
      screen.getByRole("menuitem", { name: "Marcar como pendente" }),
    );

    expect(toast.error).toHaveBeenCalledWith(
      "Um pagamento pago não pode voltar para pendente.",
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(updatePagamento).not.toHaveBeenCalled();
  });

  it("não deixa cancelar uma cobrança paga online pelo quadro", async () => {
    const user = userEvent.setup();
    renderBoard([
      makePayment({
        id: 9,
        patientName: "Ana Souza",
        status: "Paid",
        paidAt: "2026-10-05",
        paidOnline: true,
        paymentMethod: "Online (Mercado Pago)",
      }),
    ]);

    await user.click(
      within(cardFor("Ana Souza")).getByRole("button", { name: /Mover para/ }),
    );
    await user.click(
      screen.getByRole("menuitem", { name: "Cancelar pagamento" }),
    );

    expect(toast.error).toHaveBeenCalledWith(
      "Uma cobrança paga online não pode ser cancelada pelo quadro. Reembolse na lista.",
    );
    expect(updatePagamento).not.toHaveBeenCalled();
  });
});
