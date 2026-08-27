import { BusinessHour, ClinicAddress } from "@/types";

export interface MarketplaceCategory {
  id: number;
  name: string;
  slug: string;
}

export type MarketplaceClinicSort = "MostLiked" | "NameAsc" | "NameDesc";

export interface MarketplaceClinicFilters {
  search?: string;
  categoryIds?: number[];
  city?: string;
  state?: string;
  acceptsAppointmentRequests?: boolean;
  likedOnly?: boolean;
  sort?: MarketplaceClinicSort;
  page?: number;
  pageSize?: number;
}

export interface MarketplaceClinicCard {
  id: number;
  slug: string | null;
  displayName: string;
  logoUrl: string | null;
  coverUrl: string | null;
  categories: MarketplaceCategory[];
  city: string | null;
  state: string | null;
  likeCount: number;
  likedByMe: boolean;
  acceptsAppointmentRequests: boolean;
}

export interface MarketplaceClinicPage {
  data: MarketplaceClinicCard[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface MarketplaceClinicDetails {
  id: number;
  slug: string | null;
  displayName: string;
  description: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  gallery: string[];
  categories: MarketplaceCategory[];
  address: ClinicAddress;
  latitude: number | null;
  longitude: number | null;
  businessHours: BusinessHour[];
  contactEmail: string | null;
  contactPhone: string | null;
  likeCount: number;
  likedByMe: boolean;
  acceptsAppointmentRequests: boolean;
  isLinked: boolean;
}
