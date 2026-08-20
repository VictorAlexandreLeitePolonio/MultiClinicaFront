import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PatientAuthProvider, usePatientAuth } from "./PatientAuthContext";

const me = vi.fn();
const login = vi.fn();
const logout = vi.fn();

vi.mock("@/app/(patient-public)/paciente/services/patient-auth.service", () => ({
  me: () => me(),
  login: (p: unknown) => login(p),
  logout: () => logout(),
}));

const session = { id: 1, name: "Ana Paciente", email: "ana@paciente.test", status: "Active" as const };

function Consumer() {
  const { patient, isAuthenticated, isLoading, login: doLogin, logout: doLogout } = usePatientAuth();
  if (isLoading) return <span>Carregando</span>;
  return (
    <div>
      <span>{isAuthenticated ? "Autenticado" : "Deslogado"}</span>
      <span>{patient?.name ?? "Sem paciente"}</span>
      <button onClick={() => doLogin("ana@paciente.test", "12345678")}>entrar</button>
      <button onClick={() => doLogout()}>sair</button>
    </div>
  );
}

const renderProvider = () =>
  render(
    <PatientAuthProvider>
      <Consumer />
    </PatientAuthProvider>,
  );

describe("PatientAuthProvider", () => {
  beforeEach(() => {
    me.mockReset();
    login.mockReset();
    logout.mockReset();
  });

  it("restaura a sessão a partir do endpoint /me", async () => {
    me.mockResolvedValue(session);
    renderProvider();
    expect(await screen.findByText("Autenticado")).toBeInTheDocument();
    expect(screen.getByText("Ana Paciente")).toBeInTheDocument();
  });

  it("permanece deslogado quando /me falha (sem sessão)", async () => {
    me.mockRejectedValue(new Error("401"));
    renderProvider();
    expect(await screen.findByText("Deslogado")).toBeInTheDocument();
  });

  it("login popula a sessão do paciente", async () => {
    me.mockRejectedValue(new Error("401"));
    login.mockResolvedValue(session);
    renderProvider();
    await screen.findByText("Deslogado");

    await userEvent.click(screen.getByText("entrar"));

    await waitFor(() => expect(screen.getByText("Autenticado")).toBeInTheDocument());
    expect(login).toHaveBeenCalledWith({ email: "ana@paciente.test", password: "12345678" });
  });

  it("logout limpa a sessão do paciente", async () => {
    me.mockResolvedValue(session);
    logout.mockResolvedValue(undefined);
    renderProvider();
    await screen.findByText("Autenticado");

    await userEvent.click(screen.getByText("sair"));

    await waitFor(() => expect(screen.getByText("Deslogado")).toBeInTheDocument());
    expect(logout).toHaveBeenCalled();
  });
});
