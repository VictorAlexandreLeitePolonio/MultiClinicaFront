import { describe, expect, it, vi } from "vitest";
import { setContaFinanceiraActive } from "./contasFinanceiras.service";

const post = vi.fn().mockResolvedValue({
  data: { id: 1, nome: "Caixa Principal", tipo: "Caixa", saldoInicial: 0, isActive: true, createdAt: "" },
});

vi.mock("@/lib/api", () => ({
  default: { post: (...args: unknown[]) => post(...args) },
}));

describe("setContaFinanceiraActive", () => {
  it("calls the reativar endpoint when active is true", async () => {
    await setContaFinanceiraActive(1, true);

    expect(post).toHaveBeenCalledWith("/api/contas-financeiras/1/reativar");
  });

  it("calls the inativar endpoint when active is false", async () => {
    await setContaFinanceiraActive(1, false);

    expect(post).toHaveBeenCalledWith("/api/contas-financeiras/1/inativar");
  });
});
