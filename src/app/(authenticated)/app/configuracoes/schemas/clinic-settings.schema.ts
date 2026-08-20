import { z } from "zod";
import { ClinicSettings, UpdateClinicSettingsRequest } from "@/types";

const hexColorRegex = /^#([A-Fa-f0-9]{6})$/;
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const coordinateField = z.union([
  z.literal(""),
  z
    .string()
    .refine((value) => !Number.isNaN(Number(value)), "Informe um número válido."),
]);

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

  // ── Presença pública ──
  publicSlug: z.union([
    z.string().trim().regex(slugRegex, "Use apenas letras minúsculas, números e hifens.").max(80),
    z.literal(""),
  ]),
  description: z.string().trim().max(1000, "A descrição deve ter no máximo 1000 caracteres."),
  isPublic: z.boolean(),
  acceptsAppointmentRequests: z.boolean(),
  latitude: coordinateField,
  longitude: coordinateField,
  rua: z.string().trim().max(160),
  numero: z.string().trim().max(20),
  bairro: z.string().trim().max(120),
  cidade: z.string().trim().max(120),
  estado: z.string().trim().max(60),
  cep: z.string().trim().max(12),
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
    publicSlug: settings.publicSlug ?? "",
    description: settings.description ?? "",
    isPublic: settings.isPublic ?? false,
    acceptsAppointmentRequests: settings.acceptsAppointmentRequests ?? false,
    latitude: settings.latitude != null ? String(settings.latitude) : "",
    longitude: settings.longitude != null ? String(settings.longitude) : "",
    rua: settings.address?.rua ?? "",
    numero: settings.address?.numero ?? "",
    bairro: settings.address?.bairro ?? "",
    cidade: settings.address?.cidade ?? "",
    estado: settings.address?.estado ?? "",
    cep: settings.address?.cep ?? "",
  };
}

function emptyToNull(value: string): string | null {
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function toNumberOrNull(value: string): number | null {
  const normalized = value.trim();
  return normalized.length > 0 ? Number(normalized) : null;
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
    publicSlug: emptyToNull(values.publicSlug),
    description: emptyToNull(values.description),
    isPublic: values.isPublic,
    // Dependência: só aceita solicitações quando o perfil está público.
    acceptsAppointmentRequests: values.isPublic && values.acceptsAppointmentRequests,
    latitude: toNumberOrNull(values.latitude),
    longitude: toNumberOrNull(values.longitude),
    address: {
      rua: emptyToNull(values.rua),
      numero: emptyToNull(values.numero),
      bairro: emptyToNull(values.bairro),
      cidade: emptyToNull(values.cidade),
      estado: emptyToNull(values.estado),
      cep: emptyToNull(values.cep),
    },
  };
}
