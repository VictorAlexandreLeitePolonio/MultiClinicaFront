import { isValidCPF } from "@/utils/formatters";
import { z } from "zod";

const textField = z.string({ error: "Campo inválido." }).default("");
const cpfField = z
  .string()
  .min(1, "CPF é obrigatório")
  .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF inválido")
  .refine((value) => isValidCPF(value), "CPF inválido");
const rgField = z
  .string()
  .default("")
  .refine(
    (value) => value === "" || /^\d{2}\.\d{3}\.\d{3}-\d{1}$/.test(value),
    "RG inválido",
  );
const phoneField = z
  .string()
  .min(1, "Telefone é obrigatório")
  .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, "Telefone inválido");

export const PacienteSchema = z.object({
  name: textField,
  email: z.union([z.string().email("E-mail inválido"), z.literal("")]).default(""),
  cpf: cpfField,
  rg: rgField,
  phone: phoneField,
  rua: textField,
  numero: textField,
  bairro: textField,
  cidade: textField,
  estado: textField,
  cep: textField,
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
