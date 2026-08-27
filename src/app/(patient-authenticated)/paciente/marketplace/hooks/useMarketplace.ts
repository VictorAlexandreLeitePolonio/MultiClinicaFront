"use client";

import { useQuery } from "@tanstack/react-query";
import { marketplaceKeys } from "@/lib/queryKeys";
import {
  getMarketplaceCategories,
  getMarketplaceClinic,
  getMarketplaceClinics,
} from "../services/marketplace.service";
import { MarketplaceClinicFilters } from "../types/marketplace.types";

export function normalizeMarketplaceFilters(
  filters: MarketplaceClinicFilters,
): MarketplaceClinicFilters {
  return {
    search: filters.search?.trim() || undefined,
    categoryIds: [...(filters.categoryIds ?? [])].sort((a, b) => a - b),
    city: filters.city?.trim() || undefined,
    state: filters.state?.trim().toUpperCase() || undefined,
    acceptsAppointmentRequests: filters.acceptsAppointmentRequests || undefined,
    likedOnly: filters.likedOnly || undefined,
    sort: filters.sort ?? "MostLiked",
    page: filters.page ?? 1,
    pageSize: filters.pageSize ?? 12,
  };
}

export function useMarketplaceCategories() {
  return useQuery({
    queryKey: marketplaceKeys.categories,
    queryFn: getMarketplaceCategories,
  });
}

export function useMarketplaceClinics(filters: MarketplaceClinicFilters) {
  const normalized = normalizeMarketplaceFilters(filters);
  return useQuery({
    queryKey: marketplaceKeys.clinics(normalized),
    queryFn: () => getMarketplaceClinics(normalized),
  });
}

export function useMarketplaceClinic(clinicId: number) {
  return useQuery({
    queryKey: marketplaceKeys.detail(clinicId),
    queryFn: () => getMarketplaceClinic(clinicId),
    enabled: clinicId > 0,
  });
}
