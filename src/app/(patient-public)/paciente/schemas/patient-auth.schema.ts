import { z } from "zod";

const MIN_PASSWORD = 8;
const emailField = z.string().min(1, "E-mail é obrigatório").email("E-mail inválido");
const passwordField = z
  .string()
  .min(MIN_PASSWORD, `A senha deve ter ao menos ${MIN_PASSWORD} caracteres`);

export const patientLoginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Senha é obrigatória"),
});
export type PatientLoginFormData = z.infer<typeof patientLoginSchema>;

/** Ativação da conta: define a primeira senha. */
export const activateAccountSchema = z
  .object({
    password: passwordField,
    confirmPassword: z.string().min(1, "Confirme a senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });
export type ActivateAccountFormData = z.infer<typeof activateAccountSchema>;

export const forgotPasswordSchema = z.object({
  email: emailField,
});
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: passwordField,
    confirmPassword: z.string().min(1, "Confirme a senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Senha atual é obrigatória"),
    newPassword: passwordField,
    confirmPassword: z.string().min(1, "Confirme a nova senha"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
