// Contrato do pagamento online (Mercado Pago). Espelha os DTOs do back.

export interface MercadoPagoStatus {
  connected: boolean;
  liveMode: boolean;
  revoked: boolean;
  acceptPix: boolean;
  acceptCredit: boolean;
  maxInstallments: number;
  acceptDebit: boolean;
  /** Conta conectada; apelido e e-mail ficam nulos em contas ligadas antes de 2026-11-02. */
  accountId: number | null;
  nickname: string | null;
  email: string | null;
  connectedAt: string | null;
}

export interface MercadoPagoSettings {
  acceptPix: boolean;
  acceptCredit: boolean;
  maxInstallments: number;
  acceptDebit: boolean;
}

// GET /api/public/payments/{token}
export type PublicPaymentStatus = "Pending" | "Paid" | "Unavailable";

export interface PublicPayment {
  clinicName: string;
  clinicLogoUrl: string | null;
  patientFirstName: string;
  amount: number;
  referenceMonth: string;
  planName: string;
  status: PublicPaymentStatus;
  mpStatus: string | null;
  mpPaymentId: number | null;
  publicKey: string;
  acceptPix: boolean;
  acceptCredit: boolean;
  maxInstallments: number;
  acceptDebit: boolean;
}

// POST /api/public/payments/{token}/pay — corpo é o formData do Payment Brick.
export interface PayResult {
  paymentId: number;
  status: string;
}

// GET /api/patient/payments
export interface PatientCharge {
  id: number;
  clinicName: string;
  amount: number;
  referenceMonth: string;
  planName: string;
  status: "Pending" | "Paid";
  payUrl: string;
}
