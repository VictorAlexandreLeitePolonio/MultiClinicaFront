"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getSuperAdminClinicUsers,
  GetSuperAdminClinicChildrenParams,
} from "@/services/superadmin/clinics.service";
import { queryKeys } from "@/services/queryKeys";

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
