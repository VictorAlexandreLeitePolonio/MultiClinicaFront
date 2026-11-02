import publicApi from "@/lib/publicApi";
import type { PublicPlansResponse } from "@/types/plans";

export async function fetchPublicPlans(): Promise<PublicPlansResponse> {
  const response = await publicApi.get<PublicPlansResponse>("/api/public/plans");
  return response.data;
}
