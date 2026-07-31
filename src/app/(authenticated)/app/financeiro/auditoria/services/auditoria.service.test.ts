import { describe, expect, it, vi } from "vitest";
import { getAuditoria } from "./auditoria.service";
const get = vi.fn().mockResolvedValue({ data: [] });
vi.mock("@/lib/api", () => ({ default: { get: (...args: unknown[]) => get(...args) } }));
describe("auditoria.service", () => { it("busca com filtros e paginação", async () => { const params = { modulo: "ContasPagar", entidade: "ContaPagar", page: 1, pageSize: 20 }; await getAuditoria(params); expect(get).toHaveBeenCalledWith("/api/auditoria-financeira", { params }); }); });
