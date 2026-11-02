import api from "@/lib/api";
import type { HubApprovalItem } from "@/types/plans";

export async function fetchHubApprovals(): Promise<HubApprovalItem[]> {
  const response = await api.get<HubApprovalItem[]>("/api/superadmin/hub-approvals");
  return response.data;
}

export async function decideHubApproval(
  clinicaId: number,
  approved: boolean,
  reason?: string,
): Promise<void> {
  await api.post(`/api/superadmin/clinicas/${clinicaId}/hub-approval`, { approved, reason });
}
