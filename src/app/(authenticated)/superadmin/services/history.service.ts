import api from "@/lib/api";
import { normalizePagedResult } from "@/lib/pagination";
import { PagedResult, SuperAdminCommercialHistoryItem } from "@/types";

export interface GetSuperAdminHistoryParams {
  page: number;
  pageSize: number;
}

export async function getSuperAdminCommercialHistory(
  clinicId: number,
  params: GetSuperAdminHistoryParams
): Promise<PagedResult<SuperAdminCommercialHistoryItem>> {
  const response = await api.get<PagedResult<SuperAdminCommercialHistoryItem>>(
    `/api/superadmin/clinicas/${clinicId}/history`,
    { params }
  );

  return normalizePagedResult<SuperAdminCommercialHistoryItem>(response.data, params.pageSize);
}
