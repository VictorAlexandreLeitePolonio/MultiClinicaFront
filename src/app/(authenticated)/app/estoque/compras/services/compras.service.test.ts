import { describe, expect, it, vi } from "vitest";
import { aprovarCompra, gerarContaPagar, getCompras } from "./compras.service";
const get = vi.fn().mockResolvedValue({ data: [] }); const post = vi.fn().mockResolvedValue({ data: {} });
vi.mock("@/lib/api", () => ({ default: { get: (...args: unknown[]) => get(...args), post: (...args: unknown[]) => post(...args) } }));
describe("compras.service", () => { it("lista com filtros", async () => { const params = { status: "Aprovada" as const, page: 1, pageSize: 10 }; await getCompras(params); expect(get).toHaveBeenCalledWith("/api/compras", { params }); }); it("aprova compra", async () => { await aprovarCompra(7); expect(post).toHaveBeenCalledWith("/api/compras/7/aprovar"); }); it("gera conta a pagar com data e categoria", async () => { const payload = { dataVencimento: "2026-08-10", categoriaFinanceiraId: null }; await gerarContaPagar(7, payload); expect(post).toHaveBeenCalledWith("/api/compras/7/gerar-conta-pagar", payload); }); });
