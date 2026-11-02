"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormSection } from "@/components/ui/FormSection";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AgendaSchema, AgendaFormData } from "../schemas/agenda.schema";
import { useAgendaById } from "../hooks/getId";
import { useAgendaUpdate } from "../hooks/update";
import { Patient } from "@/types";
import { getApiErrorMessage } from "@/utils/apiError";
import { queryKeys } from "@/lib/queryKeys";
import { clinicDateTimeToIso } from "../services/clinicDateTime";
import { Edit3, Save, X } from "lucide-react";
import { getPatients } from "@/app/(authenticated)/app/pacientes/services/patients.service";
import { getAppointmentProfessionals } from "../services/appointments.service";
import { StartConsultationButton } from "./consultation/StartConsultationButton";
import { ConsultationTab } from "./consultation/ConsultationTab";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  id: number;
  onBack: () => void;
  onSave: () => void;
}

const appointmentStatusMapping: Record<string, { label: string; className: string }> = {
  Scheduled: {
    label: "Agendado",
    className: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300",
  },
  Completed: {
    label: "Concluído",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  Cancelled: {
    label: "Cancelado",
    className: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300",
  },
};

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
  const { user } = useAuth();
  const { data, loading, error, refetch } = useAgendaById(id);
  const { updateAgenda, isPending } = useAgendaUpdate();
  const [isEditing, setIsEditing] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);

  const professionals = useQuery({
    queryKey: queryKeys.appointments.professionals,
    queryFn: getAppointmentProfessionals,
  });

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

  const professionalName = professionals.data?.find(
    (professional) => professional.id === data?.professionalId,
  )?.name;

  // Recepção não tem acesso ao relatório clínico.
  const canSeeClinical = user?.role === "Administrador" || user?.role === "Profissional";

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl">
        <PageHeader title="Detalhes do Agendamento" onBack={onBack} />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 max-w-6xl">
        <PageHeader title="Detalhes do Agendamento" onBack={onBack} />
        <ErrorState message={error} onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <PageHeader title="Detalhes do Agendamento" onBack={onBack} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          {isEditing ? (
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
                </div>

                {/* Data e Hora */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="detail-datetime"
                    className="text-sm font-semibold text-secondary dark:text-white uppercase tracking-wider"
                  >
                    Data e Hora *
                  </label>
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
                </div>
              </FormSection>
            </form>
          ) : data?.consultationStatus && canSeeClinical ? (
            <ConsultationTab appointment={data} onChanged={refetch} />
          ) : (
            <section className="rounded-2xl border border-dashed border-[#a7f3d0] bg-white/80 p-6 dark:border-slate-700 dark:bg-slate-900/80">
              <h2 className="text-lg font-bold text-[#0f172a] dark:text-white">Consulta</h2>
              <p className="mt-2 text-sm text-[#475569] dark:text-slate-300">
                {data?.consultationStatus
                  ? "Consulta gravada. O relatório fica disponível para os profissionais."
                  : "Nenhuma consulta gravada. Inicie a gravação para gerar o relatório e as evoluções desta sessão."}
              </p>
            </section>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-2xl border border-[#d7f3ea] bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-bold text-[#0f172a] dark:text-white">Resumo</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-xs font-semibold text-[#475569] dark:text-slate-300">
                  Paciente
                </dt>
                <dd className="mt-0.5">
                  {data ? (
                    <Link
                      href={`/app/pacientes?mode=profile&id=${data.patientId}`}
                      className="font-semibold text-[#0f766e] underline underline-offset-2 dark:text-[#67e8f9]"
                    >
                      {getPatientName()}
                    </Link>
                  ) : (
                    "-"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-[#475569] dark:text-slate-300">
                  Profissional
                </dt>
                <dd className="mt-0.5 text-[#0f172a] dark:text-white">
                  {professionalName ?? "-"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-[#475569] dark:text-slate-300">
                  Data
                </dt>
                <dd className="mt-0.5 text-[#0f172a] dark:text-white">
                  {data
                    ? formatDateTimeDisplay(
                        isoToDateTimeLocal(data.appointmentDate, data.timeZoneId),
                      )
                    : "-"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-[#475569] dark:text-slate-300">
                  Status
                </dt>
                <dd className="mt-1">
                  {data && (
                    <StatusBadge status={data.status} mapping={appointmentStatusMapping} />
                  )}
                </dd>
              </div>
            </dl>
          </section>

          {(isEditing || (data && !data.consultationStatus)) && (
            <section className="space-y-3 rounded-2xl border border-[#d7f3ea] bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-sm font-bold text-[#0f172a] dark:text-white">Ações</h2>
              {isEditing ? (
                <div className="flex flex-col items-start gap-2">
                  <Button fullWidth={false} variant="outline" onClick={handleCancelEdit}>
                    <X size={16} />
                    Cancelar
                  </Button>
                  <Button
                    fullWidth={false}
                    onClick={handleSubmit(onSubmit)}
                    loading={isPending}
                  >
                    <Save size={16} />
                    Salvar Alterações
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-start gap-2">
                  {data && <StartConsultationButton appointment={data} onChanged={refetch} />}
                  {data && !data.consultationStatus && (
                    <Button
                      fullWidth={false}
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit3 size={16} />
                      Editar
                    </Button>
                  )}
                </div>
              )}
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
