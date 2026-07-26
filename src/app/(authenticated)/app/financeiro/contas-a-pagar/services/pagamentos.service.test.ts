import { beforeEach, describe, expect, it, vi } from "vitest";
import { estornarPagamento, registrarPagamento } from "./pagamentos.service";

const post = vi.fn().mockResolvedValue({ data: {} });

vi.mock("@/lib/api", () => ({
  default: {
    post: (...args: unknown[]) => post(...args),
  },
}));

describe("pagamentos.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("registra pagamento no endpoint /api/pagamentos", async () => {
    const payload = {
      contaPagarId: 1,
      contaFinanceiraId: 2,
      formaPagamentoId: 3,
      valor: 100,
      dataPagamento: "2026-07-26",
    };

    await registrarPagamento(payload);

    expect(post).toHaveBeenCalledWith("/api/pagamentos", payload);
  });

  it("estorna pagamento no endpoint correto", async () => {
    await estornarPagamento(5, { motivo: "Duplicidade" });

    expect(post).toHaveBeenCalledWith("/api/pagamentos/5/estornar", {
      motivo: "Duplicidade",
    });
  });
});
