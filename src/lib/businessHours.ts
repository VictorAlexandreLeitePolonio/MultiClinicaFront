import { BusinessHour, DayOfWeekName } from "@/types";

export const ORDERED_DAYS: { value: DayOfWeekName; label: string }[] = [
  { value: "Monday", label: "Segunda" },
  { value: "Tuesday", label: "Terça" },
  { value: "Wednesday", label: "Quarta" },
  { value: "Thursday", label: "Quinta" },
  { value: "Friday", label: "Sexta" },
  { value: "Saturday", label: "Sábado" },
  { value: "Sunday", label: "Domingo" },
];

/** "HH:mm:ss" → "HH:mm". */
export const toHourMinute = (time: string) => time.slice(0, 5);

/** Agrupa as faixas por dia, ordenadas por horário inicial. */
export function groupBusinessHoursByDay(hours: BusinessHour[]): Record<DayOfWeekName, BusinessHour[]> {
  const grouped = {} as Record<DayOfWeekName, BusinessHour[]>;
  for (const { value } of ORDERED_DAYS) {
    grouped[value] = hours
      .filter((h) => h.dayOfWeek === value)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }
  return grouped;
}
