import { describe, expect, it, vi } from "vitest";
import { setFormaPagamentoActive } from "./formasPagamento.service";

const post = vi.fn().mockResolvedValue({
  data: { id: 1, nome: "Dinheiro", isActive: true, createdAt: "" },
});

vi.mock("@/lib/api", () => ({
  default: { post: (...args: unknown[]) => post(...args) },
}));

describe("setFormaPagamentoActive", () => {
  it("calls the reativar endpoint when active is true", async () => {
    await setFormaPagamentoActive(1, true);

    expect(post).toHaveBeenCalledWith("/api/formas-pagamento/1/reativar");
  });

  it("calls the inativar endpoint when active is false", async () => {
    await setFormaPagamentoActive(1, false);

    expect(post).toHaveBeenCalledWith("/api/formas-pagamento/1/inativar");
  });
});
