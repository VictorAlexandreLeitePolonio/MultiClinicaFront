import publicApi from "@/lib/publicApi";
import type {
  MarketplaceCategory,
  MarketplaceClinicFilters,
  MarketplaceClinicPage,
} from "@/app/(patient-authenticated)/paciente/marketplace/types/marketplace.types";

// Hub público (sem login). Mesmo contrato do marketplace do paciente, sem "curtidas".
export type PublicHubFilters = Omit<MarketplaceClinicFilters, "likedOnly">;

export async function getPublicHubCategories(): Promise<MarketplaceCategory[]> {
  const response = await publicApi.get<MarketplaceCategory[]>("/api/public/clinics/categories");
  return response.data;
}

export async function getPublicHubClinics(filters: PublicHubFilters): Promise<MarketplaceClinicPage> {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  filters.categoryIds?.forEach((id) => params.append("categoryIds", String(id)));
  if (filters.city) params.set("city", filters.city);
  if (filters.state) params.set("state", filters.state);
  if (filters.acceptsAppointmentRequests !== undefined) {
    params.set("acceptsAppointmentRequests", String(filters.acceptsAppointmentRequests));
  }
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.page !== undefined) params.set("page", String(filters.page));
  if (filters.pageSize !== undefined) params.set("pageSize", String(filters.pageSize));
  const response = await publicApi.get<MarketplaceClinicPage>("/api/public/clinics/search", { params });
  return response.data;
}
