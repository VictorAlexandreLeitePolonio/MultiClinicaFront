import type { ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { resendSignupEmail, signup } from "@/app/(public)/cadastro/services/signup.service";
import { SignupForm } from "./SignupForm";

const { searchParamsMock } = vi.hoisted(() => ({ searchParamsMock: vi.fn() }));

vi.mock("next/navigation", () => ({ useSearchParams: searchParamsMock }));
vi.mock("@/components/auth/AuthLayout", () => ({
  AuthLayout: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock("@/app/(public)/cadastro/services/signup.service", () => ({
  signup: vi.fn(),
  resendSignupEmail: vi.fn(),
}));

async function fillForm(confirmation = "secret123") {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(/Nome da clínica/), "Clínica Vida");
  await user.type(screen.getByLabelText(/Seu nome/), "Ana Souza");
  await user.type(screen.getByLabelText(/E-mail/), "ana@clinica.test");
  await user.type(screen.getByLabelText(/Telefone/), "11999999999");
  await user.type(screen.getByLabelText(/^Senha/), "secret123");
  await user.type(screen.getByLabelText(/Confirmar senha/), confirmation);
  return user;
}

describe("SignupForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    searchParamsMock.mockReturnValue(new URLSearchParams());
  });

  it("valida e-mail inválido e senhas diferentes antes de enviar", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(screen.getByLabelText(/Nome da clínica/), "Clínica Vida");
    await user.type(screen.getByLabelText(/Seu nome/), "Ana Souza");
    await user.type(screen.getByLabelText(/E-mail/), "sem-arroba");
    await user.type(screen.getByLabelText(/Telefone/), "11999999999");
    await user.type(screen.getByLabelText(/^Senha/), "secret123");
    await user.type(screen.getByLabelText(/Confirmar senha/), "outra123");
    await user.click(screen.getByRole("button", { name: "Criar conta" }));

    expect(await screen.findByText("Informe um e-mail válido.")).toBeInTheDocument();
    expect(screen.getByText("As senhas não coincidem.")).toBeInTheDocument();
    expect(signup).not.toHaveBeenCalled();
  });

  it("envia o cadastro, guarda o plano escolhido e mostra a confirmação", async () => {
    searchParamsMock.mockReturnValue(new URLSearchParams("plano=Premium&ciclo=Annual"));
    vi.mocked(signup).mockResolvedValue(undefined);
    vi.mocked(resendSignupEmail).mockResolvedValue(undefined);
    render(<SignupForm />);
    const user = await fillForm();

    await user.click(screen.getByRole("button", { name: "Criar conta" }));

    await waitFor(() =>
      expect(signup).toHaveBeenCalledWith({
        clinicName: "Clínica Vida",
        ownerName: "Ana Souza",
        email: "ana@clinica.test",
        phone: "11999999999",
        password: "secret123",
      }),
    );
    expect(await screen.findByText("Confira seu e-mail")).toBeInTheDocument();
    expect(screen.getByText(/Você escolheu o Premium anual/)).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("cliniq:signup-plan") ?? "null")).toEqual({
      plan: "Premium",
      cycle: "Annual",
    });

    await user.click(screen.getByRole("button", { name: /Reenviar e-mail/ }));

    await waitFor(() => expect(resendSignupEmail).toHaveBeenCalledWith("ana@clinica.test"));
  });
});
