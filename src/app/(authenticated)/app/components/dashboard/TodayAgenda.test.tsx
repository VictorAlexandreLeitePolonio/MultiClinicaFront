import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import type { Appointment } from "@/types";
import { TodayAgenda } from "./TodayAgenda";

function appointmentAt(
  hour: number,
  minute: number,
  status: Appointment["status"],
  patientName: string,
  id: number,
): Appointment {
  const date = new Date(2026, 10, 2, hour, minute);
  return {
    id,
    professionalId: 1,
    patientId: id,
    patientName,
    appointmentDate: date.toISOString(),
    status,
    createdAt: date.toISOString(),
  };
}

const appointments = [
  appointmentAt(8, 0, "Completed", "Ana Souza", 1),
  appointmentAt(10, 30, "Scheduled", "Bruno Lima", 2),
];

it("filtra os atendimentos ao selecionar uma hora no gráfico", async () => {
  const user = userEvent.setup();
  render(
    <TodayAgenda appointments={appointments} loading={false} error={null} onRetry={vi.fn()} />,
  );

  expect(screen.getByText("Ana Souza")).toBeInTheDocument();
  expect(screen.getByText("Bruno Lima")).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: /08h: 1 agendamento/i }));

  expect(screen.getByText("Ana Souza")).toBeInTheDocument();
  expect(screen.queryByText("Bruno Lima")).not.toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: /08h: 1 agendamento/i }));

  expect(screen.getByText("Bruno Lima")).toBeInTheDocument();
});

it("mostra o estado vazio quando não há agendamentos", () => {
  render(<TodayAgenda appointments={[]} loading={false} error={null} onRetry={vi.fn()} />);

  expect(screen.getByText("Nenhum agendamento para hoje.")).toBeInTheDocument();
});
