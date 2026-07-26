import { z } from "zod";

export const RelatorioPeriodoSchema = z.object({
  de: z.string().min(1, "Data inicial é obrigatória"),
  ate: z.string().min(1, "Data final é obrigatória"),
  agruparPor: z.enum(["Periodo", "FormaPagamento", "Categoria"]),
}).refine((data) => data.de <= data.ate, { path: ["ate"], message: "A data final deve ser igual ou posterior à inicial" });

export type RelatorioPeriodoFormData = z.infer<typeof RelatorioPeriodoSchema>;
