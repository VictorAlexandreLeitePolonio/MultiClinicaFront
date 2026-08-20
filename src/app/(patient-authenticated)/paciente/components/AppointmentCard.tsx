"use client";

import { Calendar, Clock, Stethoscope } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PatientAppointment } from "@/types";
import { formatDate } from "@/utils/formatters";

export const appointmentStatusMapping = {
  Scheduled: { label: "Agendada", className: "bg-blue-100 text-blue-700 border-blue-200" },
  Completed: { label: "Realizada", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  Cancelled: { label: "Cancelada", className: "bg-red-100 text-red-700 border-red-200" },
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

/** Cartão de consulta — expõe apenas clínica, profissional, data, horário e status. */
export function AppointmentCard({ appointment }: { appointment: PatientAppointment }) {
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-[#d7f3ea] bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <p className="font-semibold text-[#0f172a] dark:text-white">
          {appointment.clinicName ?? "Clínica"}
        </p>
        <p className="flex items-center gap-1.5 text-sm text-[#64748b] dark:text-slate-300">
          <Stethoscope size={14} />
          {appointment.professionalName ?? "Profissional a definir"}
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#64748b] dark:text-slate-300">
          <span className="flex items-center gap-1.5">
            <Calendar size={14} />
            {formatDate(appointment.appointmentDate)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={14} />
            {formatTime(appointment.appointmentDate)}
          </span>
        </div>
      </div>
      <StatusBadge status={appointment.status} mapping={appointmentStatusMapping} />
    </article>
  );
}
