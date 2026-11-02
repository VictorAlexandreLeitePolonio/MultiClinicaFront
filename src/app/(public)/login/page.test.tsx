import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "./page";

const { replaceMock, loginUserMock, toastErrorMock } = vi.hoisted(() => ({
  replaceMock: vi.fn(),
  loginUserMock: vi.fn(),
  toastErrorMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock, push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ setAuth: vi.fn(), isAuthenticated: false, user: null }),
}));
vi.mock("./hooks/login", () => ({
  useLogin: () => ({ loginUser: loginUserMock, loading: false, error: null }),
}));
vi.mock("sonner", () => ({
  toast: { error: toastErrorMock, success: vi.fn() },
}));
vi.mock("@/components/auth/AuthBrandPanel", () => ({
  AuthBrandPanel: () => null,
}));
vi.mock("@/components/ui/Logo", () => ({
  Logo: () => <span>Cliniq</span>,
}));

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza o formulário sem o robô do palco antigo", () => {
    render(<LoginPage />);

    expect(
      screen.getByRole("heading", { name: "Acesso ao Sistema" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/E-mail/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Senha/)).toBeInTheDocument();
    expect(screen.queryByText("Estou por aqui.")).not.toBeInTheDocument();
  });

  it("mostra a mensagem de erro quando as credenciais falham", async () => {
    loginUserMock.mockResolvedValue({ success: false, error: "E-mail ou senha inválidos." });
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/E-mail/), "ana@clinica.test");
    await user.type(screen.getByLabelText(/Senha/), "secret123");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("E-mail ou senha inválidos.");
    expect(toastErrorMock).toHaveBeenCalledWith("E-mail ou senha inválidos.");
    expect(replaceMock).not.toHaveBeenCalled();
  });
});
