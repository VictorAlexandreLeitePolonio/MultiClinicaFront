"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormSection } from "@/components/ui/FormSection";
import { Button } from "@/components/ui/Button";
import { AgendaCreateSchema, AgendaCreateFormData } from "../schemas/agenda.schema";
import { useAgendaInsert } from "../hooks/insert";
import { Patient } from "@/types";
import { getPatients } from "@/app/(authenticated)/app/pacientes/services/patients.service";
import { useTutorial } from "@/hooks/tutorial/useTutorial";
import { getAppointmentProfessionals, getProfessionalDaySchedule } from "../services/appointments.service";
import { ProfessionalDaySchedule } from "./ProfessionalDaySchedule";
import { queryKeys } from "@/lib/queryKeys";
import { getApiErrorMessage } from "@/utils/apiError";
import { clinicDateTimeToIso } from "../services/clinicDateTime";


interface Props {
  onBack: () => void;
  onSave: () => void;
}

export default function AgendaRegister({ onBack, onSave }: Props) {
  const { insertAgenda, isPending } = useAgendaInsert();
  const queryClient = useQueryClient();
  const { completeTaskTutorial } = useTutorial();
  const professionals = useQuery({ queryKey: queryKeys.appointments.professionals, queryFn: getAppointmentProfessionals });
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);

  const {
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm<AgendaCreateFormData>({
    resolver: zodResolver(AgendaCreateSchema),
    defaultValues: {
      patientId: 0,
      appointmentDate: "",
      status: "Scheduled",
      professionalId: 0,
    },
  });

  const patientId = watch("patientId");
  const appointmentDate = watch("appointmentDate");
  const professionalId = watch("professionalId");
  const day = appointmentDate?.slice(0, 10) ?? "";
  const daySchedule = useQuery({
    queryKey: queryKeys.appointments.day(professionalId, day),
    queryFn: () => getProfessionalDaySchedule(professionalId, day),
    enabled: professionalId > 0 && /^\d{4}-\d{2}-\d{2}$/.test(day),
  });

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

  const onSubmit = async (data: AgendaCreateFormData) => {
    try {
      if (!daySchedule.data?.timeZoneId) throw new Error("Aguarde a agenda do profissional carregar.");
      await insertAgenda({ patientId: data.patientId, professionalId: data.professionalId,
        appointmentDate: clinicDateTimeToIso(data.appointmentDate, daySchedule.data.timeZoneId) });
      toast.success("Agendamento criado com sucesso!");
      completeTaskTutorial("agenda", "create-appointment");
      onSave();
    } catch (error) {
      setError("appointmentDate", { type: "server", message: getApiErrorMessage(error,
        error instanceof Error ? error.message : "Não foi possível agendar a consulta.") });
      if (professionalId && day) void queryClient.invalidateQueries({ queryKey: queryKeys.appointments.day(professionalId, day) });
    }
  };

  return (
    <div className="max-w-6xl space-y-6">
      <PageHeader title="Novo Agendamento" onBack={onBack} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,380px)] lg:items-start">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormSection title="Dados do Agendamento">
          {/* Select de Paciente */}
          <div data-tutorial="agenda-form-patient" className="flex flex-col gap-2">
            <label
              htmlFor="appointment-patient"
              className="text-sm font-semibold text-secondary dark:text-white uppercase tracking-wider"
            >
              Paciente *
            </label>
            <select
              id="appointment-patient"
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

          <div className="flex flex-col gap-2">
            <label htmlFor="appointment-professional" className="text-sm font-semibold uppercase tracking-wider text-secondary dark:text-white">Profissional *</label>
            <select id="appointment-professional" value={professionalId || 0}
              onChange={(event) => setValue("professionalId", Number(event.target.value), { shouldValidate: true })}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-secondary focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
              <option value={0}>{professionals.isPending ? "Carregando profissionais..." : "Selecione um profissional"}</option>
              {professionals.data?.map((professional) => <option key={professional.id} value={professional.id}>{professional.name}</option>)}
            </select>
            {professionals.isError && <p role="alert" className="text-sm text-red-700 dark:text-red-300">Não foi possível carregar os profissionais. <button type="button" onClick={() => professionals.refetch()} className="font-semibold underline">Tentar novamente</button></p>}
            {errors.professionalId && <span className="text-xs text-red-600">{errors.professionalId.message}</span>}
          </div>

          {/* Data e Hora */}
          <div data-tutorial="agenda-form-datetime" className="flex flex-col gap-2">
            <label
              htmlFor="appointment-datetime"
              className="text-sm font-semibold text-secondary dark:text-white uppercase tracking-wider"
            >
              Data e Hora *
            </label>
            <input
              id="appointment-datetime"
              type="datetime-local"
              value={appointmentDate || ""}
              onChange={(e) => {
                clearErrors("appointmentDate");
                setValue("appointmentDate", e.target.value, { shouldValidate: true });
              }}
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-secondary dark:text-white
                focus:border-primary focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all"
            />
            {errors.appointmentDate && (
              <span className="text-xs text-red-600">{errors.appointmentDate.message}</span>
            )}
          </div>
        </FormSection>

        <div data-tutorial="agenda-form-save">
          <Button type="submit" loading={isPending}>
            Cadastrar
          </Button>
        </div>
      </form>
      {professionalId > 0 && /^\d{4}-\d{2}-\d{2}$/.test(day) && (
        <ProfessionalDaySchedule key={`${professionalId}-${day}`} professionalId={professionalId} date={day}
          selectedLocalDateTime={appointmentDate}
          onSelect={(local) => { clearErrors("appointmentDate"); setValue("appointmentDate", local, { shouldValidate: true }); }} />
      )}
      </div>
    </div>
  );
}
