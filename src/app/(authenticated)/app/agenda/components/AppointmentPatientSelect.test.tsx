import { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, expect, test, vi } from "vitest";
import { AppointmentPatientSelect } from "./AppointmentPatientSelect";

const { getPatients } = vi.hoisted(() => ({ getPatients: vi.fn() }));
vi.mock("@/app/(authenticated)/app/pacientes/services/patients.service", () => ({ getPatients }));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ tenant: { id: 42 } }) }));

function Harness() {
  const [value, onChange] = useState(0);
  return <AppointmentPatientSelect value={value} onChange={onChange} />;
}

function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(<QueryClientProvider client={client}><Harness /></QueryClientProvider>);
  return client;
}

beforeEach(() => { getPatients.mockReset(); });

test("pagina, mantém a seleção e busca com debounce voltando à primeira página", async () => {
  getPatients.mockImplementation(async ({ name, page }: { name?: string; page: number }) => ({
    data: name ? [{ id: 3, name: "João" }] : page === 1 ? [{ id: 1, name: "Ana" }] : [{ id: 2, name: "Bruno" }],
    totalCount: name ? 1 : 20,
  }));
  setup();
  await screen.findByRole("option", { name: "Ana" });
  await userEvent.selectOptions(screen.getByLabelText("Paciente *"), "1");
  await userEvent.click(screen.getByRole("button", { name: "Próximos pacientes" }));
  await screen.findByRole("option", { name: "Bruno" });
  expect(screen.getByLabelText("Paciente *")).toHaveValue("1");
  expect(screen.getByRole("option", { name: "Ana" })).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText("Buscar paciente"), { target: { value: "João" } });
  expect(getPatients).toHaveBeenLastCalledWith({ name: undefined, isActive: true, page: 2, pageSize: 10 });
  await screen.findByRole("option", { name: "João" });
  expect(getPatients).toHaveBeenLastCalledWith({ name: "João", isActive: true, page: 1, pageSize: 10 });
  expect(screen.getByLabelText("Paciente *")).toHaveValue("1");
});

test("distingue falha de lista vazia e oferece nova tentativa e cadastro", async () => {
  getPatients.mockRejectedValueOnce(new Error("offline")).mockResolvedValue({ data: [], totalCount: 0 });
  setup();
  expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível carregar");
  expect(screen.queryByText("Nenhum paciente ativo cadastrado.")).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
  await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Nenhum paciente ativo cadastrado."));
  expect(screen.getByRole("link", { name: "Cadastrar paciente em outra aba" })).toHaveAttribute("target", "_blank");
});
