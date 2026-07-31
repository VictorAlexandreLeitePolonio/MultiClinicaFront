import { describe, expect, it, vi } from "vitest";
import { ajustarEstoque, cancelarMovimentacao, registrarEntrada } from "./movimentacoes.service";
const post = vi.fn().mockResolvedValue({ data: {} });
vi.mock("@/lib/api", () => ({ default: { post: (...args: unknown[]) => post(...args) } }));
describe("movimentacoes.service", () => { it("registra entrada", async () => { const payload = { produtoId: 1, quantidade: 3, observacao: "Compra" }; await registrarEntrada(payload); expect(post).toHaveBeenCalledWith("/api/estoque/movimentacoes/entrada", payload); }); it("ajusta com nova quantidade", async () => { const payload = { produtoId: 1, novaQuantidade: 10, observacao: "Inventário" }; await ajustarEstoque(payload); expect(post).toHaveBeenCalledWith("/api/estoque/movimentacoes/ajuste", payload); }); it("cancela com motivo", async () => { await cancelarMovimentacao(5, "Erro"); expect(post).toHaveBeenCalledWith("/api/estoque/movimentacoes/5/cancelar", { motivo: "Erro" }); }); });
