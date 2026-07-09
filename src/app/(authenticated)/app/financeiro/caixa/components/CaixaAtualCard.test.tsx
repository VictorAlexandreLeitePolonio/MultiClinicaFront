import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CaixaAtualCard } from "./CaixaAtualCard";

const getCaixaAtual = vi.fn();
const getMovimentacoesCaixa = vi.fn();

vi.mock("@/services/caixa/caixa.service", () => ({
  getCaixaAtual: () => getCaixaAtual(),
  getMovimentacoesCaixa: (id: number) => getMovimentacoesCaixa(id),
}));

vi.mock("@/services/contasFinanceiras/contasFinanceiras.service", () => ({
  getContasFinanceiras: () => Promise.resolve({ data: [], page: 1, pageSize: 100, totalCount: 0, totalPages: 0 }),
}));

describe("CaixaAtualCard", () => {
  beforeEach(() => {
    getCaixaAtual.mockReset();
    getMovimentacoesCaixa.mockReset();
    getMovimentacoesCaixa.mockResolvedValue([]);
  });

  it("shows the open cash register when one exists", async () => {
    getCaixaAtual.mockResolvedValue({
      id: 1,
      contaFinanceiraId: 1,
      dataAbertura: "2026-07-09T10:00:00Z",
      dataFechamento: null,
      saldoInicial: 100,
      saldoFinalInformado: null,
      saldoFinalCalculado: null,
      diferenca: null,
      status: "Aberto",
      observacao: null,
      createdAt: "2026-07-09T10:00:00Z",
    });

    render(<CaixaAtualCard />);

    await waitFor(() => expect(screen.getByText(/caixa aberto/i)).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /fechar caixa/i })).toBeInTheDocument();
  });

  it("shows the empty state with an Abrir Caixa action when none is open", async () => {
    getCaixaAtual.mockResolvedValue(null);

    render(<CaixaAtualCard />);

    await waitFor(() => expect(screen.getByText(/nenhum caixa aberto/i)).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /abrir caixa/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /fechar caixa/i })).not.toBeInTheDocument();
  });
});
