import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import { beforeEach, expect, test, vi } from "vitest";
import { FinishConsultationPanel } from "./FinishConsultationPanel";
import { getPatientById } from "@/app/(authenticated)/app/pacientes/services/patients.service";

const { getChargeSuggestion, finishConsultation } = vi.hoisted(() => ({
  getChargeSuggestion: vi.fn(),
  finishConsultation: vi.fn(),
}));

vi.mock("@/app/(authenticated)/app/agenda/services/consultation.service", () => ({
  getChargeSuggestion,
  finishConsultation,
}));

vi.mock("@/app/(authenticated)/app/pacientes/services/patients.service", () => ({
  getPatientById: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
  },
}));


const plans = [{ id: 4, name: "Mensal", planType: "Mensal" as const, amount: 150 }];

const target = {
  appointmentId: 10,
  patientId: 2,
  patientName: "Ana Souza",
  appointmentDate: "2026-11-01T13:00:00Z",
  timeZoneId: "America/Sao_Paulo",
};

function renderPanel(onFinished = vi.fn()) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <FinishConsultationPanel target={target} onFinished={onFinished} />
    </QueryClientProvider>,
  );
  return onFinished;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getPatientById).mockResolvedValue({
    id: 2,
    name: "Ana Souza",
    email: "ana@example.com",
  } as never);
  getChargeSuggestion.mockResolvedValue({
    planId: 4,
    planName: "Mensal",
    planType: "Mensal",
    alreadyChargedThisMonth: false,
    plans,
    onlineAvailable: true,
  });
  finishConsultation.mockResolvedValue({
    status: "Processing",
    paymentId: 20,
    chargeError: null,
  });
});

test("pré-seleciona o plano sugerido e envia a cobrança manual", async () => {
  const onFinished = renderPanel();
  const checkbox = screen.getByRole("checkbox", {
    name: /Gerar cobrança desta sessão/,
  });

  await waitFor(() => expect(checkbox).toBeChecked());
  expect(screen.getByLabelText("Plano *")).toHaveValue("4");

  await userEvent.selectOptions(
    screen.getByLabelText("Forma de pagamento *"),
    "Pix",
  );
  await userEvent.click(screen.getByRole("button", { name: "Confirmar" }));

  await waitFor(() =>
    expect(finishConsultation).toHaveBeenCalledWith(10, {
      charge: { planId: 4, paymentMethod: "Pix", sendOnline: false },
    }),
  );
  expect(toast.success).toHaveBeenCalledWith(
    "Consulta encerrada. O relatório fica pronto em alguns minutos.",
  );
  expect(onFinished).toHaveBeenCalledTimes(1);
});

test("respeita cobrança já existente no mês e desmarca a opção", async () => {
  getChargeSuggestion.mockResolvedValue({
    planId: 4,
    planName: "Mensal",
    planType: "Mensal",
    alreadyChargedThisMonth: true,
    plans,
    onlineAvailable: true,
  });
  const onFinished = renderPanel();

  const checkbox = screen.getByRole("checkbox", {
    name: /Gerar cobrança desta sessão/,
  });
  await waitFor(() => expect(checkbox).toBeEnabled());
  expect(checkbox).not.toBeChecked();
  expect(
    screen.getByText(
      "Já existe cobrança de 11/2026 para este paciente",
    ),
  ).toBeInTheDocument();

  await userEvent.click(checkbox);
  expect(screen.getByLabelText("Plano *")).toHaveValue("4");

  await userEvent.click(
    screen.getByRole("button", { name: "Encerrar sem cobrança" }),
  );

  await waitFor(() =>
    expect(finishConsultation).toHaveBeenCalledWith(10, { charge: null }),
  );
  expect(onFinished).toHaveBeenCalledTimes(1);
});

test("cobra online com envio por e-mail quando o paciente tem e-mail", async () => {
  renderPanel();

  await waitFor(() =>
    expect(
      screen.getByRole("checkbox", { name: /Gerar cobrança desta sessão/ }),
    ).toBeChecked(),
  );
  await userEvent.click(
    screen.getByRole("radio", { name: /Online \(Mercado Pago\)/ }),
  );

  expect(
    screen.getByRole("checkbox", { name: "Enviar cobrança por e-mail" }),
  ).toBeChecked();

  await userEvent.click(screen.getByRole("button", { name: "Confirmar" }));

  await waitFor(() =>
    expect(finishConsultation).toHaveBeenCalledWith(10, {
      charge: {
        planId: 4,
        paymentMethod: "Online (Mercado Pago)",
        sendOnline: true,
      },
    }),
  );
});

test("avisa quando a cobrança falha mas mantém o encerramento", async () => {
  finishConsultation.mockResolvedValue({
    status: "Processing",
    paymentId: null,
    chargeError: "Já existe cobrança neste mês.",
  });
  renderPanel();

  await userEvent.click(
    screen.getByRole("button", { name: "Encerrar sem cobrança" }),
  );

  await waitFor(() =>
    expect(toast.warning).toHaveBeenCalledWith("Já existe cobrança neste mês."),
  );
});
