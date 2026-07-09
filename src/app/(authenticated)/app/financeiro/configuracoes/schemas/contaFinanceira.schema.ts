import { z } from "zod";

export const ContaFinanceiraSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  tipo: z.enum(["Caixa", "Banco", "Cartao", "Outro"]),
  saldoInicial: z.number().min(0, "Saldo inicial não pode ser negativo"),
});

export type ContaFinanceiraFormData = z.infer<typeof ContaFinanceiraSchema>;
