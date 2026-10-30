/**
 * Formas de pagamento aceitas pelo back para cobranças NOVAS.
 * Cobranças antigas podem ter valores legados ("Cartão", "Boleto", ...): eles
 * continuam válidos no update enquanto não forem trocados.
 */
export const ONLINE_PAYMENT_METHOD = "Online (Mercado Pago)" as const;

export const MANUAL_PAYMENT_METHODS = [
  "Dinheiro",
  "Pix",
  "Cartão de crédito",
  "Cartão de débito",
  "Transferência",
] as const;

/** Opções do select de forma de pagamento na edição, incluindo o valor atual legado. */
export function paymentMethodChoices(current?: string | null): string[] {
  const choices: string[] = [...MANUAL_PAYMENT_METHODS];
  if (current && !choices.includes(current)) {
    choices.unshift(current);
  }
  return choices;
}
