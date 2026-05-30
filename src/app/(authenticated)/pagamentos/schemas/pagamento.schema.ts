import { z } from "zod";

export const PagamentoSchema = z.object({
  patientId: z.number().min(1, "Paciente é obrigatório"),
  planId: z.number().min(1, "Plano é obrigatório"),
  referenceMonth: z.string().min(1, "Mês de referência é obrigatório"),
  paymentMethod: z.string().min(1, "Método de pagamento é obrigatório"),
  status: z.enum(["Pending", "Paid", "Cancelled"]),
  paidAt: z.string().optional(),
  paymentDate: z.string().optional().nullable(),
});

export type PagamentoFormData = z.infer<typeof PagamentoSchema>;
