import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FornecedorList } from "./FornecedorList";

const can = vi.fn();
const setFornecedorActive = vi.fn().mockResolvedValue(undefined);
const createFornecedor = vi.fn().mockResolvedValue(undefined);
const updateFornecedor = vi.fn().mockResolvedValue(undefined);

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ can }),
}));

vi.mock("../hooks/useFornecedores", () => ({
  useFornecedores: () => ({
    data: {
      data: [{ id: 1, nome: "ACME", isActive: true, createdAt: "2026-07-26T00:00:00Z" }],
      page: 1,
      pageSize: 10,
      totalCount: 1,
      totalPages: 1,
    },
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
  useFornecedorMutations: () => ({
    createFornecedor,
    updateFornecedor,
    setFornecedorActive,
    isCreating: false,
    isUpdating: false,
    isSettingActive: false,
  }),
}));

vi.mock("@/components/ui/ActionsDropdown", () => ({
  ActionsDropdown: ({ actions }: { actions: { label: string; onClick: () => void }[] }) => (
    <div>
      {actions.map((action) => (
        <button key={action.label} type="button" onClick={action.onClick}>
          {action.label}
        </button>
      ))}
    </div>
  ),
}));

describe("FornecedorList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    can.mockReturnValue(true);
  });

  it("shows active actions only when the user has the permission", () => {
    can.mockImplementation((permission: string) => permission !== "financeiro.fornecedores.inativar");

    render(<FornecedorList />);

    expect(screen.getByRole("button", { name: "Editar" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Inativar" })).not.toBeInTheDocument();
  });

  it("opens the confirmation when inativar is selected", () => {
    render(<FornecedorList />);

    fireEvent.click(screen.getByRole("button", { name: "Inativar" }));

    expect(screen.getByText("Inativar fornecedor")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Inativar" })).toBeInTheDocument();
  });
});
