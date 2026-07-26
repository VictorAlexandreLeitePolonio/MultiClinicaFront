import { z } from "zod";

export const ProdutoSchema = z.object({
  categoriaProdutoId: z.number().nullable(),
  nome: z.string().trim().min(1, "Nome é obrigatório"),
  descricao: z.string().optional(),
  codigoInterno: z.string().optional(),
  codigoBarras: z.string().optional(),
  valorCompra: z.number().min(0, "Valor de compra não pode ser negativo"),
  valorVenda: z.number().min(0, "Valor de venda não pode ser negativo"),
  quantidadeMinima: z.number().int().min(0, "Quantidade mínima não pode ser negativa"),
});

export type ProdutoFormData = z.infer<typeof ProdutoSchema>;
