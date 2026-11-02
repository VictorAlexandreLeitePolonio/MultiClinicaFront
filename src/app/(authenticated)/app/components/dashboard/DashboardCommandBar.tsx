"use client";

import type { Appointment, UserRole } from "@/types";
import {
  formatAppointmentTime,
  getCompletionRate,
  getNextScheduledAppointment,
  getStatusCounts,
} from "./dashboardData";

interface DashboardCommandBarProps {
  name?: string | null;
  clinicName?: string | null;
  role: UserRole;
  appointments: Appointment[];
  total: number;
  loading?: boolean;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

function getDateLabel(): string {
  const label = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

const HONORIFICS = /^(dr|dra|sr|sra|prof|profa)\.?$/i;

/** "Dra. Ana Ribeiro" → "Ana": o título fica de fora da saudação. */
export function firstName(name?: string | null): string {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  return parts.find((part) => !HONORIFICS.test(part)) ?? parts[0] ?? "";
}

export function DashboardCommandBar({
  name,
  clinicName,
  role,
  appointments,
  total,
  loading = false,
}: DashboardCommandBarProps) {
  const counts = getStatusCounts(appointments);
  const next = getNextScheduledAppointment(appointments);
  const completion = getCompletionRate(counts);
  const first = firstName(name);
  const isOwnAgenda = role === "Profissional";

  const metrics = [
    {
      label: isOwnAgenda ? "Seus atendimentos hoje" : "Atendimentos hoje",
      value: loading ? "—" : String(total),
      hint: counts.cancelled > 0 ? `${counts.cancelled} cancelado(s)` : "na agenda do dia",
    },
    {
      label: "Concluídos",
      value: loading ? "—" : String(counts.completed),
      hint: loading ? "" : `${completion}% do dia`,
    },
    {
      label: "Próximo paciente",
      value: loading ? "—" : next ? formatAppointmentTime(next) : "Livre",
      hint: loading ? "" : (next?.patientName ?? "Sem horários pela frente"),
    },
  ];

  return (
    <section data-tutorial="dashboard-greeting" aria-labelledby="dashboard-title" className="flex flex-col gap-5">
      <div>
        <h1
          id="dashboard-title"
          className="text-2xl font-semibold tracking-tight text-[var(--color-secondary)] [text-wrap:balance]"
        >
          {getGreeting()}
          {first ? `, ${first}` : ""}
        </h1>
        <p className="mt-1 text-sm text-[var(--color-gray-600)]">
          {clinicName?.trim() ? (
            <>
              {clinicName.trim()} <span aria-hidden="true">·</span>{" "}
            </>
          ) : null}
          {getDateLabel()}
        </p>
      </div>

      <dl
        data-tutorial="dashboard-metrics"
        className="grid overflow-hidden rounded-2xl border border-[var(--color-gray-200)] bg-[var(--color-card)] shadow-[var(--shadow-sm)] sm:grid-cols-3"
      >
        {metrics.map((metric, index) => (
          <div
            key={metric.label}
            className={`min-w-0 px-5 py-4 ${index > 0 ? "border-t border-[var(--color-gray-200)] sm:border-t-0 sm:border-l" : ""}`}
          >
            <dt className="text-sm text-[var(--color-gray-600)]">{metric.label}</dt>
            <dd className="mt-1 truncate font-mono text-3xl font-semibold tracking-[-0.03em] text-[var(--color-secondary)] tabular-nums">
              {metric.value}
            </dd>
            <p className="mt-0.5 truncate text-xs text-[var(--color-gray-500)]">{metric.hint}</p>
          </div>
        ))}
      </dl>
    </section>
  );
}
