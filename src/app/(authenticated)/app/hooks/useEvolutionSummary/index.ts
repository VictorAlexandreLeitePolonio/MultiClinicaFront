"use client";

import { useQuery } from "@tanstack/react-query";
import { getEvolutionDashboardSummary } from "@/services/evolution/evolution.service";
import { queryKeys } from "@/services/queryKeys";

export function useEvolutionSummary() {
  return useQuery({
    queryKey: queryKeys.evolution.dashboardSummary,
    queryFn: getEvolutionDashboardSummary,
  });
}
