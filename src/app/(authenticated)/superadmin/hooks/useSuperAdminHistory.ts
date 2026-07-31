"use client";

import { useQuery } from "@tanstack/react-query";
import { getSuperAdminCommercialHistory, GetSuperAdminHistoryParams } from "@/app/(authenticated)/superadmin/services/history.service";
import { queryKeys } from "@/lib/queryKeys";

export function useSuperAdminHistory(clinicId: number, params: GetSuperAdminHistoryParams) {
  return useQuery({
    queryKey: queryKeys.superAdmin.history(clinicId, params),
    queryFn: () => getSuperAdminCommercialHistory(clinicId, params),
    enabled: Number.isFinite(clinicId) && clinicId > 0,
  });
}
