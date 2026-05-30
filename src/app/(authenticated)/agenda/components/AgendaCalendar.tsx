"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
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
        return "bg-[#e8f0ec] border-[#1a4a3a] text-[#1a4a3a]";
      case "Completed":
        return "bg-green-50 border-green-500 text-green-700";
      case "Cancelled":
        return "bg-gray-100 border-gray-300 text-gray-400 line-through";
      default:
        return "bg-[#e8f0ec] border-[#1a4a3a] text-[#1a4a3a]";
    }
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    router.push(`/agenda?mode=view&id=${appointment.id}`);
  };

  const handleSlotClick = (dayIndex: number, hour: number) => {
    // Opcional: pré-preencher a data no create
    onCreate?.();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-[#4a6354]">Carregando calendário...</p>
      </div>
    );
  }

  return (
    <motion.div variants={fadeSlideUp} className="space-y-4">
      {/* Header da semana */}
      <div className="flex items-center justify-between bg-white border-2 border-[#e2ebe6] rounded-sm p-4">
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousWeek}
            className="p-2 hover:bg-[#f0f4f2] rounded-sm transition-colors"
          >
            <ChevronLeft size={20} className="text-[#1a4a3a]" />
          </button>
          <h2
            className="text-lg font-bold text-[#1a2a4a] min-w-[200px] text-center"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {formatWeekRange()}
          </h2>
          <button
            onClick={goToNextWeek}
            className="p-2 hover:bg-[#f0f4f2] rounded-sm transition-colors"
          >
            <ChevronRight size={20} className="text-[#1a4a3a]" />
          </button>
        </div>
        <Button variant="outline" onClick={goToToday}>
          Hoje
        </Button>
      </div>

      {/* Grid do calendário */}
      <div className="bg-white border-2 border-[#e2ebe6] rounded-sm overflow-hidden">
        {/* Cabeçalho dos dias */}
        <div className="grid grid-cols-8 border-b-2 border-[#e2ebe6]">
          <div className="p-3 bg-[#f0f4f2] border-r border-[#e2ebe6]">
            <span className="text-xs font-semibold text-[#4a6354] uppercase">Horário</span>
          </div>
          {DAYS.map((day, index) => {
            const date = weekDates[index];
            const isToday = new Date().toDateString() === date.toDateString();
            return (
              <div
                key={day}
                className={`p-3 text-center border-r border-[#e2ebe6] last:border-r-0 ${
                  isToday ? "bg-[#1a4a3a] text-white" : "bg-[#f0f4f2]"
                }`}
              >
                <p
                  className={`text-xs font-semibold uppercase ${
                    isToday ? "text-white/80" : "text-[#4a6354]"
                  }`}
                >
                  {day}
                </p>
                <p className={`text-sm font-bold ${isToday ? "text-white" : "text-[#1a2a4a]"}`}>
                  {date.getDate()}
                </p>
              </div>
            );
          })}
        </div>

        {/* Grid de horários */}
        <div className="grid grid-cols-8">
          {/* Coluna de horários */}
          <div className="border-r border-[#e2ebe6]">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="h-16 border-b border-[#e2ebe6] last:border-b-0 flex items-center justify-center"
              >
                <span className="text-xs text-[#4a6354]">
                  {hour.toString().padStart(2, "0")}:00
                </span>
              </div>
            ))}
          </div>

          {/* Colunas dos dias */}
          {DAYS.map((_, dayIndex) => (
            <div key={dayIndex} className="border-r border-[#e2ebe6] last:border-r-0">
              {HOURS.map((hour) => {
                const slotAppointments = getAppointmentsForSlot(dayIndex, hour);
                return (
                  <div
                    key={hour}
                    className="h-16 border-b border-[#e2ebe6] last:border-b-0 p-1 relative hover:bg-[#f8faf9] transition-colors cursor-pointer"
                    onClick={() => handleSlotClick(dayIndex, hour)}
                  >
                    {slotAppointments.map((apt) => (
                      <div
                        key={apt.id}
                        className={`text-xs p-1.5 rounded-sm border cursor-pointer truncate ${getAppointmentStyle(
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
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-sm bg-[#e8f0ec] border border-[#1a4a3a]"></span>
          <span className="text-[#4a6354]">Agendado</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-sm bg-green-50 border border-green-500"></span>
          <span className="text-[#4a6354]">Completo</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-sm bg-gray-100 border border-gray-300"></span>
          <span className="text-[#4a6354]">Cancelado</span>
        </div>
      </div>
    </motion.div>
  );
}
