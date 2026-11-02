"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarClock, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import type { Appointment } from "@/types";
import { cn } from "@/lib/utils";
import {
  DASHBOARD_STATUS,
  DAY_END_HOUR,
  DAY_START_HOUR,
  buildHourBuckets,
  formatAppointmentTime,
  formatHour,
  getStatusCounts,
  sortAppointmentsByTime,
} from "./dashboardData";

interface TodayAgendaProps {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

const VISIBLE_APPOINTMENTS = 6;

export function TodayAgenda({ appointments, loading, error, onRetry }: TodayAgendaProps) {
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const counts = getStatusCounts(appointments);
  const buckets = useMemo(() => buildHourBuckets(appointments), [appointments]);
  const maxBucket = Math.max(...buckets.map((bucket) => bucket.total), 1);
  const sorted = useMemo(() => sortAppointmentsByTime(appointments), [appointments]);

  const visible = useMemo(() => {
    if (selectedHour !== null) {
      return sorted.filter((appointment) => {
        const rawHour = new Date(appointment.appointmentDate).getHours();
        const clampedHour = Math.min(Math.max(rawHour, DAY_START_HOUR), DAY_END_HOUR - 1);
        return clampedHour === selectedHour;
      });
    }
    return sorted.slice(0, VISIBLE_APPOINTMENTS);
  }, [selectedHour, sorted]);
  // A lista mostra só os primeiros; o contador é do dia (ou da hora filtrada) inteiro.
  const listCount = selectedHour === null ? sorted.length : visible.length;

  return (
    <section
      data-tutorial="dashboard-today"
      aria-labelledby="today-agenda-title"
      className="flex min-w-0 flex-col rounded-2xl border border-[var(--color-gray-200)] bg-[var(--color-card)] p-5 shadow-[var(--shadow-sm)] sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-muted)] text-[var(--color-primary-dark)]">
            <CalendarClock size={17} aria-hidden="true" />
          </span>
          <div>
            <h2
              id="today-agenda-title"
              className="text-lg font-bold tracking-tight text-[var(--color-secondary)]"
            >
              Ritmo de hoje
            </h2>
            <p className="mt-0.5 text-sm text-[var(--color-gray-600)]">
              Onde o dia está concentrado e quem vem a seguir.
            </p>
          </div>
        </div>

        <Link
          href="/app/agenda"
          className="inline-flex items-center gap-1.5 rounded-lg px-1 py-1 text-sm font-semibold text-[var(--color-primary-dark)] transition-colors hover:text-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
        >
          Abrir agenda
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>

      {loading ? (
        <div className="mt-6 space-y-4">
          <Skeleton className="h-32" />
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-12" />
          ))}
        </div>
      ) : error ? (
        <div className="mt-6 flex flex-col items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
          <p>{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200"
          >
            <RefreshCw size={13} aria-hidden="true" />
            Tentar novamente
          </button>
        </div>
      ) : counts.total === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-[var(--color-gray-200)] px-5 py-10 text-center">
          <CalendarClock
            size={28}
            className="mx-auto text-[var(--color-gray-600)]"
            aria-hidden="true"
          />
          <p className="mt-3 text-sm font-semibold text-[var(--color-secondary)]">
            Nenhum agendamento para hoje.
          </p>
          <p className="mt-1 text-sm text-[var(--color-gray-600)]">
            O dia está livre. A agenda completa continua disponível.
          </p>
          <Link
            href="/app/agenda"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-primary-dark)] hover:text-[var(--color-primary)]"
          >
            Ir para a agenda
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium text-[var(--color-gray-600)]">
                Agendamentos por hora
              </p>
              {selectedHour !== null && (
                <button
                  type="button"
                  onClick={() => setSelectedHour(null)}
                  className="rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[var(--color-primary-dark)] transition-colors hover:bg-[var(--color-primary-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                >
                  limpar filtro
                </button>
              )}
            </div>

            <div
              role="group"
              aria-label="Distribuição dos agendamentos por hora"
              className="mt-3 flex h-36 items-end gap-1 sm:gap-1.5"
            >
              {buckets.map((bucket) => {
                const height =
                  bucket.total === 0 ? 0 : Math.max(8, (bucket.total / maxBucket) * 100);
                const isSelected = selectedHour === bucket.hour;

                return (
                  <button
                    key={bucket.hour}
                    type="button"
                    aria-pressed={isSelected}
                    aria-label={`${formatHour(bucket.hour)}: ${bucket.total} ${
                      bucket.total === 1 ? "agendamento" : "agendamentos"
                    }`}
                    onClick={() =>
                      setSelectedHour((current) => (current === bucket.hour ? null : bucket.hour))
                    }
                    className={cn(
                      "group flex h-full flex-1 flex-col justify-end rounded-md px-0.5 pb-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]",
                      isSelected
                        ? "bg-[var(--color-primary-muted)]"
                        : "hover:bg-[var(--color-gray-50)]",
                    )}
                  >
                    <span className="flex flex-1 items-end">
                      {height > 0 && (
                        <span
                          className="dashboard-bar flex w-full flex-col-reverse overflow-hidden rounded-t-[4px] transition-opacity duration-150"
                          style={{
                            height: `${height}%`,
                            opacity: selectedHour === null || isSelected ? 1 : 0.45,
                          }}
                        >
                          {(["scheduled", "completed", "cancelled"] as const).map((statusKey) => {
                            const value = bucket[statusKey];
                            if (value === 0) return null;
                            return (
                              <span
                                key={statusKey}
                                className="w-full"
                                style={{
                                  height: `${(value / bucket.total) * 100}%`,
                                  backgroundColor:
                                    statusKey === "scheduled"
                                      ? DASHBOARD_STATUS.Scheduled.color
                                      : statusKey === "completed"
                                        ? DASHBOARD_STATUS.Completed.color
                                        : DASHBOARD_STATUS.Cancelled.color,
                                }}
                              />
                            );
                          })}
                        </span>
                      )}
                    </span>
                    <span
                      className={cn(
                        "mt-2 font-mono text-[8px] sm:text-[9px]",
                        isSelected
                          ? "font-semibold text-[var(--color-primary-dark)]"
                          : "text-[var(--color-gray-600)]",
                      )}
                    >
                      {formatHour(bucket.hour)}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
              {(["Scheduled", "Completed", "Cancelled"] as const).map((status) => {
                const value =
                  status === "Scheduled"
                    ? counts.scheduled
                    : status === "Completed"
                      ? counts.completed
                      : counts.cancelled;
                return (
                  <span
                    key={status}
                    className="inline-flex items-center gap-1.5 font-mono text-[10px] text-[var(--color-gray-600)]"
                  >
                    <span
                      aria-hidden="true"
                      className="size-2 rounded-sm"
                      style={{ backgroundColor: DASHBOARD_STATUS[status].color }}
                    />
                    {DASHBOARD_STATUS[status].label}
                    <span className="font-semibold text-[var(--color-secondary)]">{value}</span>
                  </span>
                );
              })}
            </div>
          </div>

          <div className="mt-6 border-t border-[var(--color-gray-200)] pt-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium text-[var(--color-gray-600)]">
                {selectedHour === null ? "Agenda do dia" : `Horários de ${formatHour(selectedHour)}`}
              </p>
              <span className="font-mono text-[10px] text-[var(--color-gray-600)]">
                {listCount} {listCount === 1 ? "atendimento" : "atendimentos"}
              </span>
            </div>

            <ul className="mt-2 divide-y divide-[var(--color-gray-200)]">
              {visible.map((appointment) => (
                <li key={appointment.id} className="flex items-center gap-3 py-2.5">
                  <span className="w-12 shrink-0 font-mono text-xs font-semibold tabular-nums text-[var(--color-gray-600)]">
                    {formatAppointmentTime(appointment)}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--color-secondary)]">
                    {appointment.patientName}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                      DASHBOARD_STATUS[appointment.status].chipClassName,
                    )}
                  >
                    {DASHBOARD_STATUS[appointment.status].label}
                  </span>
                </li>
              ))}
            </ul>

            {selectedHour !== null && visible.length === 0 && (
              <p className="py-4 text-sm text-[var(--color-gray-600)]">
                Nenhum agendamento nesse horário.
              </p>
            )}

            {selectedHour === null && sorted.length > VISIBLE_APPOINTMENTS && (
              <Link
                href="/app/agenda"
                className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-primary-dark)] hover:text-[var(--color-primary)]"
              >
                Ver todos os {sorted.length} horários
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            )}
          </div>
        </>
      )}
    </section>
  );
}
