import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SidebarGroup } from "./SidebarGroup";

let mockedPathname = "/app";

vi.mock("next/navigation", () => ({
  usePathname: () => mockedPathname,
}));

const items = [
  { href: "/app/financeiro/configuracoes", label: "Configurações", permission: "financeiro.categorias.visualizar" },
  { href: "/app/financeiro/caixa", label: "Caixa", permission: "financeiro.caixa.visualizar" },
];

describe("SidebarGroup", () => {
  it("hides the whole group when no child permission is granted", () => {
    mockedPathname = "/app";

    render(<SidebarGroup label="Financeiro" icon={<span />} items={items} can={() => false} />);

    expect(screen.queryByText("Financeiro")).not.toBeInTheDocument();
  });

  it("shows only the items whose permission is granted", () => {
    mockedPathname = "/app";

    render(
      <SidebarGroup
        label="Financeiro"
        icon={<span />}
        items={items}
        can={(permission) => permission === "financeiro.caixa.visualizar"}
      />
    );

    expect(screen.getByText("Financeiro")).toBeInTheDocument();
    expect(screen.queryByText("Configurações")).not.toBeInTheDocument();
  });

  it("expands automatically when a child route is active", () => {
    mockedPathname = "/app/financeiro/caixa";

    render(<SidebarGroup label="Financeiro" icon={<span />} items={items} can={() => true} />);

    expect(screen.getByText("Caixa")).toBeInTheDocument();
    expect(screen.getByText("Configurações")).toBeInTheDocument();
  });

  it("starts closed and expands on click when no child route is active", async () => {
    mockedPathname = "/app";
    const user = userEvent.setup();

    render(<SidebarGroup label="Financeiro" icon={<span />} items={items} can={() => true} />);

    expect(screen.queryByText("Caixa")).not.toBeInTheDocument();

    await user.click(screen.getByText("Financeiro"));

    expect(screen.getByText("Caixa")).toBeInTheDocument();
  });
});
