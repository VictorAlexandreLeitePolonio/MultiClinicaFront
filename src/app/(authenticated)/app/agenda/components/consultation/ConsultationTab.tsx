"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import { Appointment } from "@/types";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EvolutionSheet } from "@/components/evolution/EvolutionSheet";
import { useAuth } from "@/contexts/AuthContext";
import { consultationKeys, patientRecordKeys, queryKeys } from "@/lib/queryKeys";
import { getApiErrorMessage } from "@/utils/apiError";
import { formatDate, formatDateTime } from "@/utils/formatters";
import { getPatientEvolutions } from "@/app/(authenticated)/app/pacientes/services/patient-record.service";
import {
  getAppointmentProfessionals,
} from "../../services/appointments.service";
import {
  createEvolutionFromConsultation,
  getConsultation,
  retryConsultation,
} from "../../services/consultation.service";
import { SoapReportEditor } from "./SoapReportEditor";

interface Props {
  appointment: Appointment;
  onChanged?: () => void;
}

const consultationStatusMapping: Record<string, { label: string; className: string }> = {
  Recording: {
    label: "Gravando",
    className: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300",
  },
  Processing: {
    label: "Processando",
    className: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
  },
  Ready: {
    label: "Pronta",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  Interrupted: {
    label: "Interrompida",
    className: "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
  },
  Failed: {
    label: "Falhou",
    className: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300",
  },
};

const evolutionStatusMapping: Record<string, { label: string; className: string }> = {
  Draft: {
    label: "Rascunho",
    className: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
  },
  Completed: {
    label: "Concluída",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  Canceled: {
    label: "Cancelada",
    className: "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
  },
};

function formatDuration(seconds: number | null): string {
  if (seconds == null) return "—";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remaining = seconds % 60;
  const pad = (value: number) => String(value).padStart(2, "0");

  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(remaining)}`
    : `${pad(minutes)}:${pad(remaining)}`;
}

export function ConsultationTab({ appointment, onChanged }: Props) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const canSeeClinical =
    user?.role === "Administrador" || user?.role === "Profissional";
  const enabled = !!appointment.consultationStatus && canSeeClinical;
  const [evolutionSheetOpen, setEvolutionSheetOpen] = useState(false);
  const [evolutionSheetId, setEvolutionSheetId] = useState<number | null>(null);

  const consultation = useQuery({
    queryKey: consultationKeys.detail(appointment.id),
    queryFn: () => getConsultation(appointment.id),
    enabled,
    refetchInterval: (query) => {
      const report = query.state.data;
      return report && (report.status === "Processing" || report.reportPending) ? 10_000 : false;
    },
  });

  const professionals = useQuery({
    queryKey: queryKeys.appointments.professionals,
    queryFn: getAppointmentProfessionals,
    enabled: enabled && !!consultation.data,
  });

  const evolutionsParams = { appointmentId: appointment.id };
  const evolutions = useQuery({
    queryKey: patientRecordKeys.evolutions(appointment.patientId, evolutionsParams),
    queryFn: () => getPatientEvolutions(appointment.patientId, evolutionsParams),
    enabled: enabled && !!consultation.data,
  });

  const retry = useMutation({
    mutationFn: () => retryConsultation(appointment.id),
    onSuccess: async () => {
      toast.success("Nova tentativa iniciada.");
      await queryClient.invalidateQueries({ queryKey: consultationKeys.detail(appointment.id) });
      onChanged?.();
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível tentar novamente."));
    },
  });

  const generateEvolution = useMutation({
    mutationFn: () => createEvolutionFromConsultation(appointment.id),
    onSuccess: ({ evolutionId }) => {
      setEvolutionSheetId(evolutionId);
      setEvolutionSheetOpen(true);
      void queryClient.invalidateQueries({
        queryKey: patientRecordKeys.evolutions(appointment.patientId, evolutionsParams),
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível gerar a evolução."));
    },
  });

  if (!enabled) return null;

  if (consultation.isPending) {
    return (
      <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-24 w-full" />
      </section>
    );
  }

  if (consultation.isError) {
    return (
      <ErrorState
        message="Não foi possível carregar a consulta."
        onRetry={() => consultation.refetch()}
      />
    );
  }

  const report = consultation.data;
  if (!report) return null;

  const professionalName = professionals.data?.find(
    (professional) => professional.id === report.professionalId,
  )?.name;
  const recordedAt = formatDateTime(report.startedAt);
  const recordedBy = professionalName
    ? `Gravado por ${professionalName} em ${recordedAt}`
    : `Gravado em ${recordedAt}`;
  const canGenerate = report.status === "Ready" && !report.reportPending;

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#d7f3ea] pb-4 dark:border-slate-800">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-[#0f172a] dark:text-white">Consulta</h2>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#475569] dark:text-slate-300">
              <span>Duração {formatDuration(report.durationSeconds)}</span>
              <span>{recordedBy}</span>
              {report.reviewedAt && (
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                  Revisado em {formatDateTime(report.reviewedAt)}
                </span>
              )}
            </p>
          </div>
          <StatusBadge status={report.status} mapping={consultationStatusMapping} />
        </div>

        {report.status === "Recording" && (
          <p className="text-sm text-[#475569] dark:text-slate-300">Gravação em andamento</p>
        )}

        {report.status === "Processing" && (
          <p className="text-sm text-[#475569] dark:text-slate-300">
            Transcrevendo e gerando o relatório…
          </p>
        )}

        {report.status === "Ready" && report.reportPending && (
          <div className="space-y-3">
            <p className="text-sm text-[#475569] dark:text-slate-300">
              Relatório aguardando a IA
            </p>
            {report.transcript && (
              <details className="rounded-xl border border-gray-200 px-4 py-3 dark:border-slate-700">
                <summary className="cursor-pointer text-sm font-semibold text-[#0f172a] dark:text-white">
                  Transcrição
                </summary>
                <p className="mt-2 whitespace-pre-wrap text-sm text-[#475569] dark:text-slate-300">
                  {report.transcript}
                </p>
              </details>
            )}
          </div>
        )}

        {report.status === "Ready" && !report.reportPending && (
          <SoapReportEditor appointment={appointment} report={report} onChanged={onChanged} />
        )}

        {(report.status === "Failed" || report.status === "Interrupted") && (
          <div className="space-y-3">
            <p className="text-sm text-[#475569] dark:text-slate-300">
              {report.failureReason?.trim() || "Gravação interrompida"}
            </p>
            <Button fullWidth={false} onClick={() => retry.mutate()} loading={retry.isPending}>
              Tentar novamente
            </Button>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-[#0f172a] dark:text-white">
            Evoluções desta consulta
          </h2>
          <Button
            fullWidth={false}
            variant="outline"
            disabled={!canGenerate}
            loading={generateEvolution.isPending}
            onClick={() => generateEvolution.mutate()}
          >
            Gerar evolução
          </Button>
        </div>

        {evolutions.isPending && (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        )}

        {evolutions.isError && (
          <ErrorState
            title="Não foi possível carregar as evoluções"
            message="Tente novamente para ver as evoluções registradas nesta consulta."
            onRetry={() => evolutions.refetch()}
          />
        )}

        {!evolutions.isPending && !evolutions.isError && (evolutions.data?.data.length ?? 0) === 0 && (
          <p className="text-sm text-[#475569] dark:text-slate-300">
            Nenhuma evolução desta consulta. Gere uma para registrar as medições da sessão.
          </p>
        )}

        {!evolutions.isPending && !evolutions.isError && (evolutions.data?.data.length ?? 0) > 0 && (
          <ul className="divide-y divide-[#e6fbf4] rounded-2xl border border-[#d7f3ea] bg-white px-4 dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
            {evolutions.data?.data.map((evolution) => (
              <li key={evolution.id}>
                <button
                  type="button"
                  onClick={() => {
                    setEvolutionSheetId(evolution.id);
                    setEvolutionSheetOpen(true);
                  }}
                  className="flex w-full flex-wrap items-center justify-between gap-2 py-3 text-left transition-colors hover:bg-[#f8fffc] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#99f6e4] dark:hover:bg-slate-800"
                >
                  <span className="flex items-center gap-2 text-sm font-semibold text-[#0f172a] dark:text-white">
                    <FileText size={16} className="text-[#0f766e] dark:text-[#67e8f9]" />
                    {formatDate(evolution.date)}
                  </span>
                  <span className="min-w-0 flex-1 truncate px-2 text-sm text-[#475569] dark:text-slate-300">
                    {evolution.templateNames.length > 0
                      ? evolution.templateNames.join(" · ")
                      : "Sem fichas"}
                  </span>
                  <StatusBadge
                    status={evolution.status}
                    mapping={evolutionStatusMapping}
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <EvolutionSheet
        patientId={appointment.patientId}
        evolutionId={evolutionSheetId}
        appointmentId={appointment.id}
        open={evolutionSheetOpen}
        onOpenChange={setEvolutionSheetOpen}
        onSaved={() => {
          void queryClient.invalidateQueries({
            queryKey: patientRecordKeys.evolutions(appointment.patientId, evolutionsParams),
          });
        }}
      />
    </div>
  );
}
