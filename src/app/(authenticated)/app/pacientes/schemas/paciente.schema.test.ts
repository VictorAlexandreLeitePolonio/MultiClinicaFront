import { describe, expect, it } from "vitest";
import { PacienteSchema } from "./paciente.schema";

const validBase = {
  name: "João Silva",
  email: "joao@example.com",
  cpf: "529.982.247-25", // CPF válido
  rg: "",
  phone: "(11) 99999-9999",
  rua: "",
  numero: "",
  bairro: "",
  cidade: "",
  estado: "",
  cep: "",
};

describe("PacienteSchema", () => {
  it("rejeita e-mail vazio", () => {
    const result = PacienteSchema.safeParse({ ...validBase, email: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const emailIssue = result.error.issues.find((i) => i.path[0] === "email");
      expect(emailIssue?.message).toBe("E-mail é obrigatório");
    }
  });

  it("rejeita e-mail inválido", () => {
    const result = PacienteSchema.safeParse({ ...validBase, email: "não-é-email" });
    expect(result.success).toBe(false);
  });

  it("mantém CPF e telefone obrigatórios", () => {
    expect(PacienteSchema.safeParse({ ...validBase, cpf: "" }).success).toBe(false);
    expect(PacienteSchema.safeParse({ ...validBase, phone: "" }).success).toBe(false);
  });

  it("aceita um cadastro válido", () => {
    expect(PacienteSchema.safeParse(validBase).success).toBe(true);
  });
});
