"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormSection } from "@/components/ui/FormSection";
import { Button } from "@/components/ui/Button";
import { AgendaSchema, AgendaFormData } from "../schemas/agenda.schema";
import { useAgendaInsert } from "../hooks/insert";
import { Patient, PagedResult } from "@/types";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";


interface Props {
  onBack: () => void;
  onSave: () => void;
}

// Converte datetime-local para ISO preservando o fuso horário local
const dateTimeLocalToIso = (dateTimeLocal: string): string => {
  if (!dateTimeLocal) return "";
  const [datePart, timePart] = dateTimeLocal.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);
  const localDate = new Date(year, month - 1, day, hours, minutes);
  return localDate.toISOString();
};

export default function AgendaRegister({ onBack, onSave }: Props) {
  const { insertAgenda, isPending } = useAgendaInsert();
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);

  const {
    handleSubmit,
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

  const onSubmit = async (data: AgendaFormData) => {
    try {
      if (!user?.id) {
        throw new Error("Usuário não autenticado");
      }
      // Converte o datetime-local para ISO apenas no submit
      const payload = {
        ...data,
        userId: user.id,
        appointmentDate: data.appointmentDate ? dateTimeLocalToIso(data.appointmentDate) : "",
      };
      await insertAgenda(payload);
      toast.success("Agendamento criado com sucesso!");
      onSave();
    } catch {
      // erro já tratado no hook
    }
  };

  // Converte ISO para datetime-local (YYYY-MM-DDTHH:MM) para exibição no input
  const getDateTimeLocalValue = (isoDate?: string) => {
    if (!isoDate) return "";
    try {
      const date = new Date(isoDate);
      // Ajusta para o fuso horário local
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

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Novo Agendamento" onBack={onBack} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormSection title="Dados do Agendamento">
          {/* Select de Paciente */}
          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-semibold text-[#1a2a4a] uppercase tracking-wider"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Paciente *
            </label>
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
          </div>

          {/* Data e Hora */}
          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-semibold text-[#1a2a4a] uppercase tracking-wider"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Data e Hora *
            </label>
            <input
              type="datetime-local"
              value={getDateTimeLocalValue(appointmentDate)}
              onChange={(e) => {
                // Armazena o valor datetime-local diretamente
                // Será convertido para ISO apenas no submit
                const localValue = e.target.value;
                if (localValue) {
                  setValue("appointmentDate", localValue, { shouldValidate: true });
                }
              }}
              className="w-full px-4 py-3 bg-white border-2 border-[#e2ebe6] rounded-sm text-[#1a2a4a]
                focus:border-[#1a4a3a] focus:shadow-[3px_3px_0_0_#1a4a3a] focus:outline-none transition-all"
              style={{ fontFamily: "var(--font-serif)" }}
            />
            {errors.appointmentDate && (
              <span className="text-xs text-red-600">{errors.appointmentDate.message}</span>
            )}
          </div>
        </FormSection>

        <Button type="submit" loading={isPending}>
          Cadastrar
        </Button>
      </form>
    </div>
  );
}
