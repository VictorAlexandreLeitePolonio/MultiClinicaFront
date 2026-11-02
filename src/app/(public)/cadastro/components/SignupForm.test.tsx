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

async function goToOwnerStep(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/Nome da clínica/), "Clínica Vida");
  await user.click(screen.getByRole("button", { name: "Continuar" }));
  await screen.findByRole("heading", { name: "Seu acesso" });
}

async function goToPlanStep(user: ReturnType<typeof userEvent.setup>) {
  await goToOwnerStep(user);
  await user.type(screen.getByLabelText(/Seu nome/), "Ana Souza");
  await user.type(screen.getByLabelText(/E-mail/), "ana@clinica.test");
  await user.type(screen.getByLabelText(/Telefone/), "11999999999");
  await user.type(screen.getByLabelText(/^Senha/), "secret123");
  await user.type(screen.getByLabelText(/Confirmar senha/), "secret123");
  await user.click(screen.getByRole("button", { name: "Continuar" }));
  await screen.findByRole("heading", { name: "Plano e termos" });
}

describe("SignupForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    searchParamsMock.mockReturnValue(new URLSearchParams());
  });

  it("não avança para o passo seguinte com o passo atual inválido", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.click(screen.getByRole("button", { name: "Continuar" }));

    expect(await screen.findByText("Informe o nome da clínica.")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Seu acesso" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/E-mail/)).not.toBeInTheDocument();
  });

  it("valida e-mail inválido e senhas diferentes antes de avançar do responsável", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);
    await goToOwnerStep(user);

    await user.type(screen.getByLabelText(/Seu nome/), "Ana Souza");
    await user.type(screen.getByLabelText(/E-mail/), "sem-arroba");
    await user.type(screen.getByLabelText(/Telefone/), "11999999999");
    await user.type(screen.getByLabelText(/^Senha/), "secret123");
    await user.type(screen.getByLabelText(/Confirmar senha/), "outra123");
    await user.click(screen.getByRole("button", { name: "Continuar" }));

    expect(await screen.findByText("Informe um e-mail válido.")).toBeInTheDocument();
    expect(screen.getByText("As senhas não coincidem.")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Plano e termos" })).not.toBeInTheDocument();
    expect(signup).not.toHaveBeenCalled();
  });

  it("não envia sem aceitar os termos no passo 3", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);
    await goToPlanStep(user);

    await user.click(screen.getByRole("button", { name: "Criar conta" }));

    expect(await screen.findByText("Aceite os termos para continuar.")).toBeInTheDocument();
    expect(signup).not.toHaveBeenCalled();
  });

  it("envia o cadastro no passo 3, guarda o plano escolhido e mostra a confirmação", async () => {
    searchParamsMock.mockReturnValue(new URLSearchParams("plano=Premium&ciclo=Annual"));
    vi.mocked(signup).mockResolvedValue(undefined);
    vi.mocked(resendSignupEmail).mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<SignupForm />);
    await goToPlanStep(user);

    expect(screen.getByText(/Você escolheu o Premium anual/)).toBeInTheDocument();
    await user.click(screen.getByRole("checkbox", { name: /termos de uso/ }));
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
    expect(await screen.findByRole("heading", { name: "Confira seu e-mail" })).toBeInTheDocument();
    expect(screen.getByText(/Você escolheu o Premium anual/)).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("cliniq:signup-plan") ?? "null")).toEqual({
      plan: "Premium",
      cycle: "Annual",
    });

    await user.click(screen.getByRole("button", { name: /Reenviar e-mail/ }));

    await waitFor(() => expect(resendSignupEmail).toHaveBeenCalledWith("ana@clinica.test"));
  });
});
