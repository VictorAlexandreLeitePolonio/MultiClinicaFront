"use client";

import { useQuery } from "@tanstack/react-query";
import { Activity } from "lucide-react";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { patientRecordKeys } from "@/lib/queryKeys";
import {
  EvolutionDirection,
  EvolutionFieldUnit,
  PatientMeasurementSeries,
  TreatmentProgressChart,
} from "@/types/evolution";
import { formatDate } from "@/utils/formatters";
import { getPatientMeasurements } from "../../services/patient-record.service";

interface Props {
  patientId: number;
}

export type MeasurementTrend = "Melhorou" | "Estável" | "Piorou";

const UNIT_LABELS: Record<EvolutionFieldUnit, string> = {
  None: "",
  Points: "Pontos",
  Percentage: "%",
  Kg: "kg",
  G: "g",
  Mg: "mg",
  Cm: "cm",
  Mm: "mm",
  M: "m",
  Degrees: "graus",
  Seconds: "s",
  Minutes: "min",
  Hours: "h",
  Days: "dias",
  Repetitions: "rep.",
  Liters: "L",
  Ml: "ml",
  Score: "pontos",
};

const TREND_STYLES: Record<MeasurementTrend, string> = {
  Melhorou: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
  "Estável": "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
  Piorou: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300",
};

const numberFormatter = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });

/** Tendência de um campo pela direção esperada da ficha. */
export function measurementTrend(
  direction: EvolutionDirection,
  initialValue: number,
  currentValue: number,
): MeasurementTrend {
  if (direction === "Neutral" || initialValue === currentValue) return "Estável";
  const increased = currentValue > initialValue;
  const improved = direction === "Increase" ? increased : !increased;
  return improved ? "Melhorou" : "Piorou";
}

function formatReading(value: number, unit: EvolutionFieldUnit): string {
  const unitLabel = UNIT_LABELS[unit];
  return unitLabel ? `${numberFormatter.format(value)} ${unitLabel}` : numberFormatter.format(value);
}

function evolutionCountLabel(count: number): string {
  return count === 1 ? "1 evolução" : `${count} evoluções`;
}

function MeasurementField({ field }: { field: TreatmentProgressChart }) {
  const trend = measurementTrend(field.direction, field.initialValue, field.currentValue);
  const chartData = field.data.map((point) => ({
    value: point.value,
    label: formatDate(point.date),
  }));

  return (
    <div className="grid gap-3 py-3 sm:grid-cols-[minmax(0,1fr)_180px] sm:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-[#0f172a] dark:text-white">{field.label}</p>
          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${TREND_STYLES[trend]}`}>
            {trend}
          </span>
        </div>
        <p className="mt-1 text-sm text-[#475569] dark:text-slate-300">
          {formatReading(field.initialValue, field.unit)} → {formatReading(field.currentValue, field.unit)}
        </p>
      </div>
      <div className="h-14 w-full min-w-[140px]" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 6, right: 6, left: 6, bottom: 6 }}>
            <Line
              type="monotone"
              dataKey="value"
              stroke="#14b8a6"
              strokeWidth={2}
              dot={chartData.length === 1 ? { r: 3 } : false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function MeasurementSeriesBlock({ series }: { series: PatientMeasurementSeries }) {
  return (
    <section className="p-5">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-bold text-[#0f172a] dark:text-white">{series.templateName}</h2>
        <p className="text-xs text-[#475569] dark:text-slate-300">
          Última medição em {formatDate(series.lastDate)} · {evolutionCountLabel(series.evolutionCount)}
        </p>
      </header>

      {series.fields.length === 0 ? (
        <p className="mt-3 text-sm text-[#475569] dark:text-slate-300">
          Nenhuma medição numérica registrada nesta ficha.
        </p>
      ) : (
        <div className="mt-3 divide-y divide-[#e6fbf4] dark:divide-slate-800">
          {series.fields.map((field) => (
            <MeasurementField key={field.fieldId} field={field} />
          ))}
        </div>
      )}
    </section>
  );
}

export function PatientMeasurements({ patientId }: Props) {
  const measurementsQuery = useQuery({
    queryKey: patientRecordKeys.measurements(patientId),
    queryFn: () => getPatientMeasurements(patientId),
  });

  if (measurementsQuery.isPending) {
    return (
      <div className="space-y-2" aria-label="Carregando medições">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-28" />
        ))}
      </div>
    );
  }

  if (measurementsQuery.isError) {
    return (
      <ErrorState
        message="Não foi possível carregar as medições."
        onRetry={() => void measurementsQuery.refetch()}
      />
    );
  }

  const series = measurementsQuery.data ?? [];
  if (series.length === 0) {
    return (
      <EmptyState
        title="Nenhuma medição registrada. Adicione fichas ao registrar uma evolução."
        icon={Activity}
      />
    );
  }

  return (
    <div className="divide-y divide-[#d7f3ea] overflow-hidden rounded-2xl border border-[#d7f3ea] bg-white shadow-[0_18px_50px_-44px_rgba(15,23,42,0.42)] dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
      {series.map((item) => (
        <MeasurementSeriesBlock key={item.templateId} series={item} />
      ))}
    </div>
  );
}
