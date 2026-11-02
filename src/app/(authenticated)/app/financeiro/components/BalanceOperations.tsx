"use client";

import { DASHBOARD_STATUS } from "@/app/(authenticated)/app/components/dashboard/dashboardData";
import { formatCurrency } from "@/utils/formatters";
import type {
  BalanceAppointmentsSummary,
  BalanceEvolutionSummary,
  BalanceMoneySummary,
  BalancePatientsSummary,
} from "@/types";

interface BalanceOperationsProps {
  money: BalanceMoneySummary;
  appointments: BalanceAppointmentsSummary;
  patients: BalancePatientsSummary;
  evolutions: BalanceEvolutionSummary;
}

/** Ticket médio por pagamento recebido; null sem pagamentos. */
export function averageTicket(money: Pick<BalanceMoneySummary, "appointmentIncome" | "paidAppointmentCount">): number | null {
  return money.paidAppointmentCount > 0 ? money.appointmentIncome / money.paidAppointmentCount : null;
}

export function BalanceOperations({ money, appointments, patients, evolutions }: BalanceOperationsProps) {
  const segments = [
    { key: "completed", label: "Realizadas", value: appointments.completed, color: DASHBOARD_STATUS.Completed.color },
    { key: "scheduled", label: "Agendadas", value: appointments.scheduled, color: DASHBOARD_STATUS.Scheduled.color },
    { key: "cancelled", label: "Canceladas", value: appointments.cancelled, color: DASHBOARD_STATUS.Cancelled.color },
  ];
  const ticket = averageTicket(money);
  const total = appointments.total;

  const facts = [
    { label: "Ticket médio", value: ticket === null ? "—" : formatCurrency(ticket) },
    { label: "Pacientes ativos", value: `${patients.active} de ${patients.total}` },
    { label: "Novos pacientes", value: String(patients.newInPeriod) },
    { label: "Evoluções registradas", value: String(evolutions.evolutionsInPeriod) },
  ];

  return (
    <aside
      aria-labelledby="balance-operations-title"
      className="rounded-2xl border border-[var(--color-gray-200)] bg-[var(--color-card)] shadow-[var(--shadow-sm)]"
    >
      <div className="px-5 pt-4 pb-4">
        <h2 id="balance-operations-title" className="text-lg font-bold text-[var(--color-secondary)]">
          Operação no período
        </h2>
        <div className="mt-3 flex items-baseline justify-between gap-2">
          <span className="text-sm text-[var(--color-gray-600)]">Consultas</span>
          <span className="font-mono text-2xl font-semibold tabular-nums text-[var(--color-secondary)]">{total}</span>
        </div>

        {total > 0 ? (
          <div
            role="img"
            aria-label={segments.map((s) => `${s.value} ${s.label.toLowerCase()}`).join(", ")}
            className="mt-2 flex h-2 gap-0.5 overflow-hidden rounded-full"
          >
            {segments
              .filter((s) => s.value > 0)
              .map((s) => (
                <span key={s.key} className="h-full" style={{ flexGrow: s.value, backgroundColor: s.color }} />
              ))}
          </div>
        ) : (
          <p className="mt-2 text-xs text-[var(--color-gray-600)]">Nenhuma consulta no período.</p>
        )}

        <ul className="mt-3 space-y-1.5">
          {segments.map((s) => (
            <li key={s.key} className="flex items-center justify-between gap-2 text-sm">
              <span className="flex items-center gap-2 text-[var(--color-secondary)]">
                <span aria-hidden="true" className="size-2 rounded-full" style={{ backgroundColor: s.color }} />
                {s.label}
              </span>
              <span className="font-mono tabular-nums text-[var(--color-gray-600)]">
                {s.value}
                {total > 0 && <span className="ml-2 text-xs">{Math.round((s.value / total) * 100)}%</span>}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <dl className="divide-y divide-[var(--color-gray-200)] border-t border-[var(--color-gray-200)]">
        {facts.map((fact) => (
          <div key={fact.label} className="flex items-baseline justify-between gap-3 px-5 py-3">
            <dt className="text-sm text-[var(--color-gray-600)]">{fact.label}</dt>
            <dd className="font-mono text-sm font-semibold tabular-nums text-[var(--color-secondary)]">{fact.value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
