import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  fetchBillingStatus,
  fetchUsage,
  startCheckout,
} from "@/app/(authenticated)/app/configuracoes/plano/services/billing.service";
import { fetchPublicPlans } from "@/app/(public)/lp/services/plans.service";
import type { BillingStatus, PublicPlansResponse, UsageResponse } from "@/types/plans";
import { METRIC_LABELS } from "@/utils/plans";
import { PlanPage } from "./PlanPage";
import { UsageBars } from "./UsageBars";

const mockSearchParams = vi.hoisted(() => ({ current: new URLSearchParams() }));

vi.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams.current,
}));

vi.mock("@/app/(authenticated)/app/configuracoes/plano/services/billing.service", () => ({
  fetchBillingStatus: vi.fn(),
  fetchUsage: vi.fn(),
  startCheckout: vi.fn(),
  changeSubscription: vi.fn(),
  cancelSubscription: vi.fn(),
  purchase: vi.fn(),
}));

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
      annualPrice: 499,
      includedProfessionals: 3,
      maxExtraProfessionals: 2,
      features: ["OwnerCopilot", "OnlinePayments"],
      quotas: { WhatsAppConversations: 300, TranscriptionMinutes: 0 },
      hubRank: 1,
    },
    {
      plan: "Premium",
      monthlyPrice: 79.9,
      annualPrice: 799,
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
  packs: [
    {
      id: "pro-conversations-200",
      plan: "Pro",
      metric: "WhatsAppConversations",
      amount: 200,
      price: 29,
    },
    {
      id: "premium-conversations-500",
      plan: "Premium",
      metric: "WhatsAppConversations",
      amount: 500,
      price: 49,
    },
    {
      id: "premium-transcription-300",
      plan: "Premium",
      metric: "TranscriptionMinutes",
      amount: 300,
      price: 29,
    },
  ],
};

const freeStatus: BillingStatus = {
  plan: "Free",
  billingCycle: null,
  isFounder: false,
  extraProfessionals: 0,
  professionalLimit: 1,
  activeProfessionals: 1,
  hasSubscription: false,
};

const freeUsage: UsageResponse = {
  period: "2026-10",
  metrics: [
    { metric: "WhatsAppConversations", used: 0, planLimit: 0, extraGranted: 0, total: 0 },
    { metric: "TranscriptionMinutes", used: 0, planLimit: 0, extraGranted: 0, total: 0 },
  ],
};

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <PlanPage />
    </QueryClientProvider>,
  );
}

function mockQueries(status: BillingStatus = freeStatus) {
  vi.mocked(fetchPublicPlans).mockResolvedValue(plans);
  vi.mocked(fetchBillingStatus).mockResolvedValue(status);
  vi.mocked(fetchUsage).mockResolvedValue(freeUsage);
}

describe("PlanPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockSearchParams.current = new URLSearchParams();
  });

  it("renderiza os três planos com os preços do contrato", async () => {
    mockQueries();
    renderPage();

    const freeCard = await screen.findByRole("article", { name: "Free" });
    const proCard = screen.getByRole("article", { name: "Pro" });
    const premiumCard = screen.getByRole("article", { name: "Premium" });

    expect(within(freeCard).getByText("R$ 0,00")).toBeInTheDocument();
    expect(within(proCard).getByText("R$ 49,90")).toBeInTheDocument();
    expect(within(premiumCard).getByText("R$ 79,90")).toBeInTheDocument();
  });

  it("alternar para Anual mostra o preço anual e os dois meses grátis", async () => {
    mockQueries();
    renderPage();

    await userEvent.click(await screen.findByRole("button", { name: "Anual" }));

    const proCard = screen.getByRole("article", { name: "Pro" });
    expect(within(proCard).getByText("R$ 499,00")).toBeInTheDocument();
    expect(screen.getByText("2 meses grátis")).toBeInTheDocument();
  });

  it("clicar em Assinar no Pro inicia o checkout mensal", async () => {
    mockQueries();
    vi.mocked(startCheckout).mockResolvedValue({ url: "https://pay.test/checkout" });
    renderPage();

    const proCard = await screen.findByRole("article", { name: "Pro" });
    await userEvent.click(within(proCard).getByRole("button", { name: "Assinar" }));

    await waitFor(() => expect(startCheckout).toHaveBeenCalledWith("Pro", "Monthly"));
  });

  it("clínica fundadora não mostra botões de assinatura nem de troca", async () => {
    mockQueries({
      plan: "Premium",
      billingCycle: null,
      isFounder: true,
      extraProfessionals: 0,
      professionalLimit: null,
      activeProfessionals: 1,
      hasSubscription: false,
    });
    renderPage();

    expect((await screen.findAllByText("Fundadora")).length).toBeGreaterThan(0);
    expect(screen.getByText("Premium de cortesia para sempre.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Assinar" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Trocar" })).not.toBeInTheDocument();
  });

  it("mostra o aviso de validade do pacote no mês", async () => {
    mockQueries({
      plan: "Pro",
      billingCycle: "Monthly",
      isFounder: false,
      extraProfessionals: 0,
      professionalLimit: 3,
      activeProfessionals: 2,
      hasSubscription: true,
    });
    renderPage();

    expect(await screen.findByText(/Válido até o fim deste mês/)).toBeInTheDocument();
  });

  it("inicia o checkout uma única vez quando vem da landing page", async () => {
    mockSearchParams.current = new URLSearchParams("assinar=Premium&ciclo=Annual");
    mockQueries();
    vi.mocked(startCheckout).mockResolvedValue({ url: "https://pay.test/checkout" });
    renderPage();

    await waitFor(() => expect(startCheckout).toHaveBeenCalledWith("Premium", "Annual"));
    expect(startCheckout).toHaveBeenCalledTimes(1);
  });
});

describe("UsageBars", () => {
  it("mostra o uso e entra em alerta a partir de 80%", () => {
    render(
      <UsageBars
        usage={{
          period: "2026-10",
          metrics: [
            {
              metric: "WhatsAppConversations",
              used: 240,
              planLimit: 300,
              extraGranted: 0,
              total: 300,
            },
          ],
        }}
      />,
    );

    expect(screen.getByText("240 de 300")).toBeInTheDocument();
    const bar = screen.getByRole("progressbar", { name: METRIC_LABELS.WhatsAppConversations });
    expect(bar).toHaveAttribute("aria-valuenow", "240");
    expect(bar).toHaveAttribute("data-alert", "true");
  });
});
