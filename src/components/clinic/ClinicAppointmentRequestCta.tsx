"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarPlus, LogIn } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { usePatientAuth } from "@/contexts/PatientAuthContext";
import { RequestAppointmentModal } from "@/app/(patient-authenticated)/paciente/components/RequestAppointmentModal";

interface Props {
  clinicId: number;
  clinicName: string | null;
  acceptsAppointmentRequests: boolean;
  onRequestsDisabled?: () => void;
}

export function ClinicAppointmentRequestCta({ clinicId, clinicName, acceptsAppointmentRequests, onRequestsDisabled }: Props) {
  const { isAuthenticated, isLoading } = usePatientAuth();
  const [open, setOpen] = useState(false);
  const [disabledByServer, setDisabledByServer] = useState(false);

  // Sem ação de solicitação quando a clínica não aceita.
  if (!acceptsAppointmentRequests || disabledByServer) return null;

  return (
    <section className="rounded-2xl border border-[#a7f3d0] bg-[#ecfdf5] p-5 dark:border-emerald-900 dark:bg-emerald-950/30">
      <h2 className="text-lg font-bold text-[#0f172a] dark:text-white">Agende sua consulta</h2>
      <p className="mt-1 text-sm text-[#475569] dark:text-slate-300">
        Esta clínica aceita solicitações de consulta online.
      </p>

      <div className="mt-4">
        {isLoading ? (
          <Button fullWidth={false} disabled>
            Carregando...
          </Button>
        ) : isAuthenticated ? (
          <Button fullWidth={false} onClick={() => setOpen(true)}>
            <CalendarPlus size={16} />
            Solicitar consulta
          </Button>
        ) : (
          <Link href="/paciente/login">
            <Button fullWidth={false}>
              <LogIn size={16} />
              Entrar para solicitar
            </Button>
          </Link>
        )}
      </div>

      {open && (
        <RequestAppointmentModal
          open
          clinicId={clinicId}
          clinicName={clinicName}
          onClose={() => setOpen(false)}
          onRequestsDisabled={() => {
            setDisabledByServer(true);
            onRequestsDisabled?.();
          }}
        />
      )}
    </section>
  );
}
