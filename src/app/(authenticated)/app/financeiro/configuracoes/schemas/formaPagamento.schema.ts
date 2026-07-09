import { z } from "zod";

export const FormaPagamentoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
});

export type FormaPagamentoFormData = z.infer<typeof FormaPagamentoSchema>;
