import { describe, expect, it } from "vitest";
import type { Appointment } from "@/types";
import {
  buildHourBuckets,
  getCompletionRate,
  getNextScheduledAppointment,
  getStatusCounts,
  toPercent,
} from "./dashboardData";

function appointmentAt(
  hour: number,
  minute: number,
  status: Appointment["status"],
  id = hour * 100 + minute,
): Appointment {
  const date = new Date(2026, 10, 2, hour, minute);
  return {
    id,
    professionalId: 1,
    patientId: 1,
    patientName: "Ana Souza",
    appointmentDate: date.toISOString(),
    status,
    createdAt: date.toISOString(),
  };
}

describe("dashboardData", () => {
  it("conta os status dos agendamentos do dia", () => {
    const counts = getStatusCounts([
      appointmentAt(8, 0, "Scheduled"),
      appointmentAt(9, 0, "Completed"),
      appointmentAt(10, 0, "Completed"),
      appointmentAt(11, 0, "Cancelled"),
    ]);

    expect(counts).toEqual({ scheduled: 1, completed: 2, cancelled: 1, total: 4 });
    expect(getCompletionRate(counts)).toBe(50);
  });

  it("distribui os agendamentos nas horas e clampa horários fora do intervalo", () => {
    const buckets = buildHourBuckets([
      appointmentAt(8, 30, "Scheduled"),
      appointmentAt(8, 45, "Completed"),
      appointmentAt(6, 30, "Scheduled"),
      appointmentAt(21, 0, "Cancelled"),
    ]);

    expect(buckets).toHaveLength(13);
    expect(buckets[0]).toMatchObject({ hour: 7, total: 1, scheduled: 1 });
    expect(buckets[1]).toMatchObject({ hour: 8, total: 2, scheduled: 1, completed: 1 });
    expect(buckets[12]).toMatchObject({ hour: 19, total: 1, cancelled: 1 });
  });

  it("encontra o próximo agendamento ainda não realizado", () => {
    const appointments = [
      appointmentAt(9, 0, "Scheduled"),
      appointmentAt(10, 30, "Completed"),
      appointmentAt(11, 0, "Scheduled"),
    ];

    expect(
      getNextScheduledAppointment(appointments, new Date(2026, 10, 2, 10, 0))?.id,
    ).toBe(appointmentAt(11, 0, "Scheduled").id);
  });

  it("não retorna próximo quando todos já passaram", () => {
    expect(
      getNextScheduledAppointment(
        [appointmentAt(8, 0, "Scheduled")],
        new Date(2026, 10, 2, 12, 0),
      ),
    ).toBeNull();
  });

  it("normaliza percentuais inválidos", () => {
    expect(toPercent(Number.NaN)).toBe(0);
    expect(toPercent(-10)).toBe(0);
    expect(toPercent(120)).toBe(100);
  });
});
