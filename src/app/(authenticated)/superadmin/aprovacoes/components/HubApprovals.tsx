"use client";

import { useState } from "react";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { getApiErrorMessage } from "@/utils/apiError";
import { formatDateTime } from "@/utils/formatters";
import { useDecideHubApproval, useHubApprovals } from "../../hooks/useHubApprovals";

export function HubApprovals() {
  const approvals = useHubApprovals();
  const decide = useDecideHubApproval();
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [reason, setReason] = useState("");

  const approve = (clinicaId: number) => {
    decide.mutate(
      { clinicaId, approved: true },
      {
        onSuccess: () => toast.success("Perfil aprovado no hub."),
        onError: (error) => toast.error(getApiErrorMessage(error, "Não foi possível aprovar o perfil.")),
      },
    );
  };

  const reject = (clinicaId: number) => {
    const trimmed = reason.trim();
    if (!trimmed) return;
    decide.mutate(
      { clinicaId, approved: false, reason: trimmed },
      {
        onSuccess: () => {
          toast.success("Perfil reprovado no hub.");
          setRejectingId(null);
          setReason("");
        },
        onError: (error) => toast.error(getApiErrorMessage(error, "Não foi possível reprovar o perfil.")),
      },
    );
  };

  if (approvals.isLoading) return <Skeleton className="h-72" />;

  if (approvals.isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(approvals.error, "Não foi possível carregar as aprovações do hub.")}
        onRetry={() => void approvals.refetch()}
      />
    );
  }

  if (!approvals.data || approvals.data.length === 0) {
    return (
      <EmptyState
        icon={BadgeCheck}
        title="Nenhum perfil pendente"
        description="Quando uma clínica pública aguardar aprovação, ela aparece aqui."
      />
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {approvals.data.map((item) => {
        const isRejecting = rejectingId === item.clinicaId;
        return (
          <li
            key={item.clinicaId}
            className="rounded-2xl border border-[#d7f3ea] bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="font-bold text-[#0f172a] dark:text-white">{item.name}</h2>
                <p className="mt-1 text-sm text-[#64748b] dark:text-slate-300">
                  {item.city || "Cidade não informada"} · atualizado em {formatDateTime(item.updatedAt)}
                </p>
                {item.publicSlug && (
                  <Link
                    href={`/clinicas/${item.publicSlug}`}
                    className="mt-2 inline-block text-sm font-semibold text-[#0f766e] hover:underline dark:text-[#67e8f9]"
                  >
                    Ver perfil público
                  </Link>
                )}
              </div>
              {!isRejecting && (
                <div className="flex gap-2">
                  <div className="w-32">
                    <Button type="button" onClick={() => approve(item.clinicaId)} disabled={decide.isPending}>
                      Aprovar
                    </Button>
                  </div>
                  <div className="w-32">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setRejectingId(item.clinicaId);
                        setReason("");
                      }}
                      disabled={decide.isPending}
                    >
                      Reprovar
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {isRejecting && (
              <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-4 dark:border-slate-800">
                <label
                  htmlFor={`hub-reject-${item.clinicaId}`}
                  className="text-sm font-semibold text-[#0f172a] dark:text-white"
                >
                  Motivo da reprovação
                </label>
                <textarea
                  id={`hub-reject-${item.clinicaId}`}
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-[#d7f3ea] bg-white px-4 py-3 text-sm text-[#0f172a] focus:border-[#14b8a6] focus:outline-none focus:ring-4 focus:ring-[#99f6e4]/50 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
                <div className="flex flex-wrap gap-3">
                  <div className="w-48">
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => reject(item.clinicaId)}
                      disabled={!reason.trim() || decide.isPending}
                    >
                      Confirmar reprovação
                    </Button>
                  </div>
                  <div className="w-32">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setRejectingId(null);
                        setReason("");
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
