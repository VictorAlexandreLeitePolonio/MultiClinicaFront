import patientApi from "@/lib/patientApi";
import {
  MarketplaceCategory,
  MarketplaceClinicDetails,
  MarketplaceClinicFilters,
  MarketplaceClinicPage,
} from "../types/marketplace.types";

export async function getMarketplaceCategories(): Promise<MarketplaceCategory[]> {
  const response = await patientApi.get<MarketplaceCategory[]>(
    "/api/patient/marketplace/categories",
  );
  return response.data;
}

export async function getMarketplaceClinics(
  filters: MarketplaceClinicFilters,
): Promise<MarketplaceClinicPage> {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  filters.categoryIds?.forEach((categoryId) => params.append("categoryIds", String(categoryId)));
  if (filters.city) params.set("city", filters.city);
  if (filters.state) params.set("state", filters.state);
  if (filters.acceptsAppointmentRequests !== undefined) {
    params.set("acceptsAppointmentRequests", String(filters.acceptsAppointmentRequests));
  }
  if (filters.likedOnly !== undefined) params.set("likedOnly", String(filters.likedOnly));
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.page !== undefined) params.set("page", String(filters.page));
  if (filters.pageSize !== undefined) params.set("pageSize", String(filters.pageSize));

  const response = await patientApi.get<MarketplaceClinicPage>(
    "/api/patient/marketplace/clinics",
    { params },
  );
  return response.data;
}

export async function getMarketplaceClinic(clinicId: number): Promise<MarketplaceClinicDetails> {
  const response = await patientApi.get<MarketplaceClinicDetails>(
    `/api/patient/marketplace/clinics/${clinicId}`,
  );
  return response.data;
}
