import type { Appointment } from "@/types";

export const DAY_START_HOUR = 7;
export const DAY_END_HOUR = 20;

export const DASHBOARD_STATUS = {
  Scheduled: {
    label: "Agendado",
    color: "oklch(0.62 0.17 255)",
    chipClassName:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300",
  },
  Completed: {
    label: "Concluído",
    color: "oklch(0.62 0.13 165)",
    chipClassName:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  Cancelled: {
    label: "Cancelado",
    color: "oklch(0.61 0.2 25)",
    chipClassName:
      "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300",
  },
} as const satisfies Record<
  Appointment["status"],
  { label: string; color: string; chipClassName: string }
>;

export const CLINICAL_STATUS = {
  improving: {
    label: "Melhorando",
    color: "oklch(0.62 0.13 180)",
  },
  stable: {
    label: "Estáveis",
    color: "oklch(0.65 0.03 240)",
  },
  worsening: {
    label: "Piorando",
    color: "oklch(0.68 0.16 45)",
  },
} as const;

export interface AppointmentStatusCounts {
  scheduled: number;
  completed: number;
  cancelled: number;
  total: number;
}

export interface HourBucket extends AppointmentStatusCounts {
  hour: number;
  appointments: Appointment[];
}

export function getAppointmentDate(appointment: Appointment): Date {
  return new Date(appointment.appointmentDate);
}

export function formatAppointmentTime(appointment: Appointment): string {
  const date = getAppointmentDate(appointment);
  if (Number.isNaN(date.getTime())) return "--:--";

  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function sortAppointmentsByTime(appointments: Appointment[]): Appointment[] {
  return [...appointments].sort(
    (a, b) => getAppointmentDate(a).getTime() - getAppointmentDate(b).getTime(),
  );
}

export function getStatusCounts(appointments: Appointment[]): AppointmentStatusCounts {
  return appointments.reduce<AppointmentStatusCounts>(
    (counts, appointment) => {
      counts.total += 1;
      if (appointment.status === "Scheduled") counts.scheduled += 1;
      if (appointment.status === "Completed") counts.completed += 1;
      if (appointment.status === "Cancelled") counts.cancelled += 1;
      return counts;
    },
    { scheduled: 0, completed: 0, cancelled: 0, total: 0 },
  );
}

/** Agrupa os agendamentos por hora local, mantendo a ordem cronológica. */
export function buildHourBuckets(
  appointments: Appointment[],
  startHour = DAY_START_HOUR,
  endHour = DAY_END_HOUR,
): HourBucket[] {
  const buckets = Array.from({ length: Math.max(0, endHour - startHour) }, (_, index) => ({
    hour: startHour + index,
    scheduled: 0,
    completed: 0,
    cancelled: 0,
    total: 0,
    appointments: [] as Appointment[],
  }));

  for (const appointment of sortAppointmentsByTime(appointments)) {
    const date = getAppointmentDate(appointment);
    if (Number.isNaN(date.getTime())) continue;

    const clampedHour = Math.min(Math.max(date.getHours(), startHour), endHour - 1);
    const bucket = buckets[clampedHour - startHour];
    if (!bucket) continue;

    bucket.total += 1;
    bucket.appointments.push(appointment);
    if (appointment.status === "Scheduled") bucket.scheduled += 1;
    if (appointment.status === "Completed") bucket.completed += 1;
    if (appointment.status === "Cancelled") bucket.cancelled += 1;
  }

  return buckets;
}

export function getNextScheduledAppointment(
  appointments: Appointment[],
  now = new Date(),
): Appointment | null {
  return (
    sortAppointmentsByTime(
      appointments.filter(
        (appointment) =>
          appointment.status === "Scheduled" &&
          getAppointmentDate(appointment).getTime() >= now.getTime(),
      ),
    )[0] ?? null
  );
}

export function getCompletionRate(counts: AppointmentStatusCounts): number {
  if (counts.total === 0) return 0;
  return Math.round((counts.completed / counts.total) * 100);
}

/** Percentual seguro para barras: evita NaN e mantém o valor entre 0 e 100. */
export function toPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

export function formatHour(hour: number): string {
  return `${String(hour).padStart(2, "0")}h`;
}
