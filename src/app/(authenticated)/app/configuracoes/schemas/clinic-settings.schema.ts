import { z } from "zod";
import { ClinicSettings, UpdateClinicSettingsRequest } from "@/types";

const hexColorRegex = /^#([A-Fa-f0-9]{6})$/;

export const clinicSettingsSchema = z.object({
  displayName: z.string().trim().max(120, "O nome de exibição deve ter no máximo 120 caracteres."),
  logoUrl: z.union([
    z.string().trim().url("Informe uma URL válida.").max(500, "A URL da logo deve ter no máximo 500 caracteres."),
    z.literal(""),
  ]),
  primaryColor: z.union([z.string().regex(hexColorRegex, "Use uma cor no formato #RRGGBB."), z.literal("")]),
  secondaryColor: z.union([z.string().regex(hexColorRegex, "Use uma cor no formato #RRGGBB."), z.literal("")]),
  accentColor: z.union([z.string().regex(hexColorRegex, "Use uma cor no formato #RRGGBB."), z.literal("")]),
  contactEmail: z.union([
    z.string().trim().email("Informe um email válido.").max(160, "O email deve ter no máximo 160 caracteres."),
    z.literal(""),
  ]),
  contactPhone: z.string().trim().max(30, "O telefone deve ter no máximo 30 caracteres."),
});

export type ClinicSettingsFormValues = z.infer<typeof clinicSettingsSchema>;

export function toClinicSettingsFormValues(settings: ClinicSettings): ClinicSettingsFormValues {
  return {
    displayName: settings.displayName ?? "",
    logoUrl: settings.logoUrl ?? "",
    primaryColor: settings.primaryColor ?? "",
    secondaryColor: settings.secondaryColor ?? "",
    accentColor: settings.accentColor ?? "",
    contactEmail: settings.contactEmail ?? "",
    contactPhone: settings.contactPhone ?? "",
  };
}

function emptyToNull(value: string): string | null {
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

export function toUpdateClinicSettingsRequest(
  values: ClinicSettingsFormValues,
): UpdateClinicSettingsRequest {
  return {
    displayName: emptyToNull(values.displayName),
    logoUrl: emptyToNull(values.logoUrl),
    primaryColor: emptyToNull(values.primaryColor),
    secondaryColor: emptyToNull(values.secondaryColor),
    accentColor: emptyToNull(values.accentColor),
    contactEmail: emptyToNull(values.contactEmail),
    contactPhone: emptyToNull(values.contactPhone),
  };
}
