import { z } from "zod";

export const AbrirCaixaSchema = z.object({
  contaFinanceiraId: z.number().min(1, "Conta financeira é obrigatória"),
  saldoInicial: z.number().min(0, "Saldo inicial não pode ser negativo"),
  observacao: z.string().optional(),
});

export type AbrirCaixaFormData = z.infer<typeof AbrirCaixaSchema>;

export const FecharCaixaSchema = z.object({
  saldoFinalInformado: z.number().min(0, "Saldo final não pode ser negativo"),
  observacao: z.string().optional(),
});

export type FecharCaixaFormData = z.infer<typeof FecharCaixaSchema>;

export const AjustarCaixaSchema = z.object({
  saldoFinalInformado: z.number().min(0, "Saldo final não pode ser negativo"),
  motivo: z.string().min(1, "Motivo é obrigatório"),
});

export type AjustarCaixaFormData = z.infer<typeof AjustarCaixaSchema>;
