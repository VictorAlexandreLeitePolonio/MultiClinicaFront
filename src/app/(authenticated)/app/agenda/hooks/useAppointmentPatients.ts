"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/app/hooks/useDebounce";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "@/lib/queryKeys";
import { getPatients } from "@/app/(authenticated)/app/pacientes/services/patients.service";

export function useAppointmentPatients() {
  const { tenant } = useAuth();
  const [search, setSearch] = useState("");
  const name = useDebounce(search, 500).trim();
  const [pagination, setPagination] = useState({ name, page: 1 });
  const page = pagination.name === name ? pagination.page : 1;
  if (pagination.name !== name) setPagination({ name, page: 1 });
  const params = { name: name || undefined, isActive: true, page, pageSize: 10 };
  const query = useQuery({
    queryKey: queryKeys.patients.list({ ...params, tenantId: tenant?.id }),
    queryFn: () => getPatients(params),
  });

  return { query, search, setSearch, page, setPage: (next: number) => setPagination({ name, page: next }) };
}
