import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import type { Patient } from "@/types";
import PacienteFocusForm from "./PacienteFocusForm";

const hooks = vi.hoisted(() => ({
  insertPaciente: vi.fn(),
  updatePaciente: vi.fn(),
  refetch: vi.fn(),
  patient: null as Patient | null,
}));

vi.mock("../hooks/insert", () => ({
  usePacienteInsert: () => ({ insertPaciente: hooks.insertPaciente, isPending: false }),
}));

vi.mock("../hooks/update", () => ({
  usePacienteUpdate: () => ({ updatePaciente: hooks.updatePaciente, isPending: false }),
}));

vi.mock("../hooks/getId", () => ({
  usePacienteById: () => ({ data: hooks.patient, loading: false, error: null, refetch: hooks.refetch }),
}));

beforeEach(() => {
  hooks.insertPaciente.mockReset();
  hooks.updatePaciente.mockReset();
  hooks.refetch.mockReset();
  hooks.patient = null;
});

function renderCreate() {
  return render(
    <PacienteFocusForm mode="create" open onClose={vi.fn()} onSaved={vi.fn()} />,
  );
}

it("mostra uma etapa por vez no cadastro de paciente", async () => {
  const user = userEvent.setup();
  renderCreate();

  expect(screen.getByRole("dialog", { name: "Novo paciente" })).toBeInTheDocument();
  expect(screen.getByLabelText("Nome")).toBeInTheDocument();
  expect(screen.queryByLabelText("Rua")).not.toBeInTheDocument();

  await user.type(screen.getByLabelText("E-mail"), "ana@cliniq.local");
  await user.type(screen.getByLabelText("CPF"), "52998224725");
  await user.type(screen.getByLabelText("Telefone"), "11999990000");
  await user.click(screen.getByRole("button", { name: "Continuar" }));

  expect(await screen.findByLabelText("Rua")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Cadastrar paciente" })).toBeInTheDocument();
});

it("não avança quando os dados obrigatórios estão inválidos", async () => {
  const user = userEvent.setup();
  renderCreate();

  await user.click(screen.getByRole("button", { name: "Continuar" }));

  expect(await screen.findByText("E-mail é obrigatório")).toBeInTheDocument();
  expect(screen.getByLabelText("Nome")).toBeInTheDocument();
  expect(screen.queryByLabelText("Rua")).not.toBeInTheDocument();
});

it("abre os detalhes preenchidos e com a etapa de acesso ao portal", async () => {
  hooks.patient = {
    id: 7,
    name: "Ana Souza",
    email: "ana@cliniq.local",
    cpf: "52998224725",
    rg: null,
    phone: "11999990000",
    rua: "Rua das Flores",
    numero: "10",
    bairro: "Centro",
    cidade: "São Paulo",
    estado: "SP",
    cep: "01001000",
    birthDate: "1990-01-01",
    isActive: true,
    appointmentStatus: null,
    paymentStatus: null,
    portalAccessStatus: null,
  };

  render(
    <PacienteFocusForm
      mode="edit"
      open
      patientId={7}
      onClose={vi.fn()}
      onSaved={vi.fn()}
    />,
  );

  expect(await screen.findByDisplayValue("Ana Souza")).toBeInTheDocument();
  expect(screen.getByText("Acesso ao portal")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /etapa 3: acesso ao portal/i })).toBeInTheDocument();
});

