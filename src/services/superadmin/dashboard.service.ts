import api from "@/lib/api";
import { SuperAdminDashboardMetrics } from "@/types";

export async function getSuperAdminDashboardMetrics(): Promise<SuperAdminDashboardMetrics> {
  const response = await api.get<SuperAdminDashboardMetrics>("/api/superadmin/dashboard");

  return response.data;
}
