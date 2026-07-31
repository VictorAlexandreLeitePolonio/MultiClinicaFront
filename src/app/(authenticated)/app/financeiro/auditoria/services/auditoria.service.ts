import api from "@/lib/api";
import { normalizePagedResult } from "@/lib/pagination";
import type { PagedResult } from "@/types";

export interface AuditoriaFinanceira { id: number; usuarioId: number; modulo: string; acao: string; entidade: string; entidadeId: number; dadosAntes: string | null; dadosDepois: string | null; motivo: string | null; dataAcao: string; ip: string | null; userAgent: string | null; }
export interface GetAuditoriaParams { modulo?: string; entidade?: string; usuarioId?: number; de?: string; ate?: string; page: number; pageSize: number; }
export async function getAuditoria(params: GetAuditoriaParams): Promise<PagedResult<AuditoriaFinanceira>> { const response = await api.get<PagedResult<AuditoriaFinanceira> | AuditoriaFinanceira[]>("/api/auditoria-financeira", { params }); return normalizePagedResult<AuditoriaFinanceira>(response.data, params.pageSize); }
