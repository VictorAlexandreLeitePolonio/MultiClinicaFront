import { describe, expect, it } from "vitest";
import {
  clinicSettingsSchema,
  toUpdateClinicSettingsRequest,
} from "./clinic-settings.schema";

const baseForm = {
  displayName: " Clínica Centro ",
  logoUrl: "",
  primaryColor: "#2563EB",
  secondaryColor: "",
  accentColor: "",
  contactEmail: "",
  contactPhone: "",
  publicSlug: "clinica-centro",
  description: "Descrição",
  isPublic: true,
  acceptsAppointmentRequests: true,
  latitude: "-23.5",
  longitude: "",
  rua: "Rua A",
  numero: "10",
  bairro: "",
  cidade: "São Paulo",
  estado: "SP",
  cep: "",
};

describe("clinicSettingsSchema", () => {
  it("converte valores vazios para null e monta endereço/coordenadas", () => {
    const values = clinicSettingsSchema.parse(baseForm);
    const payload = toUpdateClinicSettingsRequest(values);

    expect(payload.displayName).toBe("Clínica Centro");
    expect(payload.logoUrl).toBeNull();
    expect(payload.publicSlug).toBe("clinica-centro");
    expect(payload.isPublic).toBe(true);
    expect(payload.acceptsAppointmentRequests).toBe(true);
    expect(payload.latitude).toBe(-23.5);
    expect(payload.longitude).toBeNull();
    expect(payload.address).toEqual({
      rua: "Rua A",
      numero: "10",
      bairro: null,
      cidade: "São Paulo",
      estado: "SP",
      cep: null,
    });
  });

  it("força acceptsAppointmentRequests=false quando o perfil não é público", () => {
    const values = clinicSettingsSchema.parse({
      ...baseForm,
      isPublic: false,
      acceptsAppointmentRequests: true,
    });
    expect(toUpdateClinicSettingsRequest(values).acceptsAppointmentRequests).toBe(false);
  });

  it("rejeita slug com caracteres inválidos", () => {
    expect(clinicSettingsSchema.safeParse({ ...baseForm, publicSlug: "Slug Inválido!" }).success).toBe(false);
  });
});
