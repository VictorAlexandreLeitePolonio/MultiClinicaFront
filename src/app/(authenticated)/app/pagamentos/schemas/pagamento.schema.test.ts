import { describe, expect, it } from "vitest";
import { PagamentoSchema } from "./pagamento.schema";

const validPayment = {
  patientId: 1,
  planId: 1,
  referenceMonth: "2026-09-20",
  paymentMethod: "Pix",
  status: "Paid" as const,
  paidAt: "2026-09-04",
  paymentDate: null,
};

describe("PagamentoSchema", () => {
  it("aceita datas civis ISO e preserva o dia informado", () => {
    const result = PagamentoSchema.safeParse(validPayment);

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.referenceMonth).toBe("2026-09-20");
  });

  it("rejeita referência ausente, formato antigo e datas impossíveis", () => {
    expect(PagamentoSchema.safeParse({ ...validPayment, referenceMonth: "" }).success).toBe(false);
    expect(PagamentoSchema.safeParse({ ...validPayment, referenceMonth: "09-2026" }).success).toBe(false);
    expect(PagamentoSchema.safeParse({ ...validPayment, referenceMonth: "2026-02-30" }).success).toBe(false);
  });
});
