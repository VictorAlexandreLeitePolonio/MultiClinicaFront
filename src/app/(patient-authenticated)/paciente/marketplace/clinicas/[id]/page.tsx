"use client";

import axios from "axios";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Building2, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { ClinicPublicHeader } from "@/app/(public)/clinicas/[slug]/components/ClinicPublicHeader";
import { ClinicGallery } from "@/app/(public)/clinicas/[slug]/components/ClinicGallery";
import { ClinicAddress } from "@/app/(public)/clinicas/[slug]/components/ClinicAddress";
import { ClinicBusinessHours } from "@/app/(public)/clinicas/[slug]/components/ClinicBusinessHours";
import { ClinicAppointmentRequestCta } from "@/app/(public)/clinicas/[slug]/components/ClinicAppointmentRequestCta";
import { useMarketplaceClinic } from "../../hooks/useMarketplace";
import { MarketplaceClinicMap } from "./components/MarketplaceClinicMap";

function addressText(address: {
  rua: string | null;
  numero: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
}) {
  return [address.rua, address.numero, address.bairro, address.cidade, address.estado]
    .filter(Boolean)
    .join(", ");
}

export default function MarketplaceClinicDetailsPage() {
  const clinicId = Number(useParams().id);
  const query = useMarketplaceClinic(clinicId);
  const notFound = axios.isAxiosError(query.error) && query.error.response?.status === 404;

  if (!Number.isInteger(clinicId) || clinicId <= 0 || notFound) {
    return (
      <div className="space-y-4">
        <EmptyState
          icon={Building2}
          title="Clínica indisponível"
          description="Esta clínica não existe ou não está disponível no Marketplace."
        />
        <Link href="/paciente/marketplace"><Button variant="outline">Voltar ao Marketplace</Button></Link>
      </div>
    );
  }

  if (query.isLoading) {
    return <div className="space-y-4"><Skeleton className="h-64" /><Skeleton className="h-40" /></div>;
  }

  if (query.isError) {
    return (
      <ErrorState
        message="Não foi possível carregar os dados da clínica."
        onRetry={() => void query.refetch()}
      />
    );
  }

  const clinic = query.data;
  if (!clinic) return null;

  return (
    <div className="space-y-6">
      <Link href="/paciente/marketplace" className="text-sm font-medium text-[#0f766e] hover:text-[#14b8a6]">
        ← Voltar ao Marketplace
      </Link>

      <ClinicPublicHeader clinic={clinic} />

      {clinic.description && (
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-[#0f172a] dark:text-white">Sobre</h2>
          <p className="whitespace-pre-line rounded-2xl border border-[#d7f3ea] bg-white p-4 text-sm text-[#475569] shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            {clinic.description}
          </p>
        </section>
      )}

      <ClinicGallery images={clinic.gallery} />

      <ClinicAppointmentRequestCta
        clinicId={clinic.id}
        clinicName={clinic.displayName}
        acceptsAppointmentRequests={clinic.acceptsAppointmentRequests}
        onRequestsDisabled={() => void query.refetch()}
      />

      <ClinicAddress address={clinic.address} latitude={clinic.latitude} longitude={clinic.longitude} />

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-[#0f172a] dark:text-white">Mapa</h2>
        <MarketplaceClinicMap
          latitude={clinic.latitude}
          longitude={clinic.longitude}
          displayName={clinic.displayName}
          address={addressText(clinic.address)}
        />
      </section>

      <ClinicBusinessHours hours={clinic.businessHours} />

      {(clinic.contactEmail || clinic.contactPhone) && (
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-[#0f172a] dark:text-white">Contato</h2>
          <div className="space-y-2 rounded-2xl border border-[#d7f3ea] bg-white p-4 text-sm text-[#475569] shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            {clinic.contactEmail && <p className="flex items-center gap-2"><Mail size={15} />{clinic.contactEmail}</p>}
            {clinic.contactPhone && <p className="flex items-center gap-2"><Phone size={15} />{clinic.contactPhone}</p>}
          </div>
        </section>
      )}
    </div>
  );
}
