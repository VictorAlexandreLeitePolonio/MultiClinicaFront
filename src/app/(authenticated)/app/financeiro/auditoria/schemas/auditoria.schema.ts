import { z } from "zod";

export const AuditoriaFiltroSchema = z.object({
  modulo: z.string().optional(),
  entidade: z.string().optional(),
  de: z.string().optional(),
  ate: z.string().optional(),
});

export type AuditoriaFiltroFormData = z.infer<typeof AuditoriaFiltroSchema>;
