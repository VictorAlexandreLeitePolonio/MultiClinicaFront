import { z } from "zod";

export const UsuarioSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  role: z.enum(["Admin", "Fisio"]),
});

export type UsuarioFormData = z.infer<typeof UsuarioSchema>;

// Schema para cadastro (com senha obrigatória)
export const UsuarioCreateSchema = UsuarioSchema.extend({
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

export type UsuarioCreateFormData = z.infer<typeof UsuarioCreateSchema>;
