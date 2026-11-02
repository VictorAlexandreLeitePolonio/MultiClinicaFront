import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { User } from "@/types";
import { CommandPalette } from "./CommandPalette";

const push = vi.fn();
let mockedUser: User | null = null;

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/app",
  useSearchParams: () => ({ toString: () => "" }),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: mockedUser,
    can: () => true,
  }),
}));

vi.mock("@/contexts/PatientAuthContext", () => ({
  usePatientAuth: () => ({ patient: null, logout: vi.fn() }),
}));

vi.mock("@/app/(public)/login/services/auth.service", () => ({
  logout: vi.fn(),
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light", setTheme: vi.fn() }),
}));

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
Element.prototype.scrollIntoView = vi.fn();

describe("CommandPalette", () => {
  beforeEach(() => {
    push.mockClear();
    mockedUser = {
      id: 1,
      name: "Usuário",
      email: "usuario@multi.test",
      role: "Administrador",
      clinicName: "Clínica Centro",
    };
  });

  it("opens with Ctrl+K", () => {
    render(<CommandPalette />);

    expect(screen.queryByPlaceholderText("Buscar no Cliniq...")).not.toBeInTheDocument();

    fireEvent.keyDown(document, { key: "k", ctrlKey: true });

    expect(screen.getByPlaceholderText("Buscar no Cliniq...")).toBeInTheDocument();
    expect(screen.getByText("Ir para")).toBeInTheDocument();
  });

  it("opens from the topbar command event", () => {
    render(<CommandPalette />);

    fireEvent(window, new Event("cliniq:command"));

    expect(screen.getByPlaceholderText("Buscar no Cliniq...")).toBeInTheDocument();
  });

  it("does not show Prontuários for Recepcao", () => {
    mockedUser = {
      id: 2,
      name: "Recepção",
      email: "recepcao@multi.test",
      role: "Recepcao",
      clinicName: "Clínica Centro",
    };

    render(<CommandPalette />);
    fireEvent.keyDown(document, { key: "k", ctrlKey: true });

    expect(screen.getByText("Pacientes")).toBeInTheDocument();
    expect(screen.getByText("Agenda")).toBeInTheDocument();
    expect(screen.queryByText("Prontuários")).not.toBeInTheDocument();
    expect(screen.queryByText("Usuários")).not.toBeInTheDocument();
    expect(screen.queryByText("Balanço")).not.toBeInTheDocument();
  });

  it("navigates to the selected item on Enter", async () => {
    render(<CommandPalette />);
    fireEvent.keyDown(document, { key: "k", ctrlKey: true });

    const input = screen.getByPlaceholderText("Buscar no Cliniq...");
    fireEvent.change(input, { target: { value: "Fichas de medição" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => expect(push).toHaveBeenCalledWith("/app/fichas"));
    await waitFor(() =>
      expect(screen.queryByPlaceholderText("Buscar no Cliniq...")).not.toBeInTheDocument(),
    );
  });
});
