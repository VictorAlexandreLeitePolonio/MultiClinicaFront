"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [disabledByServer, setDisabledByServer] = useState(false);

  const query = searchParams.toString();
  const returnTo = `${pathname || "/"}${query ? `?${query}` : ""}`;

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
          <Link
            href={`/paciente/login?next=${encodeURIComponent(returnTo)}`}
            className="inline-flex w-auto items-center justify-center gap-1.5 rounded-xl border border-[var(--color-primary-dark)] bg-[var(--color-primary-dark)] px-5 py-2.5 text-sm font-semibold text-[var(--color-white)] shadow-[var(--shadow-teal-sm)] transition-[transform,background-color,box-shadow] duration-150 hover:brightness-110 hover:shadow-[var(--shadow-teal-md)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)] active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
          >
            <LogIn size={16} />
            Entrar para solicitar
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
