import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, expect, test, vi } from "vitest";
import { PatientTimelineEvent } from "@/types/evolution";
import { PatientTimeline } from "./PatientTimeline";

const service = vi.hoisted(() => ({ getPatientTimeline: vi.fn() }));
const router = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("../../services/patient-record.service", () => service);
vi.mock("next/navigation", () => ({ useRouter: () => router }));

const appointmentEvent: PatientTimelineEvent = {
  type: "appointment",
  id: 10,
  date: "2026-11-01T13:00:00.000Z",
  title: "Consulta de retorno",
  professionalName: "Dra. Ana",
  status: "Completed",
  consultationStatus: "Ready",
  appointmentId: null,
  evolutionCount: 2,
  templateNames: [],
};

const evolutionEvent: PatientTimelineEvent = {
  type: "evolution",
  id: 20,
  date: "2026-11-01T14:00:00.000Z",
  title: "Evolução de dor",
  professionalName: "Dra. Ana",
  status: "Completed",
  consultationStatus: null,
  appointmentId: 10,
  evolutionCount: 0,
  templateNames: ["Escala de dor"],
};

const anamnesisEvent: PatientTimelineEvent = {
  type: "anamnesis",
  id: 30,
  date: "2026-10-15T11:00:00.000Z",
  title: "Avaliação inicial",
  professionalName: "Dra. Ana",
  status: null,
  consultationStatus: null,
  appointmentId: null,
  evolutionCount: 0,
  templateNames: [],
};

function renderTimeline(props: {
  onOpenEvolution?: (evolutionId: number) => void;
  onOpenAnamnesis?: (recordId: number) => void;
} = {}) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <PatientTimeline
        patientId={3}
        onOpenEvolution={props.onOpenEvolution ?? vi.fn()}
        onOpenAnamnesis={props.onOpenAnamnesis}
      />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  service.getPatientTimeline.mockReset();
  router.push.mockReset();
});

test("agrupa por mês e mostra os chips de vínculo", async () => {
  service.getPatientTimeline.mockResolvedValue({
    events: [appointmentEvent, evolutionEvent, anamnesisEvent],
    nextBefore: null,
  });
  renderTimeline();

  expect(await screen.findByText("Consulta de retorno")).toBeInTheDocument();
  expect(screen.getByText("novembro de 2026")).toBeInTheDocument();
  expect(screen.getByText("outubro de 2026")).toBeInTheDocument();
  expect(screen.getByText("Consulta gravada")).toBeInTheDocument();
  expect(screen.getByText("Relatório pronto")).toBeInTheDocument();
  expect(screen.getByText("2 evoluções")).toBeInTheDocument();
  expect(screen.getByText("Ligada à consulta de 01/11/2026")).toBeInTheDocument();
  expect(screen.getByText("Escala de dor")).toBeInTheDocument();
});

test("abre a evolução, o agendamento e a anamnese ao clicar", async () => {
  service.getPatientTimeline.mockResolvedValue({
    events: [appointmentEvent, evolutionEvent, anamnesisEvent],
    nextBefore: null,
  });
  const onOpenEvolution = vi.fn();
  const onOpenAnamnesis = vi.fn();
  renderTimeline({ onOpenEvolution, onOpenAnamnesis });

  await userEvent.click(await screen.findByRole("button", { name: /Evolução de dor/ }));
  expect(onOpenEvolution).toHaveBeenCalledWith(20);

  await userEvent.click(screen.getByRole("button", { name: /Consulta de retorno/ }));
  expect(router.push).toHaveBeenCalledWith("/app/agenda?mode=view&id=10");

  await userEvent.click(screen.getByRole("button", { name: /Avaliação inicial/ }));
  expect(onOpenAnamnesis).toHaveBeenCalledWith(30);
});

test("carrega mais registros quando há próxima página", async () => {
  service.getPatientTimeline
    .mockResolvedValueOnce({ events: [appointmentEvent], nextBefore: "2026-10-01T00:00:00.000Z" })
    .mockResolvedValueOnce({ events: [anamnesisEvent], nextBefore: null });
  renderTimeline();

  await userEvent.click(await screen.findByRole("button", { name: "Carregar mais" }));

  expect(await screen.findByText("Avaliação inicial")).toBeInTheDocument();
  await waitFor(() =>
    expect(service.getPatientTimeline).toHaveBeenLastCalledWith(3, "2026-10-01T00:00:00.000Z"),
  );
  expect(screen.queryByRole("button", { name: "Carregar mais" })).not.toBeInTheDocument();
});

test("mostra o vazio que ensina o próximo passo", async () => {
  service.getPatientTimeline.mockResolvedValue({ events: [], nextBefore: null });
  renderTimeline();

  expect(
    await screen.findByText("Nenhum registro ainda. Agende uma consulta ou registre uma evolução."),
  ).toBeInTheDocument();
});
