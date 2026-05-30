import { PagedResult } from "@/types";

/**
 * Normaliza a resposta da API para o formato PagedResult.
 * Suporta tanto o formato novo (PagedResult) quanto o formato antigo (array).
 */
export function normalizePagedResult<T>(
  responseData: any,
  defaultPageSize: number = 10
): PagedResult<T> {
  // Se já é um PagedResult (tem propriedade data que é array)
  if (
    responseData &&
    typeof responseData === "object" &&
    Array.isArray(responseData.data) &&
    "totalPages" in responseData
  ) {
    return responseData as PagedResult<T>;
  }

  // Se é um array (formato antigo da API)
  if (Array.isArray(responseData)) {
    const data = responseData as T[];
    return {
      data,
      page: 1,
      pageSize: defaultPageSize,
      totalCount: data.length,
      totalPages: 1, // Como é formato antigo, assume 1 página
    };
  }

  // Fallback para objeto vazio
  return {
    data: [],
    page: 1,
    pageSize: defaultPageSize,
    totalCount: 0,
    totalPages: 0,
  };
}
