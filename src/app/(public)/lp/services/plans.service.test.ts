import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchPublicPlans } from "./plans.service";

const get = vi.fn();

vi.mock("@/lib/publicApi", () => ({
  default: { get: (...args: unknown[]) => get(...args) },
}));

describe("public plans service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    get.mockResolvedValue({
      data: { plans: [], extraProfessionalPrice: 59, packs: [] },
    });
  });

  it("loads the public plans", async () => {
    await expect(fetchPublicPlans()).resolves.toEqual({
      plans: [],
      extraProfessionalPrice: 59,
      packs: [],
    });

    expect(get).toHaveBeenCalledWith("/api/public/plans");
  });
});
