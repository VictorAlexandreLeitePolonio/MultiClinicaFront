"use client";

import { Appointment } from "@/types";
import { motion } from "motion/react";
import { fadeSlideUp, hoverLift } from "@/lib/motion";
import { Clock } from "lucide-react";

const statusConfig = {
  Scheduled: { label: "Agendado", color: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  Completed: { label: "Concluído", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  Cancelled: { label: "Cancelado", color: "bg-red-50 text-red-700 border-red-200" },
};

export function AppointmentCard({ appointment }: { appointment: Appointment }) {
  const { label, color } = statusConfig[appointment.status];
  const time = new Date(appointment.appointmentDate).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.div
      variants={fadeSlideUp}
      whileHover={hoverLift}
      className="flex cursor-pointer items-center justify-between rounded-2xl border border-[#d7f3ea] bg-white p-4 shadow-sm transition-colors hover:border-[#14b8a6] hover:bg-[#f8fffc] dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#a7f3d0] bg-[#ecfdf5]">
          <Clock size={18} className="text-[#0f766e]" />
        </div>
        <div>
          <p 
            className="text-sm font-semibold text-[#0f172a] dark:text-white"
          >
            {appointment.patientName}
          </p>
          <p className="mt-0.5 text-xs text-[#64748b] dark:text-slate-300">{time}</p>
        </div>
      </div>
      <span 
        className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${color}`}
      >
        {label}
      </span>
    </motion.div>
  );
}
