"use client";

import { useState } from "react";
import { Calendar, ClipboardList, Clock } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { MotivoDialog } from "@/components/ui/MotivoDialog";
import { appointmentRequestStatusMapping } from "@/lib/appointmentRequestStatus";
import { getApiErrorMessage } from "@/utils/apiError";
import { formatDate } from "@/utils/formatters";
import { PatientAppointmentRequest } from "@/types";
import { useCancelAppointmentRequest, useMyAppointmentRequests } from "../hooks/usePatientPortal";

function formatDateTime(iso: string) {
  const date = new Date(iso);
  return `${formatDate(iso)} ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
}

export default function PatientRequestsPage() {
  const { data, isLoading, isError, refetch } = useMyAppointmentRequests();
  const cancel = useCancelAppointmentRequest();
  const [cancelling, setCancelling] = useState<PatientAppointmentRequest | null>(null);

  const handleCancel = async (reason: string) => {
    if (!cancelling) return;
    try {
      await cancel.mutateAsync({ id: cancelling.id, reason });
      toast.success("Solicitação cancelada.");
      setCancelling(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Não foi possível cancelar a solicitação."));
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0f172a] dark:text-white">Solicitações</h1>

      {isLoading && (
        <p className="py-8 text-center text-sm text-[#64748b] dark:text-slate-400">Carregando...</p>
      )}

      {isError && !isLoading && (
        <ErrorState message="Não foi possível carregar suas solicitações." onRetry={() => void refetch()} />
      )}

      {!isLoading && !isError && (data?.length ?? 0) === 0 && (
        <EmptyState
          icon={ClipboardList}
          title="Nenhuma solicitação"
          description="Você pode solicitar uma consulta em Minhas clínicas."
        />
      )}

      {!isLoading && !isError && (data?.length ?? 0) > 0 && (
        <div className="space-y-3">
          {data!.map((request) => (
            <article
              key={request.id}
              className="space-y-3 rounded-2xl border border-[#d7f3ea] bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-semibold text-[#0f172a] dark:text-white">
                    {request.clinicName ?? "Clínica"}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#64748b] dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      {formatDateTime(request.requestedDate)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} />
                      Solicitada em {formatDate(request.createdAt)}
                    </span>
                  </div>
                </div>
                <StatusBadge status={request.status} mapping={appointmentRequestStatusMapping} />
              </div>

              {request.reason && (
                <p className="text-sm text-[#475569] dark:text-slate-300">
                  <span className="font-medium">Motivo:</span> {request.reason}
                </p>
              )}

              {request.responseReason && (
                <p className="rounded-lg bg-[#f8fafc] px-3 py-2 text-sm text-[#475569] dark:bg-slate-800 dark:text-slate-300">
                  <span className="font-medium">
                    {request.status === "Rejected" ? "Motivo da recusa" : "Motivo do cancelamento"}:
                  </span>{" "}
                  {request.responseReason}
                </p>
              )}

              {request.status === "Pending" && (
                <div className="flex justify-end">
                  <Button variant="danger" fullWidth={false} onClick={() => setCancelling(request)}>
                    Cancelar solicitação
                  </Button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      <MotivoDialog
        open={cancelling !== null}
        title="Cancelar solicitação"
        description="Informe o motivo do cancelamento desta solicitação."
        confirmLabel="Cancelar solicitação"
        loading={cancel.isPending}
        onCancel={() => setCancelling(null)}
        onConfirm={handleCancel}
      />
    </div>
  );
}
