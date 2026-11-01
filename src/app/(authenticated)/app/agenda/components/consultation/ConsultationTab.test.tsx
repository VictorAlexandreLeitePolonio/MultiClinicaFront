import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, expect, test, vi } from "vitest";
import { Appointment } from "@/types";
import { ConsultationReport } from "@/types/consultation";
import { PatientEvolution } from "@/types/evolution";
import { ConsultationTab } from "./ConsultationTab";

const service = vi.hoisted(() => ({
  getConsultation: vi.fn(),
  retryConsultation: vi.fn(),
  updateConsultationReport: vi.fn(),
  reviewConsultation: vi.fn(),
  createEvolutionFromConsultation: vi.fn(),
}));

const patientRecord = vi.hoisted(() => ({
  getPatientEvolutions: vi.fn(),
}));

const appointmentsService = vi.hoisted(() => ({
  getAppointmentProfessionals: vi.fn(),
}));

vi.mock("../../services/consultation.service", () => service);
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock(
  "@/app/(authenticated)/app/pacientes/services/patient-record.service",
  () => patientRecord,
);
vi.mock("../../services/appointments.service", () => appointmentsService);
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: 7, role: "Administrador", name: "Dra. Ana" } }),
}));
vi.mock("@/components/evolution/EvolutionSheet", () => ({
  EvolutionSheet: ({ evolutionId, open }: { evolutionId?: number | null; open: boolean }) =>
    open ? <div role="dialog">Evolução {evolutionId ?? "nova"}</div> : null,
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
  consultationStatus: "Ready",
  consultationReviewed: false,
};

const baseReport: ConsultationReport = {
  id: 1,
  appointmentId: 10,
  patientId: 3,
  professionalId: 7,
  status: "Ready",
  failureReason: null,
  startedAt: "2026-11-01T13:00:00.000Z",
  endedAt: "2026-11-01T13:30:00.000Z",
  chunkCount: 4,
  durationSeconds: 1800,
  transcript: "Paciente relata dor lombar.",
  subjective: "Dor lombar há três dias.",
  objective: "Exame físico sem alterações.",
  assessment: "Lombalgia mecânica.",
  plan: "Analgésico e retorno.",
  suggestedReturnDays: 7,
  reportPending: false,
  minutesCharged: 30,
  reviewedAt: null,
  reviewedByUserId: null,
  evolutionIds: [],
};

const evolution: PatientEvolution = {
  id: 99,
  patientId: 3,
  appointmentId: 10,
  templateNames: ["Escala de dor"],
  professionalId: 7,
  serviceId: null,
  date: "2026-11-01T15:00:00.000Z",
  description: null,
  conduct: null,
  observations: null,
  nextGuidance: null,
  status: "Draft",
  values: [],
};

function emptyEvolutions() {
  return { data: [], page: 1, pageSize: 10, totalCount: 0, totalPages: 0 };
}

function renderTab(data: Appointment = appointment) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <ConsultationTab appointment={data} />
    </QueryClientProvider>
  );
}

beforeEach(() => {
  service.getConsultation.mockReset();
  service.retryConsultation.mockReset();
  service.updateConsultationReport.mockReset();
  service.reviewConsultation.mockReset();
  service.createEvolutionFromConsultation.mockReset();

  patientRecord.getPatientEvolutions.mockReset().mockResolvedValue(emptyEvolutions());
  appointmentsService.getAppointmentProfessionals.mockReset().mockResolvedValue([
    { id: 7, name: "Dra. Ana" },
  ]);
});

test("não renderiza nada quando o agendamento não tem consulta", () => {
  const { container } = renderTab({ ...appointment, consultationStatus: null });

  expect(container).toBeEmptyDOMElement();
  expect(service.getConsultation).not.toHaveBeenCalled();
});

test("mostra gravação em andamento", async () => {
  service.getConsultation.mockResolvedValue({ ...baseReport, status: "Recording", transcript: null });
  renderTab();

  expect(await screen.findByText("Gravação em andamento")).toBeInTheDocument();
});

test("mostra transcrição enquanto processa", async () => {
  service.getConsultation.mockResolvedValue({ ...baseReport, status: "Processing", transcript: null });
  renderTab();

  expect(await screen.findByText("Transcrevendo e gerando o relatório…")).toBeInTheDocument();
});

test("mostra relatório pendente com a transcrição recolhível", async () => {
  service.getConsultation.mockResolvedValue({ ...baseReport, reportPending: true });
  renderTab();

  expect(await screen.findByText("Relatório aguardando a IA")).toBeInTheDocument();
  expect(screen.getByText("Transcrição")).toBeInTheDocument();
  expect(screen.getByText("Paciente relata dor lombar.")).toBeInTheDocument();
});

test("mostra o editor SOAP quando o relatório está pronto", async () => {
  service.getConsultation.mockResolvedValue(baseReport);
  renderTab();

  expect(await screen.findByLabelText("Subjetivo")).toHaveValue("Dor lombar há três dias.");
  expect(screen.getByLabelText("Objetivo")).toHaveValue("Exame físico sem alterações.");
  expect(screen.getByLabelText("Avaliação")).toHaveValue("Lombalgia mecânica.");
  expect(screen.getByLabelText("Plano")).toHaveValue("Analgésico e retorno.");
});

test("mostra duração, quem gravou e a revisão no cabeçalho", async () => {
  service.getConsultation.mockResolvedValue({
    ...baseReport,
    reviewedAt: "2026-11-01T14:00:00.000Z",
  });
  renderTab();

  expect(await screen.findByText("Duração 30:00")).toBeInTheDocument();
  expect(
    await screen.findByText(/Gravado por Dra\. Ana em \d{2}\/\d{2}\/\d{4}/),
  ).toBeInTheDocument();
  expect(screen.getByText(/Revisado em/)).toBeInTheDocument();
});

test("lista as evoluções desta consulta com status e fichas", async () => {
  service.getConsultation.mockResolvedValue(baseReport);
  patientRecord.getPatientEvolutions.mockResolvedValue({
    data: [evolution],
    page: 1,
    pageSize: 10,
    totalCount: 1,
    totalPages: 1,
  });
  renderTab();

  expect(await screen.findByText("Escala de dor")).toBeInTheDocument();
  expect(screen.getByText("Rascunho")).toBeInTheDocument();
  expect(screen.getByText("01/11/2026")).toBeInTheDocument();
  expect(patientRecord.getPatientEvolutions).toHaveBeenCalledWith(3, { appointmentId: 10 });
});

test("gera uma evolução da consulta e abre o painel lateral", async () => {
  service.getConsultation.mockResolvedValue(baseReport);
  service.createEvolutionFromConsultation.mockResolvedValue({ evolutionId: 99 });
  renderTab();

  const generate = await screen.findByRole("button", { name: "Gerar evolução" });
  await userEvent.click(generate);

  await waitFor(() =>
    expect(service.createEvolutionFromConsultation).toHaveBeenCalledWith(10),
  );
  expect(await screen.findByRole("dialog")).toHaveTextContent("Evolução 99");
});

test("mostra o motivo da falha e tenta novamente", async () => {
  service.getConsultation.mockResolvedValue({
    ...baseReport,
    status: "Failed",
    failureReason: "Transcrição indisponível",
  });
  service.retryConsultation.mockResolvedValue(undefined);
  renderTab();

  expect(await screen.findByText("Transcrição indisponível")).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));

  expect(service.retryConsultation).toHaveBeenCalledWith(10);
});

test("mostra gravação interrompida quando não há motivo", async () => {
  service.getConsultation.mockResolvedValue({
    ...baseReport,
    status: "Interrupted",
    failureReason: null,
  });
  renderTab();

  expect(await screen.findByText("Gravação interrompida")).toBeInTheDocument();
});
