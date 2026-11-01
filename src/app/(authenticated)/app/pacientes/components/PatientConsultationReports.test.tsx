import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, expect, test, vi } from "vitest";
import { PatientConsultationReports } from "./PatientConsultationReports";

const service = vi.hoisted(() => ({
  getPatientConsultationReports: vi.fn(),
}));

vi.mock("../../agenda/services/consultation.service", () => service);

function renderReports() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <PatientConsultationReports patientId={3} />
    </QueryClientProvider>
  );
}

beforeEach(() => {
  service.getPatientConsultationReports.mockReset();
});

test("lista os relatórios com link para o agendamento", async () => {
  service.getPatientConsultationReports.mockResolvedValue([
    {
      id: 1,
      appointmentId: 10,
      appointmentDate: "2026-11-01T13:00:00.000Z",
      professionalName: "Dra. Ana",
      status: "Ready",
      reviewed: true,
    },
  ]);
  renderReports();

  expect(await screen.findByText("Dra. Ana")).toBeInTheDocument();
  expect(screen.getByText("Relatório pronto")).toBeInTheDocument();
  expect(screen.getByText("Sim")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "01/11/2026" })).toHaveAttribute(
    "href",
    "/app/agenda?mode=view&id=10"
  );
});

test("mostra o vazio quando não há consulta gravada", async () => {
  service.getPatientConsultationReports.mockResolvedValue([]);
  renderReports();

  expect(await screen.findByText("Nenhuma consulta gravada.")).toBeInTheDocument();
});
