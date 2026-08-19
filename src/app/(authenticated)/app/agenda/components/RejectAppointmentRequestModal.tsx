"use client";

import { MotivoDialog } from "@/components/ui/MotivoDialog";

interface Props {
  open: boolean;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}

/** Recusa de uma solicitação — exige motivo (reutiliza o MotivoDialog). */
export function RejectAppointmentRequestModal({ open, loading, onCancel, onConfirm }: Props) {
  return (
    <MotivoDialog
      open={open}
      title="Recusar solicitação"
      description="Informe o motivo da recusa. O paciente poderá visualizá-lo."
      confirmLabel="Recusar"
      loading={loading}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}
