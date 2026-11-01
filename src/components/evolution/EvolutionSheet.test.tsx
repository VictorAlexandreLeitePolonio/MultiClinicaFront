import { AxiosError } from "axios";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, expect, test, vi } from "vitest";
import { EvolutionTemplate, EvolutionTemplateField, PatientEvolution, PatientMeasurementSeries } from "@/types/evolution";
import { EvolutionSheet, EvolutionSheetProps } from "./EvolutionSheet";

const recordService = vi.hoisted(() => ({
  getPatientEvolution: vi.fn(),
  createPatientEvolution: vi.fn(),
  updatePatientEvolution: vi.fn(),
  getPatientMeasurements: vi.fn(),
}));

const evolutionService = vi.hoisted(() => ({
  getEvolutionTemplates: vi.fn(),
  getEvolutionTemplateFields: vi.fn(),
}));

const appointmentsService = vi.hoisted(() => ({
  getAppointmentById: vi.fn(),
  getAppointmentProfessionals: vi.fn(),
}));

const auth = vi.hoisted(() => ({ useAuth: vi.fn() }));

vi.mock(
  "@/app/(authenticated)/app/pacientes/services/patient-record.service",
  () => recordService,
);
vi.mock(
  "@/app/(authenticated)/app/modelos-evolucao/services/evolution.service",
  () => evolutionService,
);
vi.mock(
  "@/app/(authenticated)/app/agenda/services/appointments.service",
  () => appointmentsService,
);
vi.mock("@/contexts/AuthContext", () => auth);
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

function template(overrides: Partial<EvolutionTemplate> = {}): EvolutionTemplate {
  return {
    id: 1,
    name: "Escala de dor",
    description: null,
    category: "Dor",
    isActive: true,
    isDefault: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function field(overrides: Partial<EvolutionTemplateField> = {}): EvolutionTemplateField {
  return {
    id: 11,
    templateId: 1,
    label: "Dor",
    key: "dor",
    type: "Number",
    unit: "Points",
    minValue: null,
    maxValue: null,
    targetValue: null,
    expectedDirection: "Decrease",
    weight: 1,
    required: true,
    showInChart: true,
    isActive: true,
    order: 1,
    optionsJson: null,
    ...overrides,
  };
}

const measurement: PatientMeasurementSeries = {
  templateId: 1,
  templateName: "Escala de dor",
  lastDate: "2026-10-20T10:00:00.000Z",
  evolutionCount: 1,
  fields: [
    {
      fieldId: 11,
      label: "Dor",
      unit: "Points",
      direction: "Decrease",
      initialValue: 7,
      currentValue: 7,
      targetValue: null,
      progress: null,
      data: [{ date: "2026-10-20T10:00:00.000Z", value: 7 }],
    },
  ],
};

function renderSheet(props: Partial<EvolutionSheetProps> = {}) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const onOpenChange = vi.fn();
  const onSaved = vi.fn();

  render(
    <QueryClientProvider client={client}>
      <EvolutionSheet
        patientId={3}
        open
        onOpenChange={onOpenChange}
        onSaved={onSaved}
        {...props}
      />
    </QueryClientProvider>,
  );

  return { onOpenChange, onSaved, client };
}

async function addTemplate(name: string) {
  await userEvent.click(screen.getByRole("button", { name: "Adicionar ficha" }));
  await userEvent.click(await screen.findByText(name));
}

beforeEach(() => {
  auth.useAuth.mockReset().mockReturnValue({
    user: { id: 7, name: "Dra. Ana", role: "Profissional" },
    tenant: null,
    permissions: [],
    isAuthenticated: true,
    isLoading: false,
    initialLoading: false,
    setUser: vi.fn(),
    setAuth: vi.fn(),
    updateTenant: vi.fn(),
    refreshUser: vi.fn(),
    can: vi.fn(),
  });

  recordService.getPatientEvolution.mockReset();
  recordService.createPatientEvolution.mockReset();
  recordService.updatePatientEvolution.mockReset();
  recordService.getPatientMeasurements.mockReset().mockResolvedValue([]);

  evolutionService.getEvolutionTemplates.mockReset().mockResolvedValue({
    data: [
      template(),
      template({ id: 2, name: "Amplitude de movimento", category: "Mobilidade" }),
    ],
    page: 1,
    pageSize: 100,
    totalCount: 2,
    totalPages: 1,
  });
  evolutionService.getEvolutionTemplateFields.mockReset().mockImplementation(
    async (templateId: number) =>
      templateId === 1
        ? [field()]
        : [field({ id: 21, templateId: 2, label: "Amplitude", key: "amplitude", required: false })],
  );

  appointmentsService.getAppointmentById.mockReset();
  appointmentsService.getAppointmentProfessionals.mockReset().mockResolvedValue([]);
});

test("adiciona duas fichas e remove uma da evolução", async () => {
  renderSheet();

  await addTemplate("Escala de dor");
  expect(
    await screen.findByRole("heading", { name: "Escala de dor" }),
  ).toBeInTheDocument();

  await addTemplate("Amplitude de movimento");
  expect(
    await screen.findByRole("heading", { name: "Amplitude de movimento" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Escala de dor" })).toBeInTheDocument();

  await userEvent.click(
    screen.getByRole("button", { name: "Remover ficha Escala de dor" }),
  );

  expect(screen.queryByRole("heading", { name: "Escala de dor" })).not.toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "Amplitude de movimento" }),
  ).toBeInTheDocument();
});

test("mostra o valor anterior da última evolução concluída", async () => {
  recordService.getPatientMeasurements.mockResolvedValue([measurement]);
  renderSheet();

  await addTemplate("Escala de dor");

  expect(await screen.findByText("antes: 7")).toBeInTheDocument();
});

test("mostra a consulta de origem com link para o relatório", async () => {
  appointmentsService.getAppointmentById.mockResolvedValue({
    id: 10,
    professionalId: 7,
    patientId: 3,
    patientName: "Ana Silva",
    appointmentDate: "2026-11-03T13:00:00.000Z",
    status: "Completed",
    createdAt: "2026-10-20T10:00:00.000Z",
    timeZoneId: "America/Sao_Paulo",
  });
  renderSheet({ appointmentId: 10 });

  expect(await screen.findByText(/Consulta de 03\/11\/2026/)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "ver relatório" })).toHaveAttribute(
    "href",
    "/app/agenda?mode=view&id=10",
  );
  expect(appointmentsService.getAppointmentById).toHaveBeenCalledWith(10);
});

test("concluir com obrigatório faltando mostra o erro da API", async () => {
  const apiError = new AxiosError(
    "Requisicao falhou",
    "ERR_BAD_REQUEST",
    undefined,
    undefined,
    {
      status: 400,
      data: { code: "REQUIRED_FIELD", message: "Campo obrigatório ausente: Dor." },
    } as never,
  );
  recordService.createPatientEvolution.mockRejectedValue(apiError);
  renderSheet();

  await addTemplate("Escala de dor");
  await userEvent.click(screen.getByRole("button", { name: "Concluir" }));

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Campo obrigatório ausente: Dor.",
  );
  expect(recordService.createPatientEvolution).toHaveBeenCalledWith(
    3,
    expect.objectContaining({ status: "Completed" }),
  );
});

test("salva rascunho, avisa a evolução salva e fecha", async () => {
  recordService.createPatientEvolution.mockResolvedValue({ id: 55 });
  const { onSaved, onOpenChange } = renderSheet();

  await addTemplate("Escala de dor");
  await userEvent.click(screen.getByRole("button", { name: "Salvar rascunho" }));

  await waitFor(() =>
    expect(recordService.createPatientEvolution).toHaveBeenCalledWith(
      3,
      expect.objectContaining({ status: "Draft" }),
    ),
  );
  await waitFor(() => expect(onSaved).toHaveBeenCalledWith(55));
  expect(onOpenChange).toHaveBeenCalledWith(false);
});

test("edita uma evolução existente e reconstrói as fichas pelos valores", async () => {
  const existing: PatientEvolution = {
    id: 44,
    patientId: 3,
    appointmentId: null,
    templateNames: ["Escala de dor"],
    professionalId: 7,
    serviceId: null,
    date: "2026-10-20T12:00:00.000Z",
    description: "Dor melhorou.",
    conduct: null,
    observations: null,
    nextGuidance: null,
    status: "Completed",
    values: [
      {
        fieldId: 11,
        valueNumber: 7,
        valueText: null,
        valueBoolean: null,
        valueJson: null,
      },
    ],
  };
  recordService.getPatientEvolution.mockResolvedValue(existing);
  recordService.updatePatientEvolution.mockResolvedValue(undefined);
  const { onSaved, onOpenChange } = renderSheet({ evolutionId: 44 });

  expect(await screen.findByDisplayValue("Dor melhorou.")).toBeInTheDocument();
  expect(await screen.findByRole("spinbutton")).toHaveValue(7);
  expect(screen.getByRole("heading", { name: "Escala de dor" })).toBeInTheDocument();

  await userEvent.click(screen.getByRole("button", { name: "Salvar rascunho" }));

  await waitFor(() =>
    expect(recordService.updatePatientEvolution).toHaveBeenCalledWith(
      3,
      44,
      expect.objectContaining({ status: "Draft" }),
    ),
  );
  await waitFor(() => expect(onSaved).toHaveBeenCalledWith(44));
  expect(onOpenChange).toHaveBeenCalledWith(false);
});
