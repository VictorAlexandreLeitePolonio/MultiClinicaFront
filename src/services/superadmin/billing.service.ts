import api from "@/lib/api";
import { PagedResult, SuperAdminBillingCharge } from "@/types";

export interface GetSuperAdminBillingParams {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
}

export async function getSuperAdminBillingCharges(
  params: GetSuperAdminBillingParams
): Promise<PagedResult<SuperAdminBillingCharge>> {
  const response = await api.get<PagedResult<SuperAdminBillingCharge>>(
    "/api/superadmin/billing/charges",
    { params }
  );

  return response.data;
}
