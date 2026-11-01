"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Appointment } from "@/types";
import { Button } from "@/components/ui/Button";
import { consultationKeys } from "@/lib/queryKeys";
import { getApiErrorMessage } from "@/utils/apiError";
import { getConsultation, retryConsultation } from "../../services/consultation.service";
import { SoapReportEditor } from "./SoapReportEditor";

interface Props {
  appointment: Appointment;
  onChanged?: () => void;
}

export function ConsultationTab({ appointment, onChanged }: Props) {
  const queryClient = useQueryClient();
  const enabled = !!appointment.consultationStatus;

  const consultation = useQuery({
    queryKey: consultationKeys.detail(appointment.id),
    queryFn: () => getConsultation(appointment.id),
    enabled,
    refetchInterval: (query) => {
      const report = query.state.data;
      return report && (report.status === "Processing" || report.reportPending) ? 10_000 : false;
    },
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

  if (!enabled) return null;

  if (consultation.isPending) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm text-gray-600 dark:text-slate-300">Carregando consulta...</p>
      </section>
    );
  }

  if (consultation.isError) {
    return (
      <section className="space-y-3 rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950/40">
        <p className="text-sm font-semibold text-red-700 dark:text-red-300">
          Não foi possível carregar a consulta.
        </p>
        <Button fullWidth={false} variant="danger" onClick={() => consultation.refetch()}>
          Tentar novamente
        </Button>
      </section>
    );
  }

  const report = consultation.data;
  if (!report) return null;

  return (
    <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-bold text-secondary dark:text-white">Consulta</h2>

      {report.status === "Recording" && (
        <p className="text-sm text-gray-600 dark:text-slate-300">Gravação em andamento</p>
      )}

      {report.status === "Processing" && (
        <p className="text-sm text-gray-600 dark:text-slate-300">
          Transcrevendo e gerando o relatório…
        </p>
      )}

      {report.status === "Ready" && report.reportPending && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-slate-300">Relatório aguardando a IA</p>
          {report.transcript && (
            <details className="rounded-xl border border-gray-200 px-4 py-3 dark:border-slate-700">
              <summary className="cursor-pointer text-sm font-semibold text-secondary dark:text-white">
                Transcrição
              </summary>
              <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600 dark:text-slate-300">
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
          <p className="text-sm text-gray-600 dark:text-slate-300">
            {report.failureReason?.trim() || "Gravação interrompida"}
          </p>
          <Button fullWidth={false} onClick={() => retry.mutate()} loading={retry.isPending}>
            Tentar novamente
          </Button>
        </div>
      )}
    </section>
  );
}
