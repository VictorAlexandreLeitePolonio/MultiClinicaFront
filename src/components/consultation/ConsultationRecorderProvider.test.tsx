import { AxiosError } from "axios";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { Appointment } from "@/types";
import {
  ConsultationRecorderProvider,
  useConsultationRecorder,
} from "./ConsultationRecorderProvider";

const { startConsultation, uploadChunk } = vi.hoisted(() => ({
  startConsultation: vi.fn(),
  uploadChunk: vi.fn(),
}));

vi.mock("@/app/(authenticated)/app/agenda/services/consultation.service", () => ({
  startConsultation,
  uploadChunk,
}));

vi.mock("./FinishConsultationPanel", () => ({
  FinishConsultationPanel: ({
    target,
  }: {
    target: { patientName: string };
  }) => <div>Painel de encerramento de {target.patientName}</div>,
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
}));

const originalMediaRecorder = globalThis.MediaRecorder;
const originalMediaDevices = navigator.mediaDevices;

const appointment: Appointment = {
  id: 10,
  professionalId: 7,
  patientId: 2,
  patientName: "Ana Souza",
  appointmentDate: "2026-11-01T13:00:00Z",
  status: "Scheduled",
  createdAt: "2026-11-01T12:00:00Z",
  timeZoneId: "America/Sao_Paulo",
};

let retryCallbacks: Array<() => void> = [];

class FakeMediaRecorder {
  static lastInstance: FakeMediaRecorder | null = null;

  static isTypeSupported = vi.fn((type: string) => {
    void type;
    return true;
  });

  state: "inactive" | "recording" | "paused" = "inactive";
  ondataavailable: ((event: BlobEvent) => void) | null = null;
  onstop: (() => void) | null = null;
  mimeType: string;

  start = vi.fn(() => {
    this.state = "recording";
  });

  pause = vi.fn(() => {
    this.state = "paused";
  });

  resume = vi.fn(() => {
    this.state = "recording";
  });

  stop = vi.fn(() => {
    if (this.state === "inactive") return;
    this.state = "inactive";
    this.ondataavailable?.({ data: new Blob(["final"]) } as BlobEvent);
    this.onstop?.();
  });

  constructor(
    public stream: MediaStream,
    options?: MediaRecorderOptions,
  ) {
    this.mimeType = options?.mimeType ?? "";
    FakeMediaRecorder.lastInstance = this;
  }

  emit(blob: Blob) {
    this.ondataavailable?.({ data: blob } as BlobEvent);
  }
}

const getUserMedia = vi.fn();
const stopTrack = vi.fn();
const stream = {
  getTracks: () => [{ stop: stopTrack }],
} as unknown as MediaStream;

function Harness() {
  const { active, paused, elapsedSeconds, start, pause, resume, requestFinish } =
    useConsultationRecorder();

  return (
    <div>
      <span data-testid="active">{active?.patientName ?? "nenhum"}</span>
      <span data-testid="paused">{paused ? "pausado" : "ativo"}</span>
      <span data-testid="elapsed">{elapsedSeconds}</span>
      <button
        type="button"
        onClick={() => {
          void start(appointment).catch(() => undefined);
        }}
      >
        iniciar via contexto
      </button>
      <button type="button" onClick={pause}>
        pausar
      </button>
      <button type="button" onClick={resume}>
        retomar
      </button>
      <button type="button" onClick={requestFinish}>
        encerrar
      </button>
    </div>
  );
}

function renderProvider() {
  return render(
    <ConsultationRecorderProvider>
      <Harness />
    </ConsultationRecorderProvider>,
  );
}

async function startAndWait() {
  fireEvent.click(screen.getByRole("button", { name: "iniciar via contexto" }));
  await waitFor(() =>
    expect(screen.getByTestId("active")).toHaveTextContent("Ana Souza"),
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  startConsultation.mockReset().mockResolvedValue({ reportId: 1 });
  uploadChunk.mockReset().mockResolvedValue(undefined);
  getUserMedia.mockReset().mockResolvedValue(stream);
  stopTrack.mockReset();
  FakeMediaRecorder.isTypeSupported.mockReset().mockReturnValue(true);
  FakeMediaRecorder.lastInstance = null;
  retryCallbacks = [];

  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: { getUserMedia },
  });
  Object.defineProperty(globalThis, "MediaRecorder", {
    configurable: true,
    writable: true,
    value: FakeMediaRecorder,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  Object.defineProperty(globalThis, "MediaRecorder", {
    configurable: true,
    writable: true,
    value: originalMediaRecorder,
  });
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: originalMediaDevices,
  });
});

test("inicia o microfone, cria o relatório e grava em intervalos de 30 s", async () => {
  renderProvider();
  await startAndWait();

  expect(getUserMedia).toHaveBeenCalledWith({ audio: true });
  expect(startConsultation).toHaveBeenCalledWith(10);
  expect(FakeMediaRecorder.isTypeSupported).toHaveBeenCalledWith(
    "audio/webm;codecs=opus",
  );
  expect(FakeMediaRecorder.lastInstance?.mimeType).toBe("audio/webm;codecs=opus");
  expect(FakeMediaRecorder.lastInstance?.start).toHaveBeenCalledWith(30_000);
});

test("usa audio/webm quando o codec opus não é suportado", async () => {
  FakeMediaRecorder.isTypeSupported.mockImplementation(
    (type: string) => type === "audio/webm",
  );
  renderProvider();
  await startAndWait();

  expect(FakeMediaRecorder.lastInstance?.mimeType).toBe("audio/webm");
});

test("envia cada pedaço com n sequencial", async () => {
  renderProvider();
  await startAndWait();

  act(() => FakeMediaRecorder.lastInstance?.emit(new Blob(["um"])));
  await waitFor(() =>
    expect(uploadChunk).toHaveBeenCalledWith(10, 0, expect.any(Blob)),
  );

  act(() => FakeMediaRecorder.lastInstance?.emit(new Blob(["dois"])));
  await waitFor(() =>
    expect(uploadChunk).toHaveBeenCalledWith(10, 1, expect.any(Blob)),
  );
});

test("reenvia um pedaço que falhou depois do backoff", async () => {
  uploadChunk.mockRejectedValueOnce(new Error("offline")).mockResolvedValue(undefined);
  const nativeSetTimeout = globalThis.setTimeout;
  const timeoutSpy = vi
    .spyOn(globalThis, "setTimeout")
    .mockImplementation(
      ((handler: TimerHandler, timeout?: number, ...args: unknown[]) => {
        if (timeout === 2_000 && typeof handler === "function") {
          retryCallbacks.push(handler as () => void);
          return 0 as unknown as ReturnType<typeof setTimeout>;
        }
        return nativeSetTimeout(handler, timeout, ...(args as never[]));
      }) as typeof globalThis.setTimeout,
    );

  renderProvider();
  await startAndWait();

  act(() => FakeMediaRecorder.lastInstance?.emit(new Blob(["um"])));
  await waitFor(() => expect(uploadChunk).toHaveBeenCalledTimes(1));
  await waitFor(() => expect(retryCallbacks).toHaveLength(1));

  await act(async () => {
    retryCallbacks[0]();
  });

  await waitFor(() => expect(uploadChunk).toHaveBeenCalledTimes(2));
  expect(uploadChunk.mock.calls[1][0]).toBe(10);
  expect(uploadChunk.mock.calls[1][1]).toBe(0);
  timeoutSpy.mockRestore();
});

test("descarta pedaço recusado com 4xx e segue para o próximo", async () => {
  const rejected = new AxiosError("recusado", "ERR_BAD_REQUEST", undefined, undefined, {
    status: 400,
    data: { code: "INVALID_STATUS", message: "A consulta não está gravando." },
  } as never);
  uploadChunk.mockRejectedValueOnce(rejected).mockResolvedValue(undefined);
  renderProvider();
  await startAndWait();

  act(() => FakeMediaRecorder.lastInstance?.emit(new Blob(["um"])));
  act(() => FakeMediaRecorder.lastInstance?.emit(new Blob(["dois"])));

  await waitFor(() => expect(uploadChunk).toHaveBeenCalledTimes(2));
  expect(uploadChunk.mock.calls.map((call) => call[1])).toEqual([0, 1]);
  expect(toast.error).toHaveBeenCalled();
});

test("recusa um segundo início enquanto há gravação", async () => {
  renderProvider();
  await startAndWait();

  fireEvent.click(screen.getByRole("button", { name: "iniciar via contexto" }));

  await waitFor(() =>
    expect(toast.error).toHaveBeenCalledWith(
      "Já existe uma consulta em gravação.",
    ),
  );
  expect(startConsultation).toHaveBeenCalledTimes(1);
});

test("avisa quando o microfone não está disponível", async () => {
  getUserMedia.mockRejectedValue(new Error("sem permissão"));
  renderProvider();

  fireEvent.click(screen.getByRole("button", { name: "iniciar via contexto" }));

  await waitFor(() =>
    expect(toast.error).toHaveBeenCalledWith(
      "Não foi possível acessar o microfone.",
    ),
  );
  expect(startConsultation).not.toHaveBeenCalled();
  expect(screen.getByTestId("active")).toHaveTextContent("nenhum");
});

test("pausa e retoma pelo contexto", async () => {
  renderProvider();
  await startAndWait();

  fireEvent.click(screen.getByRole("button", { name: "pausar" }));

  expect(FakeMediaRecorder.lastInstance?.pause).toHaveBeenCalledTimes(1);
  expect(screen.getByTestId("paused")).toHaveTextContent("pausado");

  fireEvent.click(screen.getByRole("button", { name: "retomar" }));

  expect(FakeMediaRecorder.lastInstance?.resume).toHaveBeenCalledTimes(1);
  expect(screen.getByTestId("paused")).toHaveTextContent("ativo");
});

test("encerra, sobe o último pedaço, para o microfone e abre o painel", async () => {
  renderProvider();
  await startAndWait();

  act(() => FakeMediaRecorder.lastInstance?.emit(new Blob(["um"])));
  await waitFor(() => expect(uploadChunk).toHaveBeenCalledTimes(1));

  fireEvent.click(screen.getByRole("button", { name: "encerrar" }));

  expect(await screen.findByText("Painel de encerramento de Ana Souza")).toBeInTheDocument();
  expect(stopTrack).toHaveBeenCalledTimes(1);
  expect(screen.getByTestId("active")).toHaveTextContent("nenhum");
  expect(uploadChunk).toHaveBeenCalledWith(10, 1, expect.any(Blob));
});

test("avisa antes de sair da página durante a gravação", async () => {
  renderProvider();
  await startAndWait();

  const event = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(event);

  expect(event.defaultPrevented).toBe(true);
});
