import { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, expect, test, vi } from "vitest";
import { PatientMeasurementSeries } from "@/types/evolution";
import { measurementTrend, PatientMeasurements } from "./PatientMeasurements";

const service = vi.hoisted(() => ({ getPatientMeasurements: vi.fn() }));

vi.mock("../../services/patient-record.service", () => service);
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  LineChart: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Line: () => null,
}));

const series: PatientMeasurementSeries = {
  templateId: 1,
  templateName: "Escala de dor",
  lastDate: "2026-11-01T12:00:00.000Z",
  evolutionCount: 3,
  fields: [
    {
      fieldId: 1,
      label: "Dor",
      unit: "Points",
      direction: "Decrease",
      initialValue: 8,
      currentValue: 2,
      targetValue: 0,
      progress: 75,
      data: [
        { date: "2026-10-01T12:00:00.000Z", value: 8 },
        { date: "2026-11-01T12:00:00.000Z", value: 2 },
      ],
    },
    {
      fieldId: 2,
      label: "Força",
      unit: "Kg",
      direction: "Increase",
      initialValue: 10,
      currentValue: 10,
      targetValue: 20,
      progress: 0,
      data: [{ date: "2026-11-01T12:00:00.000Z", value: 10 }],
    },
    {
      fieldId: 3,
      label: "Amplitude",
      unit: "Degrees",
      direction: "Increase",
      initialValue: 90,
      currentValue: 80,
      targetValue: 120,
      progress: 0,
      data: [
        { date: "2026-10-01T12:00:00.000Z", value: 90 },
        { date: "2026-11-01T12:00:00.000Z", value: 80 },
      ],
    },
  ],
};

function renderMeasurements() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <PatientMeasurements patientId={3} />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  service.getPatientMeasurements.mockReset();
});

test("calcula a tendência pela direção esperada do campo", () => {
  expect(measurementTrend("Decrease", 8, 2)).toBe("Melhorou");
  expect(measurementTrend("Increase", 10, 15)).toBe("Melhorou");
  expect(measurementTrend("Increase", 10, 10)).toBe("Estável");
  expect(measurementTrend("Neutral", 10, 2)).toBe("Estável");
  expect(measurementTrend("Increase", 10, 8)).toBe("Piorou");
});

test("mostra uma ficha por bloco, a primeira e a última leitura e a tendência", async () => {
  service.getPatientMeasurements.mockResolvedValue([series]);
  renderMeasurements();

  expect(await screen.findByText("Escala de dor")).toBeInTheDocument();
  expect(screen.getByText("Última medição em 01/11/2026 · 3 evoluções")).toBeInTheDocument();
  expect(screen.getByText("8 Pontos → 2 Pontos")).toBeInTheDocument();
  expect(screen.getByText("10 kg → 10 kg")).toBeInTheDocument();
  expect(screen.getByText("90 graus → 80 graus")).toBeInTheDocument();
  expect(screen.getByText("Melhorou")).toBeInTheDocument();
  expect(screen.getByText("Estável")).toBeInTheDocument();
  expect(screen.getByText("Piorou")).toBeInTheDocument();
});

test("mostra o vazio que ensina o próximo passo", async () => {
  service.getPatientMeasurements.mockResolvedValue([]);
  renderMeasurements();

  expect(
    await screen.findByText("Nenhuma medição registrada. Adicione fichas ao registrar uma evolução."),
  ).toBeInTheDocument();
});
