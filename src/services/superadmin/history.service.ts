import api from "@/lib/api";
import { PagedResult, SuperAdminCommercialHistoryItem } from "@/types";

export interface GetSuperAdminHistoryParams {
  page: number;
  pageSize: number;
  search?: string;
}

export async function getSuperAdminCommercialHistory(
  params: GetSuperAdminHistoryParams
): Promise<PagedResult<SuperAdminCommercialHistoryItem>> {
  const response = await api.get<PagedResult<SuperAdminCommercialHistoryItem>>(
    "/api/superadmin/commercial-history",
    { params }
  );

  return response.data;
}
