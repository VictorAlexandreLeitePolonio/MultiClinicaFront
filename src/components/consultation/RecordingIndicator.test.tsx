import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test, vi } from "vitest";
import { RecordingIndicator, formatConsultationElapsed } from "./RecordingIndicator";

const recorder = vi.hoisted(() => ({
  useConsultationRecorder: vi.fn(),
}));

vi.mock("@/components/consultation/ConsultationRecorderProvider", () => recorder);

const active = { appointmentId: 10, patientName: "Ana Souza", startedAt: 0 };

function mockRecorder(overrides: Record<string, unknown> = {}) {
  recorder.useConsultationRecorder.mockReturnValue({
    active,
    paused: false,
    elapsedSeconds: 65,
    sending: false,
    start: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    requestFinish: vi.fn(),
    ...overrides,
  });
}

beforeEach(() => {
  recorder.useConsultationRecorder.mockReset();
});

test("mostra paciente, cronômetro e status gravando com aria-live", () => {
  mockRecorder();
  const { container } = render(<RecordingIndicator />);

  expect(screen.getByText("Ana Souza")).toBeInTheDocument();
  expect(screen.getByText("01:05")).toBeInTheDocument();
  expect(screen.getByText("Gravando")).toHaveAttribute("aria-live", "polite");
  expect(container.innerHTML).toContain("animate-pulse");
});

test("formata horas quando a consulta passa de uma hora", () => {
  expect(formatConsultationElapsed(3_661)).toBe("1:01:01");
});

test("pausa e retoma", async () => {
  const pause = vi.fn();
  const resume = vi.fn();
  mockRecorder({ pause, resume });
  const { rerender } = render(<RecordingIndicator />);

  await userEvent.click(screen.getByRole("button", { name: "Pausar" }));
  expect(pause).toHaveBeenCalledTimes(1);

  mockRecorder({ paused: true, pause, resume });
  rerender(<RecordingIndicator />);

  expect(screen.getByText("Pausado")).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Retomar" }));
  expect(resume).toHaveBeenCalledTimes(1);
});

test("mostra o envio do áudio, desabilita as ações e encerra", async () => {
  const requestFinish = vi.fn();
  mockRecorder({ sending: true, requestFinish });
  const { rerender } = render(<RecordingIndicator />);

  expect(screen.getByText("Enviando áudio…")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Pausar" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Encerrar" })).toBeDisabled();

  mockRecorder({ requestFinish });
  rerender(<RecordingIndicator />);
  await userEvent.click(screen.getByRole("button", { name: "Encerrar" }));
  expect(requestFinish).toHaveBeenCalledTimes(1);
});

test("não renderiza sem consulta ativa", () => {
  mockRecorder({ active: null });
  const { container } = render(<RecordingIndicator />);

  expect(container).toBeEmptyDOMElement();
});
