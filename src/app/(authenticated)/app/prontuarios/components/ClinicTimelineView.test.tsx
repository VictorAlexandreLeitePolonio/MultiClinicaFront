import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, expect, test, vi } from "vitest";
import type { ClinicTimelineEvent, PatientTimelineEvent } from "@/types/evolution";
import { ClinicTimelineView } from "./ClinicTimelineView";

const service = vi.hoisted(() => ({ getClinicTimeline: vi.fn() }));
const router = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("../services/clinic-timeline.service", () => service);
vi.mock("next/navigation", () => ({ useRouter: () => router }));

function dateAt(daysFromToday: number, hour: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

function dayMonthLabel(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function timelineEvent(overrides: Partial<PatientTimelineEvent>): PatientTimelineEvent {
  return {
    type: "appointment",
    id: 1,
    date: dateAt(0, 9),
    title: "Consulta",
    professionalName: "Dra. Ana",
    status: null,
    consultationStatus: null,
    appointmentId: null,
    evolutionCount: 0,
    templateNames: [],
    ...overrides,
  };
}

function clinicEvent(
  patientId: number,
  patientName: string,
  event: Partial<PatientTimelineEvent>,
): ClinicTimelineEvent {
  return { patientId, patientName, event: timelineEvent(event) };
}

function renderTimeline() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <ClinicTimelineView />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  service.getClinicTimeline.mockReset();
  router.push.mockReset();
});

test("agrupa por dia e abre o perfil do paciente", async () => {
  service.getClinicTimeline.mockResolvedValue({
    events: [
      clinicEvent(3, "Ana", {
        type: "appointment",
        id: 10,
        date: dateAt(0, 9),
        title: "Consulta de retorno",
      }),
      clinicEvent(4, "Bruno", {
        type: "evolution",
        id: 20,
        date: dateAt(0, 11),
        title: "Evolução de dor",
      }),
      clinicEvent(5, "Carla", {
        type: "anamnesis",
        id: 30,
        date: dateAt(-1, 15),
        title: "Avaliação inicial",
      }),
      clinicEvent(6, "Davi", {
        type: "appointment",
        id: 40,
        date: dateAt(-5, 10),
        title: "Consulta inicial",
      }),
    ],
    nextBefore: null,
  });

  renderTimeline();

  expect(await screen.findByRole("heading", { name: "Hoje" })).toBeInTheDocument();
  expect(screen.getByText("Consulta de retorno")).toBeInTheDocument();
  expect(screen.getByText("Evolução de dor")).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Ontem" })).toBeInTheDocument();
  expect(screen.getByText("Avaliação inicial")).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: dayMonthLabel(5) })).toBeInTheDocument();
  expect(screen.getByText("Consulta inicial")).toBeInTheDocument();

  await userEvent.click(screen.getByRole("button", { name: "Ana" }));
  expect(router.push).toHaveBeenCalledWith("/app/pacientes?mode=profile&id=3");
});

test("carrega a próxima página ao clicar em Carregar mais", async () => {
  service.getClinicTimeline
    .mockResolvedValueOnce({
      events: [
        clinicEvent(3, "Ana", {
          type: "appointment",
          id: 10,
          date: dateAt(0, 9),
          title: "Consulta de retorno",
        }),
      ],
      nextBefore: "2026-10-01T00:00:00.000Z",
    })
    .mockResolvedValueOnce({
      events: [
        clinicEvent(5, "Carla", {
          type: "anamnesis",
          id: 30,
          date: dateAt(-10, 15),
          title: "Avaliação inicial",
        }),
      ],
      nextBefore: null,
    });

  renderTimeline();

  await userEvent.click(await screen.findByRole("button", { name: "Carregar mais" }));

  expect(await screen.findByText("Avaliação inicial")).toBeInTheDocument();
  await waitFor(() =>
    expect(service.getClinicTimeline).toHaveBeenLastCalledWith("2026-10-01T00:00:00.000Z"),
  );
  expect(screen.queryByRole("button", { name: "Carregar mais" })).not.toBeInTheDocument();
});
