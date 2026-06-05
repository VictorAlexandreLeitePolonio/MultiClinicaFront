"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAgendaCalendar } from "../hooks/calendar";
import { Appointment } from "@/types";
import { fadeSlideUp } from "@/lib/motion";

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 07:00 - 20:00
const DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

interface Props {
  onCreate?: () => void;
}

export default function AgendaCalendar({ onCreate }: Props) {
  const router = useRouter();
  const [weekStart, setWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  const { appointments, loading } = useAgendaCalendar(weekStart);

  const goToPreviousWeek = () => {
    const newDate = new Date(weekStart);
    newDate.setDate(newDate.getDate() - 7);
    setWeekStart(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(weekStart);
    newDate.setDate(newDate.getDate() + 7);
    setWeekStart(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);
    setWeekStart(monday);
  };

  const getWeekDates = () => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      return date;
    });
  };

  const weekDates = getWeekDates();

  const formatWeekRange = () => {
    const start = weekDates[0];
    const end = weekDates[6];
    const startStr = start.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    const endStr = end.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
    return `${startStr} – ${endStr}`;
  };

  const getAppointmentsForSlot = (dayIndex: number, hour: number): Appointment[] => {
    const date = weekDates[dayIndex];
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.appointmentDate);
      return (
        aptDate.getDate() === date.getDate() &&
        aptDate.getMonth() === date.getMonth() &&
        aptDate.getFullYear() === date.getFullYear() &&
        aptDate.getHours() === hour
      );
    });
  };

  const getAppointmentStyle = (status: Appointment["status"]) => {
    switch (status) {
      case "Scheduled":
        return "border-cyan-200 bg-cyan-50 text-cyan-700";
      case "Completed":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
      case "Cancelled":
        return "border-slate-200 bg-slate-50 text-slate-400 line-through";
      default:
        return "border-cyan-200 bg-cyan-50 text-cyan-700";
    }
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    router.push(`/app/agenda?mode=view&id=${appointment.id}`);
  };

  const handleSlotClick = () => {
    onCreate?.();
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center rounded-3xl border border-[#d7f3ea] bg-white shadow-[0_18px_50px_-44px_rgba(15,23,42,0.42)] dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-medium text-[#64748b] dark:text-slate-300">Carregando calendário...</p>
      </div>
    );
  }

  return (
    <motion.div variants={fadeSlideUp} className="space-y-4">
      {/* Header da semana */}
      <div className="flex flex-col gap-4 rounded-3xl border border-[#d7f3ea] bg-white p-4 shadow-[0_18px_50px_-44px_rgba(15,23,42,0.42)] sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousWeek}
            className="rounded-xl border border-[#d7f3ea] p-2 text-[#0f766e] transition-colors hover:bg-[#ecfdf5] dark:border-slate-800 dark:text-[#67e8f9] dark:hover:bg-slate-800"
            aria-label="Semana anterior"
          >
            <ChevronLeft size={20} />
          </button>
          <h2
            className="min-w-[200px] text-center text-lg font-bold text-[#0f172a] dark:text-white"
          >
            {formatWeekRange()}
          </h2>
          <button
            onClick={goToNextWeek}
            className="rounded-xl border border-[#d7f3ea] p-2 text-[#0f766e] transition-colors hover:bg-[#ecfdf5] dark:border-slate-800 dark:text-[#67e8f9] dark:hover:bg-slate-800"
            aria-label="Próxima semana"
          >
            <ChevronRight size={20} />
          </button>
        </div>
        <Button variant="outline" onClick={goToToday}>
          Hoje
        </Button>
      </div>

      {/* Grid do calendário */}
      <div className="overflow-x-auto rounded-3xl border border-[#d7f3ea] bg-white shadow-[0_18px_50px_-44px_rgba(15,23,42,0.42)] dark:border-slate-800 dark:bg-slate-900">
        {/* Cabeçalho dos dias */}
        <div className="grid min-w-[920px] grid-cols-8 border-b border-[#d7f3ea] bg-[#f0fdf9] dark:border-slate-800 dark:bg-slate-900">
          <div className="border-r border-[#d7f3ea] p-3 dark:border-slate-800">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#64748b] dark:text-slate-300">Horário</span>
          </div>
          {DAYS.map((day, index) => {
            const date = weekDates[index];
            const isToday = new Date().toDateString() === date.toDateString();
            const formattedDate = date.toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
            });
            return (
              <div
                key={date.toISOString()}
                className={`border-r border-[#d7f3ea] p-3 text-center last:border-r-0 dark:border-slate-800 ${
                  isToday ? "bg-[#0f766e] text-white" : ""
                }`}
              >
                <p
                  className={`text-xs font-semibold uppercase tracking-wide ${
                    isToday ? "text-white/80" : "text-[#64748b] dark:text-slate-300"
                  }`}
                >
                  {day}
                </p>
                <p className={`mt-1 text-sm font-bold ${isToday ? "text-white" : "text-[#0f172a] dark:text-white"}`}>
                  {formattedDate}
                </p>
              </div>
            );
          })}
        </div>

        {/* Grid de horários */}
        <div className="grid min-w-[920px] grid-cols-8">
          {/* Coluna de horários */}
          <div className="border-r border-[#d7f3ea] bg-[#f8fffc] dark:border-slate-800 dark:bg-slate-950/40">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="flex h-20 items-center justify-center border-b border-[#e6fbf4] last:border-b-0 dark:border-slate-800"
              >
                <span className="text-xs font-medium text-[#64748b] dark:text-slate-300">
                  {hour.toString().padStart(2, "0")}:00
                </span>
              </div>
            ))}
          </div>

          {/* Colunas dos dias */}
          {DAYS.map((_, dayIndex) => (
            <div key={weekDates[dayIndex].toISOString()} className="border-r border-[#d7f3ea] last:border-r-0 dark:border-slate-800">
              {HOURS.map((hour) => {
                const slotAppointments = getAppointmentsForSlot(dayIndex, hour);
                return (
                  <div
                    key={hour}
                    className="relative h-20 cursor-pointer border-b border-[#e6fbf4] p-1.5 transition-colors last:border-b-0 hover:bg-[#ecfdf5]/70 dark:border-slate-800 dark:hover:bg-slate-800/70"
                    onClick={handleSlotClick}
                  >
                    {slotAppointments.map((apt) => (
                      <div
                        key={apt.id}
                        className={`cursor-pointer truncate rounded-xl border px-2 py-1.5 text-xs shadow-sm transition-transform hover:-translate-y-0.5 ${getAppointmentStyle(
                          apt.status
                        )}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAppointmentClick(apt);
                        }}
                        title={`${apt.patientName} - ${new Date(apt.appointmentDate).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`}
                      >
                        <p className="font-semibold truncate">{apt.patientName}</p>
                        <p className="text-[10px] opacity-80">
                          {new Date(apt.appointmentDate).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-[#d7f3ea] bg-white px-4 py-3 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 rounded-md border border-cyan-200 bg-cyan-50"></span>
          <span className="text-[#64748b] dark:text-slate-300">Agendado</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 rounded-md border border-emerald-200 bg-emerald-50"></span>
          <span className="text-[#64748b] dark:text-slate-300">Completo</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 rounded-md border border-slate-200 bg-slate-50"></span>
          <span className="text-[#64748b] dark:text-slate-300">Cancelado</span>
        </div>
      </div>
    </motion.div>
  );
}
