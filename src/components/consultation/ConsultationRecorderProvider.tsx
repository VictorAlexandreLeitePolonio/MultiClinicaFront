"use client";

import { createContext, ReactNode, useContext } from "react";
import { Appointment } from "@/types";

// Stub da Fundação; a implementação (MediaRecorder, fila de envio, mini player) é da Trilha F1.
export interface ConsultationRecorderValue {
  active: { appointmentId: number; patientName: string; startedAt: number } | null;
  paused: boolean;
  elapsedSeconds: number;
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
  start: async () => {},
  pause: noop,
  resume: noop,
  requestFinish: noop,
});

export function ConsultationRecorderProvider({ children }: { children: ReactNode }) {
  return (
    <ConsultationRecorderContext.Provider value={useContext(ConsultationRecorderContext)}>
      {children}
    </ConsultationRecorderContext.Provider>
  );
}

export const useConsultationRecorder = () => useContext(ConsultationRecorderContext);
