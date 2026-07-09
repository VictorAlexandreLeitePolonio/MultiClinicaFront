import { z } from "zod";

export const CategoriaFinanceiraSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  tipo: z.enum(["Receita", "Despesa"]),
});

export type CategoriaFinanceiraFormData = z.infer<typeof CategoriaFinanceiraSchema>;
