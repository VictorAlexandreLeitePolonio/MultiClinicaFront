import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  MarketplaceClinicCard,
  MarketplaceClinicPage,
} from "@/app/(patient-authenticated)/paciente/marketplace/types/marketplace.types";
import { HubPageContent } from "./HubPageContent";

const { replaceMock, searchParamsMock, getClinicsMock, getCategoriesMock } = vi.hoisted(() => ({
  replaceMock: vi.fn(),
  searchParamsMock: vi.fn(),
  getClinicsMock: vi.fn(),
  getCategoriesMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
  usePathname: () => "/hub",
  useSearchParams: () => searchParamsMock(),
}));

vi.mock("@/components/clinic/public-hub.service", () => ({
  getPublicHubCategories: getCategoriesMock,
  getPublicHubClinics: getClinicsMock,
}));

vi.mock("@/components/ClinicLikeButton", () => ({
  ClinicLikeButton: () => <button type="button">Curtir clínica</button>,
}));

vi.mock("@/components/clinic/ClinicDetailModal", () => ({
  ClinicDetailModal: ({ source }: { source: { mode: string; slug: string } | null }) =>
    source ? <div>{`modal:${source.mode}:${source.slug}`}</div> : null,
}));

const clinic: MarketplaceClinicCard = {
  id: 1,
  slug: "clinica-alfa",
  displayName: "Clínica Alfa",
  logoUrl: null,
  coverUrl: null,
  categories: [{ id: 1, name: "Psicologia", slug: "psicologia" }],
  city: "Itapetininga",
  state: "SP",
  likeCount: 10,
  likedByMe: false,
  acceptsAppointmentRequests: true,
  badge: null,
};

function clinicsPage(data: MarketplaceClinicCard[]): MarketplaceClinicPage {
  return { data, totalCount: data.length, page: 1, pageSize: 12 };
}

function renderHub() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <HubPageContent />
    </QueryClientProvider>,
  );
}

describe("HubPageContent", () => {
  beforeEach(() => {
    replaceMock.mockReset();
    searchParamsMock.mockReturnValue(new URLSearchParams());
    getCategoriesMock.mockResolvedValue([]);
    getClinicsMock.mockResolvedValue(clinicsPage([]));
  });

  it("lista as clínicas sem botão de curtir", async () => {
    getClinicsMock.mockResolvedValue(clinicsPage([clinic]));
    renderHub();

    expect(await screen.findByText("Clínica Alfa")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /curtir clínica/i })).not.toBeInTheDocument();
    expect(screen.getByLabelText("10 curtidas")).toBeInTheDocument();
    expect(screen.queryByLabelText("Somente curtidas")).not.toBeInTheDocument();
  });

  it("mostra o estado vazio quando não há resultados", async () => {
    renderHub();

    expect(await screen.findByText("Nenhuma clínica encontrada")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Limpar filtros" })).not.toBeInTheDocument();
  });

  it("abre o modal ao carregar /hub?clinica=slug", async () => {
    searchParamsMock.mockReturnValue(new URLSearchParams("clinica=clinica-alfa"));
    renderHub();

    expect(await screen.findByText("modal:public:clinica-alfa")).toBeInTheDocument();
  });

  it("coloca o slug da clínica na URL ao abrir o detalhe", async () => {
    getClinicsMock.mockResolvedValue(clinicsPage([clinic]));
    renderHub();

    await userEvent.click(await screen.findByRole("button", { name: /ver detalhes de clínica alfa/i }));

    expect(replaceMock).toHaveBeenCalledWith("/hub?clinica=clinica-alfa", { scroll: false });
  });
});
