"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
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
      appointmentDay: "",
      appointmentTime: "",
      status: "Scheduled",
      professionalId: 0,
    },
  });

  const patientId = watch("patientId");
  const appointmentDay = watch("appointmentDay");
  const appointmentTime = watch("appointmentTime");
  const professionalId = watch("professionalId");
  const selectedLocalDateTime = appointmentDay && appointmentTime
    ? `${appointmentDay}T${appointmentTime}` : "";
  const daySchedule = useQuery({
    queryKey: queryKeys.appointments.day(professionalId, appointmentDay),
    queryFn: () => getProfessionalDaySchedule(professionalId, appointmentDay),
    enabled: professionalId > 0 && /^\d{4}-\d{2}-\d{2}$/.test(appointmentDay),
  });
  const availabilityError = (() => {
    if (!selectedLocalDateTime || !daySchedule.data) return null;
    try {
      const start = Date.parse(clinicDateTimeToIso(selectedLocalDateTime, daySchedule.data.timeZoneId));
      const end = start + daySchedule.data.durationMinutes * 60_000;
      return daySchedule.data.appointments.some((appointment) =>
        start < Date.parse(appointment.end) && end > Date.parse(appointment.start))
        ? "Este horário já está ocupado." : null;
    } catch (error) {
      return error instanceof Error ? error.message : "Data e hora inválidas.";
    }
  })();

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
      if (!daySchedule.data?.timeZoneId || daySchedule.data.date !== data.appointmentDay)
        throw new Error("Aguarde a agenda do profissional carregar.");
      if (availabilityError) throw new Error(availabilityError);
      await insertAgenda({ patientId: data.patientId, professionalId: data.professionalId,
        appointmentDate: clinicDateTimeToIso(`${data.appointmentDay}T${data.appointmentTime}`, daySchedule.data.timeZoneId) });
      toast.success("Agendamento criado com sucesso!");
      completeTaskTutorial("agenda", "create-appointment");
      onSave();
    } catch (error) {
      setError("appointmentTime", { type: "server", message: getApiErrorMessage(error,
        error instanceof Error ? error.message : "Não foi possível agendar a consulta.") });
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
              onChange={(event) => {
                clearErrors("appointmentTime");
                setValue("professionalId", Number(event.target.value), { shouldValidate: true });
              }}
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
              htmlFor="appointment-day"
              className="text-sm font-semibold text-secondary dark:text-white uppercase tracking-wider"
            >
              Data *
            </label>
            <input
              id="appointment-day"
              type="date"
              value={appointmentDay || ""}
              onChange={(e) => {
                clearErrors("appointmentTime");
                setValue("appointmentDay", e.target.value, { shouldValidate: true });
              }}
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-secondary dark:text-white
                focus:border-primary focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all"
            />
            {errors.appointmentDay && (
              <span className="text-xs text-red-600">{errors.appointmentDay.message}</span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="appointment-time" className="text-sm font-semibold text-secondary dark:text-white uppercase tracking-wider">Hora *</label>
            <input id="appointment-time" type="time" value={appointmentTime || ""}
              onChange={(event) => { clearErrors("appointmentTime"); setValue("appointmentTime", event.target.value, { shouldValidate: true }); }}
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 rounded-xl text-secondary focus:border-primary focus:ring-4 focus:ring-primary/20 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
            {(errors.appointmentTime || availabilityError) && (
              <span role="alert" className="text-xs text-red-600">{errors.appointmentTime?.message ?? availabilityError}</span>
            )}
            {selectedLocalDateTime && daySchedule.data && !availabilityError && (
              <span className="text-xs text-teal-700 dark:text-teal-300">Sem conflito com consultas deste dia.</span>
            )}
          </div>
        </FormSection>

        <div data-tutorial="agenda-form-save">
          <Button type="submit" loading={isPending}
            disabled={isPending || !!availabilityError || (professionalId > 0 && !!appointmentDay && !daySchedule.data)}>
            Cadastrar
          </Button>
        </div>
      </form>
      {professionalId > 0 && /^\d{4}-\d{2}-\d{2}$/.test(appointmentDay) && (
        <ProfessionalDaySchedule key={`${professionalId}-${appointmentDay}`} date={appointmentDay} schedule={daySchedule}
          selectedLocalDateTime={selectedLocalDateTime}
          onSelect={(local) => {
            clearErrors("appointmentTime");
            setValue("appointmentDay", local.slice(0, 10), { shouldValidate: true });
            setValue("appointmentTime", local.slice(11, 16), { shouldValidate: true });
          }} />
      )}
      </div>
    </div>
  );
}
