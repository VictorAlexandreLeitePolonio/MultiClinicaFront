"use client";

import { useState } from "react";
import { ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { MotivoDialog } from "@/components/ui/MotivoDialog";
import { getApiErrorMessage } from "@/utils/apiError";
import { AppointmentRequest } from "@/types";
import { AppointmentRequestDetails } from "./AppointmentRequestDetails";
import { AcceptAppointmentRequestModal } from "./AcceptAppointmentRequestModal";
import { RejectAppointmentRequestModal } from "./RejectAppointmentRequestModal";
import { useClinicRequests, useCancelClinicRequest, useRejectRequest } from "../hooks/requests";

export default function AppointmentRequestsList() {
  const { data, isLoading, isError, refetch } = useClinicRequests();
  const reject = useRejectRequest();
  const cancel = useCancelClinicRequest();

  const [accepting, setAccepting] = useState<AppointmentRequest | null>(null);
  const [rejecting, setRejecting] = useState<AppointmentRequest | null>(null);
  const [cancelling, setCancelling] = useState<AppointmentRequest | null>(null);

  // Pendentes primeiro, depois por data solicitada.
  const requests = [...(data ?? [])].sort((a, b) => {
    if (a.status === "Pending" && b.status !== "Pending") return -1;
    if (a.status !== "Pending" && b.status === "Pending") return 1;
    return new Date(a.requestedDate).getTime() - new Date(b.requestedDate).getTime();
  });

  const handleReject = async (reason: string) => {
    if (!rejecting) return;
    try {
      await reject.mutateAsync({ id: rejecting.id, reason });
      toast.success("Solicitação recusada.");
      setRejecting(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Não foi possível recusar a solicitação."));
    }
  };

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

  if (isLoading) {
    return <p className="py-8 text-center text-sm text-[#64748b] dark:text-slate-400">Carregando...</p>;
  }

  if (isError) {
    return <ErrorState message="Não foi possível carregar as solicitações." onRetry={() => void refetch()} />;
  }

  if (requests.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="Nenhuma solicitação"
        description="Solicitações de consulta enviadas pelos pacientes aparecerão aqui."
      />
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((request) => (
        <AppointmentRequestDetails
          key={request.id}
          request={request}
          onAccept={setAccepting}
          onReject={setRejecting}
          onCancel={setCancelling}
        />
      ))}

      {accepting && (
        <AcceptAppointmentRequestModal
          request={accepting}
          onClose={() => setAccepting(null)}
          onAccepted={() => setAccepting(null)}
        />
      )}

      <RejectAppointmentRequestModal
        open={rejecting !== null}
        loading={reject.isPending}
        onCancel={() => setRejecting(null)}
        onConfirm={handleReject}
      />

      <MotivoDialog
        open={cancelling !== null}
        title="Cancelar solicitação"
        description="Informe o motivo do cancelamento. O paciente poderá visualizá-lo."
        confirmLabel="Cancelar solicitação"
        loading={cancel.isPending}
        onCancel={() => setCancelling(null)}
        onConfirm={handleCancel}
      />
    </div>
  );
}
