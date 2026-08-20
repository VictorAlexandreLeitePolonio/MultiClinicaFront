"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { queryKeys } from "@/lib/queryKeys";
import { getApiErrorMessage } from "@/utils/apiError";
import { AppointmentRequest } from "@/types";
import { getUsers } from "@/app/(authenticated)/app/usuarios/services/users.service";
import { useAcceptRequest } from "../hooks/requests";

interface Props {
  request: AppointmentRequest;
  onClose: () => void;
  onAccepted: () => void;
}

function formatDateTime(iso: string) {
  const date = new Date(iso);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AcceptAppointmentRequestModal({ request, onClose, onAccepted }: Props) {
  const accept = useAcceptRequest();
  const [professionalId, setProfessionalId] = useState(0);

  const usersQuery = useQuery({
    queryKey: queryKeys.users.list({ pageSize: 100 }),
    queryFn: () => getUsers({ pageSize: 100 }),
  });

  // Profissionais que atendem consultas (recepção não atende).
  const professionals = (usersQuery.data?.data ?? []).filter(
    (u) => u.role === "Profissional" || u.role === "Administrador",
  );

  const handleConfirm = async () => {
    if (!professionalId) return;
    try {
      await accept.mutateAsync({ id: request.id, professionalId });
      toast.success("Solicitação aceita. A consulta foi criada na Agenda.");
      onAccepted();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Não foi possível aceitar a solicitação."));
    }
  };

  return (
    <Dialog.Root open onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#d7f3ea] bg-white p-6 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.42)] dark:border-slate-800 dark:bg-slate-900">
          <Dialog.Title className="text-lg font-bold text-[#0f172a] dark:text-white">
            Confirmar consulta
          </Dialog.Title>

          <dl className="mt-4 space-y-1.5 text-sm">
            <div className="flex gap-2">
              <dt className="font-semibold text-[#0f172a] dark:text-white">Paciente:</dt>
              <dd className="text-[#475569] dark:text-slate-300">{request.patientName ?? "-"}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold text-[#0f172a] dark:text-white">Data solicitada:</dt>
              <dd className="text-[#475569] dark:text-slate-300">{formatDateTime(request.requestedDate)}</dd>
            </div>
            {request.reason && (
              <div className="flex gap-2">
                <dt className="font-semibold text-[#0f172a] dark:text-white">Motivo:</dt>
                <dd className="text-[#475569] dark:text-slate-300">{request.reason}</dd>
              </div>
            )}
          </dl>

          <div className="mt-4 flex flex-col gap-2">
            <label htmlFor="accept-professional" className="text-sm font-semibold text-[#0f172a] dark:text-white">
              Profissional
            </label>
            <select
              id="accept-professional"
              value={professionalId}
              onChange={(e) => setProfessionalId(Number(e.target.value))}
              className="w-full rounded-xl border border-[#d7f3ea] bg-white px-4 py-3 text-[#0f172a] focus:border-[#14b8a6] focus:outline-none focus:ring-4 focus:ring-[#99f6e4]/50 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            >
              <option value={0}>
                {usersQuery.isLoading ? "Carregando..." : "Selecionar profissional"}
              </option>
              {professionals.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-6 flex gap-3">
            <Dialog.Close asChild>
              <Button type="button" variant="outline" disabled={accept.isPending}>
                Cancelar
              </Button>
            </Dialog.Close>
            <Button
              type="button"
              loading={accept.isPending}
              disabled={professionalId === 0}
              onClick={handleConfirm}
            >
              Confirmar consulta
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
