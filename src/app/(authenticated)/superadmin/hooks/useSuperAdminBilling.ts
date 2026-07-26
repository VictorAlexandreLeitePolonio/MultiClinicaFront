"use client";

import { useQuery } from "@tanstack/react-query";
import { getSuperAdminClinicCharges, GetSuperAdminBillingParams } from "@/app/(authenticated)/superadmin/services/billing.service";
import { queryKeys } from "@/lib/queryKeys";

export function useSuperAdminBilling(clinicId: number, params: GetSuperAdminBillingParams) {
  return useQuery({
    queryKey: queryKeys.superAdmin.billing(clinicId, params),
    queryFn: () => getSuperAdminClinicCharges(clinicId, params),
    enabled: Number.isFinite(clinicId) && clinicId > 0,
  });
}
