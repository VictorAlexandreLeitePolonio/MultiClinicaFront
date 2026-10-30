"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setClinicPlan, type ClinicPlan } from "@/lib/plans";
import { queryKeys } from "@/lib/queryKeys";

interface SetClinicPlanInput {
  plan: ClinicPlan;
  isFounder: boolean;
}

export function useSetClinicPlan(clinicId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ plan, isFounder }: SetClinicPlanInput) =>
      setClinicPlan(clinicId, plan, isFounder),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.superAdmin.clinicDetail(clinicId),
      });
    },
  });
}
