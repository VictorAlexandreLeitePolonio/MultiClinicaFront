import { describe, expect, it, vi } from "vitest";
import { aprovarCompra, getCompras } from "./compras.service";
const get = vi.fn().mockResolvedValue({ data: [] }); const post = vi.fn().mockResolvedValue({ data: {} });
vi.mock("@/lib/api", () => ({ default: { get: (...args: unknown[]) => get(...args), post: (...args: unknown[]) => post(...args) } }));
describe("compras.service", () => { it("lista com filtros", async () => { const params = { status: "Aprovada" as const, page: 1, pageSize: 10 }; await getCompras(params); expect(get).toHaveBeenCalledWith("/api/compras", { params }); }); it("aprova compra", async () => { await aprovarCompra(7); expect(post).toHaveBeenCalledWith("/api/compras/7/aprovar"); }); });
