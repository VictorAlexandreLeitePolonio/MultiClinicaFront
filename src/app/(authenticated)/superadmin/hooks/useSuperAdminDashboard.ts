"use client";

import { useQuery } from "@tanstack/react-query";
import { getSuperAdminDashboardMetrics } from "@/services/superadmin/dashboard.service";
import { queryKeys } from "@/services/queryKeys";

export function useSuperAdminDashboard() {
  return useQuery({
    queryKey: queryKeys.superAdmin.dashboard,
    queryFn: getSuperAdminDashboardMetrics,
  });
}
