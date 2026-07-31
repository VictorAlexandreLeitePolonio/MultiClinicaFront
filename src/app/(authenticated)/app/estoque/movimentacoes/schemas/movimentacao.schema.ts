import { z } from "zod";

export const RegistrarMovimentacaoSchema = z.object({
  produtoId: z.number().min(1, "Produto é obrigatório"),
  quantidade: z.number().int().positive("Quantidade deve ser maior que zero"),
  observacao: z.string().optional(),
});
export type RegistrarMovimentacaoFormData = z.infer<typeof RegistrarMovimentacaoSchema>;

export const AjustarEstoqueSchema = z.object({
  produtoId: z.number().min(1, "Produto é obrigatório"),
  novaQuantidade: z.number().int().min(0, "Quantidade não pode ser negativa"),
  observacao: z.string().trim().min(1, "Observação é obrigatória"),
});
export type AjustarEstoqueFormData = z.infer<typeof AjustarEstoqueSchema>;
