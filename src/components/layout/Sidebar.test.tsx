import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { User } from "@/types";
import { Sidebar } from "./Sidebar";

let mockedUser: User | null = null;
let mockedPermissions: string[] = [];

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: mockedUser,
    setUser: vi.fn(),
    can: (permission: string) => mockedPermissions.includes(permission),
  }),
}));

vi.mock("@/app/(public)/login/services/auth.service", () => ({
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
    };
    mockedPermissions = [];
  });

  it("shows all clinic modules for Administrador", () => {
    render(<Sidebar area="clinic" />);

    expect(screen.getByText("Pacientes")).toBeInTheDocument();
    expect(screen.getByText("Agenda")).toBeInTheDocument();
    expect(screen.getByText("Prontuários")).toBeInTheDocument();
    expect(screen.getByText("Pagamentos")).toBeInTheDocument();
    expect(screen.getByText("Balanço")).toBeInTheDocument();
    expect(screen.queryByText("Financeiro")).not.toBeInTheDocument();
    expect(screen.queryByText("Relatórios")).not.toBeInTheDocument();
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
    expect(screen.queryByText("Balanço")).not.toBeInTheDocument();
    expect(screen.queryByText("Financeiro")).not.toBeInTheDocument();
    expect(screen.queryByText("Relatórios")).not.toBeInTheDocument();
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

  it("does not render removed financial groups", () => {
    mockedUser = {
      id: 4,
      name: "Sem permissão",
      email: "sempermissao@multi.test",
      role: "Administrador",
      clinicName: "Clínica Centro",
    };

    render(<Sidebar area="clinic" />);

    expect(screen.queryByText("Financeiro")).not.toBeInTheDocument();
    expect(screen.queryByText("Relatórios")).not.toBeInTheDocument();
    expect(screen.getByText("Balanço")).toBeInTheDocument();
  });

  it("shows clinic settings only with the view permission", () => {
    mockedUser = {
      id: 5,
      name: "Administrador",
      email: "admin@multi.test",
      role: "Administrador",
      clinicName: "Clínica Centro",
    };
    mockedPermissions = ["clinic.settings.view"];

    render(<Sidebar area="clinic" />);

    expect(screen.getByText("Configurações")).toBeInTheDocument();
  });
});
