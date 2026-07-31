"use client";
import { useQuery } from "@tanstack/react-query";
import { getAuditoria, type GetAuditoriaParams } from "../services/auditoria.service";
export function useAuditoria(params: GetAuditoriaParams) { return useQuery({ queryKey: ["auditoria-financeira", params], queryFn: () => getAuditoria(params) }); }
