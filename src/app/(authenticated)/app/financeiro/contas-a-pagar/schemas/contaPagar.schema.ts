import { z } from "zod";

const dateRangeMessage = "A data de vencimento deve ser igual ou posterior à emissão";

const contaPagarFields = {
  categoriaFinanceiraId: z.number().nullable(),
  descricao: z.string().trim().min(1, "Descrição é obrigatória"),
  valorOriginal: z.number().positive("O valor original deve ser maior que zero"),
  valorDesconto: z.number().min(0, "Desconto não pode ser negativo"),
  valorJuros: z.number().min(0, "Juros não pode ser negativo"),
  dataVencimento: z.string().min(1, "Data de vencimento é obrigatória"),
  observacao: z.string().optional(),
};

export const CreateContaPagarSchema = z
  .object({
    fornecedorId: z.number().min(1, "Fornecedor é obrigatório"),
    ...contaPagarFields,
    dataEmissao: z.string().min(1, "Data de emissão é obrigatória"),
  })
  .refine((data) => data.dataVencimento >= data.dataEmissao, {
    path: ["dataVencimento"],
    message: dateRangeMessage,
  });

export type CreateContaPagarFormData = z.infer<typeof CreateContaPagarSchema>;

export const UpdateContaPagarSchema = z
  .object(contaPagarFields)
  .refine((data) => data.valorDesconto + data.valorJuros <= data.valorOriginal, {
    path: ["valorDesconto"],
    message: "Desconto e juros não podem superar o valor original",
  });

export type UpdateContaPagarFormData = z.infer<typeof UpdateContaPagarSchema>;
