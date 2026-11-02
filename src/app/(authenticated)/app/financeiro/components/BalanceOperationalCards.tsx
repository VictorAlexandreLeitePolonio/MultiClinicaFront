"use client";

import { CalendarCheck, ClipboardCheck, UserPlus, Users } from "lucide-react";
import { MetricCard } from "@/components/ui/MetricCard";
import type {
  BalanceAppointmentsSummary,
  BalanceEvolutionSummary,
  BalanceMoneySummary,
  BalancePatientsSummary,
} from "@/types";

interface BalanceOperationalCardsProps {
  money: BalanceMoneySummary | null;
  appointments: BalanceAppointmentsSummary | null;
  patients: BalancePatientsSummary | null;
  evolutions: BalanceEvolutionSummary | null;
}

export function BalanceOperationalCards({ money, appointments, patients, evolutions }: BalanceOperationalCardsProps) {
  const cards = [
    { label: "Pagamentos de consultas", value: money?.paidAppointmentCount ?? 0, icon: CalendarCheck },
    { label: "Consultas realizadas", value: appointments?.completed ?? 0, icon: ClipboardCheck },
    { label: "Consultas canceladas", value: appointments?.cancelled ?? 0, icon: CalendarCheck },
    { label: "Pacientes ativos", value: patients?.active ?? 0, icon: Users },
    { label: "Novos pacientes", value: patients?.newInPeriod ?? 0, icon: UserPlus },
    { label: "Evoluções no período", value: evolutions?.evolutionsInPeriod ?? 0, icon: ClipboardCheck },
  ];

  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card) => <MetricCard key={card.label} {...card} />)}</div>;
}
