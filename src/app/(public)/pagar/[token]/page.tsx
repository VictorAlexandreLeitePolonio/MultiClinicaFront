"use client";

import { ReactNode, useState } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { CheckCircle2, Clock3, Link2Off } from "lucide-react";
import { toast } from "sonner";
import { ErrorState } from "@/components/ui/ErrorState";
import { getApiErrorMessage } from "@/utils/apiError";
import { PaymentStateCard } from "./components/PaymentStateCard";
import { PaymentSummary } from "./components/PaymentSummary";
import { usePayPublicPayment, usePublicPayment } from "./hooks/usePublicPayment";
import { PublicPaymentFormData } from "./services/public-payment.service";

// Os Bricks dependem de window: só carregam no cliente.
const PaymentBricks = dynamic(() => import("./components/PaymentBricks"), { ssr: false });

const ONGOING_MP_STATUSES = new Set(["pending", "in_process", "authorized"]);

function isNotFound(error: unknown) {
  return (error as { response?: { status?: number } } | null)?.response?.status === 404;
}

export default function PublicPaymentPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token ?? "";
  const query = usePublicPayment(token);
  const pay = usePayPublicPayment(token);
  const [submittedPaymentId, setSubmittedPaymentId] = useState<string | null>(null);

  const payment = query.data;

  const handlePay = async (formData: PublicPaymentFormData) => {
    try {
      const result = await pay.mutateAsync(formData);
      const resultStatus = result.status.toLowerCase();

      if (resultStatus === "approved") {
        await query.refetch();
        return;
      }

      if (ONGOING_MP_STATUSES.has(resultStatus)) {
        setSubmittedPaymentId(String(result.paymentId));
        return;
      }

      toast.error("O pagamento não foi aprovado. Tente novamente.");
      await query.refetch();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível processar o pagamento. Tente novamente."));
      throw error;
    }
  };

  let content: ReactNode = null;

  if (!token) {
    content = (
      <PaymentStateCard
        icon={Link2Off}
        title="Link de pagamento inválido."
        description="Confira o link recebido por e-mail ou peça um novo à clínica."
        tone="error"
      />
    );
  } else if (query.isLoading) {
    content = (
      <p role="status" className="py-10 text-center text-sm text-[#64748b] dark:text-slate-400">
        Carregando cobrança...
      </p>
    );
  } else if (query.isError) {
    content = isNotFound(query.error) ? (
      <PaymentStateCard
        icon={Link2Off}
        title="Link de pagamento inválido."
        description="Confira o link recebido por e-mail ou peça um novo à clínica."
        tone="error"
      />
    ) : (
      <ErrorState
        message="Não foi possível carregar a cobrança."
        onRetry={() => void query.refetch()}
      />
    );
  } else if (payment?.status === "Paid") {
    content = (
      <PaymentStateCard
        icon={CheckCircle2}
        title="Pagamento confirmado"
        description="Recebemos seu pagamento. A clínica já foi avisada."
        tone="success"
      />
    );
  } else if (payment?.status === "Unavailable") {
    content = (
      <PaymentStateCard
        icon={Clock3}
        title="Esta cobrança não está mais disponível"
        description="Se você acredita que isso é um erro, fale com a clínica."
      />
    );
  } else if (payment) {
    // Mantém o Status Screen do pagamento recém-criado até o MP concluir (Pix/3DS).
    // Enquanto a consulta ainda não reflete o novo pagamento, confia no resultado do /pay.
    const mpStatus = payment.mpStatus?.toLowerCase() ?? null;
    const submittedStillOngoing =
      submittedPaymentId !== null &&
      (String(payment.mpPaymentId) !== submittedPaymentId ||
        !mpStatus ||
        ONGOING_MP_STATUSES.has(mpStatus));
    const paymentId = submittedStillOngoing ? submittedPaymentId : null;
    const ongoingPaymentId =
      payment.mpPaymentId !== null && mpStatus !== null && ONGOING_MP_STATUSES.has(mpStatus)
        ? String(payment.mpPaymentId)
        : null;
    const statusPaymentId = paymentId ?? ongoingPaymentId;

    content = (
      <>
        <PaymentSummary payment={payment} />

        <div className="mt-6 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[#64748b] dark:text-slate-400">
            {statusPaymentId ? "Finalize seu pagamento" : "Escolha como pagar"}
          </h2>

          <PaymentBricks
            publicKey={payment.publicKey}
            amount={payment.amount}
            acceptPix={payment.acceptPix}
            acceptCredit={payment.acceptCredit}
            acceptDebit={payment.acceptDebit}
            maxInstallments={payment.maxInstallments}
            paymentId={statusPaymentId}
            onSubmit={handlePay}
          />

          {statusPaymentId && (
            <p role="status" className="text-center text-sm text-[#64748b] dark:text-slate-400">
              Aguardando a confirmação do Mercado Pago. Esta página atualiza sozinha.
            </p>
          )}
        </div>
      </>
    );
  }

  return (
    <main className="min-h-screen bg-[#f0fdf9] px-4 py-10 dark:bg-slate-950 sm:py-14">
      <div className="mx-auto w-full max-w-xl space-y-6">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#14b8a6]">
          Pagamento online
        </p>

        <section className="rounded-3xl border border-[#d7f3ea] bg-white p-6 shadow-[0_30px_60px_-50px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          {content}
        </section>

        <p className="text-center text-xs text-[#64748b] dark:text-slate-400">
          Pagamento processado com segurança pelo Mercado Pago.
        </p>
      </div>
    </main>
  );
}
