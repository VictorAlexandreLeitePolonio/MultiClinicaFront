import { beforeEach, describe, expect, it, vi } from "vitest";
import { getMarketplaceClinics } from "./marketplace.service";

const get = vi.fn();

vi.mock("@/lib/patientApi", () => ({
  default: { get: (...args: unknown[]) => get(...args) },
}));

describe("marketplace.service", () => {
  beforeEach(() => {
    get.mockReset();
  });

  it("serializa múltiplas categorias como parâmetros repetidos", async () => {
    get.mockResolvedValue({ data: { data: [], totalCount: 0, page: 1, pageSize: 12 } });

    await getMarketplaceClinics({ categoryIds: [1, 2], page: 1, pageSize: 12 });

    const [, config] = get.mock.calls[0];
    expect(config.params.toString()).toContain("categoryIds=1&categoryIds=2");
    expect(config.params.toString()).not.toContain("categoryIds%5B%5D");
  });
});
