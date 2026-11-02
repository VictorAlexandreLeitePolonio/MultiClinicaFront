import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, expect, test, vi } from "vitest";
import { Appointment } from "@/types";
import { ConsultationReport } from "@/types/consultation";
import { SoapReportEditor } from "./SoapReportEditor";

const service = vi.hoisted(() => ({
  getConsultation: vi.fn(),
  retryConsultation: vi.fn(),
  updateConsultationReport: vi.fn(),
  reviewConsultation: vi.fn(),
  createEvolutionFromConsultation: vi.fn(),
}));

const router = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("../../services/consultation.service", () => service);
vi.mock("next/navigation", () => ({ useRouter: () => router }));

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

const report: ConsultationReport = {
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

function renderEditor(data: ConsultationReport = report) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <SoapReportEditor appointment={appointment} report={data} />
    </QueryClientProvider>
  );
}

beforeEach(() => {
  service.updateConsultationReport.mockReset();
  service.reviewConsultation.mockReset();
  service.createEvolutionFromConsultation.mockReset();
  router.push.mockReset();
});

test("edita e salva os quatro campos do relatório", async () => {
  service.updateConsultationReport.mockResolvedValue(undefined);
  renderEditor();

  const subjective = screen.getByLabelText("Subjetivo");
  await userEvent.clear(subjective);
  await userEvent.type(subjective, "Nova queixa");
  await userEvent.click(screen.getByRole("button", { name: "Salvar" }));

  await waitFor(() =>
    expect(service.updateConsultationReport).toHaveBeenCalledWith(10, {
      subjective: "Nova queixa",
      objective: "Exame físico sem alterações.",
      assessment: "Lombalgia mecânica.",
      plan: "Analgésico e retorno.",
    })
  );
});

test("marca a consulta como revisada", async () => {
  service.reviewConsultation.mockResolvedValue(undefined);
  renderEditor();

  await userEvent.click(screen.getByRole("button", { name: "Marcar como revisado" }));

  expect(service.reviewConsultation).toHaveBeenCalledWith(10);
  expect(await screen.findByText("Revisado")).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Marcar como revisado" })).not.toBeInTheDocument();
});

test("agenda retorno com a data da consulta somada aos dias sugeridos", async () => {
  renderEditor();

  await userEvent.click(screen.getByRole("button", { name: "Agendar retorno" }));

  expect(router.push).toHaveBeenCalledWith(
    "/app/agenda?mode=create&patientId=3&professionalId=7&date=2026-11-08"
  );
});

test("agenda retorno sem data quando não há retorno sugerido", async () => {
  renderEditor({ ...report, suggestedReturnDays: null });

  await userEvent.click(screen.getByRole("button", { name: "Agendar retorno" }));

  expect(router.push).toHaveBeenCalledWith(
    "/app/agenda?mode=create&patientId=3&professionalId=7"
  );
});

test("usa o fuso da clínica ao calcular o dia da consulta", async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <SoapReportEditor
        appointment={{ ...appointment, appointmentDate: "2026-11-01T02:30:00.000Z" }}
        report={{ ...report, suggestedReturnDays: 1 }}
      />
    </QueryClientProvider>
  );

  await userEvent.click(screen.getByRole("button", { name: "Agendar retorno" }));

  expect(router.push).toHaveBeenCalledWith(
    "/app/agenda?mode=create&patientId=3&professionalId=7&date=2026-11-01"
  );
});

test("mostra a transcrição recolhível", () => {
  renderEditor();

  expect(screen.getByText("Transcrição")).toBeInTheDocument();
  expect(screen.getByText("Paciente relata dor lombar.")).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Gerar evolução" })).not.toBeInTheDocument();
});
