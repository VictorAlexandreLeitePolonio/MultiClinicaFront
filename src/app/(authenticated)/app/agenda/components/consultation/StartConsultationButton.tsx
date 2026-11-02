"use client";

import { useState } from "react";
import { Mic } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useConsultationRecorder } from "@/components/consultation/ConsultationRecorderProvider";
import { ConsentDialog } from "@/components/consultation/ConsentDialog";
import { queryKeys } from "@/lib/queryKeys";
import { Appointment, UserRole } from "@/types";

interface Props {
  appointment: Appointment;
  onChanged?: () => void;
}

export function canStartConsultation(
  appointment: Appointment,
  role?: UserRole,
): boolean {
  if (role !== "Administrador" && role !== "Profissional") return false;
  if (appointment.status === "Cancelled") return false;
  return !appointment.consultationStatus;
}

/** Abre o consentimento e inicia a gravação; usado no detalhe e na listagem. */
export function useStartConsultation(onChanged?: () => void) {
  const { start } = useConsultationRecorder();
  const queryClient = useQueryClient();
  const [target, setTarget] = useState<Appointment | null>(null);
  const [starting, setStarting] = useState(false);

  async function confirmStart() {
    if (!target || starting) return;

    setStarting(true);
    try {
      await start(target);
      toast.success("Consulta iniciada. Você pode navegar pelo sistema.");
      setTarget(null);
      await queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
      onChanged?.();
    } catch {
      // O provider já mostrou a mensagem de erro.
    } finally {
      setStarting(false);
    }
  }

  function closeDialog() {
    if (!starting) setTarget(null);
  }

  return {
    target,
    starting,
    open: setTarget,
    close: closeDialog,
    confirm: confirmStart,
  };
}

export function StartConsultationButton({ appointment, onChanged }: Props) {
  const { user } = useAuth();
  const { active } = useConsultationRecorder();
  const { target, starting, open, close, confirm } = useStartConsultation(onChanged);

  const visible =
    canStartConsultation(appointment, user?.role) &&
    active?.appointmentId !== appointment.id;

  if (!visible) return null;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        fullWidth={false}
        onClick={() => open(appointment)}
      >
        <Mic size={16} />
        Iniciar consulta
      </Button>

      <ConsentDialog
        open={Boolean(target)}
        loading={starting}
        onCancel={close}
        onConfirm={() => void confirm()}
      />
    </>
  );
}
