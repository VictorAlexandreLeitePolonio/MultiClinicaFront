"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getSuperAdminClinicUsers,
  GetSuperAdminClinicChildrenParams,
} from "@/app/(authenticated)/superadmin/services/clinics.service";
import { queryKeys } from "@/lib/queryKeys";

export function useSuperAdminClinicUsers(
  clinicId: number,
  params: GetSuperAdminClinicChildrenParams,
) {
  return useQuery({
    queryKey: queryKeys.superAdmin.clinicUsers(clinicId, params),
    queryFn: () => getSuperAdminClinicUsers(clinicId, params),
    enabled: Number.isFinite(clinicId) && clinicId > 0,
  });
}
