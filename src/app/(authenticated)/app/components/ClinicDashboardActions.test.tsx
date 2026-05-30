import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ClinicDashboardActions } from "./ClinicDashboardActions";

describe("ClinicDashboardActions", () => {
  it("shows all operational shortcuts for Administrador", () => {
    render(<ClinicDashboardActions role="Administrador" />);

    expect(screen.getByRole("link", { name: "Abrir Agenda" })).toHaveAttribute("href", "/app/agenda");
    expect(screen.getByRole("link", { name: "Abrir Pacientes" })).toHaveAttribute("href", "/app/pacientes");
    expect(screen.getByRole("link", { name: "Abrir Prontuários" })).toHaveAttribute("href", "/app/prontuarios");
    expect(screen.getByRole("link", { name: "Abrir Pagamentos" })).toHaveAttribute("href", "/app/pagamentos");
    expect(screen.getByRole("link", { name: "Abrir Financeiro" })).toHaveAttribute("href", "/app/financeiro");
    expect(screen.getByRole("link", { name: "Abrir Planos" })).toHaveAttribute("href", "/app/planos");
    expect(screen.getByRole("link", { name: "Abrir Usuários" })).toHaveAttribute("href", "/app/usuarios");
  });

  it("limits Profissional shortcuts to clinical work", () => {
    render(<ClinicDashboardActions role="Profissional" />);

    expect(screen.getByRole("link", { name: "Abrir Agenda" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Abrir Pacientes" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Abrir Prontuários" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Abrir Pagamentos" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Abrir Financeiro" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Abrir Usuários" })).not.toBeInTheDocument();
  });

  it("limits Recepcao shortcuts to front desk work", () => {
    render(<ClinicDashboardActions role="Recepcao" />);

    expect(screen.getByRole("link", { name: "Abrir Agenda" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Abrir Pacientes" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Abrir Pagamentos" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Abrir Prontuários" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Abrir Financeiro" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Abrir Planos" })).not.toBeInTheDocument();
  });
});
