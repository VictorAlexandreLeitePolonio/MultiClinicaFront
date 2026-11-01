import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, expect, test, vi } from "vitest";
import { PatientTreatment } from "@/types/evolution";
import { EvolutionFromConsultationDialog } from "./EvolutionFromConsultationDialog";

const service = vi.hoisted(() => ({
  getConsultation: vi.fn(),
  retryConsultation: vi.fn(),
  updateConsultationReport: vi.fn(),
  reviewConsultation: vi.fn(),
  createEvolutionFromConsultation: vi.fn(),
}));

const router = vi.hoisted(() => ({ push: vi.fn() }));
const treatmentsHook = vi.hoisted(() => ({ usePatientTreatments: vi.fn() }));

vi.mock("../../services/consultation.service", () => service);
vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("@/app/(authenticated)/app/pacientes/hooks/evolution/usePatientEvolution", () => treatmentsHook);

const treatments: PatientTreatment[] = [
  {
    id: 5,
    patientId: 3,
    professionalId: 7,
    templateId: 1,
    title: "Joelho direito",
    description: null,
    startedAt: "2026-10-01",
    endedAt: null,
    status: "Active",
    createdAt: "2026-10-01T10:00:00.000Z",
  },
  {
    id: 6,
    patientId: 3,
    professionalId: 7,
    templateId: 1,
    title: "Ombro esquerdo",
    description: null,
    startedAt: "2026-10-10",
    endedAt: null,
    status: "Active",
    createdAt: "2026-10-10T10:00:00.000Z",
  },
];

function mockTreatments(data: PatientTreatment[]) {
  treatmentsHook.usePatientTreatments.mockReturnValue({
    data,
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  });
}

function renderDialog(onOpenChange = vi.fn()) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <EvolutionFromConsultationDialog
        appointmentId={10}
        patientId={3}
        open
        onOpenChange={onOpenChange}
      />
    </QueryClientProvider>
  );
}

beforeEach(() => {
  service.createEvolutionFromConsultation.mockReset();
  router.push.mockReset();
  treatmentsHook.usePatientTreatments.mockReset();
});

test("cria o rascunho no tratamento escolhido e abre a aba Evolução", async () => {
  mockTreatments(treatments);
  service.createEvolutionFromConsultation.mockResolvedValue({ evolutionId: 99 });
  const onOpenChange = vi.fn();
  renderDialog(onOpenChange);

  expect(await screen.findByRole("dialog")).toBeInTheDocument();
  await userEvent.selectOptions(screen.getByLabelText("Acompanhamento"), "6");
  await userEvent.click(screen.getByRole("button", { name: "Criar rascunho" }));

  await waitFor(() =>
    expect(service.createEvolutionFromConsultation).toHaveBeenCalledWith(10)
  );
  expect(router.push).toHaveBeenCalledWith("/app/pacientes?mode=profile&id=3&tab=evolution");
  expect(onOpenChange).toHaveBeenCalledWith(false);
});

test("avisa quando o paciente não tem tratamento ativo", async () => {
  mockTreatments([]);
  renderDialog();

  expect(
    await screen.findByText(
      "O paciente não tem tratamento ativo. Crie um tratamento na aba Evolução."
    )
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Criar rascunho" })).toBeDisabled();
  expect(service.createEvolutionFromConsultation).not.toHaveBeenCalled();
});
