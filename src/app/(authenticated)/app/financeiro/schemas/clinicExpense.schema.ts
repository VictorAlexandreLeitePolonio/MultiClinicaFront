import { z } from "zod";

export const ClinicExpenseSchema = z.object({
  title: z.string().trim().min(1, "Título é obrigatório"),
  amount: z.number().positive("O valor deve ser maior que zero"),
  date: z.string().min(1, "Data é obrigatória"),
  description: z.string().optional(),
});

export type ClinicExpenseFormData = z.infer<typeof ClinicExpenseSchema>;
