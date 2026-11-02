import api from "@/lib/api";
import type { ClinicTimeline } from "@/types/evolution";

export async function getClinicTimeline(before?: string | null): Promise<ClinicTimeline> {
  const response = await api.get<ClinicTimeline>("/api/patient-records/timeline", {
    params: { before: before ?? undefined, take: 30 },
  });
  return response.data;
}
