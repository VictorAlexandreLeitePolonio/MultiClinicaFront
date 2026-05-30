"use client";

import { useQuery } from "@tanstack/react-query";
import { getSuperAdminCommercialHistory, GetSuperAdminHistoryParams } from "@/services/superadmin/history.service";
import { queryKeys } from "@/services/queryKeys";

export function useSuperAdminHistory(params: GetSuperAdminHistoryParams) {
  return useQuery({
    queryKey: queryKeys.superAdmin.history(params),
    queryFn: () => getSuperAdminCommercialHistory(params),
  });
}
