import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getSuperAdminClinicSettings,
  updateSuperAdminClinicSettings,
} from "./superadmin-clinic-settings.service";

const get = vi.fn();
const put = vi.fn();

vi.mock("@/lib/api", () => ({
  default: {
    get: (...args: unknown[]) => get(...args),
    put: (...args: unknown[]) => put(...args),
  },
}));

describe("superadmin-clinic-settings.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    get.mockResolvedValue({ data: { clinicId: 4 } });
    put.mockResolvedValue({ data: { clinicId: 4 } });
  });

  it("uses the clinic settings endpoint", async () => {
    await getSuperAdminClinicSettings(4);
    await updateSuperAdminClinicSettings(4, { displayName: "Nova clínica" });

    expect(get).toHaveBeenCalledWith("/api/superadmin/clinics/4/settings");
    expect(put).toHaveBeenCalledWith("/api/superadmin/clinics/4/settings", {
      displayName: "Nova clínica",
    });
  });
});
