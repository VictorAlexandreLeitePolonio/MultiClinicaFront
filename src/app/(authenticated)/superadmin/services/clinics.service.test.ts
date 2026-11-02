import { beforeEach, describe, expect, it, vi } from "vitest";
import { setClinicPlan } from "./clinics.service";

const put = vi.fn();

vi.mock("@/lib/api", () => ({
  default: { put: (...args: unknown[]) => put(...args) },
}));

describe("clinics service plan update", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    put.mockResolvedValue({ data: undefined });
  });

  it("updates the clinic plan and founder flag", async () => {
    await setClinicPlan(5, "Pro", true);

    expect(put).toHaveBeenCalledWith("/api/superadmin/clinicas/5/plan", {
      plan: "Pro",
      isFounder: true,
    });
  });
});
