import api from "@/lib/api";
import { normalizePagedResult } from "@/lib/pagination";
import type { AuditoriaRegistro, PagedResult } from "@/types";

export interface GetAuditoriaParams {
  modulo?: string;
  entidade?: string;
  dataInicio?: string;
  dataFim?: string;
  page: number;
  pageSize: number;
}

export async function getAuditoria(params: GetAuditoriaParams): Promise<PagedResult<AuditoriaRegistro>> {
  const response = await api.get<PagedResult<AuditoriaRegistro> | AuditoriaRegistro[]>("/api/financeiro/auditoria", { params });
  return normalizePagedResult<AuditoriaRegistro>(response.data, params.pageSize);
}
