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
  default: ({ open }: { open: boolean }) =>
    open ? (
      <div role="dialog" aria-label="Novo paciente">
        Cadastro de paciente
      </div>
    ) : null,
}));

vi.mock("./components/PacienteDetails", () => ({
  default: () => null,
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
  expect(screen.getByText("Cadastro de paciente")).toBeInTheDocument();
  expect(screen.getByText("Lista de pacientes")).toBeInTheDocument();
});
