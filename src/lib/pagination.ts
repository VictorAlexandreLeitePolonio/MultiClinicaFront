import { PagedResult } from "@/types";

interface PagedResponseShape<T> {
  data: T[];
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages: number;
}

/**
 * Normaliza a resposta da API para o formato PagedResult.
 * Suporta tanto o formato novo (PagedResult) quanto o formato antigo (array).
 */
export function normalizePagedResult<T>(
  responseData: unknown,
  defaultPageSize: number = 10
): PagedResult<T> {
  // Se já é um PagedResult (tem propriedade data que é array)
  if (
    responseData &&
    typeof responseData === "object" &&
    "data" in responseData &&
    Array.isArray(responseData.data) &&
    "totalPages" in responseData
  ) {
    const pagedData = responseData as PagedResponseShape<T>;

    return {
      data: pagedData.data,
      page: pagedData.page ?? 1,
      pageSize: pagedData.pageSize ?? defaultPageSize,
      totalCount: pagedData.totalCount ?? pagedData.data.length,
      totalPages: pagedData.totalPages,
    };
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
