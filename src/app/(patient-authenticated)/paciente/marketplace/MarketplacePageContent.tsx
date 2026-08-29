"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Building2 } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";
import { useDebounce } from "@/app/hooks/useDebounce";
import { MarketplaceClinicCard } from "./components/MarketplaceClinicCard";
import { MarketplaceFilters } from "./components/MarketplaceFilters";
import { ClinicDetailModal } from "@/components/clinic/ClinicDetailModal";
import { useMarketplaceCategories, useMarketplaceClinics } from "./hooks/useMarketplace";
import { MarketplaceClinicFilters } from "./types/marketplace.types";

function numberParam(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function MarketplacePageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") ?? "";
  const [search, setSearch] = useState(urlSearch);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const debouncedSearch = useDebounce(search, 400);

  const filters = useMemo<MarketplaceClinicFilters>(() => ({
    search: urlSearch || undefined,
    categoryIds: searchParams.getAll("categoryIds").map(Number).filter(Number.isInteger),
    city: searchParams.get("city") || undefined,
    state: searchParams.get("state") || undefined,
    acceptsAppointmentRequests: searchParams.get("acceptsAppointmentRequests") === "true" || undefined,
    likedOnly: searchParams.get("likedOnly") === "true" || undefined,
    sort: (searchParams.get("sort") as MarketplaceClinicFilters["sort"]) ?? "MostLiked",
    page: numberParam(searchParams.get("page"), 1),
    pageSize: numberParam(searchParams.get("pageSize"), 12),
  }), [searchParams, urlSearch]);

  const replaceFilters = (patch: Partial<MarketplaceClinicFilters>) => {
    const params = new URLSearchParams(searchParams.toString());
    const next = { ...filters, ...patch, page: patch.page ?? ("page" in patch ? patch.page : 1) };
    params.delete("categoryIds");
    Object.entries(next).forEach(([key, value]) => {
      if (key === "categoryIds") {
        (value as number[] | undefined)?.forEach((id) => params.append(key, String(id)));
      } else if (value === undefined || value === "" || value === false) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    if (debouncedSearch !== urlSearch) replaceFilters({ search: debouncedSearch || undefined });
    // replaceFilters is intentionally derived from the current URL snapshot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, urlSearch]);

  useEffect(() => setSearch(urlSearch), [urlSearch]);

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
          Descubra clínicas e solicite atendimento pelo MultiClínica.
        </p>
      </header>

      <MarketplaceFilters
        filters={filters}
        search={search}
        categories={categoriesQuery.data ?? []}
        onSearchChange={setSearch}
        onChange={replaceFilters}
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
            onPageChange={(page) => replaceFilters({ page })}
            onPageSizeChange={(pageSize) => replaceFilters({ pageSize, page: 1 })}
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
