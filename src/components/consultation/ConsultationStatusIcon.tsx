"use client";

import { ReactNode } from "react";
import { AlertTriangle, FileCheck2, FileText, Loader2, Mic } from "lucide-react";
import type { ConsultationStatus } from "@/types/consultation";

interface ConsultationStatusIconProps {
  status?: ConsultationStatus | null;
  reviewed?: boolean;
}

function WithTitle({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className="inline-flex"
    >
      {children}
    </span>
  );
}

export function ConsultationStatusIcon({
  status,
  reviewed = false,
}: ConsultationStatusIconProps) {
  if (!status) return null;

  if (status === "Ready" && reviewed) {
    return (
      <WithTitle label="Relatório revisado">
        <FileCheck2 aria-hidden="true" className="h-4 w-4 text-emerald-600" />
      </WithTitle>
    );
  }

  if (status === "Recording") {
    return (
      <WithTitle label="Consulta em gravação">
        <Mic aria-hidden="true" className="h-4 w-4 text-red-600" />
      </WithTitle>
    );
  }

  if (status === "Processing") {
    return (
      <WithTitle label="Consulta em processamento">
        <Loader2
          aria-hidden="true"
          className="h-4 w-4 animate-spin text-sky-600"
        />
      </WithTitle>
    );
  }

  if (status === "Ready") {
    return (
      <WithTitle label="Relatório pronto">
        <FileText aria-hidden="true" className="h-4 w-4 text-emerald-600" />
      </WithTitle>
    );
  }

  const interrupted = status === "Interrupted";
  const label = interrupted ? "Consulta interrompida" : "Falha na consulta";

  return (
    <WithTitle label={label}>
      <AlertTriangle aria-hidden="true" className="h-4 w-4 text-amber-600" />
    </WithTitle>
  );
}
