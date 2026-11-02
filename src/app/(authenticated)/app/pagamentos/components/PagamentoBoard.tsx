"use client";

import { useMemo, useRef, useState } from "react";
import { motion, useReducedMotion, type PanInfo } from "motion/react";
import { DropdownMenu } from "radix-ui";
import { GripVertical } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { Payment, PaymentStatus } from "@/types";
import { formatCivilDate } from "@/utils/formatters";
import { cn } from "@/lib/utils";
import { usePagamentoUpdate } from "../hooks/update";
import type { PagamentoFormData } from "../schemas/pagamento.schema";

interface Props {
  payments: Payment[];
  loading?: boolean;
  onViewDetails: (id: number) => void;
  onChanged?: () => void;
}

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const columns = [
  { status: "Pending", label: "Pendente" },
  { status: "Paid", label: "Pago" },
  { status: "Cancelled", label: "Cancelado" },
] as const;

const columnDot: Record<PaymentStatus, string> = {
  Pending: "bg-[var(--signal)]",
  Paid: "bg-[var(--color-primary-dark)]",
  Cancelled: "bg-[var(--color-gray-600)]",
};

const moveActionLabel: Record<PaymentStatus, string> = {
  Pending: "Marcar como pendente",
  Paid: "Marcar como pago",
  Cancelled: "Cancelar pagamento",
};

/** Regras de transição do quadro. Retorna a mensagem quando a mudança é recusada. */
export function paymentMoveBlockedReason(
  payment: Payment,
  target: PaymentStatus,
): string | null {
  if (payment.status === "Paid" && target === "Pending") {
    return "Um pagamento pago não pode voltar para pendente.";
  }
  if (payment.status === "Paid" && payment.paidOnline && target === "Cancelled") {
    return "Uma cobrança paga online não pode ser cancelada pelo quadro. Reembolse na lista.";
  }
  return null;
}

function toUpdatePayload(
  payment: Payment,
  status: PaymentStatus,
): PagamentoFormData {
  return {
    patientId: payment.patientId,
    planId: payment.planId,
    referenceMonth: payment.referenceMonth.slice(0, 10),
    paymentMethod: payment.paymentMethod,
    status,
    ...(payment.paidAt ? { paidAt: payment.paidAt.slice(0, 10) } : {}),
    paymentDate: payment.paymentDate
      ? payment.paymentDate.slice(0, 10)
      : null,
  };
}

function confirmTitle(target: PaymentStatus) {
  return target === "Paid"
    ? "Marcar como pago?"
    : target === "Cancelled"
      ? "Cancelar pagamento?"
      : "Marcar como pendente?";
}

function confirmDescription(payment: Payment, target: PaymentStatus) {
  const amount = brl.format(payment.planAmount);
  if (target === "Paid") {
    return `O pagamento de ${payment.patientName} (${amount}) será marcado como pago.`;
  }
  if (target === "Cancelled") {
    return `O pagamento de ${payment.patientName} (${amount}) será cancelado.`;
  }
  return `O pagamento de ${payment.patientName} (${amount}) voltará para pendente.`;
}

export function PagamentoBoard({
  payments,
  loading = false,
  onViewDetails,
  onChanged,
}: Props) {
  const { updatePagamento, isPending } = usePagamentoUpdate();
  const reduceMotion = useReducedMotion();
  const [pendingMove, setPendingMove] = useState<{
    payment: Payment;
    target: PaymentStatus;
  } | null>(null);
  const [hoveredColumn, setHoveredColumn] = useState<PaymentStatus | null>(null);
  const columnRefs = useRef<Record<PaymentStatus, HTMLElement | null>>({
    Pending: null,
    Paid: null,
    Cancelled: null,
  });

  const grouped = useMemo(() => {
    const result: Record<PaymentStatus, Payment[]> = {
      Pending: [],
      Paid: [],
      Cancelled: [],
    };
    for (const payment of payments) {
      result[payment.status].push(payment);
    }
    return result;
  }, [payments]);

  const requestMove = (payment: Payment, target: PaymentStatus) => {
    if (payment.status === target) return;
    const blocked = paymentMoveBlockedReason(payment, target);
    if (blocked) {
      toast.error(blocked);
      return;
    }
    setPendingMove({ payment, target });
  };

  const columnAtPoint = (x: number, y: number): PaymentStatus | null => {
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    for (const { status } of columns) {
      const element = columnRefs.current[status];
      if (!element) continue;
      const rect = element.getBoundingClientRect();
      if (
        x >= rect.left + scrollX &&
        x <= rect.right + scrollX &&
        y >= rect.top + scrollY &&
        y <= rect.bottom + scrollY
      ) {
        return status;
      }
    }
    return null;
  };

  const handleDrag = (payment: Payment, info: PanInfo) => {
    const over = columnAtPoint(info.point.x, info.point.y);
    setHoveredColumn(over && over !== payment.status ? over : null);
  };

  const handleDragEnd = (payment: Payment, info: PanInfo) => {
    setHoveredColumn(null);
    const target = columnAtPoint(info.point.x, info.point.y);
    if (target && target !== payment.status) {
      requestMove(payment, target);
    }
  };

  const confirmMove = async () => {
    if (!pendingMove) return;
    const { payment, target } = pendingMove;
    try {
      await updatePagamento(payment.id, toUpdatePayload(payment, target));
      toast.success(
        target === "Paid"
          ? "Pagamento marcado como pago."
          : target === "Cancelled"
            ? "Pagamento cancelado."
            : "Pagamento marcado como pendente.",
      );
      setPendingMove(null);
      onChanged?.();
    } catch {
      // O hook já exibe a mensagem da API.
    }
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3" aria-label="Quadro de pagamentos">
        {columns.map(({ status, label }) => {
          const items = grouped[status];
          const total = items.reduce(
            (sum, payment) => sum + payment.planAmount,
            0,
          );
          const countLabel = `${items.length} ${
            items.length === 1 ? "pagamento" : "pagamentos"
          }`;
          return (
            <section
              key={status}
              ref={(element) => {
                columnRefs.current[status] = element;
              }}
              aria-label={label}
              className={cn(
                "flex min-h-[320px] flex-col gap-3 rounded-2xl bg-[var(--color-gray-50)] p-3 transition-[background-color,box-shadow] duration-150 motion-reduce:transition-none",
                hoveredColumn === status &&
                  "bg-[var(--color-primary-muted)] ring-2 ring-[var(--color-primary)] ring-inset",
              )}
            >
              <header className="px-1">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--color-secondary)]">
                  <span
                    aria-hidden="true"
                    className={cn("size-2 rounded-full", columnDot[status])}
                  />
                  {label}
                </h2>
                <p className="mt-1 font-mono text-xs text-[var(--color-gray-600)]">
                  <span>{countLabel}</span>
                  <span aria-hidden="true"> · </span>
                  <span data-testid="payments-column-total">
                    {brl.format(total)}
                  </span>
                </p>
              </header>

              {items.length === 0 ? (
                <p className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-[var(--color-gray-200)] p-6 text-center text-xs text-[var(--color-gray-600)]">
                  {loading ? "Carregando..." : "Nenhum pagamento"}
                </p>
              ) : (
                <ul role="list" className="flex flex-col gap-2">
                  {items.map((payment) => (
                    <motion.li
                      key={payment.id}
                      drag
                      dragSnapToOrigin
                      dragMomentum={false}
                      whileDrag={
                        reduceMotion
                          ? { boxShadow: "var(--shadow-lg)" }
                          : { scale: 1.02, boxShadow: "var(--shadow-lg)" }
                      }
                      onDrag={(_event, info) => handleDrag(payment, info)}
                      onDragEnd={(_event, info) =>
                        handleDragEnd(payment, info)
                      }
                      className="payments-board__card relative rounded-xl border border-[var(--color-gray-200)] bg-[var(--color-card)] p-3 shadow-[var(--shadow-sm)]"
                      aria-label={`Pagamento de ${payment.patientName}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="min-w-0 truncate text-sm font-semibold text-[var(--color-secondary)]">
                          {payment.patientName}
                        </p>

                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger asChild>
                            <button
                              type="button"
                              aria-label={`Mover para… ${payment.patientName}`}
                              className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg text-[var(--color-gray-600)] transition-[background-color,transform] duration-150 hover:bg-[var(--color-gray-100)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] active:scale-[0.97] motion-reduce:transition-none"
                            >
                              <GripVertical size={14} aria-hidden="true" />
                            </button>
                          </DropdownMenu.Trigger>
                          <DropdownMenu.Portal>
                            <DropdownMenu.Content
                              align="end"
                              sideOffset={4}
                              className="z-50 min-w-44 rounded-xl border border-[var(--color-gray-200)] bg-[var(--color-card)] p-1 text-[var(--color-secondary)] shadow-[var(--shadow-md)]"
                            >
                              <DropdownMenu.Label className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-gray-600)]">
                                Mover para…
                              </DropdownMenu.Label>
                              {columns
                                .filter((column) => column.status !== status)
                                .map((column) => (
                                  <DropdownMenu.Item
                                    key={column.status}
                                    onSelect={() =>
                                      requestMove(payment, column.status)
                                    }
                                    className="cursor-pointer rounded-lg px-2 py-1.5 text-xs font-medium outline-none transition-colors duration-150 focus:bg-[var(--color-primary-muted)] motion-reduce:transition-none"
                                  >
                                    {moveActionLabel[column.status]}
                                  </DropdownMenu.Item>
                                ))}
                              <DropdownMenu.Separator className="my-1 h-px bg-[var(--color-gray-200)]" />
                              <DropdownMenu.Item
                                onSelect={() => onViewDetails(payment.id)}
                                className="cursor-pointer rounded-lg px-2 py-1.5 text-xs font-medium outline-none transition-colors duration-150 focus:bg-[var(--color-primary-muted)] motion-reduce:transition-none"
                              >
                                Ver detalhes
                              </DropdownMenu.Item>
                            </DropdownMenu.Content>
                          </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                      </div>

                      <p className="mt-2 font-mono text-lg font-semibold text-[var(--color-secondary)]">
                        {brl.format(payment.planAmount)}
                      </p>
                      <p className="mt-1 flex flex-wrap items-center gap-x-1.5 font-mono text-xs text-[var(--color-gray-600)]">
                        <span>{formatCivilDate(payment.referenceMonth)}</span>
                        <span aria-hidden="true">·</span>
                        <span>{payment.paymentMethod}</span>
                      </p>
                    </motion.li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>

      <ConfirmDialog
        open={pendingMove !== null}
        title={pendingMove ? confirmTitle(pendingMove.target) : ""}
        description={
          pendingMove
            ? confirmDescription(pendingMove.payment, pendingMove.target)
            : ""
        }
        confirmLabel={
          pendingMove ? moveActionLabel[pendingMove.target] : "Confirmar"
        }
        loading={isPending}
        onCancel={() => setPendingMove(null)}
        onConfirm={() => void confirmMove()}
      />
    </>
  );
}
