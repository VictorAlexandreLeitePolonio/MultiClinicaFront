import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProdutoList } from "./ProdutoList";

const can = vi.fn();
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ can }) }));
vi.mock("@/hooks/tutorial/useTutorial", () => ({ useTutorial: () => ({ completeTaskTutorial: vi.fn() }) }));
vi.mock("../hooks/useProdutos", () => ({
  useProdutos: () => ({ data: { data: [{ id: 1, nome: "Luva", categoriaProdutoId: null, descricao: null, codigoInterno: null, codigoBarras: null, valorCompra: 4, valorVenda: 8, quantidadeAtual: 3, quantidadeMinima: 1, isActive: true, createdAt: "" }], totalPages: 1 }, isLoading: false, isError: false, error: null, refetch: vi.fn() }),
  useProdutoMutations: () => ({ createProduto: vi.fn(), updateProduto: vi.fn(), setProdutoActive: vi.fn(), isCreating: false, isUpdating: false, isSettingActive: false }),
}));
vi.mock("../../categorias-produto/hooks/useCategoriasProduto", () => ({ useCategoriasProduto: () => ({ data: { data: [] } }) }));
vi.mock("@/components/ui/ActionsDropdown", () => ({ ActionsDropdown: ({ actions }: { actions: { label: string }[] }) => <div>{actions.map((action) => <span key={action.label}>{action.label}</span>)}</div> }));

describe("ProdutoList", () => { beforeEach(() => { vi.clearAllMocks(); can.mockReturnValue(true); }); it("esconde custo, venda e ações quando não há permissões", () => { can.mockImplementation((permission: string) => !["estoque.produtos.visualizar_custo", "estoque.produtos.visualizar_preco_venda", "estoque.produtos.editar", "estoque.produtos.inativar"].includes(permission)); render(<ProdutoList />); expect(screen.queryByText("Custo")).not.toBeInTheDocument(); expect(screen.queryByText("Venda")).not.toBeInTheDocument(); expect(screen.queryByText("Editar")).not.toBeInTheDocument(); }); it("mostra valores e ação de inativar com permissões", () => { render(<ProdutoList />); expect(screen.getByText("Custo")).toBeInTheDocument(); expect(screen.getByText("Venda")).toBeInTheDocument(); expect(screen.getByText("Editar")).toBeInTheDocument(); expect(screen.getByText("Inativar")).toBeInTheDocument(); }); });
