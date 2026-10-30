import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "@/lib/api";
import {
  getPaymentLink,
  refundDuplicate,
  refundPayment,
  sendPaymentCharge,
} from "./online-payment.service";

vi.mock("@/lib/api", () => ({ default: { get: vi.fn(), post: vi.fn() } }));

describe("online payment service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sends the charge by e-mail", async () => {
    vi.mocked(api.post).mockResolvedValue({ data: undefined });
    await sendPaymentCharge(12);
    expect(api.post).toHaveBeenCalledWith("/api/payments/12/send");
  });

  it("gets the public payment link", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { url: "https://app.cliniq.com/pagar/token" } });
    await expect(getPaymentLink(12)).resolves.toEqual({ url: "https://app.cliniq.com/pagar/token" });
    expect(api.get).toHaveBeenCalledWith("/api/payments/12/link");
  });

  it("refunds a paid charge", async () => {
    vi.mocked(api.post).mockResolvedValue({ data: undefined });
    await refundPayment(12);
    expect(api.post).toHaveBeenCalledWith("/api/payments/12/refund");
  });

  it("refunds a duplicated charge", async () => {
    vi.mocked(api.post).mockResolvedValue({ data: undefined });
    await refundDuplicate(12);
    expect(api.post).toHaveBeenCalledWith("/api/payments/12/refund-duplicate");
  });
});
