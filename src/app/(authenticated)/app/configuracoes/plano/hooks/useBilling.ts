"use client";

import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

function invalidateBilling(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: planQueryKeys.status }),
    queryClient.invalidateQueries({ queryKey: planQueryKeys.usage }),
  ]);
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ plan, cycle }: PlanCycle) => startCheckout(plan, cycle),
    onSuccess: (result) => {
      void invalidateBilling(queryClient);
      if (result?.url) window.location.href = result.url;
    },
  });
}

export function useChangeSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ plan, cycle }: PlanCycle) => changeSubscription(plan, cycle),
    onSuccess: async () => {
      toast.success("A troca vale a partir do próximo ciclo.");
      await invalidateBilling(queryClient);
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelSubscription,
    onSuccess: async () => {
      toast.success("Assinatura cancelada. Sua clínica voltou para o Free.");
      await invalidateBilling(queryClient);
    },
  });
}

export function usePurchase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (item: PurchaseItem) => purchase(item),
    onSuccess: (result) => {
      void invalidateBilling(queryClient);
      if (result?.url) window.location.href = result.url;
    },
  });
}
