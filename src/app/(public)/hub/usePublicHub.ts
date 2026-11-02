"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getPublicHubCategories,
  getPublicHubClinics,
  type PublicHubFilters,
} from "@/components/clinic/public-hub.service";

export function usePublicHubCategories() {
  return useQuery({
    queryKey: ["public-hub", "categories"],
    queryFn: getPublicHubCategories,
  });
}

export function usePublicHubClinics(filters: PublicHubFilters) {
  return useQuery({
    queryKey: ["public-hub", "clinics", filters],
    queryFn: () => getPublicHubClinics(filters),
  });
}
