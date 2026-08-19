"use client";

import { Calendar, Clock, User } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { appointmentRequestStatusMapping } from "@/lib/appointmentRequestStatus";
import { formatDate } from "@/utils/formatters";
import { AppointmentRequest } from "@/types";

interface Props {
  request: AppointmentRequest;
  onAccept: (request: AppointmentRequest) => void;
  onReject: (request: AppointmentRequest) => void;
  onCancel: (request: AppointmentRequest) => void;
}

function formatDateTime(iso: string) {
  const date = new Date(iso);
  return `${formatDate(iso)} ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
}

/** Cartão de uma solicitação na Agenda da clínica, com as ações disponíveis. */
export function AppointmentRequestDetails({ request, onAccept, onReject, onCancel }: Props) {
  const isPending = request.status === "Pending";

  return (
    <article className="space-y-3 rounded-2xl border border-[#d7f3ea] bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="flex items-center gap-1.5 font-semibold text-[#0f172a] dark:text-white">
            <User size={15} />
            {request.patientName ?? "Paciente"}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#64748b] dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              {formatDateTime(request.requestedDate)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} />
              Recebida em {formatDate(request.createdAt)}
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

      {isPending && (
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" fullWidth={false} onClick={() => onCancel(request)}>
            Cancelar
          </Button>
          <Button variant="danger" fullWidth={false} onClick={() => onReject(request)}>
            Recusar
          </Button>
          <Button fullWidth={false} onClick={() => onAccept(request)}>
            Aceitar
          </Button>
        </div>
      )}
    </article>
  );
}
