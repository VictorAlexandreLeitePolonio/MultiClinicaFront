import { z } from "zod";

export const ClinicCreateSchema = z
  .object({
    name: z.string().min(2, "Nome da clínica é obrigatório"),
    document: z.string().optional(),
    email: z.union([z.string().email("E-mail inválido"), z.literal("")]).optional(),
    phone: z.string().optional(),
    rua: z.string().optional(),
    numero: z.string().optional(),
    bairro: z.string().optional(),
    cidade: z.string().optional(),
    estado: z.string().optional(),
    cep: z.string().optional(),
    billingEnabled: z.boolean(),
    monthlyFee: z.number().min(0, "Mensalidade não pode ser negativa"),
    status: z.enum(["Active", "Inactive"]),
    internalNotes: z.string().optional(),
    createFirstAdmin: z.boolean(),
    adminName: z.string().optional(),
    adminEmail: z.string().optional(),
    adminPassword: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.createFirstAdmin) {
      ctx.addIssue({
        code: "custom",
        path: ["createFirstAdmin"],
        message: "A API exige o primeiro administrador da clínica",
      });
      return;
    }

    if (!data.adminName || data.adminName.trim().length < 2) {
      ctx.addIssue({
        code: "custom",
        path: ["adminName"],
        message: "Nome do administrador é obrigatório",
      });
    }

    if (!data.adminEmail || !z.string().email().safeParse(data.adminEmail).success) {
      ctx.addIssue({
        code: "custom",
        path: ["adminEmail"],
        message: "E-mail do administrador é obrigatório",
      });
    }

    if (!data.adminPassword || data.adminPassword.length < 6) {
      ctx.addIssue({
        code: "custom",
        path: ["adminPassword"],
        message: "Senha deve ter no mínimo 6 caracteres",
      });
    }
  });

export type ClinicCreateFormData = z.infer<typeof ClinicCreateSchema>;

export const clinicDataFields = ["name", "document", "email", "phone"] as const;
export const clinicAddressFields = ["rua", "numero", "bairro", "cidade", "estado", "cep"] as const;
export const clinicBillingFields = ["billingEnabled", "monthlyFee", "status", "internalNotes"] as const;
export const clinicAdminFields = ["createFirstAdmin", "adminName", "adminEmail", "adminPassword"] as const;
