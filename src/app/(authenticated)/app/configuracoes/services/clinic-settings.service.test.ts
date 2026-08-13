import { beforeEach, describe, expect, it, vi } from "vitest";
import { getClinicSettings, updateClinicSettings } from "./clinic-settings.service";

const get = vi.fn();
const put = vi.fn();

vi.mock("@/lib/api", () => ({
  default: {
    get: (...args: unknown[]) => get(...args),
    put: (...args: unknown[]) => put(...args),
  },
}));

describe("clinic-settings.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    get.mockResolvedValue({ data: { clinicId: 1 } });
    put.mockResolvedValue({ data: { clinicId: 1 } });
  });

  it("loads the logged clinic settings", async () => {
    await getClinicSettings();

    expect(get).toHaveBeenCalledWith("/api/clinic/settings");
  });

  it("updates the logged clinic settings", async () => {
    const payload = { displayName: "Clínica Centro", logoUrl: null };

    await updateClinicSettings(payload);

    expect(put).toHaveBeenCalledWith("/api/clinic/settings", payload);
  });
});
