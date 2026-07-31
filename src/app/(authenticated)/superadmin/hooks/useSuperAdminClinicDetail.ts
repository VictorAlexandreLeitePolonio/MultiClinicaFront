"use client";

import { useQuery } from "@tanstack/react-query";
import { getSuperAdminClinicDetail } from "@/app/(authenticated)/superadmin/services/clinics.service";
import { queryKeys } from "@/lib/queryKeys";

export function useSuperAdminClinicDetail(clinicId: number) {
  return useQuery({
    queryKey: queryKeys.superAdmin.clinicDetail(clinicId),
    queryFn: () => getSuperAdminClinicDetail(clinicId),
    enabled: Number.isFinite(clinicId) && clinicId > 0,
  });
}
