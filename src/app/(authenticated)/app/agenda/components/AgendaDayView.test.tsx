import { fireEvent, render, screen, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { Appointment } from "@/types";
import AgendaDayView from "./AgendaDayView";

const calendarState = vi.hoisted(() => ({
  appointments: [] as Appointment[],
  loading: false,
  error: null as string | null,
}));
const push = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("../hooks/calendar", () => ({
  useAgendaCalendar: () => ({
    appointments: calendarState.appointments,
    loading: calendarState.loading,
    error: calendarState.error,
    refetch: vi.fn(),
  }),
}));

vi.mock("../services/appointments.service", () => ({
  getAppointmentProfessionals: () =>
    Promise.resolve([
      { id: 7, name: "Dra. Ana" },
      { id: 8, name: "Dr. Bruno" },
    ]),
}));

function appointment(
  data: Pick<Appointment, "id" | "professionalId" | "patientName"> & Partial<Appointment>,
): Appointment {
  return {
    patientId: data.id + 100,
    appointmentDate: new Date().toISOString(),
    status: "Scheduled",
    createdAt: new Date().toISOString(),
    ...data,
  };
}

function renderView() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <AgendaDayView onCreate={vi.fn()} />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  calendarState.appointments = [];
  calendarState.loading = false;
  calendarState.error = null;
  push.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

test("agrupa por profissional e posiciona 09:30 abaixo de 09:00", async () => {
  const at = (hours: number, minutes: number) => {
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date.toISOString();
  };

  calendarState.appointments = [
    appointment({ id: 1, professionalId: 7, patientName: "Ana Silva", appointmentDate: at(9, 0) }),
    appointment({ id: 2, professionalId: 7, patientName: "Bruno Costa", appointmentDate: at(9, 30) }),
    appointment({ id: 3, professionalId: 8, patientName: "Carla Dias", appointmentDate: at(10, 0) }),
  ];

  renderView();

  expect(await screen.findByText("Dra. Ana")).toBeInTheDocument();
  expect(screen.getByText("Dr. Bruno")).toBeInTheDocument();

  const anaColumn = screen.getByTestId("agenda-day-column-7");
  const nine = within(anaColumn).getByRole("button", { name: /09:00 Ana Silva/ });
  const nineThirty = within(anaColumn).getByRole("button", { name: /09:30 Bruno Costa/ });

  expect(nine.style.top).toBe("128px");
  expect(nineThirty.style.top).toBe("160px");
  expect(parseFloat(nineThirty.style.top)).toBeGreaterThan(parseFloat(nine.style.top));

  const brunoColumn = screen.getByTestId("agenda-day-column-8");
  expect(within(brunoColumn).getByRole("button", { name: /10:00 Carla Dias/ })).toBeInTheDocument();
  expect(within(brunoColumn).queryByRole("button", { name: /Ana Silva/ })).not.toBeInTheDocument();

  fireEvent.click(nine);
  expect(push).toHaveBeenCalledWith("/app/agenda?mode=view&id=1");
});

test("mostra a linha do agora somente quando a data selecionada é hoje", async () => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(new Date(2026, 10, 2, 10, 30));

  const at = (hours: number, minutes: number) => {
    const date = new Date(2026, 10, 2, hours, minutes, 0, 0);
    return date.toISOString();
  };

  calendarState.appointments = [
    appointment({ id: 1, professionalId: 7, patientName: "Ana Silva", appointmentDate: at(9, 0) }),
  ];

  renderView();

  expect(await screen.findByText("Dra. Ana")).toBeInTheDocument();
  expect(screen.getByTestId("agenda-now-line")).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Próximo dia" }));
  expect(screen.queryByTestId("agenda-now-line")).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Dia anterior" }));
  expect(screen.getByTestId("agenda-now-line")).toBeInTheDocument();
});
