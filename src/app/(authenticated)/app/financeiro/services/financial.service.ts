import api from "@/lib/api";
import { normalizePagedResult } from "@/lib/pagination";
import type { ClinicExpense, FinancialBalance, PagedResult } from "@/types";

export interface GetFinancialBalanceParams {
  startDate?: string;
  endDate?: string;
}

export async function getFinancialBalance(
  params?: GetFinancialBalanceParams,
): Promise<FinancialBalance> {
  const response = await api.get<FinancialBalance>("/api/financial/balance", {
    params,
  });

  return response.data;
}

export interface GetClinicExpensesParams {
  startDate?: string;
  endDate?: string;
  page: number;
  pageSize: number;
}

export interface CreateClinicExpenseRequest {
  title: string;
  amount: number;
  date: string;
  description?: string;
}

export type UpdateClinicExpenseRequest = CreateClinicExpenseRequest;

export async function getClinicExpenses(
  params: GetClinicExpensesParams,
): Promise<PagedResult<ClinicExpense>> {
  const response = await api.get<PagedResult<ClinicExpense> | ClinicExpense[]>(
    "/api/financial/expenses",
    { params },
  );

  return normalizePagedResult<ClinicExpense>(response.data, params.pageSize);
}

export async function createClinicExpense(
  payload: CreateClinicExpenseRequest,
): Promise<ClinicExpense> {
  const response = await api.post<ClinicExpense>("/api/financial/expenses", payload);

  return response.data;
}

export async function getClinicExpense(id: number): Promise<ClinicExpense> {
  const response = await api.get<ClinicExpense>(`/api/financial/expenses/${id}`);

  return response.data;
}

export async function updateClinicExpense(
  id: number,
  payload: UpdateClinicExpenseRequest,
): Promise<ClinicExpense> {
  const response = await api.put<ClinicExpense>(`/api/financial/expenses/${id}`, payload);

  return response.data;
}

export async function deleteClinicExpense(id: number): Promise<void> {
  await api.delete(`/api/financial/expenses/${id}`);
}
