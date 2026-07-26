import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  cancelarContaPagar,
  createContaPagar,
} from "./contasPagar.service";

const get = vi.fn();
const post = vi.fn().mockResolvedValue({ data: {} });
const put = vi.fn().mockResolvedValue({ data: {} });

vi.mock("@/lib/api", () => ({
  default: {
    get: (...args: unknown[]) => get(...args),
    post: (...args: unknown[]) => post(...args),
    put: (...args: unknown[]) => put(...args),
  },
}));

describe("contasPagar.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("cancela via endpoint correto", async () => {
    await cancelarContaPagar(3, "Duplicidade");

    expect(post).toHaveBeenCalledWith("/api/contas-pagar/3/cancelar", {
      motivo: "Duplicidade",
    });
  });

  it("monta o payload manual de criação", async () => {
    const payload = {
      fornecedorId: 1,
      categoriaFinanceiraId: 2,
      descricao: "Aluguel",
      valorOriginal: 100,
      valorDesconto: 0,
      valorJuros: 0,
      dataEmissao: "2026-07-26",
      dataVencimento: "2026-07-30",
    };

    await createContaPagar(payload);

    expect(post).toHaveBeenCalledWith("/api/contas-pagar", {
      ...payload,
      origem: "Manual",
    });
  });
});
