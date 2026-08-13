import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SidebarGroup } from "./SidebarGroup";

let mockedPathname = "/app";

vi.mock("next/navigation", () => ({
  usePathname: () => mockedPathname,
}));

const items = [
  { href: "/app/estoque/produtos", label: "Produtos", permission: "estoque.produtos.visualizar" },
  { href: "/app/estoque/movimentacoes", label: "Movimentações", permission: "estoque.movimentacoes.visualizar" },
];

describe("SidebarGroup", () => {
  it("hides the whole group when no child permission is granted", () => {
    mockedPathname = "/app";

    render(<SidebarGroup label="Estoque" icon={<span />} items={items} can={() => false} />);

    expect(screen.queryByText("Estoque")).not.toBeInTheDocument();
  });

  it("shows only the items whose permission is granted", () => {
    mockedPathname = "/app";

    render(
      <SidebarGroup
        label="Estoque"
        icon={<span />}
        items={items}
        can={(permission) => permission === "estoque.movimentacoes.visualizar"}
      />
    );

    expect(screen.getByText("Estoque")).toBeInTheDocument();
    expect(screen.queryByText("Produtos")).not.toBeInTheDocument();
  });

  it("expands automatically when a child route is active", () => {
    mockedPathname = "/app/estoque/movimentacoes";

    render(<SidebarGroup label="Estoque" icon={<span />} items={items} can={() => true} />);

    expect(screen.getByText("Movimentações")).toBeInTheDocument();
    expect(screen.getByText("Produtos")).toBeInTheDocument();
  });

  it("starts closed and expands on click when no child route is active", async () => {
    mockedPathname = "/app";
    const user = userEvent.setup();

    render(<SidebarGroup label="Estoque" icon={<span />} items={items} can={() => true} />);

    expect(screen.queryByText("Movimentações")).not.toBeInTheDocument();

    await user.click(screen.getByText("Estoque"));

    expect(screen.getByText("Movimentações")).toBeInTheDocument();
  });
});
