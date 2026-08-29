import publicApi from "@/lib/publicApi";
import { PublicClinic } from "@/types";

export async function getPublicClinic(slug: string): Promise<PublicClinic> {
  const response = await publicApi.get<PublicClinic>(`/api/public/clinics/${slug}`);
  return response.data;
}
