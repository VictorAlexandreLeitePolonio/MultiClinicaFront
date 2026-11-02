import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PublicClinicCard } from "@/components/clinic/public-clinics.service";
import { HubSection } from "./HubSection";

const { usePublicClinicsMock } = vi.hoisted(() => ({
  usePublicClinicsMock: vi.fn(),
}));

vi.mock("@/components/clinic/usePublicClinics", () => ({
  usePublicClinics: usePublicClinicsMock,
}));

vi.mock("@/components/clinic/ClinicDetailModal", () => ({
  ClinicDetailModal: ({ source }: { source: { mode: string; slug: string } | null }) =>
    source ? `Modal: ${source.mode}:${source.slug}` : null,
}));

const clinics: PublicClinicCard[] = [
  {
    id: 1,
    slug: "clinica-alfa",
    displayName: "Clínica Alfa",
    logoUrl: null,
    city: "Itapetininga",
    state: "SP",
    categories: [],
    likeCount: 0,
    acceptsAppointmentRequests: true,
    badge: "Featured",
  },
  {
    id: 2,
    slug: "clinica-beta",
    displayName: "Clínica Beta",
    logoUrl: null,
    city: "Sorocaba",
    state: "SP",
    categories: [],
    likeCount: 0,
    acceptsAppointmentRequests: false,
    badge: "Founder",
  },
];

function mockState(state: {
  data?: PublicClinicCard[];
  isLoading?: boolean;
  isError?: boolean;
}) {
  usePublicClinicsMock.mockReturnValue({
    data: state.data,
    isLoading: state.isLoading ?? false,
    isError: state.isError ?? false,
  });
}

describe("HubSection", () => {
  beforeEach(() => {
    usePublicClinicsMock.mockReset();
  });

  it("mostra o skeleton enquanto as clínicas carregam", () => {
    mockState({ isLoading: true });
    render(<HubSection />);

    expect(screen.getByRole("status", { name: "Carregando clínicas" })).toBeInTheDocument();
  });

  it("mostra o estado vazio quando ainda não há clínicas", () => {
    mockState({ data: [] });
    render(<HubSection />);

    expect(screen.getByText("As primeiras clínicas estão chegando.")).toBeInTheDocument();
  });

  it("lista as clínicas com cidade, selo e abre os detalhes", async () => {
    mockState({ data: clinics });
    render(<HubSection />);

    expect(screen.getAllByText("Clínica Alfa")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Itapetininga · SP")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Destaque")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Fundadora")[0]).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Colocar minha clínica no Hub" })).toHaveAttribute(
      "href",
      "/cadastro",
    );
    expect(screen.getByRole("link", { name: "Explorar o Hub" })).toHaveAttribute("href", "/hub");

    await userEvent.click(screen.getAllByRole("button", { name: /Clínica Alfa/ })[0]);

    expect(screen.getByText("Modal: public:clinica-alfa")).toBeInTheDocument();
  });

  it("não quebra a página quando a busca de clínicas falha", () => {
    mockState({ isError: true });
    render(<HubSection />);

    expect(
      screen.getByText("Não foi possível carregar as clínicas agora. Tente novamente em instantes."),
    ).toBeInTheDocument();
  });
});
