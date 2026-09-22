import { z } from "zod";
import { isValidCivilDate } from "@/utils/formatters";

const civilDateField = (message: string) =>
  z.string().refine((value) => isValidCivilDate(value), message);

export const PagamentoSchema = z.object({
  patientId: z.number().min(1, "Paciente é obrigatório"),
  planId: z.number().min(1, "Plano é obrigatório"),
  referenceMonth: civilDateField("Mês de referência é obrigatório e deve ser uma data válida"),
  paymentMethod: z.string().min(1, "Método de pagamento é obrigatório"),
  status: z.enum(["Pending", "Paid", "Cancelled"]),
  paidAt: z
    .string()
    .refine((value) => value === "" || isValidCivilDate(value), "Data do pagamento inválida")
    .optional(),
  paymentDate: z
    .string()
    .nullable()
    .refine(
      (value) => value === null || value === "" || isValidCivilDate(value),
      "Data de vencimento inválida",
    )
    .optional(),
});

export type PagamentoFormData = z.infer<typeof PagamentoSchema>;
