import { describe, expect, it, vi } from "vitest";
import { getAuditoria } from "./auditoria.service";

const get = vi.fn().mockResolvedValue({ data: { data: [], page: 1, pageSize: 20, totalCount: 0, totalPages: 0 } });
vi.mock("@/lib/api", () => ({ default: { get: (...args: unknown[]) => get(...args) } }));

describe("auditoria.service", () => {
  it("consulta a trilha com endpoint e params", async () => {
    const params = { modulo: "Estoque", entidade: "Produto", dataInicio: "2026-08-01", dataFim: "2026-08-31", page: 2, pageSize: 20 };
    await getAuditoria(params);
    expect(get).toHaveBeenCalledWith("/api/financeiro/auditoria", { params });
  });
});
