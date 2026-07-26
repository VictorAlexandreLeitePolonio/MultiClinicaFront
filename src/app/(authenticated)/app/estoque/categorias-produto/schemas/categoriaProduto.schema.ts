import { z } from "zod";

export const CategoriaProdutoSchema = z.object({ nome: z.string().trim().min(1, "Nome é obrigatório") });
export type CategoriaProdutoFormData = z.infer<typeof CategoriaProdutoSchema>;
