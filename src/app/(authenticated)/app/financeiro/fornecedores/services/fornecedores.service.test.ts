import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createFornecedor,
  getFornecedores,
  setFornecedorActive,
  updateFornecedor,
} from "./fornecedores.service";

const get = vi.fn();
const post = vi.fn().mockResolvedValue({
  data: { id: 1, nome: "ACME", isActive: true, createdAt: "" },
});
const put = vi.fn().mockResolvedValue({
  data: { id: 1, nome: "ACME Atualizada", isActive: true, createdAt: "" },
});

vi.mock("@/lib/api", () => ({
  default: {
    get: (...args: unknown[]) => get(...args),
    post: (...args: unknown[]) => post(...args),
    put: (...args: unknown[]) => put(...args),
  },
}));

describe("fornecedores.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    get.mockResolvedValue({
      data: { data: [], page: 1, pageSize: 10, totalCount: 0, totalPages: 0 },
    });
  });

  it("busca fornecedores com os filtros e paginação", async () => {
    const params = { nome: "ACME", page: 2, pageSize: 10 };

    await getFornecedores(params);

    expect(get).toHaveBeenCalledWith("/api/fornecedores", { params });
  });

  it("reativa via endpoint correto", async () => {
    await setFornecedorActive(1, true);

    expect(post).toHaveBeenCalledWith("/api/fornecedores/1/reativar");
  });

  it("inativa via endpoint correto", async () => {
    await setFornecedorActive(1, false);

    expect(post).toHaveBeenCalledWith("/api/fornecedores/1/inativar");
  });

  it("cria com payload correto", async () => {
    await createFornecedor({ nome: "ACME" });

    expect(post).toHaveBeenCalledWith("/api/fornecedores", { nome: "ACME" });
  });

  it("edita com payload correto", async () => {
    await updateFornecedor(1, { nome: "ACME Atualizada" });

    expect(put).toHaveBeenCalledWith("/api/fornecedores/1", { nome: "ACME Atualizada" });
  });
});
