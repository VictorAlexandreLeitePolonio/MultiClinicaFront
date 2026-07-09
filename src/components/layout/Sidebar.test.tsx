import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { User } from "@/types";
import { Sidebar } from "./Sidebar";

let mockedUser: User | null = null;

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: mockedUser,
    setUser: vi.fn(),
    can: (permission: string) => mockedUser?.permissions?.includes(permission) ?? false,
  }),
}));

vi.mock("@/services/auth/auth.service", () => ({
  logout: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => "/app",
}));

describe("Sidebar", () => {
  beforeEach(() => {
    mockedUser = {
      id: 1,
      name: "Usuário",
      email: "usuario@multi.test",
      role: "Administrador",
      clinicName: "Clínica Centro",
      permissions: ["financeiro.formas_pagamento.visualizar"],
    };
  });

  it("shows all clinic modules for Administrador", () => {
    render(<Sidebar area="clinic" />);

    expect(screen.getByText("Pacientes")).toBeInTheDocument();
    expect(screen.getByText("Agenda")).toBeInTheDocument();
    expect(screen.getByText("Prontuários")).toBeInTheDocument();
    expect(screen.getByText("Pagamentos")).toBeInTheDocument();
    expect(screen.getByText("Balanço (legado)")).toBeInTheDocument();
    expect(screen.getByText("Financeiro")).toBeInTheDocument();
    expect(screen.getByText("Usuários")).toBeInTheDocument();
    expect(screen.getByText("Planos")).toBeInTheDocument();
  });

  it("limits clinic modules for Recepcao", () => {
    mockedUser = {
      id: 2,
      name: "Recepção",
      email: "recepcao@multi.test",
      role: "Recepcao",
      clinicName: "Clínica Centro",
    };

    render(<Sidebar area="clinic" />);

    expect(screen.getByText("Pacientes")).toBeInTheDocument();
    expect(screen.getByText("Agenda")).toBeInTheDocument();
    expect(screen.getByText("Pagamentos")).toBeInTheDocument();
    expect(screen.queryByText("Prontuários")).not.toBeInTheDocument();
    expect(screen.queryByText("Balanço (legado)")).not.toBeInTheDocument();
    expect(screen.queryByText("Financeiro")).not.toBeInTheDocument();
    expect(screen.queryByText("Usuários")).not.toBeInTheDocument();
    expect(screen.queryByText("Planos")).not.toBeInTheDocument();
  });

  it("shows only SuperAdmin modules in the global area", () => {
    mockedUser = {
      id: 3,
      name: "Global",
      email: "global@multi.test",
      role: "SuperAdmin",
    };

    render(<Sidebar area="superadmin" />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Clínicas")).toBeInTheDocument();
    expect(screen.getByText("Cobranças")).toBeInTheDocument();
    expect(screen.getByText("Histórico")).toBeInTheDocument();
    expect(screen.queryByText("Pacientes")).not.toBeInTheDocument();
  });

  it("hides the Financeiro group when the user has no financial permission", () => {
    mockedUser = {
      id: 4,
      name: "Sem permissão",
      email: "sempermissao@multi.test",
      role: "Administrador",
      clinicName: "Clínica Centro",
      permissions: [],
    };

    render(<Sidebar area="clinic" />);

    expect(screen.queryByText("Financeiro")).not.toBeInTheDocument();
  });
});
