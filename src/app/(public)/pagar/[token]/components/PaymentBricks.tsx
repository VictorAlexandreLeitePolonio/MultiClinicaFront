"use client";

import { ComponentProps } from "react";
import { initMercadoPago, Payment, StatusScreen } from "@mercadopago/sdk-react";
import { PublicPaymentFormData } from "../services/public-payment.service";

type PaymentMethods = ComponentProps<typeof Payment>["customization"]["paymentMethods"];

let initializedPublicKey: string | null = null;

function ensureMercadoPago(publicKey: string) {
  if (!publicKey || initializedPublicKey === publicKey) return;
  initMercadoPago(publicKey, { locale: "pt-BR" });
  initializedPublicKey = publicKey;
}

interface PaymentBricksProps {
  publicKey: string;
  amount: number;
  acceptPix: boolean;
  acceptCredit: boolean;
  acceptDebit: boolean;
  maxInstallments: number;
  /** Quando existe, mostra o Status Screen (Pix aguardando ou 3DS). */
  paymentId: string | null;
  onSubmit?: (formData: PublicPaymentFormData) => Promise<void>;
}

export default function PaymentBricks({
  publicKey,
  amount,
  acceptPix,
  acceptCredit,
  acceptDebit,
  maxInstallments,
  paymentId,
  onSubmit,
}: PaymentBricksProps) {
  ensureMercadoPago(publicKey);

  if (paymentId) {
    return <StatusScreen initialization={{ paymentId }} />;
  }

  // Ao menos uma forma sempre está ativa (validado nas configurações da clínica).
  const paymentMethods = {
    maxInstallments,
    ...(acceptPix ? { bankTransfer: ["pix"] } : {}),
    ...(acceptCredit ? { creditCard: "all" } : {}),
    ...(acceptDebit ? { debitCard: "all" } : {}),
  } as PaymentMethods;

  return (
    <Payment
      initialization={{ amount }}
      customization={{ paymentMethods }}
      onSubmit={async (param) => {
        if (!onSubmit) return;
        await onSubmit({
          token: param.formData.token,
          payment_method_id: param.formData.payment_method_id,
          issuer_id: param.formData.issuer_id,
          installments: param.formData.installments,
          payer: {
            email: param.formData.payer?.email ?? "",
            identification: param.formData.payer?.identification,
          },
        });
      }}
    />
  );
}
