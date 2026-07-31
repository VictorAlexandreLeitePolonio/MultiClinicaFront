import { z } from "zod";

export const CompraItemSchema = z.object({
  produtoId: z.number().min(1, "Produto é obrigatório"),
  quantidade: z.number().int().positive("Quantidade deve ser maior que zero"),
  valorUnitario: z.number().min(0, "Valor unitário não pode ser negativo"),
});
export const CompraSchema = z.object({
  fornecedorId: z.number().min(1, "Fornecedor é obrigatório"),
  dataCompra: z.string().min(1, "Data da compra é obrigatória"),
  observacao: z.string().optional(),
  itens: z.array(CompraItemSchema).min(1, "Adicione ao menos um item"),
});
export type CompraFormData = z.infer<typeof CompraSchema>;
export const GerarContaPagarSchema = z.object({ dataVencimento: z.string().min(1, "Data de vencimento é obrigatória"), categoriaFinanceiraId: z.number().nullable() });
export type GerarContaPagarFormData = z.infer<typeof GerarContaPagarSchema>;
