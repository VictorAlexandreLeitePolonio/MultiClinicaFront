"use client";

import { useQuery } from "@tanstack/react-query";
import { getSuperAdminClinicCharges, GetSuperAdminBillingParams } from "@/services/superadmin/billing.service";
import { queryKeys } from "@/services/queryKeys";

export function useSuperAdminBilling(clinicId: number, params: GetSuperAdminBillingParams) {
  return useQuery({
    queryKey: queryKeys.superAdmin.billing(clinicId, params),
    queryFn: () => getSuperAdminClinicCharges(clinicId, params),
    enabled: Number.isFinite(clinicId) && clinicId > 0,
  });
}
