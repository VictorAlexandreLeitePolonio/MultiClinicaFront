import api from "@/lib/api";
import type {
  BillingCycle,
  BillingStatus,
  ClinicPlan,
  PurchaseItem,
  UsageResponse,
} from "@/types/plans";

export async function fetchBillingStatus(): Promise<BillingStatus> {
  const response = await api.get<BillingStatus>("/api/billing/me");
  return response.data;
}

export async function fetchUsage(): Promise<UsageResponse> {
  const response = await api.get<UsageResponse>("/api/billing/usage");
  return response.data;
}

export async function startCheckout(
  plan: Exclude<ClinicPlan, "Free">,
  cycle: BillingCycle,
): Promise<{ url: string }> {
  const response = await api.post<{ url: string }>("/api/billing/subscription/checkout", {
    plan,
    cycle,
  });
  return response.data;
}

export async function changeSubscription(
  plan: Exclude<ClinicPlan, "Free">,
  cycle: BillingCycle,
): Promise<void> {
  await api.post("/api/billing/subscription/change", { plan, cycle });
}

export async function cancelSubscription(): Promise<void> {
  await api.post("/api/billing/subscription/cancel");
}

export async function purchase(item: PurchaseItem): Promise<{ url: string }> {
  const response = await api.post<{ url: string }>("/api/billing/purchase", { item });
  return response.data;
}
