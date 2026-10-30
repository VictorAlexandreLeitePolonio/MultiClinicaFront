import { describe, expect, it } from "vitest";
import type { PublicPlan } from "@/types/plans";
import { annualSavings } from "./plans";

function makePlan(monthlyPrice: number, annualPrice: number): PublicPlan {
  return {
    plan: "Pro",
    monthlyPrice,
    annualPrice,
    includedProfessionals: null,
    maxExtraProfessionals: 0,
    features: [],
    quotas: { WhatsAppConversations: 0, TranscriptionMinutes: 0 },
    hubRank: 0,
  };
}

describe("annualSavings", () => {
  it("calcula a economia real do plano Pro", () => {
    expect(annualSavings(makePlan(49.9, 499.9))).toBe(98.9);
  });

  it("calcula a economia real do plano Premium", () => {
    expect(annualSavings(makePlan(79.9, 799.9))).toBe(158.9);
  });

  it("não retorna economia quando o anual custa pelo menos 12 meses", () => {
    expect(annualSavings(makePlan(100, 1200))).toBe(0);
  });

  it("não retorna economia para o plano Free", () => {
    expect(annualSavings(makePlan(0, 0))).toBe(0);
  });
});
