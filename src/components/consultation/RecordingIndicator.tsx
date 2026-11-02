"use client";

import { Pause, Play, Square } from "lucide-react";
import { useConsultationRecorder } from "@/components/consultation/ConsultationRecorderProvider";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function formatConsultationElapsed(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }

  return `${pad(minutes)}:${pad(seconds)}`;
}

const actionStyles =
  "inline-flex items-center justify-center gap-1 rounded-lg border border-[#99f6e4] bg-white px-2 py-1 text-xs font-semibold text-[#0f766e] transition-all duration-150 hover:bg-[#ecfdf5] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#99f6e4] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-[#67e8f9] dark:hover:bg-slate-800";

export function RecordingIndicator() {
  const { active, paused, elapsedSeconds, sending, pause, resume, requestFinish } =
    useConsultationRecorder();

  if (!active) return null;

  const status = sending ? "Enviando áudio…" : paused ? "Pausado" : "Gravando";

  return (
    <div
      aria-label="Gravação da consulta"
      className="flex min-w-0 items-center gap-2 rounded-xl border border-[#d7f3ea] bg-white/90 px-2.5 py-1.5 shadow-sm dark:border-slate-700 dark:bg-slate-900/90"
    >
      <span
        aria-hidden="true"
        className={`h-2.5 w-2.5 shrink-0 rounded-full ${
          paused || sending
            ? "bg-slate-400"
            : "bg-red-500 motion-safe:animate-pulse motion-reduce:animate-none"
        }`}
      />

      <div className="min-w-0">
        <p className="max-w-40 truncate text-xs font-semibold text-[#0f172a] dark:text-white">
          {active.patientName}
        </p>
        <p
          aria-live="polite"
          className="truncate text-[11px] font-medium text-[#475569] dark:text-slate-300"
        >
          {status}
        </p>
      </div>

      <span className="shrink-0 rounded-lg bg-[#ecfdf5] px-2 py-1 font-mono text-xs font-semibold tabular-nums text-[#0f766e] dark:bg-slate-800 dark:text-[#67e8f9]">
        {formatConsultationElapsed(elapsedSeconds)}
      </span>

      {paused ? (
        <button
          type="button"
          onClick={resume}
          disabled={sending}
          className={actionStyles}
        >
          <Play size={12} />
          Retomar
        </button>
      ) : (
        <button
          type="button"
          onClick={pause}
          disabled={sending}
          className={actionStyles}
        >
          <Pause size={12} />
          Pausar
        </button>
      )}

      <button
        type="button"
        onClick={requestFinish}
        disabled={sending}
        className="inline-flex items-center justify-center gap-1 rounded-lg border border-red-500 bg-red-500 px-2 py-1 text-xs font-semibold text-white transition-all duration-150 hover:bg-red-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-red-900"
      >
        <Square size={12} />
        Encerrar
      </button>
    </div>
  );
}
