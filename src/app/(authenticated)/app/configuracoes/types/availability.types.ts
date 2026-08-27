import { DayOfWeekName } from "@/types";

export interface AvailabilitySettings {
  slotDurationMinutes: number;
  timeZoneId: string;
}

export interface ProfessionalAvailabilityRange {
  dayOfWeek: DayOfWeekName;
  startTime: string;
  endTime: string;
}
