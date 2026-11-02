import { describe, expect, it, vi } from "vitest";
import publicApi from "@/lib/publicApi";
import { getPublicPayment, payPublicPayment } from "./public-payment.service";

vi.mock("@/lib/publicApi", () => ({ default: { get: vi.fn(), post: vi.fn() } }));

describe("public payment service", () => {
  it("busca a cobrança pelo token", async () => {
    vi.mocked(publicApi.get).mockResolvedValue({ data: { status: "Pending" } });

    await getPublicPayment("abc123");

    expect(publicApi.get).toHaveBeenCalledWith("/api/public/payments/abc123");
  });

  it("envia o formData do Brick para o pagamento", async () => {
    const formData = {
      token: "card-token",
      payment_method_id: "pix",
      payer: { email: "ana@example.com" },
    };
    vi.mocked(publicApi.post).mockResolvedValue({ data: { paymentId: 9, status: "pending" } });

    await payPublicPayment("abc123", formData);

    expect(publicApi.post).toHaveBeenCalledWith("/api/public/payments/abc123/pay", formData);
  });
});
