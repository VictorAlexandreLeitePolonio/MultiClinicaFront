import { z } from "zod";

export const RegistrarPagamentoSchema = z.object({
  contaFinanceiraId: z.number().min(1, "Conta financeira é obrigatória"),
  formaPagamentoId: z.number().min(1, "Forma de pagamento é obrigatória"),
  valor: z.number().positive("O valor deve ser maior que zero"),
  dataPagamento: z.string().min(1, "Data do pagamento é obrigatória"),
  observacao: z.string().optional(),
});

export type RegistrarPagamentoFormData = z.infer<typeof RegistrarPagamentoSchema>;
