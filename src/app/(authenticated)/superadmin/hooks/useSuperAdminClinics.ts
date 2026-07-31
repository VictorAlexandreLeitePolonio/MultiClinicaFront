"use client";

import { useQuery } from "@tanstack/react-query";
import { getSuperAdminClinics, GetSuperAdminClinicsParams } from "@/app/(authenticated)/superadmin/services/clinics.service";
import { queryKeys } from "@/lib/queryKeys";

export function useSuperAdminClinics(params: GetSuperAdminClinicsParams) {
  return useQuery({
    queryKey: queryKeys.superAdmin.clinics(params),
    queryFn: () => getSuperAdminClinics(params),
  });
}
