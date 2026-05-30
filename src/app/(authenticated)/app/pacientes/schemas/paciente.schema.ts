import { z } from "zod";

export const PacienteSchema = z.object({
  name: z.string(),
  email: z.union([z.string().email("E-mail inválido"), z.literal("")]),
  cpf: z.string(),
  rg: z.string(),
  phone: z.string(),
  rua: z.string(),
  numero: z.string(),
  bairro: z.string(),
  cidade: z.string(),
  estado: z.string(),
  cep: z.string(),
});

export type PacienteFormData = z.infer<typeof PacienteSchema>;

export interface PacientePayload {
  name: string | null;
  email: string | null;
  cpf: string | null;
  rg: string | null;
  phone: string | null;
  rua: string | null;
  numero: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
}

// Campos de cada step para validação parcial
export const step1Fields = ["name", "email", "cpf", "phone"] as const;
export const step2Fields = ["rua", "numero", "bairro", "cidade", "estado", "cep"] as const;
