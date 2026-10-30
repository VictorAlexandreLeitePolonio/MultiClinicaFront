"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  BillingCycle,
  ClinicPlan,
  PurchaseItem,
  cancelSubscription,
  changeSubscription,
  fetchBillingStatus,
  fetchPublicPlans,
  fetchUsage,
  planQueryKeys,
  purchase,
  startCheckout,
} from "@/lib/plans";

type PaidPlan = Exclude<ClinicPlan, "Free">;

interface PlanCycle {
  plan: PaidPlan;
  cycle: BillingCycle;
}

export function usePublicPlans() {
  return useQuery({ queryKey: planQueryKeys.publicPlans, queryFn: fetchPublicPlans });
}

export function useBillingStatus() {
  return useQuery({ queryKey: planQueryKeys.status, queryFn: fetchBillingStatus });
}

export function useUsage() {
  return useQuery({ queryKey: planQueryKeys.usage, queryFn: fetchUsage });
}

export function useCheckout() {
  return useMutation({
    mutationFn: ({ plan, cycle }: PlanCycle) => startCheckout(plan, cycle),
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
  });
}

export function useChangeSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ plan, cycle }: PlanCycle) => changeSubscription(plan, cycle),
    onSuccess: async () => {
      toast.success("A troca vale a partir do próximo ciclo.");
      await queryClient.invalidateQueries({ queryKey: planQueryKeys.status });
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelSubscription,
    onSuccess: async () => {
      toast.success("Assinatura cancelada. Sua clínica voltou para o Free.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: planQueryKeys.status }),
        queryClient.invalidateQueries({ queryKey: planQueryKeys.usage }),
      ]);
    },
  });
}

export function usePurchase() {
  return useMutation({
    mutationFn: (item: PurchaseItem) => purchase(item),
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
  });
}
