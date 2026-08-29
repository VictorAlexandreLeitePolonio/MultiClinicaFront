import publicApi from "@/lib/publicApi";
import { ClinicCategory } from "@/types";

export interface PublicClinicCard {
  id: number;
  slug: string | null;
  displayName: string | null;
  logoUrl: string | null;
  city: string | null;
  state: string | null;
  categories: ClinicCategory[];
  likeCount: number;
  acceptsAppointmentRequests: boolean;
}

export async function getPublicClinics(limit = 9): Promise<PublicClinicCard[]> {
  const response = await publicApi.get<PublicClinicCard[]>("/api/public/clinics", {
    params: { limit },
  });
  return response.data;
}
