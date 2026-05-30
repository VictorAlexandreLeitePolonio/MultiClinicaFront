"use client";

import { useQuery } from "@tanstack/react-query";
import { getSuperAdminBillingCharges, GetSuperAdminBillingParams } from "@/services/superadmin/billing.service";
import { queryKeys } from "@/services/queryKeys";

export function useSuperAdminBilling(params: GetSuperAdminBillingParams) {
  return useQuery({
    queryKey: queryKeys.superAdmin.billing(params),
    queryFn: () => getSuperAdminBillingCharges(params),
  });
}
