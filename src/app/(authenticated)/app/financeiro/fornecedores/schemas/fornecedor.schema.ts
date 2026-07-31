import { z } from "zod";

export const FornecedorSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório"),
});

export type FornecedorFormData = z.infer<typeof FornecedorSchema>;
