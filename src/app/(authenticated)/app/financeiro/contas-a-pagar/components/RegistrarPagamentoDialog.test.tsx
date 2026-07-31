import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RegistrarPagamentoDialog } from "./RegistrarPagamentoDialog";

vi.mock("@/app/(authenticated)/app/financeiro/configuracoes/services/contasFinanceiras.service", () => ({
  getContasFinanceiras: vi.fn().mockResolvedValue({ data: [{ id: 2, nome: "Banco", tipo: "Banco", saldoInicial: 0, isActive: true, createdAt: "" }] }),
}));

vi.mock("@/app/(authenticated)/app/financeiro/configuracoes/services/formasPagamento.service", () => ({
  getFormasPagamento: vi.fn().mockResolvedValue({ data: [{ id: 3, nome: "Pix", isActive: true, createdAt: "" }] }),
}));

describe("RegistrarPagamentoDialog", () => {
  it("envia o payload preenchido e desabilita o submit durante a requisição", async () => {
    const user = userEvent.setup();
    let resolveSubmit: (() => void) | undefined;
    const onSubmit = vi.fn(() => new Promise<void>((resolve) => { resolveSubmit = resolve; }));

    render(<RegistrarPagamentoDialog open saldoRestante={100} onClose={vi.fn()} onSubmit={onSubmit} />);

    await screen.findByRole("option", { name: "Banco" });
    await user.selectOptions(screen.getByLabelText("Conta Financeira"), "2");
    await user.selectOptions(screen.getByLabelText("Forma de Pagamento"), "3");
    await user.click(screen.getByRole("button", { name: "Registrar" }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ contaFinanceiraId: 2, formaPagamentoId: 3, valor: 100 }));
    expect(await screen.findByRole("button", { name: /carregando/i })).toBeDisabled();
    await act(async () => {
      resolveSubmit?.();
    });
  });
});
