"use client";

import { useQuery } from "@tanstack/react-query";
import { getEvolutionDashboardSummary } from "@/app/(authenticated)/app/modelos-evolucao/services/evolution.service";
import { queryKeys } from "@/lib/queryKeys";

export function useEvolutionSummary() {
  return useQuery({
    queryKey: queryKeys.evolution.dashboardSummary,
    queryFn: getEvolutionDashboardSummary,
  });
}
