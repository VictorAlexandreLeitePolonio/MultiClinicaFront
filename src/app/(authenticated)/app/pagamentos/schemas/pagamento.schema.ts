import { z } from "zod";

export const PagamentoSchema = z.object({
  patientId: z.number().min(1, "Paciente é obrigatório"),
  planId: z.number().min(1, "Plano é obrigatório"),
  referenceMonth: z
    .string()
    .regex(/^(0[1-9]|1[0-2])-\d{4}$/, "Mês de referência deve estar no formato MM-YYYY"),
  paymentMethod: z.string().min(1, "Método de pagamento é obrigatório"),
  status: z.enum(["Pending", "Paid", "Cancelled"]),
  paidAt: z.string().optional(),
  paymentDate: z.string().optional().nullable(),
});

export type PagamentoFormData = z.infer<typeof PagamentoSchema>;
