"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { Payment } from "@/types";
import { getApiErrorMessage } from "@/utils/apiError";
import { formatCurrency } from "@/utils/formatters";
import {
  usePaymentLink,
  useRefundDuplicatePayment,
  useRefundPayment,
  useSendPaymentCharge,
} from "../hooks/useOnlinePayment";

interface Props {
  payment: Payment;
  onChanged: () => void;
}

const actionClassName =
  "rounded-lg border border-[#99f6e4] bg-white px-2.5 py-1 text-xs font-semibold text-[#0f766e] transition-colors hover:border-[#14b8a6] hover:bg-[#ecfdf5] disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-[#67e8f9] dark:hover:bg-slate-800";

function Badge({ children, className }: { children: React.ReactNode; className: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${className}`}>
      {children}
    </span>
  );
}

async function copyToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  // Fallback para navegadores sem a Clipboard API (ex.: contexto não seguro).
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export function PagamentoOnlineCell({ payment, onChanged }: Props) {
  const send = useSendPaymentCharge();
  const link = usePaymentLink();
  const refund = useRefundPayment();
  const refundDuplicate = useRefundDuplicatePayment();
  const [confirmRefund, setConfirmRefund] = useState(false);

  const pending = payment.status === "Pending";
  const refundable = payment.status === "Paid" && payment.paidOnline;
  const duplicate = payment.onlineAlert?.startsWith("PagamentoDuplicado:") ?? false;
  const hasBadges = payment.paidOnline || Boolean(payment.onlineAlert);
  const hasActions = pending || refundable || duplicate;

  if (!hasBadges && !hasActions) return <span className="text-gray-400">-</span>;

  const handleSend = async () => {
    try {
      await send.mutateAsync(payment.id);
      toast.success(payment.hasPaymentLink ? "Cobrança reenviada por e-mail." : "Cobrança enviada por e-mail.");
      onChanged();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível enviar a cobrança."));
    }
  };

  const handleCopyLink = async () => {
    try {
      const { url } = await link.mutateAsync(payment.id);
      await copyToClipboard(url);
      toast.success("Link copiado.");
      onChanged();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível copiar o link."));
    }
  };

  const handleRefund = async () => {
    try {
      await refund.mutateAsync(payment.id);
      setConfirmRefund(false);
      toast.success("Reembolso solicitado.");
      onChanged();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível reembolsar o pagamento."));
    }
  };

  const handleRefundDuplicate = async () => {
    try {
      await refundDuplicate.mutateAsync(payment.id);
      toast.success("Pagamento duplicado reembolsado.");
      onChanged();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível reembolsar o pagamento duplicado."));
    }
  };

  return (
    <div className="flex flex-col items-start gap-1.5">
      {hasBadges && (
        <div className="flex flex-wrap gap-1">
          {payment.paidOnline && (
            <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
              Pago online
            </Badge>
          )}
          {payment.onlineAlert === "Estornado" && (
            <Badge className="border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-300">
              Estornado
            </Badge>
          )}
          {payment.onlineAlert === "Contestado" && (
            <Badge className="border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
              Contestado
            </Badge>
          )}
          {duplicate && (
            <Badge className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
              Pagamento duplicado
            </Badge>
          )}
        </div>
      )}

      {hasActions && (
        <div className="flex flex-wrap gap-1.5">
          {pending && (
            <>
              <button type="button" onClick={() => void handleSend()} disabled={send.isPending} className={actionClassName}>
                {payment.hasPaymentLink ? "Reenviar" : "Enviar cobrança"}
              </button>
              <button type="button" onClick={() => void handleCopyLink()} disabled={link.isPending} className={actionClassName}>
                Copiar link
              </button>
            </>
          )}
          {refundable && (
            <button type="button" onClick={() => setConfirmRefund(true)} disabled={refund.isPending} className={actionClassName}>
              Reembolsar
            </button>
          )}
          {duplicate && (
            <button
              type="button"
              onClick={() => void handleRefundDuplicate()}
              disabled={refundDuplicate.isPending}
              className={actionClassName}
            >
              Reembolsar pagamento duplicado
            </button>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmRefund}
        title="Reembolsar pagamento"
        description={`O valor de ${formatCurrency(payment.planAmount)} volta para o paciente. A cobrança será cancelada.`}
        confirmLabel="Reembolsar"
        loading={refund.isPending}
        onCancel={() => setConfirmRefund(false)}
        onConfirm={() => void handleRefund()}
      />
    </div>
  );
}
