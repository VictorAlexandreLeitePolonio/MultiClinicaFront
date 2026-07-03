"use client";

import { FinancialBalance } from "@/types";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/utils/formatters";
import { TrendingUp, TrendingDown, Scale } from "lucide-react";

interface BalanceSummaryCardsProps {
  balance: FinancialBalance | null;
  loading: boolean;
}

export function BalanceSummaryCards({ balance, loading }: BalanceSummaryCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-32" />
        </div>
      </div>
    );
  }

  if (!balance) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
          <p className="text-sm text-gray-600 dark:text-slate-300">
            Entradas
          </p>
          <p className="text-2xl font-bold text-primary-dark">
            {formatCurrency(0)}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
          <p className="text-sm text-gray-600 dark:text-slate-300">
            Saídas
          </p>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(0)}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
          <p className="text-sm text-gray-600 dark:text-slate-300">
            Saldo Líquido
          </p>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(0)}
          </p>
        </div>
      </div>
    );
  }

  const isPositiveBalance = balance.netBalance >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Entradas */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-[0_18px_50px_-44px_rgba(15,23,42,0.42)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-100 border border-green-200 flex items-center justify-center">
            <TrendingUp size={20} className="text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-slate-300">
              Entradas
            </p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(balance.totalIncome)}
            </p>
          </div>
        </div>
      </div>

      {/* Saídas */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-[0_18px_50px_-44px_rgba(15,23,42,0.42)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center">
            <TrendingDown size={20} className="text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-slate-300">
              Saídas
            </p>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(balance.totalExpenses)}
            </p>
          </div>
        </div>
      </div>

      {/* Saldo Líquido */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-[0_18px_50px_-44px_rgba(15,23,42,0.42)]">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
            isPositiveBalance
              ? "bg-blue-100 border-blue-200"
              : "bg-red-100 border-red-200"
          }`}>
            <Scale size={20} className={isPositiveBalance ? "text-blue-600" : "text-red-600"} />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-slate-300">
              Saldo Líquido
            </p>
            <p
              className={`text-2xl font-bold ${isPositiveBalance ? "text-blue-600" : "text-red-600"}`}
            >
              {formatCurrency(balance.netBalance)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
