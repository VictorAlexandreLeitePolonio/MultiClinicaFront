import { AppointmentRequestStatus } from "@/types";

/** Rótulo + estilo do badge de status de uma solicitação de consulta. */
export const appointmentRequestStatusMapping: Record<
  AppointmentRequestStatus,
  { label: string; className: string }
> = {
  Pending: { label: "Pendente", className: "bg-amber-100 text-amber-700 border-amber-200" },
  Accepted: { label: "Aceita", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  Rejected: { label: "Recusada", className: "bg-red-100 text-red-700 border-red-200" },
  Cancelled: { label: "Cancelada", className: "bg-slate-100 text-slate-600 border-slate-200" },
};
