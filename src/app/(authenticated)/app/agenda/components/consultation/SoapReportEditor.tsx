"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Appointment } from "@/types";
import { ConsultationReport, UpdateConsultationReportPayload } from "@/types/consultation";
import { consultationKeys } from "@/lib/queryKeys";
import { getApiErrorMessage } from "@/utils/apiError";
import { updateConsultationReport, reviewConsultation } from "../../services/consultation.service";

interface Props {
  appointment: Appointment;
  report: ConsultationReport;
  onChanged?: () => void;
}

const DEFAULT_TIME_ZONE = "America/Sao_Paulo";

/** Data civil da consulta no fuso da clínica (YYYY-MM-DD). */
function appointmentCivilDate(appointment: Appointment): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: appointment.timeZoneId ?? DEFAULT_TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date(appointment.appointmentDate));
    const value = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
    return `${value("year")}-${value("month")}-${value("day")}`;
  } catch {
    return appointment.appointmentDate.slice(0, 10);
  }
}

function addDays(civilDate: string, days: number): string {
  const [year, month, day] = civilDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

export function SoapReportEditor({ appointment, report, onChanged }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [subjective, setSubjective] = useState(report.subjective ?? "");
  const [objective, setObjective] = useState(report.objective ?? "");
  const [assessment, setAssessment] = useState(report.assessment ?? "");
  const [plan, setPlan] = useState(report.plan ?? "");
  const [reviewedAt, setReviewedAt] = useState(report.reviewedAt);

  const save = useMutation({
    mutationFn: (payload: UpdateConsultationReportPayload) =>
      updateConsultationReport(appointment.id, payload),
    onSuccess: (_data, payload) => {
      queryClient.setQueryData<ConsultationReport>(consultationKeys.detail(appointment.id), (current) =>
        current ? { ...current, ...payload } : current
      );
      toast.success("Relatório salvo.");
      onChanged?.();
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível salvar o relatório."));
    },
  });

  const review = useMutation({
    mutationFn: () => reviewConsultation(appointment.id),
    onSuccess: () => {
      const now = new Date().toISOString();
      setReviewedAt(now);
      queryClient.setQueryData<ConsultationReport>(consultationKeys.detail(appointment.id), (current) =>
        current ? { ...current, reviewedAt: now } : current
      );
      toast.success("Consulta marcada como revisada.");
      onChanged?.();
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível marcar como revisado."));
    },
  });

  const handleSave = () => {
    save.mutate({
      subjective: subjective.trim() || null,
      objective: objective.trim() || null,
      assessment: assessment.trim() || null,
      plan: plan.trim() || null,
    });
  };

  const handleScheduleReturn = () => {
    const params = new URLSearchParams({
      mode: "create",
      patientId: String(appointment.patientId),
      professionalId: String(appointment.professionalId),
    });
    if (report.suggestedReturnDays) {
      const baseDate = appointmentCivilDate(appointment);
      params.set("date", addDays(baseDate, report.suggestedReturnDays));
    }
    router.push(`/app/agenda?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="soap-subjective" className="text-sm font-semibold uppercase tracking-wider text-secondary dark:text-white">
            Subjetivo
          </label>
          <textarea
            id="soap-subjective"
            rows={5}
            value={subjective}
            onChange={(event) => setSubjective(event.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-secondary focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="soap-objective" className="text-sm font-semibold uppercase tracking-wider text-secondary dark:text-white">
            Objetivo
          </label>
          <textarea
            id="soap-objective"
            rows={5}
            value={objective}
            onChange={(event) => setObjective(event.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-secondary focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="soap-assessment" className="text-sm font-semibold uppercase tracking-wider text-secondary dark:text-white">
            Avaliação
          </label>
          <textarea
            id="soap-assessment"
            rows={5}
            value={assessment}
            onChange={(event) => setAssessment(event.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-secondary focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="soap-plan" className="text-sm font-semibold uppercase tracking-wider text-secondary dark:text-white">
            Plano
          </label>
          <textarea
            id="soap-plan"
            rows={5}
            value={plan}
            onChange={(event) => setPlan(event.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-secondary focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button fullWidth={false} onClick={handleSave} loading={save.isPending}>
          Salvar
        </Button>
        {reviewedAt ? (
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            Revisado
          </p>
        ) : (
          <Button
            fullWidth={false}
            variant="outline"
            onClick={() => review.mutate()}
            loading={review.isPending}
          >
            Marcar como revisado
          </Button>
        )}
      </div>

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

      <div className="flex flex-wrap gap-3">
        <Button fullWidth={false} variant="outline" onClick={handleScheduleReturn}>
          Agendar retorno
        </Button>
      </div>
    </div>
  );
}
