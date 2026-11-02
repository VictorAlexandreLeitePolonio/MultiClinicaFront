"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Building2 } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";
import { ClinicDetailModal } from "@/components/clinic/ClinicDetailModal";
import type { PublicHubFilters } from "@/components/clinic/public-hub.service";
import { ease } from "@/lib/motion";
import { MarketplaceClinicCard } from "@/app/(patient-authenticated)/paciente/marketplace/components/MarketplaceClinicCard";
import { MarketplaceFilters } from "@/app/(patient-authenticated)/paciente/marketplace/components/MarketplaceFilters";
import { usePublicHubCategories, usePublicHubClinics } from "./usePublicHub";

const PAGE_SIZE = 12;
const initiallyLoadedFilters: PublicHubFilters = {
  sort: "MostLiked",
  page: 1,
  pageSize: PAGE_SIZE,
};

export function HubPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedSlug = searchParams.get("clinica");

  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [filters, setFilters] = useState<PublicHubFilters>(initiallyLoadedFilters);

  const prefersReducedMotion = useReducedMotion() ?? false;
  const animateCards = !prefersReducedMotion;

  const updateFilters = (patch: Partial<PublicHubFilters>) => {
    setFilters((current) => ({ ...current, ...patch, page: patch.page ?? 1 }));
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilters((current) => {
        if ((current.search ?? "") === search && (current.city ?? "") === city && (current.state ?? "") === state) {
          return current;
        }
        return { ...current, search: search || undefined, city: city || undefined, state: state || undefined, page: 1 };
      });
    }, 500);
    return () => clearTimeout(timeout);
  }, [search, city, state]);

  const categoriesQuery = usePublicHubCategories();
  const clinicsQuery = usePublicHubClinics(filters);

  const clinics = clinicsQuery.data?.data ?? [];
  const totalPages = Math.max(1, Math.ceil((clinicsQuery.data?.totalCount ?? 0) / (filters.pageSize ?? PAGE_SIZE)));
  const hasFilters = Boolean(
    filters.search || filters.categoryIds?.length || filters.city || filters.state || filters.acceptsAppointmentRequests,
  );

  function clearFilters() {
    setSearch("");
    setCity("");
    setState("");
    setFilters({ sort: "MostLiked", page: 1, pageSize: filters.pageSize ?? PAGE_SIZE });
  }

  function updateSlugParam(slug: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) params.set("clinica", slug);
    else params.delete("clinica");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function handleSelect(clinicId: number) {
    const clinic = clinics.find((item) => item.id === clinicId);
    if (!clinic?.slug) return;
    updateSlugParam(clinic.slug);
  }

  return (
    <section className="mx-auto w-full max-w-[88rem] px-6 pb-20 pt-28 lg:px-8 lg:pt-32">
      <header className="max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--color-primary)]">
          Hub de clínicas
        </p>
        <h1 className="font-wide mt-3 text-balance text-[clamp(2.25rem,5vw,4rem)] leading-[1.02] tracking-[-0.035em] text-[var(--lp-ink)]">
          Encontre sua clínica
        </h1>
        <p className="mt-4 max-w-[52ch] text-base leading-7 text-[var(--lp-muted)]">
          Veja especialidades, endereço e horários. Para pedir uma consulta, é só entrar com sua conta de paciente.
        </p>
      </header>

      <div className="mt-10">
        <MarketplaceFilters
          filters={filters}
          search={search}
          city={city}
          state={state}
          onCityChange={setCity}
          onStateChange={setState}
          categories={categoriesQuery.data ?? []}
          onSearchChange={setSearch}
          onChange={updateFilters}
          showLikedOnly={false}
        />
      </div>

      <div className="mt-8 space-y-6">
        {clinicsQuery.isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="h-72" />
            ))}
          </div>
        )}

        {clinicsQuery.isError && (
          <ErrorState
            message="Não foi possível carregar as clínicas do Hub."
            onRetry={() => void clinicsQuery.refetch()}
          />
        )}

        {!clinicsQuery.isLoading && !clinicsQuery.isError && clinics.length === 0 && (
          <div className="space-y-4">
            <EmptyState
              icon={Building2}
              title="Nenhuma clínica encontrada"
              description={hasFilters
                ? "Ajuste os filtros para ampliar sua busca."
                : "Ainda não há clínicas disponíveis no Hub."}
            />
            {hasFilters && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[#14b8a6] bg-white px-5 py-2.5 text-sm font-semibold text-[#0f766e] transition-[background-color,transform] duration-150 hover:bg-[#ecfdf5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#99f6e4] focus-visible:ring-offset-2 active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
                >
                  Limpar filtros
                </button>
              </div>
            )}
          </div>
        )}

        {clinics.length > 0 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {clinics.map((clinic, index) => (
                <motion.div
                  key={clinic.id}
                  initial={animateCards ? { opacity: 0.6, y: 6 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: ease.out, delay: index * 0.04 }}
                >
                  <MarketplaceClinicCard clinic={clinic} onSelect={handleSelect} likeable={false} />
                </motion.div>
              ))}
            </div>
            <Pagination
              page={filters.page ?? 1}
              totalPages={totalPages}
              pageSize={filters.pageSize ?? PAGE_SIZE}
              pageSizeOptions={[12, 24, 48]}
              onPageChange={(page) => updateFilters({ page })}
              onPageSizeChange={(pageSize) => updateFilters({ pageSize, page: 1 })}
            />
          </>
        )}
      </div>

      <ClinicDetailModal
        source={selectedSlug ? { mode: "public", slug: selectedSlug } : null}
        onClose={() => updateSlugParam(null)}
      />
    </section>
  );
}
