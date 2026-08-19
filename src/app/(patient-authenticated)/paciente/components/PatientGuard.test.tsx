import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PatientGuard } from "./PatientGuard";

const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

let authValue: { isAuthenticated: boolean; isLoading: boolean };
vi.mock("@/contexts/PatientAuthContext", () => ({
  usePatientAuth: () => authValue,
}));

describe("PatientGuard", () => {
  beforeEach(() => replace.mockReset());

  it("bloqueia rota privada e redireciona quando não há sessão", async () => {
    authValue = { isAuthenticated: false, isLoading: false };
    render(
      <PatientGuard>
        <span>conteúdo protegido</span>
      </PatientGuard>,
    );

    expect(screen.queryByText("conteúdo protegido")).not.toBeInTheDocument();
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/paciente/login"));
  });

  it("não redireciona enquanto carrega", () => {
    authValue = { isAuthenticated: false, isLoading: true };
    render(
      <PatientGuard>
        <span>conteúdo protegido</span>
      </PatientGuard>,
    );
    expect(replace).not.toHaveBeenCalled();
    expect(screen.queryByText("conteúdo protegido")).not.toBeInTheDocument();
  });

  it("renderiza o conteúdo quando autenticado", () => {
    authValue = { isAuthenticated: true, isLoading: false };
    render(
      <PatientGuard>
        <span>conteúdo protegido</span>
      </PatientGuard>,
    );
    expect(screen.getByText("conteúdo protegido")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});
