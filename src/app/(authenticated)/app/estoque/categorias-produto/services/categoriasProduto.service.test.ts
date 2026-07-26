import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCategoriasProduto, setCategoriaProdutoActive } from "./categoriasProduto.service";
const get = vi.fn(); const post = vi.fn().mockResolvedValue({ data: {} });
vi.mock("@/lib/api", () => ({ default: { get: (...args: unknown[]) => get(...args), post: (...args: unknown[]) => post(...args) } }));
describe("categoriasProduto.service", () => { beforeEach(() => { vi.clearAllMocks(); get.mockResolvedValue({ data: [] }); }); it("busca categorias", async () => { const params = { nome: "med", page: 1, pageSize: 10 }; await getCategoriasProduto(params); expect(get).toHaveBeenCalledWith("/api/categorias-produto", { params }); }); it("reativa categoria", async () => { await setCategoriaProdutoActive(2, true); expect(post).toHaveBeenCalledWith("/api/categorias-produto/2/reativar"); }); });
