import { z } from "zod";
import {
  EvolutionDirection,
  EvolutionFieldType,
  EvolutionFieldUnit,
} from "@/types/evolution";

export const evolutionFieldTypes: EvolutionFieldType[] = [
  "Number",
  "Scale",
  "Percentage",
  "Boolean",
  "Text",
  "SelectScore",
];

export const evolutionFieldUnits: EvolutionFieldUnit[] = [
  "None",
  "Points",
  "Percentage",
  "Kg",
  "G",
  "Mg",
  "Cm",
  "Mm",
  "M",
  "Degrees",
  "Seconds",
  "Minutes",
  "Hours",
  "Days",
  "Repetitions",
  "Liters",
  "Ml",
  "Score",
];

export const evolutionDirections: EvolutionDirection[] = ["Neutral", "Increase", "Decrease"];

const optionalText = z.string({ error: "Preencha com um texto válido." }).trim().default("");

const optionalNumber = z
  .union([
    z.literal(""),
    z.null(),
    z.undefined(),
    z.coerce.number({ error: "Informe um número válido." }),
  ])
  .transform((value) => (value === "" || value === null || value === undefined ? null : value));

export const EvolutionTemplateSchema = z.object({
  name: optionalText.pipe(z.string().min(2, "Nome é obrigatório.")),
  description: optionalText.optional(),
  category: optionalText.optional(),
  isDefault: z.boolean(),
});

export const EvolutionTemplateFieldSchema = z
  .object({
    label: optionalText.pipe(z.string().min(2, "Nome do campo é obrigatório.")),
    type: z.enum(evolutionFieldTypes),
    unit: z.enum(evolutionFieldUnits),
    minValue: optionalNumber,
    maxValue: optionalNumber,
    targetValue: optionalNumber,
    expectedDirection: z.enum(evolutionDirections),
    weight: z.coerce.number({ error: "Informe um peso válido." }).min(0.01, "Peso deve ser maior que zero."),
    required: z.boolean(),
    showInChart: z.boolean(),
    order: z.coerce.number({ error: "Informe uma ordem válida." }).int("Ordem deve ser um número inteiro.").min(0, "Ordem inválida."),
    optionsJson: optionalText.optional(),
  })
  .refine(
    (data) => data.minValue === null || data.maxValue === null || data.minValue < data.maxValue,
    {
      path: ["maxValue"],
      message: "O valor máximo precisa ser maior que o valor mínimo.",
    },
  )
  .refine(
    (data) => data.targetValue === null || data.minValue === null || data.targetValue >= data.minValue,
    {
      path: ["targetValue"],
      message: "A meta precisa ser maior ou igual ao valor mínimo.",
    },
  )
  .refine(
    (data) => data.targetValue === null || data.maxValue === null || data.targetValue <= data.maxValue,
    {
      path: ["targetValue"],
      message: "A meta precisa ser menor ou igual ao valor máximo.",
    },
  );

export type EvolutionTemplateFormData = z.infer<typeof EvolutionTemplateSchema>;
export type EvolutionTemplateFieldFormData = z.infer<typeof EvolutionTemplateFieldSchema>;
