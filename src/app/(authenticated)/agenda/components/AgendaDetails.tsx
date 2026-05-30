"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormSection } from "@/components/ui/FormSection";
import { Button } from "@/components/ui/Button";
import { AgendaSchema, AgendaFormData } from "../schemas/agenda.schema";
import { useAgendaById } from "../hooks/getId";
import { useAgendaUpdate } from "../hooks/update";
import { Patient, PagedResult } from "@/types";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, Edit3, Save, X } from "lucide-react";

interface Props {
  id: number;
  onBack: () => void;
  onSave: () => void;
}


// Converte ISO para datetime-local (YYYY-MM-DDTHH:MM)
const isoToDateTimeLocal = (isoDate?: string): string => {
  if (!isoDate) return "";
  try {
    const date = new Date(isoDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch {
    return "";
  }
};

// Converte datetime-local para ISO preservando o fuso horário local
const dateTimeLocalToIso = (dateTimeLocal: string): string => {
  if (!dateTimeLocal) return "";
  // datetime-local tem formato "YYYY-MM-DDTHH:mm" sem fuso horário
  // Construímos a data manualmente para preservar o horário local
  const [datePart, timePart] = dateTimeLocal.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);
  const localDate = new Date(year, month - 1, day, hours, minutes);
  return localDate.toISOString();
};

export default function AgendaDetails({ id, onBack, onSave }: Props) {
  const { data, loading, error } = useAgendaById(id);
  const { updateAgenda, isPending } = useAgendaUpdate();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);

  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AgendaFormData>({
    resolver: zodResolver(AgendaSchema),
    defaultValues: {
      patientId: 0,
      appointmentDate: "",
      status: "Scheduled",
    },
  });

  const patientId = watch("patientId");
  const appointmentDate = watch("appointmentDate");

  // Buscar pacientes
  useEffect(() => {
    const fetchPatients = async () => {
      setLoadingPatients(true);
      try {
        const response = await api.get<PagedResult<Patient>>("/api/patients");
        setPatients(response.data.data);
      } catch {
        // erro silencioso
      } finally {
        setLoadingPatients(false);
      }
    };
    fetchPatients();
  }, []);

  // Reset form quando dados são carregados
  useEffect(() => {
    if (data) {
      reset({
        patientId: data.patientId,
        // Converte ISO para datetime-local para edição
        appointmentDate: isoToDateTimeLocal(data.appointmentDate),
        status: data.status,
      });
    }
  }, [data, reset]);

  const onSubmit = async (formData: AgendaFormData) => {
    try {
      if (!user?.id) {
        throw new Error("Usuário não autenticado");
      }
      const payload = {
        ...formData,
        userId: user.id,
        appointmentDate: dateTimeLocalToIso(formData.appointmentDate),
      };
      await updateAgenda(id, payload);
      toast.success("Agendamento atualizado com sucesso!");
      setIsEditing(false);
      onSave();
    } catch {
      // erro já tratado no hook
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (data) {
      reset({
        patientId: data.patientId,
        appointmentDate: isoToDateTimeLocal(data.appointmentDate),
        status: data.status,
      });
    }
  };

  const formatDateTimeDisplay = (dateTimeLocal?: string) => {
    if (!dateTimeLocal) return "-";
    try {
      const date = new Date(dateTimeLocal);
      return date.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  // Encontra o nome do paciente (da lista ou dos dados da agenda)
  const getPatientName = (): string => {
    // Primeiro tenta encontrar na lista de pacientes
    const patientFromList = patients.find((p) => p.id === patientId);
    if (patientFromList?.name) return patientFromList.name;
    // Se não encontrar, usa o patientName da agenda
    if (data?.patientName) return data.patientName;
    return "-";
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <PageHeader title="Detalhes do Agendamento" onBack={onBack} />
        <p className="text-[#4a6354]" style={{ fontFamily: "var(--font-serif)" }}>
          Carregando...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 max-w-2xl">
        <PageHeader title="Detalhes do Agendamento" onBack={onBack} />
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Detalhes do Agendamento"
        onBack={onBack}
        actions={
          !isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit3 size={16} className="mr-2" />
              Editar
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancelEdit}>
                <X size={16} className="mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleSubmit(onSubmit)} loading={isPending}>
                <Save size={16} className="mr-2" />
                Salvar Alterações
              </Button>
            </div>
          )
        }
      />

      {/* Status Visual */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center gap-2 px-4 py-3 rounded-sm border-2 ${
          isEditing
            ? "bg-[#1a4a3a]/10 border-[#1a4a3a]"
            : "bg-[#f0f4f2] border-[#e2ebe6]"
        }`}
      >
        {isEditing ? (
          <>
            <Edit3 size={18} className="text-[#1a4a3a]" />
            <span
              className="text-sm font-semibold text-[#1a4a3a]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Modo Edição — Você pode alterar os dados abaixo
            </span>
          </>
        ) : (
          <>
            <Eye size={18} className="text-[#4a6354]" />
            <span
              className="text-sm font-semibold text-[#4a6354]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Modo Visualização — Clique em &quot;Editar&quot; para modificar
            </span>
          </>
        )}
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormSection title="Dados do Agendamento">
          {/* Paciente */}
          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-semibold text-[#1a2a4a] uppercase tracking-wider"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Paciente *
            </label>
            {isEditing ? (
              <>
                <select
                  value={patientId || 0}
                  onChange={(e) => setValue("patientId", Number(e.target.value), { shouldValidate: true })}
                  className="w-full px-4 py-3 bg-white border-2 border-[#e2ebe6] rounded-sm text-[#1a2a4a]
                    focus:border-[#1a4a3a] focus:shadow-[3px_3px_0_0_#1a4a3a] focus:outline-none transition-all"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  <option value={0}>{loadingPatients ? "Carregando..." : "Selecione um paciente"}</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {errors.patientId && (
                  <span className="text-xs text-red-600">{errors.patientId.message}</span>
                )}
              </>
            ) : (
              <div
                className="w-full px-4 py-3 bg-[#f0f4f2] border-2 border-[#e2ebe6] rounded-sm text-[#1a2a4a]"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {getPatientName()}
              </div>
            )}
          </div>

          {/* Data e Hora */}
          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-semibold text-[#1a2a4a] uppercase tracking-wider"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Data e Hora *
            </label>
            {isEditing ? (
              <>
                <input
                  type="datetime-local"
                  value={appointmentDate || ""}
                  onChange={(e) => setValue("appointmentDate", e.target.value, { shouldValidate: true })}
                  className="w-full px-4 py-3 bg-white border-2 border-[#e2ebe6] rounded-sm text-[#1a2a4a]
                    focus:border-[#1a4a3a] focus:shadow-[3px_3px_0_0_#1a4a3a] focus:outline-none transition-all"
                  style={{ fontFamily: "var(--font-serif)" }}
                />
                {errors.appointmentDate && (
                  <span className="text-xs text-red-600">{errors.appointmentDate.message}</span>
                )}
              </>
            ) : (
              <div
                className="w-full px-4 py-3 bg-[#f0f4f2] border-2 border-[#e2ebe6] rounded-sm text-[#1a2a4a]"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {formatDateTimeDisplay(appointmentDate)}
              </div>
            )}
          </div>
        </FormSection>

        {/* Botões mobile */}
        <div className="flex gap-2 md:hidden">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit3 size={16} className="mr-2" />
              Editar
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancelEdit}>
                <X size={16} className="mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleSubmit(onSubmit)} loading={isPending}>
                <Save size={16} className="mr-2" />
                Salvar
              </Button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
