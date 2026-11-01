import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, expect, test, vi } from "vitest";
import { Appointment } from "@/types";
import AgendaDetails from "./AgendaDetails";

const agendaHook = vi.hoisted(() => ({ useAgendaById: vi.fn() }));
const updateHook = vi.hoisted(() => ({ useAgendaUpdate: vi.fn() }));
const patientsService = vi.hoisted(() => ({ getPatients: vi.fn() }));
const appointmentsService = vi.hoisted(() => ({
  getAppointmentProfessionals: vi.fn(),
}));
const authState = vi.hoisted(() => ({
  role: "Administrador" as "SuperAdmin" | "Administrador" | "Profissional" | "Recepcao",
}));

vi.mock("../hooks/getId", () => agendaHook);
vi.mock("../hooks/update", () => updateHook);
vi.mock("@/app/(authenticated)/app/pacientes/services/patients.service", () => patientsService);
vi.mock("../services/appointments.service", () => appointmentsService);
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: 1, role: authState.role } }),
}));
vi.mock("./consultation/ConsultationTab", () => ({
  ConsultationTab: () => <div>Consulta da sessão</div>,
}));
vi.mock("./consultation/StartConsultationButton", () => ({
  StartConsultationButton: () => <button type="button">Iniciar consulta</button>,
}));

const appointment: Appointment = {
  id: 10,
  professionalId: 7,
  patientId: 3,
  patientName: "Ana Silva",
  appointmentDate: "2026-11-01T13:00:00.000Z",
  status: "Completed",
  createdAt: "2026-10-20T10:00:00.000Z",
  timeZoneId: "America/Sao_Paulo",
};

function renderDetails(data: Appointment = appointment) {
  agendaHook.useAgendaById.mockReturnValue({
    data,
    loading: false,
    error: null,
    refetch: vi.fn(),
  });
  updateHook.useAgendaUpdate.mockReturnValue({ updateAgenda: vi.fn(), isPending: false });

  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <AgendaDetails id={data.id} onBack={vi.fn()} onSave={vi.fn()} />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  agendaHook.useAgendaById.mockReset();
  updateHook.useAgendaUpdate.mockReset();
  authState.role = "Administrador";
  patientsService.getPatients.mockReset().mockResolvedValue({
    data: [{ id: 3, name: "Ana Silva" }],
    page: 1,
    pageSize: 10,
    totalCount: 1,
    totalPages: 1,
  });
  appointmentsService.getAppointmentProfessionals.mockReset().mockResolvedValue([
    { id: 7, name: "Dra. Ana" },
  ]);
});

test("mostra a consulta e o resumo com link para o prontuário", async () => {
  renderDetails({ ...appointment, consultationStatus: "Ready" });

  expect(await screen.findByText("Consulta da sessão")).toBeInTheDocument();
  expect(screen.getByText("Dra. Ana")).toBeInTheDocument();
  expect(screen.getByText("01/11/2026 10:00")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Ana Silva" })).toHaveAttribute(
    "href",
    "/app/pacientes?mode=profile&id=3",
  );
});

test("não mostra Editar quando a consulta já foi gravada", () => {
  renderDetails({ ...appointment, consultationStatus: "Ready" });

  expect(screen.queryByRole("button", { name: "Editar" })).not.toBeInTheDocument();
});

test("não mostra a seção Ações quando a consulta já foi gravada", () => {
  renderDetails({ ...appointment, consultationStatus: "Ready" });

  expect(screen.queryByRole("heading", { name: "Ações" })).not.toBeInTheDocument();
});

test("Recepção vê o aviso no lugar da consulta gravada", () => {
  authState.role = "Recepcao";
  renderDetails({ ...appointment, consultationStatus: "Ready" });

  expect(
    screen.getByText(
      "Consulta gravada. O relatório fica disponível para os profissionais.",
    ),
  ).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Consulta" })).toBeInTheDocument();
  expect(screen.queryByText("Consulta da sessão")).not.toBeInTheDocument();
});

test("mostra Editar quando ainda não há consulta", () => {
  renderDetails();

  expect(screen.getByRole("button", { name: "Editar" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Iniciar consulta" })).toBeInTheDocument();
});
