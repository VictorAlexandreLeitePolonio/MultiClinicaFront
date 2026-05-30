import { z } from "zod";

export const ProntuarioSchema = z.object({
  patientId: z.number().min(1, "Paciente é obrigatório"),
  titulo: z.string().min(1, "Título é obrigatório"),
  patologia: z.string().min(1, "Patologia é obrigatória"),
  queixaPrincipal: z.string().min(1, "Queixa principal é obrigatória"),
  doencaAntiga: z.string().optional(),
  doencaAtual: z.string().optional(),
  habitos: z.string().optional(),
  examesFisicos: z.string().optional(),
  sinaisVitais: z.string().optional(),
  medicamentos: z.string().optional(),
  cirurgias: z.string().optional(),
  outrasDoencas: z.string().optional(),
  sessao: z.string().optional(),
  orientacaoDomiciliar: z.string().optional(),
});

export type ProntuarioFormData = z.infer<typeof ProntuarioSchema>;
