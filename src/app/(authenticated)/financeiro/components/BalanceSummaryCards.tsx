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
        <div className="bg-white rounded-sm border-2 border-[#e2ebe6] p-6">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="bg-white rounded-sm border-2 border-[#e2ebe6] p-6">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="bg-white rounded-sm border-2 border-[#e2ebe6] p-6">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-32" />
        </div>
      </div>
    );
  }

  if (!balance) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-sm border-2 border-[#e2ebe6] p-6">
          <p className="text-sm text-[#4a6354]" style={{ fontFamily: "var(--font-serif)" }}>
            Entradas
          </p>
          <p className="text-2xl font-bold text-[#1a4a3a]" style={{ fontFamily: "var(--font-serif)" }}>
            {formatCurrency(0)}
          </p>
        </div>
        <div className="bg-white rounded-sm border-2 border-[#e2ebe6] p-6">
          <p className="text-sm text-[#4a6354]" style={{ fontFamily: "var(--font-serif)" }}>
            Saídas
          </p>
          <p className="text-2xl font-bold text-red-600" style={{ fontFamily: "var(--font-serif)" }}>
            {formatCurrency(0)}
          </p>
        </div>
        <div className="bg-white rounded-sm border-2 border-[#e2ebe6] p-6">
          <p className="text-sm text-[#4a6354]" style={{ fontFamily: "var(--font-serif)" }}>
            Saldo Líquido
          </p>
          <p className="text-2xl font-bold text-blue-600" style={{ fontFamily: "var(--font-serif)" }}>
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
      <div className="bg-white rounded-sm border-2 border-[#e2ebe6] p-6 shadow-[2px_2px_0_0_#e2ebe6]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-sm bg-green-100 border-2 border-green-200 flex items-center justify-center">
            <TrendingUp size={20} className="text-green-600" />
          </div>
          <div>
            <p className="text-sm text-[#4a6354]" style={{ fontFamily: "var(--font-serif)" }}>
              Entradas
            </p>
            <p className="text-2xl font-bold text-green-600" style={{ fontFamily: "var(--font-serif)" }}>
              {formatCurrency(balance.totalIncome)}
            </p>
          </div>
        </div>
      </div>

      {/* Saídas */}
      <div className="bg-white rounded-sm border-2 border-[#e2ebe6] p-6 shadow-[2px_2px_0_0_#e2ebe6]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-sm bg-red-100 border-2 border-red-200 flex items-center justify-center">
            <TrendingDown size={20} className="text-red-600" />
          </div>
          <div>
            <p className="text-sm text-[#4a6354]" style={{ fontFamily: "var(--font-serif)" }}>
              Saídas
            </p>
            <p className="text-2xl font-bold text-red-600" style={{ fontFamily: "var(--font-serif)" }}>
              {formatCurrency(balance.totalExpenses)}
            </p>
          </div>
        </div>
      </div>

      {/* Saldo Líquido */}
      <div className="bg-white rounded-sm border-2 border-[#e2ebe6] p-6 shadow-[2px_2px_0_0_#e2ebe6]">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-sm flex items-center justify-center border-2 ${
            isPositiveBalance 
              ? "bg-blue-100 border-blue-200" 
              : "bg-red-100 border-red-200"
          }`}>
            <Scale size={20} className={isPositiveBalance ? "text-blue-600" : "text-red-600"} />
          </div>
          <div>
            <p className="text-sm text-[#4a6354]" style={{ fontFamily: "var(--font-serif)" }}>
              Saldo Líquido
            </p>
            <p 
              className={`text-2xl font-bold ${isPositiveBalance ? "text-blue-600" : "text-red-600"}`} 
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {formatCurrency(balance.netBalance)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
