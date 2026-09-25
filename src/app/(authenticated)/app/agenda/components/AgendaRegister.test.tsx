import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, expect, test, vi } from "vitest";
import AgendaRegister from "./AgendaRegister";

const insertAgenda = vi.fn();
const getProfessionalDaySchedule = vi.fn();

beforeEach(() => {
  insertAgenda.mockReset();
  getProfessionalDaySchedule.mockReset();
});

vi.mock("../hooks/insert", () => ({ useAgendaInsert: () => ({ insertAgenda, isPending: false }) }));
vi.mock("@/hooks/tutorial/useTutorial", () => ({ useTutorial: () => ({ completeTaskTutorial: vi.fn() }) }));
vi.mock("@/app/(authenticated)/app/pacientes/services/patients.service", () => ({ getPatients: () => Promise.resolve({ data: [{ id: 3, name: "Paciente" }] }) }));
vi.mock("../services/appointments.service", () => ({
  getAppointmentProfessionals: () => Promise.resolve([{ id: 7, name: "Dra. Ana" }, { id: 8, name: "Dr. Bruno" }]),
  getProfessionalDaySchedule: (...args: unknown[]) => getProfessionalDaySchedule(...args),
}));

test("mostra a agenda do profissional e preenche um horário livre", async () => {
  getProfessionalDaySchedule.mockImplementation(async (professionalId: number, date: string) => ({
    date, timeZoneId: "America/Sao_Paulo", durationMinutes: 60,
    appointments: professionalId === 7 ? [{ id: 1, patientName: "Paciente ocupado", start: `${date}T10:00:00-03:00`, end: `${date}T11:00:00-03:00` }] : [],
    slots: [{ start: `${date}T11:00:00-03:00`, end: `${date}T12:00:00-03:00`, available: true }],
  }));
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(<QueryClientProvider client={client}><AgendaRegister onBack={vi.fn()} onSave={vi.fn()} /></QueryClientProvider>);
  await userEvent.selectOptions(await screen.findByLabelText(/Profissional \*/), "7");
  expect(getProfessionalDaySchedule).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText("Data *"), { target: { value: "2026-09-28" } });
  expect(screen.getByLabelText("Hora *")).toHaveValue("");
  expect(await screen.findByText("Paciente ocupado")).toBeInTheDocument();
  expect(getProfessionalDaySchedule).toHaveBeenCalledWith(7, "2026-09-28");
  expect(getProfessionalDaySchedule).toHaveBeenCalledTimes(1);
  expect(insertAgenda).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole("button", { name: "11:00 livre" }));
  expect(screen.getByLabelText("Hora *")).toHaveValue("11:00");
  await userEvent.selectOptions(screen.getByLabelText(/Profissional \*/), "8");
  expect(screen.queryByText("Paciente ocupado")).not.toBeInTheDocument();
  expect(getProfessionalDaySchedule).toHaveBeenCalledWith(8, "2026-09-28");
});

test("mantém os campos e mostra conflito recusado pelo servidor", async () => {
  getProfessionalDaySchedule.mockResolvedValue({ date: "2026-09-28", timeZoneId: "America/Sao_Paulo",
    durationMinutes: 60, appointments: [], slots: [] });
  insertAgenda.mockRejectedValueOnce(Object.assign(new Error("Conflito"), {
    isAxiosError: true, response: { data: { code: "APPOINTMENT_CONFLICT", message: "Este horário já está ocupado." } },
  }));
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(<QueryClientProvider client={client}><AgendaRegister onBack={vi.fn()} onSave={vi.fn()} /></QueryClientProvider>);
  await userEvent.selectOptions(await screen.findByLabelText(/Paciente \*/), "3");
  await userEvent.selectOptions(screen.getByLabelText(/Profissional \*/), "7");
  fireEvent.change(screen.getByLabelText("Data *"), { target: { value: "2026-09-28" } });
  await screen.findByText("Nenhuma consulta agendada neste dia.");
  fireEvent.change(screen.getByLabelText("Hora *"), { target: { value: "10:30" } });
  const requestsBeforeSubmit = getProfessionalDaySchedule.mock.calls.length;
  await userEvent.click(screen.getByRole("button", { name: "Cadastrar" }));
  expect(await screen.findByText("Este horário já está ocupado.")).toBeInTheDocument();
  expect(screen.getByLabelText("Data *")).toHaveValue("2026-09-28");
  expect(screen.getByLabelText("Hora *")).toHaveValue("10:30");
  expect(insertAgenda).toHaveBeenCalledWith({ patientId: 3, professionalId: 7,
    appointmentDate: "2026-09-28T13:30:00.000Z" });
  expect(getProfessionalDaySchedule).toHaveBeenCalledTimes(requestsBeforeSubmit);
});

test("avisa sobre horário ocupado antes de enviar o agendamento", async () => {
  getProfessionalDaySchedule.mockResolvedValue({ date: "2026-09-28", timeZoneId: "America/Sao_Paulo",
    durationMinutes: 60,
    appointments: [{ id: 1, patientName: "Paciente ocupado", start: "2026-09-28T10:00:00-03:00", end: "2026-09-28T11:00:00-03:00" }],
    slots: [] });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(<QueryClientProvider client={client}><AgendaRegister onBack={vi.fn()} onSave={vi.fn()} /></QueryClientProvider>);
  await userEvent.selectOptions(await screen.findByLabelText(/Profissional \*/), "7");
  fireEvent.change(screen.getByLabelText("Data *"), { target: { value: "2026-09-28" } });
  await screen.findByText("Paciente ocupado");
  fireEvent.change(screen.getByLabelText("Hora *"), { target: { value: "10:30" } });

  expect(await screen.findByText("Este horário já está ocupado.")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Cadastrar" })).toBeDisabled();
  expect(insertAgenda).not.toHaveBeenCalled();
});
