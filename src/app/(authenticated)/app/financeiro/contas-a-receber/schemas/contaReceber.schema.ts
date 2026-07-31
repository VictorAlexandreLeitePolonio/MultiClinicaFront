import { z } from "zod";

export const CreateContaReceberSchema = z.object({
  pacienteId: z.number().min(1, "Paciente é obrigatório"),
  categoriaFinanceiraId: z.number().nullable(),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  valorOriginal: z.number().positive("O valor deve ser maior que zero"),
  valorDesconto: z.number().min(0, "Desconto não pode ser negativo"),
  valorJuros: z.number().min(0, "Juros não pode ser negativo"),
  dataEmissao: z.string().min(1, "Data de emissão é obrigatória"),
  dataVencimento: z.string().min(1, "Data de vencimento é obrigatória"),
  observacao: z.string().optional(),
});

export type CreateContaReceberFormData = z.infer<typeof CreateContaReceberSchema>;

export const RegistrarRecebimentoSchema = z.object({
  contaFinanceiraId: z.number().min(1, "Conta financeira é obrigatória"),
  formaPagamentoId: z.number().min(1, "Forma de pagamento é obrigatória"),
  valor: z.number().positive("O valor deve ser maior que zero"),
  dataRecebimento: z.string().min(1, "Data é obrigatória"),
  observacao: z.string().optional(),
});

export type RegistrarRecebimentoFormData = z.infer<typeof RegistrarRecebimentoSchema>;
