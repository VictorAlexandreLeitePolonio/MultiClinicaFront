"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { Appointment } from "@/types";
import { getApiErrorMessage } from "@/utils/apiError";
import {
  startConsultation,
  uploadChunk,
} from "@/app/(authenticated)/app/agenda/services/consultation.service";
import { ConsultationMiniPlayer } from "./ConsultationMiniPlayer";
import {
  FinishConsultationPanel,
  FinishConsultationTarget,
} from "./FinishConsultationPanel";

const CHUNK_INTERVAL_MS = 30_000;
const RETRY_DELAYS_MS = [2_000, 5_000, 15_000, 30_000];

interface ActiveConsultation {
  appointmentId: number;
  patientName: string;
  startedAt: number;
}

interface QueuedChunk {
  appointmentId: number;
  n: number;
  blob: Blob;
  attempts: number;
}

export interface ConsultationRecorderValue {
  active: ActiveConsultation | null;
  paused: boolean;
  elapsedSeconds: number;
  /** Pedaços ainda subindo depois do "Encerrar". */
  sending: boolean;
  start: (appointment: Appointment) => Promise<void>;
  pause: () => void;
  resume: () => void;
  requestFinish: () => void;
}

const noop = () => {};

const ConsultationRecorderContext = createContext<ConsultationRecorderValue>({
  active: null,
  paused: false,
  elapsedSeconds: 0,
  sending: false,
  start: async () => {},
  pause: noop,
  resume: noop,
  requestFinish: noop,
});

function stopTracks(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

function pickMimeType(): string {
  const preferred = "audio/webm;codecs=opus";
  const fallback = "audio/webm";

  if (typeof MediaRecorder.isTypeSupported !== "function") return preferred;

  try {
    if (MediaRecorder.isTypeSupported(preferred)) return preferred;
    if (MediaRecorder.isTypeSupported(fallback)) return fallback;
    return "";
  } catch {
    return fallback;
  }
}

export function ConsultationRecorderProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<ActiveConsultation | null>(null);
  const [paused, setPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [sending, setSending] = useState(false);
  const [finishTarget, setFinishTarget] = useState<FinishConsultationTarget | null>(null);

  const activeRef = useRef<ActiveConsultation | null>(null);
  const appointmentRef = useRef<Appointment | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const startingRef = useRef(false);
  const finishingRef = useRef(false);
  const disposedRef = useRef(false);
  const chunkIndexRef = useRef(0);
  const queueRef = useRef<QueuedChunk[]>([]);
  const flushingRef = useRef(false);
  const drainWaitersRef = useRef<Array<() => void>>([]);
  const stopResolverRef = useRef<(() => void) | null>(null);

  function updateActive(next: ActiveConsultation | null) {
    activeRef.current = next;
    setActive(next);
  }

  function resolveDrainWaiters() {
    if (queueRef.current.length === 0) {
      drainWaitersRef.current.splice(0).forEach((resolve) => resolve());
    }
  }

  async function flushQueue() {
    if (flushingRef.current) return;
    flushingRef.current = true;

    try {
      while (queueRef.current.length > 0 && !disposedRef.current) {
        const item = queueRef.current[0];
        try {
          await uploadChunk(item.appointmentId, item.n, item.blob);
          queueRef.current.shift();
        } catch (error) {
          if (disposedRef.current) break;
          // 4xx definitivo (estado inválido, tamanho, acesso) não melhora com nova tentativa;
          // sem descartar, a fila nunca esvazia e o "Encerrar" fica preso.
          const status = isAxiosError(error) ? error.response?.status : undefined;
          if (status && status >= 400 && status < 500 && status !== 408 && status !== 429) {
            queueRef.current.shift();
            toast.error(getApiErrorMessage(error, "Um trecho do áudio foi recusado pelo servidor."));
            continue;
          }
          const delay = RETRY_DELAYS_MS[Math.min(item.attempts, RETRY_DELAYS_MS.length - 1)];
          item.attempts += 1;
          await new Promise<void>((resolve) => setTimeout(resolve, delay));
        }
      }
    } finally {
      flushingRef.current = false;
      if (queueRef.current.length > 0 && !disposedRef.current) {
        void flushQueue();
      } else {
        resolveDrainWaiters();
      }
    }
  }

  function enqueueChunk(appointmentId: number, n: number, blob: Blob) {
    queueRef.current.push({ appointmentId, n, blob, attempts: 0 });
    void flushQueue();
  }

  function waitForQueueDrain(): Promise<void> {
    if (queueRef.current.length === 0 && !flushingRef.current) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      drainWaitersRef.current.push(resolve);
      void flushQueue();
    });
  }

  async function start(appointment: Appointment) {
    if (activeRef.current || startingRef.current) {
      toast.error("Já existe uma consulta em gravação.");
      throw new Error("Já existe uma consulta em gravação.");
    }

    startingRef.current = true;
    let stream: MediaStream | null = null;

    try {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        toast.error("Não foi possível acessar o microfone.");
        throw new Error("Não foi possível acessar o microfone.");
      }

      try {
        await startConsultation(appointment.id);
      } catch (error) {
        stopTracks(stream);
        toast.error(getApiErrorMessage(error, "Não foi possível iniciar a consulta."));
        throw error;
      }

      const mimeType = pickMimeType();
      let recorder: MediaRecorder;

      try {
        recorder = mimeType
          ? new MediaRecorder(stream, { mimeType })
          : new MediaRecorder(stream);
      } catch {
        stopTracks(stream);
        toast.error("Não foi possível iniciar a gravação.");
        throw new Error("Não foi possível iniciar a gravação.");
      }

      recorder.ondataavailable = (event: BlobEvent) => {
        if (!event.data || event.data.size === 0) return;
        const n = chunkIndexRef.current;
        chunkIndexRef.current += 1;
        enqueueChunk(appointment.id, n, event.data);
      };

      recorder.onstop = () => {
        const resolveStop = stopResolverRef.current;
        stopResolverRef.current = null;
        resolveStop?.();
      };

      chunkIndexRef.current = 0;
      queueRef.current = [];

      try {
        recorder.start(CHUNK_INTERVAL_MS);
      } catch {
        stopTracks(stream);
        toast.error("Não foi possível iniciar a gravação.");
        throw new Error("Não foi possível iniciar a gravação.");
      }

      recorderRef.current = recorder;
      streamRef.current = stream;
      appointmentRef.current = appointment;
      finishingRef.current = false;
      setPaused(false);
      setSending(false);
      setElapsedSeconds(0);
      setFinishTarget(null);
      updateActive({
        appointmentId: appointment.id,
        patientName: appointment.patientName,
        startedAt: Date.now(),
      });
    } finally {
      startingRef.current = false;
    }
  }

  function pause() {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state !== "recording") return;
    recorder.pause();
    setPaused(true);
  }

  function resume() {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state !== "paused") return;
    recorder.resume();
    setPaused(false);
  }

  async function finishRecording() {
    if (!activeRef.current || finishingRef.current) return;

    finishingRef.current = true;
    setSending(true);
    setPaused(false);

    const recorder = recorderRef.current;

    try {
      if (recorder && recorder.state !== "inactive") {
        try {
          const stopped = new Promise<void>((resolve) => {
            stopResolverRef.current = resolve;
          });
          recorder.stop();
          await stopped;
        } catch {
          // A gravação pode ter sido encerrada pelo navegador; seguimos para o painel.
          stopResolverRef.current = null;
        }
      }

      await waitForQueueDrain();
    } finally {
      stopTracks(streamRef.current);
      streamRef.current = null;
      recorderRef.current = null;

      const appointment = appointmentRef.current;
      const currentActive = activeRef.current;

      setSending(false);
      updateActive(null);
      setElapsedSeconds(0);
      setPaused(false);

      if (appointment && currentActive) {
        setFinishTarget({
          appointmentId: currentActive.appointmentId,
          patientId: appointment.patientId,
          patientName: currentActive.patientName,
          appointmentDate: appointment.appointmentDate,
          timeZoneId: appointment.timeZoneId,
        });
      }

      finishingRef.current = false;
    }
  }

  function requestFinish() {
    void finishRecording();
  }

  function handleFinishPanelClosed() {
    setFinishTarget(null);
    appointmentRef.current = null;
  }

  useEffect(() => {
    if (!active || paused || sending) return;
    const interval = setInterval(() => {
      setElapsedSeconds((seconds) => seconds + 1);
    }, 1_000);
    return () => clearInterval(interval);
  }, [active, paused, sending]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!activeRef.current && queueRef.current.length === 0) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  useEffect(() => {
    disposedRef.current = false;
    const drainWaiters = drainWaitersRef.current;
    return () => {
      disposedRef.current = true;
      const recorder = recorderRef.current;
      if (recorder && recorder.state !== "inactive") {
        recorder.ondataavailable = null;
        recorder.onstop = null;
        try {
          recorder.stop();
        } catch {
          // gravador já encerrado
        }
      }
      stopTracks(streamRef.current);
      drainWaiters.splice(0).forEach((resolve) => resolve());
    };
  }, []);

  return (
    <ConsultationRecorderContext.Provider
      value={{
        active,
        paused,
        elapsedSeconds,
        sending,
        start,
        pause,
        resume,
        requestFinish,
      }}
    >
      {children}
      <ConsultationMiniPlayer
        active={active}
        paused={paused}
        elapsedSeconds={elapsedSeconds}
        sending={sending}
        onPause={pause}
        onResume={resume}
        onFinish={requestFinish}
      />
      {finishTarget && (
        <FinishConsultationPanel
          target={finishTarget}
          onFinished={handleFinishPanelClosed}
        />
      )}
    </ConsultationRecorderContext.Provider>
  );
}

export const useConsultationRecorder = () => useContext(ConsultationRecorderContext);
