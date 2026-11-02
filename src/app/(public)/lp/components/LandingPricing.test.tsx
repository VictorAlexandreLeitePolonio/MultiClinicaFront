import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchPublicPlans } from "@/app/(public)/lp/services/plans.service";
import type { PublicPlansResponse } from "@/types/plans";
import { LandingPricing } from "./LandingPricing";

vi.mock("@/app/(public)/lp/services/plans.service", () => ({
  fetchPublicPlans: vi.fn(),
}));

const plans: PublicPlansResponse = {
  plans: [
    {
      plan: "Free",
      monthlyPrice: 0,
      annualPrice: 0,
      includedProfessionals: 1,
      maxExtraProfessionals: 1,
      features: [],
      quotas: { WhatsAppConversations: 0, TranscriptionMinutes: 0 },
      hubRank: 0,
    },
    {
      plan: "Pro",
      monthlyPrice: 49.9,
      annualPrice: 499.9,
      includedProfessionals: 3,
      maxExtraProfessionals: 2,
      features: ["OwnerCopilot", "OnlinePayments"],
      quotas: { WhatsAppConversations: 300, TranscriptionMinutes: 0 },
      hubRank: 1,
    },
    {
      plan: "Premium",
      monthlyPrice: 79.9,
      annualPrice: 799.9,
      includedProfessionals: null,
      maxExtraProfessionals: 0,
      features: [
        "OwnerCopilot",
        "OnlinePayments",
        "WhatsAppReminders",
        "PatientChatbot",
        "Transcription",
      ],
      quotas: { WhatsAppConversations: 800, TranscriptionMinutes: 1200 },
      hubRank: 2,
    },
  ],
  extraProfessionalPrice: 59,
  packs: [],
};

function renderPricing() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <LandingPricing />
    </QueryClientProvider>,
  );
}

describe("LandingPricing", () => {
  beforeEach(() => {
    vi.mocked(fetchPublicPlans).mockReset();
  });

  it("mostra os preços mensais e alterna para o anual com a economia real", async () => {
    vi.mocked(fetchPublicPlans).mockResolvedValue(plans);
    renderPricing();

    expect(await screen.findByText(/49,90/)).toBeInTheDocument();
    expect(screen.getByText(/79,90/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Anual" }));

    expect(screen.getByText(/499,90/)).toBeInTheDocument();
    expect(screen.getByText("Economize R$ 98,90")).toBeInTheDocument();
    expect(screen.getByText("No anual, você economiza até R$ 158,90.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Assinar Premium" })).toHaveAttribute(
      "href",
      "/cadastro?plano=Premium&ciclo=Annual",
    );
  });

  it("não quebra a página quando a API falha", async () => {
    vi.mocked(fetchPublicPlans).mockRejectedValue(new Error("offline"));
    renderPricing();

    expect(await screen.findAllByRole("link", { name: "Começar grátis" })).toHaveLength(3);
    expect(screen.getByText("Pague anual e economize.")).toBeInTheDocument();
  });
});
