import { z } from "zod";

export const PlanoSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  valor: z.number().positive("Valor deve ser maior que zero"),
  tipoPlano: z.enum(["Mensal", "Avulso"]),
  tipoSessaoId: z.number().int().positive("Tipo de sessão é obrigatório"),
});

export type PlanoFormData = z.infer<typeof PlanoSchema>;
