import api from "@/lib/api";
import { normalizePagedResult } from "@/lib/pagination";
import { CreateExpenseDto, Expense, FinancialBalance, PagedResult } from "@/types";

export interface GetExpensesParams {
  title?: string;
  month?: string;
  page: number;
  pageSize: number;
}

export type BalanceHistoryPeriod = 1 | 3 | 6 | 12;

export async function getMonthlyFinancialBalance(month: string): Promise<FinancialBalance> {
  const response = await api.get<FinancialBalance>(`/api/financial/balance/${month}`);

  return response.data;
}

export async function getFinancialBalanceHistory(
  months: BalanceHistoryPeriod
): Promise<FinancialBalance[]> {
  const response = await api.get<FinancialBalance[]>("/api/financial/balance/history", {
    params: { months },
  });

  return response.data;
}

export async function getExpenses(params: GetExpensesParams): Promise<PagedResult<Expense>> {
  const response = await api.get<PagedResult<Expense> | Expense[]>("/api/financial/expenses", {
    params,
  });

  return normalizePagedResult<Expense>(response.data, params.pageSize);
}

export async function getExpenseById(id: number): Promise<Expense> {
  const response = await api.get<Expense>(`/api/financial/expenses/${id}`);

  return response.data;
}

export async function createExpense(payload: CreateExpenseDto): Promise<Expense> {
  const response = await api.post<Expense>("/api/financial/expenses", payload);

  return response.data;
}

export async function updateExpense(id: number, payload: CreateExpenseDto): Promise<Expense> {
  const response = await api.put<Expense>(`/api/financial/expenses/${id}`, payload);

  return response.data;
}

export async function deleteExpense(id: number): Promise<void> {
  await api.delete(`/api/financial/expenses/${id}`);
}
