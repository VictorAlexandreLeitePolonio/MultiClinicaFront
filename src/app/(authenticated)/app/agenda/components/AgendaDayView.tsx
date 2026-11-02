"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { queryKeys } from "@/lib/queryKeys";
import { cn } from "@/lib/utils";
import type { Appointment } from "@/types";
import { useAgendaCalendar } from "../hooks/calendar";
import { getAppointmentProfessionals } from "../services/appointments.service";

const START_HOUR = 7;
const END_HOUR = 21;
const HOUR_HEIGHT = 64;
const TOTAL_HEIGHT = (END_HOUR - START_HOUR) * HOUR_HEIGHT;
/** A API de consultas não expõe a duração; 50 min é a duração padrão da visão Dia. */
const APPOINTMENT_DURATION_MINUTES = 50;
const MIN_APPOINTMENT_HEIGHT = 28;

const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, index) => START_HOUR + index);

const STATUS_LABEL: Record<Appointment["status"], string> = {
  Scheduled: "Agendado",
  Completed: "Completo",
  Cancelled: "Cancelado",
};

const STATUS_STYLE: Record<Appointment["status"], string> = {
  Scheduled:
    "border-[var(--color-primary)] bg-[var(--color-primary-muted)] text-[var(--color-primary-dark)]",
  Completed:
    "border-[var(--color-gray-200)] bg-[var(--color-gray-100)] text-[var(--color-secondary)]",
  Cancelled:
    "border-[var(--color-gray-200)] bg-[var(--color-gray-50)] text-[var(--color-gray-600)] line-through",
};

interface Props {
  onCreate?: () => void;
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function minutesSinceStart(date: Date) {
  return (date.getHours() - START_HOUR) * 60 + date.getMinutes();
}

function topFor(date: Date) {
  const top = (minutesSinceStart(date) * HOUR_HEIGHT) / 60;
  return Math.min(Math.max(top, 0), TOTAL_HEIGHT - 1);
}

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AgendaDayView({ onCreate }: Props) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));
  const [now, setNow] = useState<Date | null>(null);

  const { appointments, loading, error } = useAgendaCalendar(selectedDate);
  const professionals = useQuery({
    queryKey: queryKeys.appointments.professionals,
    queryFn: getAppointmentProfessionals,
  });

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const timer = window.setInterval(tick, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const moveDay = (amount: number) => {
    setSelectedDate((current) => {
      const next = new Date(current);
      next.setDate(current.getDate() + amount);
      return startOfDay(next);
    });
  };

  const dayAppointments = useMemo(
    () =>
      appointments.filter((appointment) =>
        isSameDay(new Date(appointment.appointmentDate), selectedDate),
      ),
    [appointments, selectedDate],
  );

  const columns = useMemo(() => {
    const names = new Map<number, string>(
      (professionals.data ?? []).map((professional) => [professional.id, professional.name]),
    );
    return Array.from(new Set(dayAppointments.map((appointment) => appointment.professionalId)))
      .map((id) => ({
        id,
        name: names.get(id) ?? "Profissional",
        appointments: dayAppointments.filter((appointment) => appointment.professionalId === id),
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }, [dayAppointments, professionals.data]);

  const dateLabel = selectedDate.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const capitalizedDate = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1);

  const showNow = now !== null && isSameDay(now, selectedDate);
  const nowTop = now ? topFor(now) : 0;

  const gridTemplateColumns = `4rem repeat(${Math.max(columns.length, 1)}, minmax(11rem, 1fr))`;

  return (
    <section aria-label="Agenda por profissional" className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-[var(--color-gray-200)] bg-[var(--color-card)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => moveDay(-1)}
            aria-label="Dia anterior"
            className="inline-flex size-9 items-center justify-center rounded-xl border border-[var(--color-gray-200)] text-[var(--color-primary-dark)] transition-colors duration-150 hover:bg-[var(--color-primary-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] active:scale-[0.97] dark:text-[var(--color-primary-light)]"
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <h2 className="min-w-[220px] text-center font-mono text-sm font-semibold text-[var(--color-secondary)]">
            {capitalizedDate}
          </h2>
          <button
            type="button"
            onClick={() => moveDay(1)}
            aria-label="Próximo dia"
            className="inline-flex size-9 items-center justify-center rounded-xl border border-[var(--color-gray-200)] text-[var(--color-primary-dark)] transition-colors duration-150 hover:bg-[var(--color-primary-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] active:scale-[0.97] dark:text-[var(--color-primary-light)]"
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
        <Button variant="outline" fullWidth={false} onClick={() => setSelectedDate(startOfDay(new Date()))}>
          Hoje
        </Button>
      </div>

      {loading && (
        <div className="flex h-72 items-center justify-center rounded-2xl border border-[var(--color-gray-200)] bg-[var(--color-card)]">
          <p className="text-sm font-medium text-[var(--color-gray-600)]">Carregando dia...</p>
        </div>
      )}

      {!loading && error && (
        <p role="alert" className="rounded-2xl border border-[var(--color-gray-200)] bg-[var(--color-card)] p-4 text-sm text-[var(--color-gray-600)]">
          {error}
        </p>
      )}

      {!loading && !error && columns.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[var(--color-gray-200)] bg-[var(--color-card)] px-6 py-16 text-center">
          <p className="text-sm font-medium text-[var(--color-gray-600)]">
            Nenhuma consulta neste dia.
          </p>
          {onCreate && (
            <Button variant="outline" fullWidth={false} onClick={onCreate}>
              Novo agendamento
            </Button>
          )}
        </div>
      )}

      {!loading && !error && columns.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-[var(--color-gray-200)] bg-[var(--color-card)]">
          <div className="min-w-max">
            <div
              className="grid border-b border-[var(--color-gray-200)]"
              style={{ gridTemplateColumns }}
            >
              <div className="border-r border-[var(--color-gray-200)] px-3 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-gray-600)]">
                Hora
              </div>
              {columns.map((column) => (
                <div
                  key={column.id}
                  data-testid={`agenda-day-column-header-${column.id}`}
                  className="border-r border-[var(--color-gray-200)] px-3 py-3 last:border-r-0"
                >
                  <p className="truncate text-sm font-semibold text-[var(--color-secondary)]">
                    {column.name}
                  </p>
                  <p className="font-mono text-[11px] text-[var(--color-gray-600)]">
                    {column.appointments.length}{" "}
                    {column.appointments.length === 1 ? "consulta" : "consultas"}
                  </p>
                </div>
              ))}
            </div>

            <div className="relative grid" style={{ gridTemplateColumns, height: TOTAL_HEIGHT }}>
              <div className="border-r border-[var(--color-gray-200)]">
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="relative h-16 border-b border-[var(--color-gray-100)] last:border-b-0"
                  >
                    <span className="absolute top-1 right-2 bg-[var(--color-card)] px-1 font-mono text-[11px] text-[var(--color-gray-600)]">
                      {String(hour).padStart(2, "0")}:00
                    </span>
                  </div>
                ))}
              </div>

              {columns.map((column) => (
                <div
                  key={column.id}
                  data-testid={`agenda-day-column-${column.id}`}
                  className="relative border-r border-[var(--color-gray-200)] last:border-r-0"
                >
                  {HOURS.map((hour) => (
                    <div
                      key={hour}
                      className="h-16 border-b border-[var(--color-gray-100)] last:border-b-0"
                    />
                  ))}

                  {column.appointments.map((appointment) => {
                    const height = Math.max(
                      (APPOINTMENT_DURATION_MINUTES * HOUR_HEIGHT) / 60,
                      MIN_APPOINTMENT_HEIGHT,
                    );
                    return (
                      <button
                        key={appointment.id}
                        type="button"
                        data-testid={`agenda-appointment-${appointment.id}`}
                        onClick={() => router.push(`/app/agenda?mode=view&id=${appointment.id}`)}
                        aria-label={`${timeLabel(appointment.appointmentDate)} ${appointment.patientName}, ${STATUS_LABEL[appointment.status]}`}
                        className={cn(
                          "absolute left-1.5 right-1.5 overflow-hidden rounded-lg border px-2 py-1 text-left shadow-[var(--shadow-sm)] transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] active:scale-[0.97] motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                          STATUS_STYLE[appointment.status],
                        )}
                        style={{ top: topFor(new Date(appointment.appointmentDate)), height }}
                      >
                        <span className="block truncate font-mono text-[11px] font-semibold">
                          {timeLabel(appointment.appointmentDate)}
                        </span>
                        <span className="block truncate text-xs font-semibold">
                          {appointment.patientName}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}

              {showNow && (
                <div
                  data-testid="agenda-now-line"
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 z-10"
                  style={{ top: nowTop }}
                >
                  <span className="ml-16 block h-px bg-[var(--color-signal)]" />
                  <span className="absolute left-16 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-signal)]" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-[var(--color-gray-200)] bg-[var(--color-card)] px-4 py-3 text-xs text-[var(--color-gray-600)]">
        <span className="flex items-center gap-2">
          <span className="size-3 rounded-sm border border-[var(--color-primary)] bg-[var(--color-primary-muted)]" />
          Agendado
        </span>
        <span className="flex items-center gap-2">
          <span className="size-3 rounded-sm border border-[var(--color-gray-200)] bg-[var(--color-gray-100)]" />
          Completo
        </span>
        <span className="flex items-center gap-2">
          <span className="size-3 rounded-sm border border-[var(--color-gray-200)] bg-[var(--color-gray-50)]" />
          Cancelado
        </span>
        <span className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-[var(--color-signal)]" />
          Agora
        </span>
      </div>
    </section>
  );
}
