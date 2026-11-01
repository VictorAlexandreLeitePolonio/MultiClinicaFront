"use client";

import { Mic, Pause, Play, Square } from "lucide-react";

interface ConsultationMiniPlayerProps {
  active: { patientName: string } | null;
  paused: boolean;
  elapsedSeconds: number;
  sending: boolean;
  onPause: () => void;
  onResume: () => void;
  onFinish: () => void;
}

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

export function ConsultationMiniPlayer({
  active,
  paused,
  elapsedSeconds,
  sending,
  onPause,
  onResume,
  onFinish,
}: ConsultationMiniPlayerProps) {
  if (!active) return null;

  const status = sending ? "Enviando áudio…" : paused ? "Pausado" : "Gravando";

  return (
    <div
      className="fixed bottom-5 left-5 z-[60] w-[22rem] max-w-[calc(100vw-2.5rem)] rounded-2xl border border-[#d7f3ea] bg-white/95 p-4 shadow-[0_22px_60px_-32px_rgba(15,23,42,0.45)] backdrop-blur dark:border-slate-700 dark:bg-slate-900/95"
      aria-label="Gravação da consulta"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-secondary dark:text-white">
            {active.patientName}
          </p>
          <p
            className="mt-1 flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-slate-300"
            aria-live="polite"
          >
            <span
              aria-hidden="true"
              className={`h-2.5 w-2.5 rounded-full ${
                paused || sending ? "bg-slate-400" : "animate-pulse bg-red-500"
              }`}
            />
            {status}
          </p>
        </div>
        <span className="rounded-xl bg-[#ecfdf5] px-2.5 py-1 font-mono text-sm font-semibold tabular-nums text-[#0f766e] dark:bg-slate-800 dark:text-[#67e8f9]">
          {formatConsultationElapsed(elapsedSeconds)}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-2">
        {paused ? (
          <button
            type="button"
            onClick={onResume}
            disabled={sending}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#99f6e4] bg-white px-3 py-2 text-xs font-semibold text-[#0f766e] transition-colors hover:bg-[#ecfdf5] disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-[#67e8f9] dark:hover:bg-slate-800"
          >
            <Play size={14} />
            Retomar
          </button>
        ) : (
          <button
            type="button"
            onClick={onPause}
            disabled={sending}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#99f6e4] bg-white px-3 py-2 text-xs font-semibold text-[#0f766e] transition-colors hover:bg-[#ecfdf5] disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-[#67e8f9] dark:hover:bg-slate-800"
          >
            <Pause size={14} />
            Pausar
          </button>
        )}

        <button
          type="button"
          onClick={onFinish}
          disabled={sending}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-500 bg-red-500 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {sending ? (
            <Mic size={14} />
          ) : (
            <Square size={14} />
          )}
          Encerrar
        </button>
      </div>
    </div>
  );
}
