import { describe, expect, it, vi } from "vitest";
import { setCategoriaFinanceiraActive } from "./categoriasFinanceiras.service";

const post = vi.fn().mockResolvedValue({
  data: { id: 1, nome: "Consultas", tipo: "Receita", isActive: true, createdAt: "" },
});

vi.mock("@/lib/api", () => ({
  default: { post: (...args: unknown[]) => post(...args) },
}));

describe("setCategoriaFinanceiraActive", () => {
  it("calls the reativar endpoint when active is true", async () => {
    await setCategoriaFinanceiraActive(1, true);

    expect(post).toHaveBeenCalledWith("/api/categorias-financeiras/1/reativar");
  });

  it("calls the inativar endpoint when active is false", async () => {
    await setCategoriaFinanceiraActive(1, false);

    expect(post).toHaveBeenCalledWith("/api/categorias-financeiras/1/inativar");
  });
});
