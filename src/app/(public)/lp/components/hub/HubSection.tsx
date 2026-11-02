"use client";

import Link from "next/link";
import { useState, useSyncExternalStore, type CSSProperties } from "react";
import { useReducedMotion } from "motion/react";
import { ArrowUpRight, Building2, Check } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { Marquee } from "@/components/magicui/marquee";
import { usePublicClinics } from "@/components/clinic/usePublicClinics";
import {
  ClinicDetailModal,
  type ClinicDetailSource,
} from "@/components/clinic/ClinicDetailModal";
import type { PublicClinicCard } from "@/components/clinic/public-clinics.service";
import type { HubBadge } from "@/types/plans";
import { cn } from "@/lib/utils";

const subscribeToHydration = () => () => {};

const highlights = [
  "Perfil público com especialidades e endereço",
  "Pacientes pedem horário pelo portal",
  "Planos Pro e Premium aparecem primeiro",
];

const badgeStyles: Record<
  Exclude<HubBadge, null>,
  { label: string; className: string }
> = {
  Featured: {
    label: "Destaque",
    className:
      "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200",
  },
  Founder: {
    label: "Fundadora",
    className:
      "border-teal-200 bg-teal-50 text-teal-900 dark:border-teal-900/60 dark:bg-teal-950/40 dark:text-teal-200",
  },
};

function clinicLocation(clinic: PublicClinicCard) {
  return [clinic.city, clinic.state].filter(Boolean).join(" · ");
}

function ClinicCard({
  clinic,
  onSelect,
}: {
  clinic: PublicClinicCard;
  onSelect: (clinic: PublicClinicCard) => void;
}) {
  const badge = clinic.badge ? badgeStyles[clinic.badge] : null;
  const location = clinicLocation(clinic);

  return (
    <button
      type="button"
      disabled={!clinic.slug}
      onClick={() => onSelect(clinic)}
      className="group flex w-[16rem] shrink-0 items-center gap-3 rounded-xl border border-[var(--lp-line)] bg-[var(--lp-surface)] px-3.5 py-3 text-left transition-transform duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--lp-bg)] active:scale-[0.97] disabled:cursor-default disabled:opacity-70 motion-reduce:transition-none motion-reduce:active:scale-100"
    >
      {clinic.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={clinic.logoUrl}
          alt=""
          className="h-9 w-9 shrink-0 rounded-lg border border-[var(--lp-line)] bg-white object-contain p-0.5"
        />
      ) : (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-muted)] text-[var(--color-primary)]">
          <Building2 size={16} aria-hidden="true" />
        </span>
      )}

      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-1.5">
          <span className="truncate text-sm font-semibold text-[var(--lp-ink)] group-hover:text-[var(--color-primary)]">
            {clinic.displayName ?? "Clínica"}
          </span>
          {badge && (
            <span
              className={cn(
                "rounded-full border px-1.5 py-0.5 text-[10px] font-semibold leading-none",
                badge.className,
              )}
            >
              {badge.label}
            </span>
          )}
        </span>
        {location && (
          <span className="mt-1 block truncate font-mono text-[11px] text-[var(--lp-muted)]">
            {location}
          </span>
        )}
      </span>
    </button>
  );
}

function HubClinics({
  clinics,
  isLoading,
  isError,
  reducedMotion,
  onSelect,
}: {
  clinics: PublicClinicCard[];
  isLoading: boolean;
  isError: boolean;
  reducedMotion: boolean;
  onSelect: (clinic: PublicClinicCard) => void;
}) {
  if (isLoading) {
    return (
      <div role="status" aria-label="Carregando clínicas" className="lp-hub-skeleton space-y-3">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-[4.25rem] rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-[var(--lp-muted)]">
        Não foi possível carregar as clínicas agora. Tente novamente em instantes.
      </p>
    );
  }

  if (clinics.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-[var(--lp-line)] px-5 py-8 text-sm text-[var(--lp-muted)]">
        As primeiras clínicas estão chegando.
      </p>
    );
  }

  if (reducedMotion) {
    return (
      <div className="flex gap-3 overflow-x-auto p-1 [scrollbar-width:thin]">
        {clinics.map((clinic) => (
          <ClinicCard key={clinic.id} clinic={clinic} onSelect={onSelect} />
        ))}
      </div>
    );
  }

  const midpoint = Math.ceil(clinics.length / 2);
  const rows = [clinics.slice(0, midpoint), clinics.slice(midpoint)].filter(
    (row) => row.length > 0,
  );

  return (
    <div className="space-y-3">
      {rows.map((row, rowIndex) => (
        <Marquee
          key={rowIndex}
          reverse={rowIndex % 2 === 1}
          pauseOnHover
          repeat={row.length >= 4 ? 2 : 4}
          className="lp-hub-marquee p-0"
          style={
            {
              "--duration": "38s",
              "--gap": "0.75rem",
            } as CSSProperties
          }
        >
          {row.map((clinic) => (
            <ClinicCard key={clinic.id} clinic={clinic} onSelect={onSelect} />
          ))}
        </Marquee>
      ))}
    </div>
  );
}

export function HubSection() {
  const { data, isLoading, isError } = usePublicClinics(12);
  const prefersReducedMotion = useReducedMotion() ?? false;
  const mounted = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
  const [selected, setSelected] = useState<ClinicDetailSource | null>(null);
  const clinics = data ?? [];

  // Mantém o primeiro render igual ao do servidor; a preferência é aplicada após a hidratação.
  const reducedMotion = mounted && prefersReducedMotion;

  function handleSelect(clinic: PublicClinicCard) {
    if (!clinic.slug) return;
    setSelected({ mode: "public", slug: clinic.slug });
  }

  return (
    <section
      id="hub"
      aria-labelledby="hub-title"
      className="border-y border-[var(--lp-line)] bg-[var(--lp-bg)] py-24 sm:py-28"
    >
      <div className="mx-auto grid max-w-[88rem] gap-12 px-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center lg:gap-16 lg:px-8">
        <div>
          <h2
            id="hub-title"
            className="font-wide text-balance text-[clamp(2rem,4vw,3.25rem)] leading-[1.05] tracking-[-0.03em] text-[var(--lp-ink)]"
          >
            Sua clínica no Hub: pacientes encontram você.
          </h2>

          <p className="mt-5 max-w-[46ch] text-base leading-7 text-[var(--lp-muted)]">
            Um perfil público com o que o paciente precisa saber antes de marcar:
            especialidades, endereço e um caminho direto para pedir horário.
          </p>

          <ul className="mt-7 space-y-3">
            {highlights.map((highlight) => (
              <li
                key={highlight}
                className="flex items-start gap-3 text-sm leading-6 text-[var(--lp-ink)]"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[var(--lp-line)] text-[var(--color-primary)]">
                  <Check size={12} aria-hidden="true" />
                </span>
                {highlight}
              </li>
            ))}
          </ul>

          <Link
            href="/cadastro"
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-[var(--lp-line)] px-5 py-2.5 text-sm font-semibold text-[var(--lp-ink)] transition-transform duration-150 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--lp-bg)] active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
          >
            Colocar minha clínica no Hub
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>

        <div className="min-w-0">
          <HubClinics
            clinics={clinics}
            isLoading={isLoading}
            isError={isError}
            reducedMotion={reducedMotion}
            onSelect={handleSelect}
          />
        </div>
      </div>

      <ClinicDetailModal source={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
