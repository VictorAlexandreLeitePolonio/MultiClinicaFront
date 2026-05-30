import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "./AuthContext";

const getCurrentUser = vi.fn();

vi.mock("@/services/auth/auth.service", () => ({
  getCurrentUser: () => getCurrentUser(),
}));

function AuthState() {
  const { user, initialLoading, isAuthenticated } = useAuth();

  if (initialLoading) return <span>Carregando</span>;

  return (
    <div>
      <span>{isAuthenticated ? "Autenticado" : "Deslogado"}</span>
      <span>{user?.name ?? "Sem usuário"}</span>
    </div>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    getCurrentUser.mockReset();
  });

  it("restores the session from the backend /me endpoint", async () => {
    getCurrentUser.mockResolvedValue({
      id: 1,
      name: "Ana Gestora",
      email: "ana@multi.test",
      role: "Administrador",
      clinicName: "Clínica Centro",
    });

    render(
      <AuthProvider>
        <AuthState />
      </AuthProvider>
    );

    expect(screen.getByText("Carregando")).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText("Autenticado")).toBeInTheDocument());
    expect(screen.getByText("Ana Gestora")).toBeInTheDocument();
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
});
