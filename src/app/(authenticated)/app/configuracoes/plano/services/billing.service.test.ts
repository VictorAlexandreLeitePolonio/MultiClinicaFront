import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  cancelSubscription,
  changeSubscription,
  fetchBillingStatus,
  fetchUsage,
  purchase,
  startCheckout,
} from "./billing.service";

const get = vi.fn();
const post = vi.fn();

vi.mock("@/lib/api", () => ({
  default: {
    get: (...args: unknown[]) => get(...args),
    post: (...args: unknown[]) => post(...args),
  },
}));

describe("billing service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads the billing status and usage", async () => {
    const status = {
      plan: "Pro",
      billingCycle: "Monthly",
      isFounder: false,
      extraProfessionals: 0,
      professionalLimit: 3,
      activeProfessionals: 2,
      hasSubscription: true,
    };
    const usage = {
      period: "2026-10",
      metrics: [
        { metric: "WhatsAppConversations", used: 10, planLimit: 300, extraGranted: 0, total: 300 },
      ],
    };

    get.mockResolvedValueOnce({ data: status }).mockResolvedValueOnce({ data: usage });

    await expect(fetchBillingStatus()).resolves.toEqual(status);
    await expect(fetchUsage()).resolves.toEqual(usage);

    expect(get).toHaveBeenNthCalledWith(1, "/api/billing/me");
    expect(get).toHaveBeenNthCalledWith(2, "/api/billing/usage");
  });

  it("starts a checkout and changes the subscription", async () => {
    post
      .mockResolvedValueOnce({ data: { url: "https://pay.test/checkout" } })
      .mockResolvedValueOnce({ data: undefined });

    await expect(startCheckout("Pro", "Monthly")).resolves.toEqual({
      url: "https://pay.test/checkout",
    });
    await changeSubscription("Premium", "Annual");

    expect(post).toHaveBeenNthCalledWith(1, "/api/billing/subscription/checkout", {
      plan: "Pro",
      cycle: "Monthly",
    });
    expect(post).toHaveBeenNthCalledWith(2, "/api/billing/subscription/change", {
      plan: "Premium",
      cycle: "Annual",
    });
  });

  it("cancels the subscription and purchases an item", async () => {
    post.mockResolvedValue({ data: { url: "https://pay.test/purchase" } });

    await cancelSubscription();
    await expect(purchase("pack:pro-conversations-200")).resolves.toEqual({
      url: "https://pay.test/purchase",
    });

    expect(post).toHaveBeenNthCalledWith(1, "/api/billing/subscription/cancel");
    expect(post).toHaveBeenNthCalledWith(2, "/api/billing/purchase", {
      item: "pack:pro-conversations-200",
    });
  });
});
