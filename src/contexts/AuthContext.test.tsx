import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "./AuthContext";

const getCurrentUser = vi.fn();

vi.mock("@/app/(public)/login/services/auth.service", () => ({
  getCurrentUser: () => getCurrentUser(),
}));

function AuthState() {
  const { user, tenant, initialLoading, isAuthenticated, can } = useAuth();

  if (initialLoading) return <span>Carregando</span>;

  return (
    <div>
      <span>{isAuthenticated ? "Autenticado" : "Deslogado"}</span>
      <span>{user?.name ?? "Sem usuário"}</span>
      <span>{tenant?.displayName ?? "Sem clínica"}</span>
      <span>{can("clinic.dashboard.view") ? "Pode dashboard" : "Não pode dashboard"}</span>
      <span>{can("clinic.users.view") ? "Pode usuários" : "Não pode usuários"}</span>
    </div>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    getCurrentUser.mockReset();
  });

  it("restores the session from the backend /me endpoint", async () => {
    getCurrentUser.mockResolvedValue({
      user: {
        id: 1,
        name: "Ana Gestora",
        email: "ana@multi.test",
        role: "Administrador",
        clinicName: "Clínica Centro",
      },
      tenant: {
        id: 10,
        name: "Clínica Centro Ltda.",
        displayName: "Clínica Centro",
        logoUrl: null,
        primaryColor: null,
        secondaryColor: null,
        accentColor: null,
        contactEmail: null,
        contactPhone: null,
      },
      permissions: [],
    });

    render(
      <AuthProvider>
        <AuthState />
      </AuthProvider>
    );

    expect(screen.getByText("Carregando")).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText("Autenticado")).toBeInTheDocument());
    expect(screen.getByText("Ana Gestora")).toBeInTheDocument();
    expect(screen.getByText("Clínica Centro")).toBeInTheDocument();
    expect(getCurrentUser).toHaveBeenCalledTimes(1);
  });

  it("does not require a client persisted user when /me fails", async () => {
    getCurrentUser.mockRejectedValue(new Error("unauthorized"));

    render(
      <AuthProvider>
        <AuthState />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByText("Deslogado")).toBeInTheDocument());
    expect(screen.getByText("Sem usuário")).toBeInTheDocument();
  });

  it("exposes can() based on the permissions array returned by /me", async () => {
    getCurrentUser.mockResolvedValue({
      user: {
        id: 1,
        name: "Recepção",
        email: "recep@multi.test",
        role: "Recepcao",
        clinicName: "Clínica Centro",
      },
      tenant: null,
      permissions: ["clinic.dashboard.view"],
    });

    render(
      <AuthProvider>
        <AuthState />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByText("Autenticado")).toBeInTheDocument());
    expect(screen.getByText("Pode dashboard")).toBeInTheDocument();
    expect(screen.getByText("Não pode usuários")).toBeInTheDocument();
  });

  it("can() returns false for everything when there is no user", async () => {
    getCurrentUser.mockRejectedValue(new Error("unauthorized"));

    render(
      <AuthProvider>
        <AuthState />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByText("Deslogado")).toBeInTheDocument());
    expect(screen.getByText("Não pode dashboard")).toBeInTheDocument();
  });
});
