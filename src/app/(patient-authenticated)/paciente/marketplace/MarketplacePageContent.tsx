"use client";

import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";
import { MarketplaceClinicCard } from "./components/MarketplaceClinicCard";
import { MarketplaceFilters } from "./components/MarketplaceFilters";
import { ClinicDetailModal } from "@/components/clinic/ClinicDetailModal";
import { useMarketplaceCategories, useMarketplaceClinics } from "./hooks/useMarketplace";
import { MarketplaceClinicFilters } from "./types/marketplace.types";

export function MarketplacePageContent() {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filters, setFilters] = useState<MarketplaceClinicFilters>({
    sort: "MostLiked",
    page: 1,
    pageSize: 12,
  });

  const updateFilters = (patch: Partial<MarketplaceClinicFilters>) => {
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

  const categoriesQuery = useMarketplaceCategories();
  const clinicsQuery = useMarketplaceClinics(filters);
  const totalPages = Math.max(1, Math.ceil((clinicsQuery.data?.totalCount ?? 0) / (filters.pageSize ?? 12)));
  const hasFilters = Boolean(
    filters.search || filters.categoryIds?.length || filters.city || filters.state
      || filters.acceptsAppointmentRequests || filters.likedOnly,
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-[#0f172a] dark:text-white">Encontre uma clínica</h1>
        <p className="mt-1 text-sm text-[#64748b] dark:text-slate-400">
          Descubra clínicas e solicite atendimento pelo Cliniq.
        </p>
      </header>

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
      />

      {clinicsQuery.isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-72" />
          ))}
        </div>
      )}

      {clinicsQuery.isError && (
        <ErrorState
          message="Não foi possível carregar o Marketplace."
          onRetry={() => void clinicsQuery.refetch()}
        />
      )}

      {!clinicsQuery.isLoading && !clinicsQuery.isError && clinicsQuery.data?.data.length === 0 && (
        <EmptyState
          icon={Building2}
          title={hasFilters ? "Nenhuma clínica encontrada" : "Nenhuma clínica pública"}
          description={hasFilters
            ? "Ajuste os filtros para ampliar sua busca."
            : "Ainda não há clínicas disponíveis no Marketplace."}
        />
      )}

      {(clinicsQuery.data?.data.length ?? 0) > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {clinicsQuery.data!.data.map((clinic) => (
              <MarketplaceClinicCard key={clinic.id} clinic={clinic} onSelect={setSelectedId} />
            ))}
          </div>
          <Pagination
            page={filters.page ?? 1}
            totalPages={totalPages}
            pageSize={filters.pageSize ?? 12}
            pageSizeOptions={[12, 24, 48]}
            onPageChange={(page) => updateFilters({ page })}
            onPageSizeChange={(pageSize) => updateFilters({ pageSize, page: 1 })}
          />
        </>
      )}

      <ClinicDetailModal
        source={selectedId ? { mode: "marketplace", id: selectedId } : null}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
