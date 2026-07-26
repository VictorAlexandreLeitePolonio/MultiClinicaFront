"use client";

import { useQuery } from "@tanstack/react-query";
import { getSuperAdminDashboardMetrics } from "@/app/(authenticated)/superadmin/services/dashboard.service";
import { queryKeys } from "@/lib/queryKeys";

export function useSuperAdminDashboard() {
  return useQuery({
    queryKey: queryKeys.superAdmin.dashboard,
    queryFn: getSuperAdminDashboardMetrics,
  });
}
