import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test, vi } from "vitest";
import { ClinicSettings } from "@/types";
import { SettingsPage } from "./SettingsPage";

const navigation = vi.hoisted(() => ({
  current: new URLSearchParams(),
  replace: vi.fn(),
}));

const auth = vi.hoisted(() => ({
  current: { user: { role: "Administrador" } },
}));

const mutations = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => navigation.current,
  useRouter: () => ({ replace: navigation.replace }),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: auth.current.user,
    can: () => true,
    updateTenant: vi.fn(),
  }),
}));

vi.mock("../hooks/useClinicSettings", () => ({
  useClinicSettings: () => ({
    data: {
      clinicId: 1,
      name: "Clinica",
      displayName: "Clínica Centro",
      logoUrl: null,
      primaryColor: null,
      secondaryColor: null,
      accentColor: null,
      contactEmail: null,
      contactPhone: null,
      publicSlug: null,
      description: null,
      isPublic: false,
      acceptsAppointmentRequests: false,
      latitude: null,
      longitude: null,
      address: { rua: null, numero: null, bairro: null, cidade: null, estado: null, cep: null },
      likeCount: 0,
    } satisfies ClinicSettings,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useUpdateClinicSettings: () => ({ mutateAsync: mutations.mutateAsync, isPending: false }),
}));

vi.mock("./AvailabilitySettingsSection", () => ({
  AvailabilitySettingsSection: () => <div>Disponibilidade da clínica</div>,
}));
vi.mock("./ClinicBusinessHoursSection", () => ({
  ClinicBusinessHoursSection: () => <div>Horários públicos</div>,
}));
vi.mock("./ClinicSettingsForm", () => ({
  ClinicSettingsForm: () => <div>Dados da clínica</div>,
}));
vi.mock("./ClinicCategoriesSection", () => ({
  ClinicCategoriesSection: () => <div>Categorias</div>,
}));
vi.mock("./ClinicMediaSection", () => ({
  ClinicMediaSection: () => <div>Mídia</div>,
}));
vi.mock("./WhatsAppLinkSection", () => ({
  WhatsAppLinkSection: () => <div>WhatsApp</div>,
}));
vi.mock("./MercadoPagoSection", () => ({
  MercadoPagoSection: () => <div>Mercado Pago</div>,
}));

function renderSettings() {
  const view = render(<SettingsPage />);
  navigation.replace.mockImplementation((url: string) => {
    navigation.current = new URL(url, "http://localhost").searchParams;
    view.rerender(<SettingsPage />);
  });
  return view;
}

beforeEach(() => {
  navigation.current = new URLSearchParams();
  navigation.replace.mockReset();
  auth.current = { user: { role: "Administrador" } };
});

test("abre Atendimento por padrão e troca de aba pela URL", async () => {
  renderSettings();

  expect(await screen.findByText("Disponibilidade da clínica")).toBeInTheDocument();
  expect(screen.getByText("Horários públicos")).toBeInTheDocument();
  expect(screen.queryByText("Dados da clínica")).not.toBeInTheDocument();

  await userEvent.click(screen.getByRole("tab", { name: "Clínica" }));

  expect(screen.getByText("Dados da clínica")).toBeInTheDocument();
  expect(screen.getByText("Categorias")).toBeInTheDocument();
  expect(screen.getByText("Mídia")).toBeInTheDocument();
  expect(navigation.replace).toHaveBeenCalledWith("/app/configuracoes?aba=clinica");
});

test("abre a aba indicada na URL", async () => {
  navigation.current = new URLSearchParams("aba=clinica");
  renderSettings();

  expect(await screen.findByText("Dados da clínica")).toBeInTheDocument();
  expect(screen.queryByText("Disponibilidade da clínica")).not.toBeInTheDocument();
});

test("Profissional não vê Integrações nem Plano", async () => {
  auth.current = { user: { role: "Profissional" } };
  navigation.current = new URLSearchParams("aba=integracoes");
  renderSettings();

  expect(await screen.findByText("Disponibilidade da clínica")).toBeInTheDocument();
  expect(screen.queryByRole("tab", { name: "Integrações" })).not.toBeInTheDocument();
  expect(screen.queryByRole("tab", { name: "Plano" })).not.toBeInTheDocument();
});

test("Administrador abre Integrações e encontra o link do plano", async () => {
  renderSettings();

  await userEvent.click(await screen.findByRole("tab", { name: "Integrações" }));
  expect(screen.getByText("WhatsApp")).toBeInTheDocument();
  expect(screen.getByText("Mercado Pago")).toBeInTheDocument();

  await userEvent.click(screen.getByRole("tab", { name: "Plano" }));
  expect(screen.getByRole("link", { name: "Plano e assinatura" })).toHaveAttribute(
    "href",
    "/app/configuracoes/plano",
  );
});
