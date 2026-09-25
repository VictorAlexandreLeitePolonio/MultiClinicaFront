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
import { Patient } from "@/types";
import { getApiErrorMessage } from "@/utils/apiError";
import { clinicDateTimeToIso } from "../services/clinicDateTime";
import { Eye, Edit3, Save, X } from "lucide-react";
import { getPatients } from "@/app/(authenticated)/app/pacientes/services/patients.service";

interface Props {
  id: number;
  onBack: () => void;
  onSave: () => void;
}


// Converte ISO para datetime-local (YYYY-MM-DDTHH:MM)
const isoToDateTimeLocal = (isoDate?: string, timeZoneId = "America/Sao_Paulo"): string => {
  if (!isoDate) return "";
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timeZoneId, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    }).formatToParts(new Date(isoDate));
    const value = (part: string) => parts.find((item) => item.type === part)?.value ?? "";
    return `${value("year")}-${value("month")}-${value("day")}T${value("hour")}:${value("minute")}`;
  } catch {
    return "";
  }
};

export default function AgendaDetails({ id, onBack, onSave }: Props) {
  const { data, loading, error } = useAgendaById(id);
  const { updateAgenda, isPending } = useAgendaUpdate();
  const [isEditing, setIsEditing] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);

  const {
    handleSubmit,
    reset,
    setValue,
    setError,
    clearErrors,
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
        const result = await getPatients();
        setPatients(result.data);
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
        appointmentDate: isoToDateTimeLocal(data.appointmentDate, data.timeZoneId),
        status: data.status,
      });
    }
  }, [data, reset]);

  const onSubmit = async (formData: AgendaFormData) => {
    try {
      const payload = { appointmentDate: clinicDateTimeToIso(formData.appointmentDate, data?.timeZoneId ?? "America/Sao_Paulo"),
        status: formData.status ?? "Scheduled" as const };
      await updateAgenda(id, payload);
      toast.success("Agendamento atualizado com sucesso!");
      setIsEditing(false);
      onSave();
    } catch (error) {
      setError("appointmentDate", { type: "server", message: getApiErrorMessage(error,
        error instanceof Error ? error.message : "Não foi possível atualizar a consulta.") });
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (data) {
      reset({
        patientId: data.patientId,
        appointmentDate: isoToDateTimeLocal(data.appointmentDate, data.timeZoneId),
        status: data.status,
      });
    }
  };

  const formatDateTimeDisplay = (dateTimeLocal?: string) => {
    if (!dateTimeLocal) return "-";
    try {
      const [day, hour] = dateTimeLocal.split("T");
      return `${day.split("-").reverse().join("/")} ${hour}`;
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
        <p className="text-gray-600 dark:text-slate-300">
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
        className={`flex items-center gap-2 px-4 py-3 rounded-xl border ${
          isEditing
            ? "bg-primary-dark/10 border-primary-dark"
            : "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700"
        }`}
      >
        {isEditing ? (
          <>
            <Edit3 size={18} className="text-primary-dark" />
            <span className="text-sm font-semibold text-primary-dark">
              Modo Edição — Você pode alterar os dados abaixo
            </span>
          </>
        ) : (
          <>
            <Eye size={18} className="text-gray-600 dark:text-slate-300" />
            <span className="text-sm font-semibold text-gray-600 dark:text-slate-300">
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
              htmlFor="detail-patient"
              className="text-sm font-semibold text-secondary dark:text-white uppercase tracking-wider"
            >
              Paciente *
            </label>
            {isEditing ? (
              <>
                <select
                  id="detail-patient"
                  value={patientId || 0}
                  onChange={(e) => setValue("patientId", Number(e.target.value), { shouldValidate: true })}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-secondary dark:text-white
                    focus:border-primary focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all"
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
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-secondary dark:text-white"
              >
                {getPatientName()}
              </div>
            )}
          </div>

          {/* Data e Hora */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="detail-datetime"
              className="text-sm font-semibold text-secondary dark:text-white uppercase tracking-wider"
            >
              Data e Hora *
            </label>
            {isEditing ? (
              <>
                <input
                  id="detail-datetime"
                  type="datetime-local"
                  value={appointmentDate || ""}
                  onChange={(e) => { clearErrors("appointmentDate"); setValue("appointmentDate", e.target.value, { shouldValidate: true }); }}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-secondary dark:text-white
                    focus:border-primary focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all"
                />
                {errors.appointmentDate && (
                  <span className="text-xs text-red-600">{errors.appointmentDate.message}</span>
                )}
              </>
            ) : (
              <div
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-secondary dark:text-white"
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
