"use client";

import { useQuery } from "@tanstack/react-query";
import { getAuditoria, type GetAuditoriaParams } from "../services/auditoria.service";

export const auditoriaQueryKey = ["financeiro", "auditoria"] as const;

export function useAuditoria(params: GetAuditoriaParams) {
  return useQuery({ queryKey: [...auditoriaQueryKey, params], queryFn: () => getAuditoria(params) });
}
