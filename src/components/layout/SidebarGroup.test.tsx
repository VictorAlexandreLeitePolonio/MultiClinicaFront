import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SidebarGroup } from "./SidebarGroup";
import { SidebarLink } from "./SidebarLink";
import { trackModuleClick } from "@/lib/analytics";

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


describe("module click analytics", () => {
  afterEach(() => vi.unstubAllGlobals());

  it.each([
    ["/app/agenda", "Agenda", "clinic"],
    ["/paciente/consultas", "Consultas", "patient"],
  ])("tracks one click on collapsed link %s", async (href, label, area) => {
    const gtag = vi.fn();
    vi.stubGlobal("gtag", gtag);
    render(<SidebarLink href={href} label={label} icon={<span />} collapsed />);
    expect(gtag).not.toHaveBeenCalled();
    await userEvent.click(screen.getByTitle(label));
    expect(gtag).toHaveBeenCalledExactlyOnceWith("event", "module_click", {
      area, module_name: label, module_path: href, navigation_location: "sidebar",
    });
  });

  it("tracks stock links but not expanding the group", async () => {
    mockedPathname = "/app";
    const gtag = vi.fn();
    vi.stubGlobal("gtag", gtag);
    render(<SidebarGroup label="Estoque" icon={<span />} items={items} can={() => true} />);
    await userEvent.click(screen.getByText("Estoque"));
    expect(gtag).not.toHaveBeenCalled();
    await userEvent.click(screen.getByText("Produtos"));
    expect(gtag).toHaveBeenCalledExactlyOnceWith("event", "module_click", {
      area: "clinic", module_name: "Produtos", module_path: "/app/estoque/produtos", navigation_location: "sidebar",
    });
  });

  it("supports mobile navigation and excludes superadmin", () => {
    const gtag = vi.fn();
    vi.stubGlobal("gtag", gtag);
    trackModuleClick("/superadmin", "Dashboard");
    expect(gtag).not.toHaveBeenCalled();
    trackModuleClick("/paciente", "Início", "bottom_navigation");
    expect(gtag).toHaveBeenCalledExactlyOnceWith("event", "module_click", {
      area: "patient", module_name: "Início", module_path: "/paciente", navigation_location: "bottom_navigation",
    });
  });

  it("keeps links usable when Analytics is unavailable", async () => {
    vi.stubGlobal("gtag", undefined);
    render(<SidebarLink href="/app/agenda" label="Agenda" icon={<span />} />);
    await userEvent.click(screen.getByRole("link", { name: "Agenda" }));
    expect(screen.getByRole("link", { name: "Agenda" })).toHaveAttribute("href", "/app/agenda");
  });
});
