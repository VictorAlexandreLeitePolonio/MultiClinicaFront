"use client";

import { Appointment } from "@/types";
import { motion } from "motion/react";
import { fadeSlideUp, hoverLift } from "@/lib/motion";
import { Clock } from "lucide-react";

const statusConfig = {
  Scheduled: { label: "Agendado", color: "bg-[#1a2a4a] text-white border-[#121d33]" },
  Completed: { label: "Concluído", color: "bg-[#5a9c94] text-white border-[#4a8880]" },
  Cancelled: { label: "Cancelado", color: "bg-red-700 text-white border-red-800" },
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
      className="bg-white rounded-sm border-2 border-[#e2ebe6] p-4 flex justify-between items-center hover:border-[#5a9c94] transition-colors cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-sm bg-[#f0f4f2] border border-[#e2ebe6] flex items-center justify-center">
          <Clock size={18} className="text-[#5a9c94]" />
        </div>
        <div>
          <p 
            className="text-sm font-semibold text-[#1a2a4a]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {appointment.patientName}
          </p>
          <p className="text-xs text-[#4a6354] mt-0.5">{time}</p>
        </div>
      </div>
      <span 
        className={`text-xs font-semibold px-3 py-1.5 rounded-sm border-2 ${color}`}
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {label}
      </span>
    </motion.div>
  );
}
