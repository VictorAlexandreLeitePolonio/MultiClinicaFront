"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { decideHubApproval, fetchHubApprovals } from "../services/hub-approvals.service";

interface DecideHubApprovalInput {
  clinicaId: number;
  approved: boolean;
  reason?: string;
}

export function useHubApprovals() {
  return useQuery({
    queryKey: queryKeys.superAdmin.hubApprovals,
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
      void queryClient.invalidateQueries({ queryKey: queryKeys.superAdmin.hubApprovals });
    },
  });
}
