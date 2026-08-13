import { describe, expect, it } from "vitest";
import {
  clinicSettingsSchema,
  toUpdateClinicSettingsRequest,
} from "./clinic-settings.schema";

describe("clinicSettingsSchema", () => {
  it("converts empty form values to null in the write payload", () => {
    const values = clinicSettingsSchema.parse({
      displayName: " Clínica Centro ",
      logoUrl: "",
      primaryColor: "#2563EB",
      secondaryColor: "",
      accentColor: "",
      contactEmail: "",
      contactPhone: "",
    });

    expect(toUpdateClinicSettingsRequest(values)).toEqual({
      displayName: "Clínica Centro",
      logoUrl: null,
      primaryColor: "#2563EB",
      secondaryColor: null,
      accentColor: null,
      contactEmail: null,
      contactPhone: null,
    });
  });
});
