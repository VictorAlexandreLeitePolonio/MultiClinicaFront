import { z } from "zod";

const daySchema = z.enum([
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
]);
const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, "Horário inválido");

export const availabilitySettingsSchema = z.object({
  slotDurationMinutes: z.number().int().min(15).max(240).refine((value) => value % 5 === 0, {
    message: "A duração deve ser múltipla de 5 minutos",
  }),
  timeZoneId: z.string().trim().min(1, "Selecione o fuso horário"),
});

export const professionalAvailabilitySchema = z
  .array(z.object({
    dayOfWeek: daySchema,
    startTime: timeSchema,
    endTime: timeSchema,
  }).refine((range) => range.startTime < range.endTime, {
    message: "O início deve ser anterior ao fim",
  }))
  .superRefine((ranges, context) => {
    for (const day of daySchema.options) {
      const ordered = ranges.filter((range) => range.dayOfWeek === day)
        .sort((left, right) => left.startTime.localeCompare(right.startTime));
      for (let index = 1; index < ordered.length; index += 1) {
        if (ordered[index - 1].endTime > ordered[index].startTime) {
          context.addIssue({ code: "custom", message: "As faixas do mesmo dia não podem se sobrepor" });
          return;
        }
      }
    }
  });
