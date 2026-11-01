import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, expect, test, vi } from "vitest";
import { PatientProfile } from "@/types";
import PacienteProfile from "./PacienteProfile";

const navigation = vi.hoisted(() => ({
  current: new URLSearchParams(),
  replace: vi.fn(),
  push: vi.fn(),
}));

const profileHook = vi.hoisted(() => ({
  current: {
    data: null as PatientProfile | null,
    loading: false,
    error: null as string | null,
    refetch: vi.fn(),
  },
}));

const auth = vi.hoisted(() => ({
  current: { user: { role: "Administrador" } },
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => navigation.current,
  useRouter: () => ({ replace: navigation.replace, push: navigation.push }),
}));

vi.mock("../hooks/profile", () => ({
  useGetPatientProfile: () => profileHook.current,
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: auth.current.user }),
}));

vi.mock("./PatientPortalAccessSection", () => ({
  PatientPortalAccessSection: () => <div>Acesso ao portal</div>,
}));

vi.mock("./record/PatientTimeline", () => ({
  PatientTimeline: ({
    patientId,
    onOpenEvolution,
  }: {
    patientId: number;
    onOpenEvolution: (evolutionId: number) => void;
  }) => (
    <div>
      Linha do tempo do paciente {patientId}
      <button type="button" onClick={() => onOpenEvolution(20)}>
        Abrir evolução 20
      </button>
    </div>
  ),
}));

vi.mock("./record/PatientAnamnesis", () => ({
  PatientAnamnesis: ({ patientId, creating }: { patientId: number; creating?: boolean }) => (
    <div>
      Anamnese do paciente {patientId} criando {creating ? "sim" : "não"}
    </div>
  ),
}));

vi.mock("./record/PatientMeasurements", () => ({
  PatientMeasurements: ({ patientId }: { patientId: number }) => (
    <div>Medições do paciente {patientId}</div>
  ),
}));

vi.mock("./record/PatientDocuments", () => ({
  PatientDocuments: ({ patientId }: { patientId: number }) => (
    <div>Documentos do paciente {patientId}</div>
  ),
}));

vi.mock("@/components/evolution/EvolutionSheet", () => ({
  EvolutionSheet: ({
    patientId,
    evolutionId,
    open,
  }: {
    patientId: number;
    evolutionId?: number | null;
    open: boolean;
  }) =>
    open ? (
      <div role="dialog">
        Evolução {evolutionId ?? "nova"} do paciente {patientId}
      </div>
    ) : null,
}));

const patientProfile: PatientProfile = {
  id: 3,
  name: "Maria da Silva",
  email: "maria@teste.com",
  cpf: "12345678901",
  rg: null,
  phone: "11912345678",
  rua: "Rua A",
  numero: "10",
  bairro: "Centro",
  cidade: "São Paulo",
  estado: "SP",
  cep: "01001000",
  birthDate: "1990-05-20",
  isActive: true,
  createdAt: "2026-01-10T12:00:00.000Z",
  portalAccessStatus: "Active",
  appointments: [],
  medicalRecords: [],
  payments: [
    {
      id: 1,
      referenceMonth: "2026-11-01",
      planName: "Plano Mensal",
      amount: 250,
      paymentMethod: "Pix",
      status: "Paid",
      paymentDate: "2026-11-10",
      paidAt: "2026-11-10",
      createdAt: "2026-11-01T12:00:00.000Z",
    },
  ],
};

function renderProfile() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const renderTree = () => (
    <QueryClientProvider client={client}>
      <PacienteProfile id={3} onBack={vi.fn()} />
    </QueryClientProvider>
  );
  const view = render(renderTree());
  navigation.replace.mockImplementation((url: string) => {
    navigation.current = new URL(url, "http://localhost").searchParams;
    view.rerender(renderTree());
  });
  return view;
}

beforeEach(() => {
  navigation.current = new URLSearchParams();
  navigation.replace.mockReset();
  navigation.push.mockReset();
  auth.current = { user: { role: "Administrador" } };
  profileHook.current = {
    data: patientProfile,
    loading: false,
    error: null,
    refetch: vi.fn(),
  };
});

test("abre a linha do tempo por padrão e troca de aba pela URL", async () => {
  renderProfile();

  expect(screen.getByText("Linha do tempo do paciente 3")).toBeInTheDocument();

  await userEvent.click(screen.getByRole("tab", { name: "Medições" }));

  expect(screen.getByText("Medições do paciente 3")).toBeInTheDocument();
  expect(navigation.replace).toHaveBeenCalledWith(
    "/app/pacientes?mode=profile&id=3&aba=medicoes",
  );
});

test("abre a aba indicada na URL", () => {
  navigation.current = new URLSearchParams("mode=profile&id=3&aba=financeiro");
  renderProfile();

  expect(screen.getByText("Plano Mensal")).toBeInTheDocument();
});

test("Recepção vê só a linha do tempo e o financeiro", () => {
  auth.current = { user: { role: "Recepcao" } };
  renderProfile();

  expect(screen.getByRole("tab", { name: "Linha do tempo" })).toBeInTheDocument();
  expect(screen.getByRole("tab", { name: "Financeiro" })).toBeInTheDocument();
  expect(screen.queryByRole("tab", { name: "Anamnese" })).not.toBeInTheDocument();
  expect(screen.queryByRole("tab", { name: "Medições" })).not.toBeInTheDocument();
  expect(screen.queryByRole("tab", { name: "Documentos" })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Nova evolução" })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Nova anamnese" })).not.toBeInTheDocument();
});

test("Nova evolução e o clique na linha do tempo abrem o painel lateral", async () => {
  renderProfile();

  await userEvent.click(screen.getByRole("button", { name: "Nova evolução" }));
  expect(screen.getByRole("dialog")).toHaveTextContent("Evolução nova do paciente 3");

  await userEvent.click(screen.getByRole("button", { name: "Abrir evolução 20" }));
  expect(screen.getByRole("dialog")).toHaveTextContent("Evolução 20 do paciente 3");
});

test("Nova anamnese abre a aba de anamnese pedindo o formulário", async () => {
  renderProfile();

  await userEvent.click(screen.getByRole("button", { name: "Nova anamnese" }));

  expect(screen.getByText("Anamnese do paciente 3 criando sim")).toBeInTheDocument();
  expect(navigation.replace).toHaveBeenCalledWith(
    "/app/pacientes?mode=profile&id=3&aba=anamnese",
  );
});
