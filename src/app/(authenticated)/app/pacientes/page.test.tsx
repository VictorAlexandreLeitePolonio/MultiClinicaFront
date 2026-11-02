import { render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import Page from "./page";

const navigation = vi.hoisted(() => ({
  params: new URLSearchParams(),
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => navigation.params,
  useRouter: () => ({ push: navigation.push }),
}));

vi.mock("./components/PacienteList", () => ({
  default: () => <div>Lista de pacientes</div>,
}));

vi.mock("./components/PacienteRegister", () => ({
  default: ({ variant }: { variant?: string }) => <div>Cadastro {variant}</div>,
  PACIENTE_FOCUS_SECTIONS: [
    { id: "dados-pessoais", label: "Dados pessoais" },
    { id: "endereco", label: "Endereço" },
  ],
}));

vi.mock("./components/PacienteDetails", () => ({
  default: () => <div>Detalhes do paciente</div>,
}));

vi.mock("./components/PacienteProfile", () => ({
  default: () => <div>Perfil do paciente</div>,
}));

beforeEach(() => {
  navigation.params = new URLSearchParams();
  navigation.push.mockReset();
});

it("abre o cadastro em modo foco mantendo a lista renderizada", async () => {
  navigation.params = new URLSearchParams({ mode: "create" });

  render(<Page />);

  expect(await screen.findByRole("dialog", { name: "Novo paciente" })).toBeInTheDocument();
  expect(screen.getByText("Cadastro focus")).toBeInTheDocument();
  expect(screen.getByText("Lista de pacientes")).toBeInTheDocument();
});
