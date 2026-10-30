"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { decideHubApproval, fetchHubApprovals, planQueryKeys } from "@/lib/plans";

interface DecideHubApprovalInput {
  clinicaId: number;
  approved: boolean;
  reason?: string;
}

export function useHubApprovals() {
  return useQuery({
    queryKey: planQueryKeys.hubApprovals,
    queryFn: fetchHubApprovals,
  });
}

export function useDecideHubApproval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clinicaId, approved, reason }: DecideHubApprovalInput) =>
      reason
        ? decideHubApproval(clinicaId, approved, reason)
        : decideHubApproval(clinicaId, approved),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: planQueryKeys.hubApprovals });
    },
  });
}
