"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Building2, Mail, Phone, X } from "lucide-react";
import { PatientAuthProvider } from "@/contexts/PatientAuthContext";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { ClinicAddress as ClinicAddressType, PublicClinic } from "@/types";
import { MarketplaceClinicDetails } from "@/app/(patient-authenticated)/paciente/marketplace/types/marketplace.types";
import { usePublicClinic } from "./usePublicClinic";
import { useMarketplaceClinic } from "@/app/(patient-authenticated)/paciente/marketplace/hooks/useMarketplace";
import { ClinicPublicHeader } from "./ClinicPublicHeader";
import { ClinicGallery } from "./ClinicGallery";
import { ClinicAddress } from "./ClinicAddress";
import { ClinicBusinessHours } from "./ClinicBusinessHours";
import { ClinicAppointmentRequestCta } from "./ClinicAppointmentRequestCta";
import { ClinicMap } from "./ClinicMap";

export type ClinicDetailSource =
  | { mode: "public"; slug: string }
  | { mode: "marketplace"; id: number };

type ClinicDetail = PublicClinic | MarketplaceClinicDetails;

function addressText(address: ClinicAddressType) {
  return [address.rua, address.numero, address.bairro, address.cidade, address.estado]
    .filter(Boolean)
    .join(", ");
}

interface Props {
  source: ClinicDetailSource | null;
  onClose: () => void;
}

export function ClinicDetailModal({ source, onClose }: Props) {
  return (
    <Dialog.Root open={source !== null} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
            <Dialog.Content
              className="relative w-full max-w-3xl rounded-2xl bg-[#f0fdf9] p-4 shadow-2xl focus:outline-none dark:bg-slate-950 sm:p-6"
              aria-describedby={undefined}
            >
              <Dialog.Close
                className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#334155] shadow-sm backdrop-blur transition hover:bg-white dark:bg-slate-800/90 dark:text-slate-200 dark:hover:bg-slate-800"
                aria-label="Fechar"
              >
                <X size={18} />
              </Dialog.Close>
              <PatientAuthProvider>
                {source && <ClinicDetailBody source={source} />}
              </PatientAuthProvider>
            </Dialog.Content>
          </div>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ClinicDetailBody({ source }: { source: ClinicDetailSource }) {
  const publicQuery = usePublicClinic(source.mode === "public" ? source.slug : "");
  const marketplaceQuery = useMarketplaceClinic(source.mode === "marketplace" ? source.id : 0);
  const query = source.mode === "public" ? publicQuery : marketplaceQuery;
  const notFound =
    source.mode === "public"
      ? publicQuery.notFound
      : "error" in marketplaceQuery && isNotFound(marketplaceQuery.error);

  if (query.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-56" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (notFound) {
    return (
      <EmptyState
        icon={Building2}
        title="Clínica indisponível"
        description="Esta clínica não existe, não está pública ou está indisponível no momento."
      />
    );
  }

  if (query.isError) {
    return (
      <ErrorState
        message="Não foi possível carregar o perfil da clínica."
        onRetry={() => void query.refetch()}
      />
    );
  }

  const clinic = query.data as ClinicDetail | undefined;
  if (!clinic) return null;

  // Dialog exige um título acessível — usamos o nome da clínica.
  return (
    <div className="space-y-6">
      <Dialog.Title className="sr-only">{clinic.displayName ?? "Clínica"}</Dialog.Title>

      <ClinicPublicHeader clinic={clinic} />

      <ClinicAppointmentRequestCta
        clinicId={clinic.id}
        clinicName={clinic.displayName}
        acceptsAppointmentRequests={clinic.acceptsAppointmentRequests}
        onRequestsDisabled={() => void query.refetch()}
      />

      {clinic.description && (
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-[#0f172a] dark:text-white">Sobre</h2>
          <p className="whitespace-pre-line rounded-2xl border border-[#d7f3ea] bg-white p-4 text-sm text-[#475569] shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            {clinic.description}
          </p>
        </section>
      )}

      <ClinicGallery images={clinic.gallery} />

      <ClinicAddress address={clinic.address} latitude={clinic.latitude} longitude={clinic.longitude} />

      {clinic.latitude != null && clinic.longitude != null && (
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-[#0f172a] dark:text-white">Mapa</h2>
          <ClinicMap
            latitude={clinic.latitude}
            longitude={clinic.longitude}
            displayName={clinic.displayName ?? ""}
            address={addressText(clinic.address)}
          />
        </section>
      )}

      <ClinicBusinessHours hours={clinic.businessHours} />

      {(clinic.contactEmail || clinic.contactPhone) && (
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-[#0f172a] dark:text-white">Contato</h2>
          <div className="space-y-2 rounded-2xl border border-[#d7f3ea] bg-white p-4 text-sm text-[#475569] shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            {clinic.contactEmail && (
              <p className="flex items-center gap-2">
                <Mail size={15} className="text-[#0f766e]" />
                {clinic.contactEmail}
              </p>
            )}
            {clinic.contactPhone && (
              <p className="flex items-center gap-2">
                <Phone size={15} className="text-[#0f766e]" />
                {clinic.contactPhone}
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function isNotFound(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    (error as { response?: { status?: number } }).response?.status === 404
  );
}
