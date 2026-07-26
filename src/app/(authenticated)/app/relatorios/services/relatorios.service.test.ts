import { describe, expect, it, vi } from "vitest";
import { getFaturamento, getResultado } from "./relatorios.service";
const get = vi.fn().mockResolvedValue({ data: [] });
vi.mock("@/lib/api", () => ({ default: { get: (...args: unknown[]) => get(...args) } }));
describe("relatorios.service", () => { it("envia período e agrupamento para faturamento", async () => { const params = { de: "2026-07-01", ate: "2026-07-31", agruparPor: "Categoria" as const }; await getFaturamento(params); expect(get).toHaveBeenCalledWith("/api/relatorios/faturamento", { params }); }); it("consulta resultado pelo período", async () => { const params = { de: "2026-07-01", ate: "2026-07-31" }; await getResultado(params); expect(get).toHaveBeenCalledWith("/api/relatorios/resultado", { params }); }); });
