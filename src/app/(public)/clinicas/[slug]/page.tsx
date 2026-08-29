"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Building2, Mail, Phone } from "lucide-react";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { usePublicClinic } from "./hooks/usePublicClinic";
import { ClinicPublicHeader } from "./components/ClinicPublicHeader";
import { ClinicGallery } from "./components/ClinicGallery";
import { ClinicAddress } from "./components/ClinicAddress";
import { ClinicBusinessHours } from "./components/ClinicBusinessHours";
import { ClinicAppointmentRequestCta } from "./components/ClinicAppointmentRequestCta";
import { MarketplaceClinicMap } from "@/app/(patient-authenticated)/paciente/marketplace/clinicas/[id]/components/MarketplaceClinicMap";
import { ClinicAddress as ClinicAddressType } from "@/types";

function addressText(address: ClinicAddressType) {
  return [address.rua, address.numero, address.bairro, address.cidade, address.estado]
    .filter(Boolean)
    .join(", ");
}

export default function PublicClinicPage() {
  const slug = String(useParams().slug ?? "");
  const { data: clinic, isLoading, isError, notFound, refetch } = usePublicClinic(slug);

  return (
    <div className="min-h-screen bg-[#f0fdf9] px-4 py-8 dark:bg-slate-950">
      <div className="mx-auto max-w-4xl space-y-6">
        {isLoading && (
          <p className="py-16 text-center text-sm text-[#64748b] dark:text-slate-400">Carregando...</p>
        )}

        {notFound && (
          <EmptyState
            icon={Building2}
            title="Clínica não encontrada"
            description="Esta clínica não existe, não está pública ou está indisponível no momento."
          />
        )}

        {isError && !notFound && (
          <ErrorState message="Não foi possível carregar o perfil da clínica." onRetry={() => void refetch()} />
        )}

        {clinic && (
          <>
            <ClinicPublicHeader clinic={clinic} />

            <ClinicAppointmentRequestCta
              clinicId={clinic.id}
              clinicName={clinic.displayName}
              acceptsAppointmentRequests={clinic.acceptsAppointmentRequests}
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
              <MarketplaceClinicMap
                latitude={clinic.latitude}
                longitude={clinic.longitude}
                displayName={clinic.displayName ?? ""}
                address={addressText(clinic.address)}
              />
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
          </>
        )}

        <div className="pt-2 text-center">
          <Link href="/paciente" className="text-sm font-medium text-[#0f766e] hover:text-[#14b8a6]">
            Ir para o portal do paciente
          </Link>
        </div>
      </div>
    </div>
  );
}
