import { describe, expect, it } from "vitest";
import {
  canAccessClinicApp,
  canAccessSuperAdmin,
  getDashboardPathByRole,
} from "./routes";

describe("auth route helpers", () => {
  it("redirects users to the correct dashboard by role", () => {
    expect(getDashboardPathByRole("SuperAdmin")).toBe("/superadmin");
    expect(getDashboardPathByRole("Administrador")).toBe("/app");
    expect(getDashboardPathByRole("Profissional")).toBe("/app");
    expect(getDashboardPathByRole("Recepcao")).toBe("/app");
  });

  it("separates SuperAdmin and clinic app access", () => {
    expect(canAccessSuperAdmin("SuperAdmin")).toBe(true);
    expect(canAccessSuperAdmin("Administrador")).toBe(false);
    expect(canAccessClinicApp("Administrador")).toBe(true);
    expect(canAccessClinicApp("Profissional")).toBe(true);
    expect(canAccessClinicApp("Recepcao")).toBe(true);
    expect(canAccessClinicApp("SuperAdmin")).toBe(false);
  });
});
