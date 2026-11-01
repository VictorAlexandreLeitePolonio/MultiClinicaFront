import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import { beforeEach, expect, test, vi } from "vitest";
import { Appointment } from "@/types";
import { StartConsultationButton } from "./StartConsultationButton";

const { start } = vi.hoisted(() => ({ start: vi.fn() }));

vi.mock("@/components/consultation/ConsultationRecorderProvider", () => ({
  useConsultationRecorder: () => ({ start, active: null }),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: 1, role: "Profissional" } }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const appointment: Appointment = {
  id: 10,
  professionalId: 7,
  patientId: 2,
  patientName: "Ana Souza",
  appointmentDate: "2026-11-01T13:00:00Z",
  status: "Scheduled",
  createdAt: "2026-11-01T12:00:00Z",
};

function renderButton(onChanged = vi.fn()) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const invalidateQueries = vi.spyOn(client, "invalidateQueries");
  render(
    <QueryClientProvider client={client}>
      <StartConsultationButton appointment={appointment} onChanged={onChanged} />
    </QueryClientProvider>,
  );
  return { onChanged, invalidateQueries };
}

beforeEach(() => {
  vi.clearAllMocks();
  start.mockReset().mockResolvedValue(undefined);
});

test("exige o consentimento e inicia a consulta", async () => {
  const { onChanged, invalidateQueries } = renderButton();

  await userEvent.click(screen.getByRole("button", { name: "Iniciar consulta" }));

  const confirmar = screen.getByRole("button", { name: "Confirmar" });
  expect(confirmar).toBeDisabled();

  await userEvent.click(
    screen.getByRole("checkbox", {
      name: "O paciente autorizou a gravação desta consulta",
    }),
  );
  await userEvent.click(confirmar);

  await waitFor(() => expect(start).toHaveBeenCalledWith(appointment));
  expect(toast.success).toHaveBeenCalledWith(
    "Consulta iniciada. Você pode navegar pelo sistema.",
  );
  expect(invalidateQueries).toHaveBeenCalledWith({
    queryKey: ["appointments"],
  });
  expect(onChanged).toHaveBeenCalledTimes(1);
});

test("não mostra a ação para agendamento cancelado", () => {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <StartConsultationButton
        appointment={{ ...appointment, status: "Cancelled" }}
      />
    </QueryClientProvider>,
  );

  expect(
    screen.queryByRole("button", { name: "Iniciar consulta" }),
  ).not.toBeInTheDocument();
});

test("não mostra a ação quando já existe relatório", () => {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <StartConsultationButton
        appointment={{ ...appointment, consultationStatus: "Ready" }}
      />
    </QueryClientProvider>,
  );

  expect(
    screen.queryByRole("button", { name: "Iniciar consulta" }),
  ).not.toBeInTheDocument();
});
