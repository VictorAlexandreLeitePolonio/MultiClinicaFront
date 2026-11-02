"use client";

import { motion, type Variants } from "motion/react";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { formatPhone } from "@/utils/formatters";
import type { Patient } from "@/types";

interface PatientCardProps {
  patient: Patient;
  onOpen: (patient: Patient) => void;
}

const easeOut: [number, number, number, number] = [
  ease.out[0],
  ease.out[1],
  ease.out[2],
  ease.out[3],
];

export const patientCardVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: easeOut } },
};

function initials(name: string | null): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]?.charAt(0) ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.charAt(0) ?? "" : "";
  return `${first}${last}`.toUpperCase() || "?";
}

/** `dd/MM HH:mm`; "—" quando não há data válida. */
export function formatCardDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month} ${hours}:${minutes}`;
}

export function PatientCard({ patient, onOpen }: PatientCardProps) {
  const name = patient.name?.trim() || "—";

  return (
    <motion.button
      type="button"
      variants={patientCardVariants}
      onClick={() => onOpen(patient)}
      aria-label={`Abrir perfil de ${name}`}
      className="flex w-full flex-col gap-4 rounded-2xl border border-[var(--color-gray-200)] bg-[var(--color-card)] p-5 text-left shadow-[var(--shadow-sm)] transition-[border-color,box-shadow,transform] duration-150 hover:border-[var(--color-primary-light)] hover:shadow-[var(--shadow-md)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
    >
      <span className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-muted)] text-sm font-semibold text-[var(--color-primary-dark)]"
        >
          {initials(patient.name)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-[var(--color-secondary)]">
            {name}
          </span>
          <span className="mt-0.5 block truncate font-mono text-xs text-[var(--color-gray-600)]">
            {patient.phone ? formatPhone(patient.phone) : "—"}
          </span>
        </span>
        <span
          className={cn(
            "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold",
            patient.isActive
              ? "border-[var(--color-primary-light)] bg-[var(--color-primary-muted)] text-[var(--color-primary-dark)]"
              : "border-[var(--color-gray-200)] bg-[var(--color-gray-100)] text-[var(--color-gray-600)]",
          )}
        >
          {patient.isActive ? "Ativo" : "Inativo"}
        </span>
      </span>

      <span className="grid grid-cols-2 gap-3 border-t border-[var(--color-gray-200)] pt-4">
        <span className="min-w-0">
          <span className="block text-[11px] font-medium text-[var(--color-gray-600)]">
            Próxima consulta
          </span>
          <span className="mt-1 block font-mono text-xs font-semibold text-[var(--color-secondary)]">
            {formatCardDateTime(patient.nextAppointmentAt)}
          </span>
        </span>
        <span className="min-w-0">
          <span className="block text-[11px] font-medium text-[var(--color-gray-600)]">
            Última sessão
          </span>
          <span className="mt-1 block font-mono text-xs font-semibold text-[var(--color-secondary)]">
            {formatCardDateTime(patient.lastSessionAt)}
          </span>
        </span>
      </span>
    </motion.button>
  );
}
