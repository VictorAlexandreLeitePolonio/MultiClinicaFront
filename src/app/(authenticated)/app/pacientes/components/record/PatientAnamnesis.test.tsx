import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, expect, test, vi } from "vitest";
import { MedicalRecord } from "@/types";
import { PatientAnamnesis } from "./PatientAnamnesis";

const service = vi.hoisted(() => ({ getMedicalRecords: vi.fn(), getMedicalRecordById: vi.fn() }));

vi.mock("@/app/(authenticated)/app/prontuarios/services/medical-records.service", () => service);
vi.mock("@/app/(authenticated)/app/prontuarios/components/ProntuarioDetails", () => ({
  default: ({ id }: { id: number }) => <div>Detalhes da anamnese {id}</div>,
}));
vi.mock("@/app/(authenticated)/app/prontuarios/components/ProntuarioForm", () => ({
  default: () => <div>Formulário de nova anamnese</div>,
}));

const record = (overrides: Partial<MedicalRecord>): MedicalRecord => ({
  id: 1,
  userId: 7,
  userName: "Dra. Ana",
  patientId: 3,
  patientName: "Maria",
  patologia: "Lombalgia",
  queixaPrincipal: "Dor lombar",
  examesImagem: "",
  doencaAntiga: "",
  doencaAtual: "",
  habitos: "",
  examesFisicos: "",
  sinaisVitais: "",
  medicamentos: "",
  cirurgias: "",
  outrasDoencas: "",
  sessao: "",
  titulo: "Avaliação",
  contrato: "",
  orientacaoDomiciliar: "",
  createdAt: "2026-11-01T12:00:00.000Z",
  attachments: [],
  ...overrides,
});

const latest = record({ id: 2, titulo: "Reavaliação", createdAt: "2026-11-01T12:00:00.000Z" });
const older = record({ id: 1, titulo: "Avaliação inicial", createdAt: "2026-10-01T12:00:00.000Z" });

function mockRecords(records: MedicalRecord[]) {
  service.getMedicalRecords.mockResolvedValue({
    data: records,
    page: 1,
    pageSize: 50,
    totalCount: records.length,
    totalPages: 1,
  });
}

function renderAnamnesis(props: { creating?: boolean; focusRecordId?: number | null } = {}) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <PatientAnamnesis patientId={3} {...props} />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  service.getMedicalRecords.mockReset();
  service.getMedicalRecordById.mockReset();
});

test("abre a avaliação mais recente e lista as anteriores", async () => {
  mockRecords([older, latest]);
  renderAnamnesis();

  expect(await screen.findByText("Detalhes da anamnese 2")).toBeInTheDocument();
  expect(screen.getByText("Avaliações anteriores")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Avaliação inicial/ })).toBeInTheDocument();
  expect(screen.getByText(/01\/11\/2026 · Dra\. Ana/)).toBeInTheDocument();
});

test("abre uma avaliação apontada pela linha do tempo", async () => {
  mockRecords([older, latest]);
  renderAnamnesis({ focusRecordId: 1 });

  expect(await screen.findByText("Detalhes da anamnese 1")).toBeInTheDocument();
});

test("abre o formulário vazio quando o cabeçalho pede uma nova anamnese", async () => {
  mockRecords([older, latest]);
  renderAnamnesis({ creating: true });

  expect(await screen.findByText("Formulário de nova anamnese")).toBeInTheDocument();
});

test("mostra o vazio quando o paciente não tem anamnese", async () => {
  mockRecords([]);
  renderAnamnesis();

  expect(await screen.findByText("Nenhuma anamnese registrada.")).toBeInTheDocument();
});

test("busca pelo id a avaliação que não está na primeira página, sem trocar pela mais recente", async () => {
  const veryOld = record({ id: 99, titulo: "Avaliação de 2024", createdAt: "2024-03-01T12:00:00.000Z" });
  mockRecords([older, latest]); // a 99 ficou fora das 50 mais recentes
  service.getMedicalRecordById.mockResolvedValue(veryOld);
  renderAnamnesis({ focusRecordId: 99 });

  expect(await screen.findByText("Detalhes da anamnese 99")).toBeInTheDocument();
  expect(screen.queryByText("Detalhes da anamnese 2")).not.toBeInTheDocument();
  expect(service.getMedicalRecordById).toHaveBeenCalledWith(99);
});
