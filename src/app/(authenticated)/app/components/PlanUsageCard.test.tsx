import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  BillingStatus,
  UsageResponse,
  fetchBillingStatus,
  fetchUsage,
} from "@/lib/plans";
import { PlanUsageCard } from "./PlanUsageCard";

vi.mock("@/lib/plans", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/plans")>();
  return {
    ...actual,
    fetchBillingStatus: vi.fn(),
    fetchUsage: vi.fn(),
  };
});

const proStatus: BillingStatus = {
  plan: "Pro",
  billingCycle: "Monthly",
  isFounder: false,
  extraProfessionals: 0,
  professionalLimit: 3,
  activeProfessionals: 2,
  hasSubscription: true,
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

const nearLimitUsage: UsageResponse = {
  period: "2026-10",
  metrics: [
    { metric: "WhatsAppConversations", used: 240, planLimit: 300, extraGranted: 0, total: 300 },
    { metric: "TranscriptionMinutes", used: 0, planLimit: 0, extraGranted: 0, total: 0 },
  ],
};

const freeUsage: UsageResponse = {
  period: "2026-10",
  metrics: [
    { metric: "WhatsAppConversations", used: 0, planLimit: 0, extraGranted: 0, total: 0 },
    { metric: "TranscriptionMinutes", used: 0, planLimit: 0, extraGranted: 0, total: 0 },
  ],
};

function renderCard() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <PlanUsageCard />
    </QueryClientProvider>,
  );
}

describe("PlanUsageCard", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("mostra o uso e o CTA de pacote a partir de 80%", async () => {
    vi.mocked(fetchBillingStatus).mockResolvedValue(proStatus);
    vi.mocked(fetchUsage).mockResolvedValue(nearLimitUsage);
    renderCard();

    expect(await screen.findByText("Uso do plano")).toBeInTheDocument();
    expect(screen.getByText("Pro")).toBeInTheDocument();
    expect(screen.getByText("240 de 300")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Comprar pacote" })).toHaveAttribute(
      "href",
      "/app/configuracoes/plano",
    );
  });

  it("mostra o CTA de planos para o Free sem cotas", async () => {
    vi.mocked(fetchBillingStatus).mockResolvedValue(freeStatus);
    vi.mocked(fetchUsage).mockResolvedValue(freeUsage);
    renderCard();

    expect(await screen.findByText("Uso do plano")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Conheça os planos" })).toHaveAttribute(
      "href",
      "/app/configuracoes/plano",
    );
  });

  it("não renderiza nada quando o uso falha", async () => {
    vi.mocked(fetchBillingStatus).mockResolvedValue(proStatus);
    vi.mocked(fetchUsage).mockRejectedValue(new Error("network"));
    const { container } = renderCard();

    await waitFor(() => expect(fetchUsage).toHaveBeenCalledTimes(1));
    expect(container).toBeEmptyDOMElement();
  });
});
