import { z } from "zod";

export const ExpenseSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  value: z.number().positive("O valor deve ser maior que zero"),
  paymentDate: z.string().min(1, "Data de pagamento é obrigatória"),
  description: z.string().min(1, "Descrição é obrigatória"),
  referenceMonth: z
    .string()
    .min(1, "Mês de referência é obrigatório")
    .regex(/^\d{4}-\d{2}$/, "Formato inválido. Use YYYY-MM (ex: 2025-03)"),
});

export type ExpenseFormData = z.infer<typeof ExpenseSchema>;
