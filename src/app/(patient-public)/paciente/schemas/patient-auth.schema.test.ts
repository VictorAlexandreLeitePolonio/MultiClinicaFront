import { describe, expect, it } from "vitest";
import {
  patientLoginSchema,
  activateAccountSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "./patient-auth.schema";

describe("patient-auth schemas", () => {
  it("login exige e-mail e senha", () => {
    expect(patientLoginSchema.safeParse({ email: "", password: "" }).success).toBe(false);
    expect(patientLoginSchema.safeParse({ email: "a@b.com", password: "x" }).success).toBe(true);
  });

  it("ativação exige senha com no mínimo 8 caracteres", () => {
    expect(
      activateAccountSchema.safeParse({ password: "1234567", confirmPassword: "1234567" }).success,
    ).toBe(false);
    expect(
      activateAccountSchema.safeParse({ password: "12345678", confirmPassword: "12345678" }).success,
    ).toBe(true);
  });

  it("ativação rejeita senhas divergentes", () => {
    const result = activateAccountSchema.safeParse({ password: "12345678", confirmPassword: "87654321" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === "confirmPassword")).toBe(true);
    }
  });

  it("forgot-password exige e-mail válido", () => {
    expect(forgotPasswordSchema.safeParse({ email: "" }).success).toBe(false);
    expect(forgotPasswordSchema.safeParse({ email: "a@b.com" }).success).toBe(true);
  });

  it("reset exige confirmação coincidente", () => {
    expect(
      resetPasswordSchema.safeParse({ password: "12345678", confirmPassword: "12345678" }).success,
    ).toBe(true);
    expect(
      resetPasswordSchema.safeParse({ password: "12345678", confirmPassword: "nope" }).success,
    ).toBe(false);
  });

  it("troca de senha exige senha atual e nova válida", () => {
    expect(
      changePasswordSchema.safeParse({
        currentPassword: "",
        newPassword: "12345678",
        confirmPassword: "12345678",
      }).success,
    ).toBe(false);
    expect(
      changePasswordSchema.safeParse({
        currentPassword: "old",
        newPassword: "12345678",
        confirmPassword: "12345678",
      }).success,
    ).toBe(true);
  });
});
