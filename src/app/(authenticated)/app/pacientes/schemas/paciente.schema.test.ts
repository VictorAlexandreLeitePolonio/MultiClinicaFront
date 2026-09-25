import { describe, expect, it } from "vitest";
import { PacienteSchema, PacienteUpdateSchema } from "./paciente.schema";

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

  it("aceita nascimento bissexto válido e rejeita datas impossíveis ou futuras", () => {
    expect(PacienteSchema.safeParse({ ...validBase, birthDate: "2000-02-29" }).success).toBe(true);
    expect(PacienteSchema.safeParse({ ...validBase, birthDate: "2025-02-29" }).success).toBe(false);
    expect(PacienteSchema.safeParse({ ...validBase, birthDate: "2999-01-01" }).success).toBe(false);
  });
});

describe("PacienteUpdateSchema", () => {
  it("permite editar somente nome e cidade sem dados opcionais", () => {
    expect(PacienteUpdateSchema.safeParse({ ...validBase, name: "Maria", email: "", cpf: "", phone: "", cidade: "Recife" }).success).toBe(true);
  });

  it("exige nome e valida opcionais apenas quando preenchidos", () => {
    expect(PacienteUpdateSchema.safeParse({ ...validBase, name: "  ", email: "", cpf: "", phone: "" }).success).toBe(false);
    expect(PacienteUpdateSchema.safeParse({ ...validBase, email: "inválido" }).success).toBe(false);
    expect(PacienteUpdateSchema.safeParse({ ...validBase, cpf: "123" }).success).toBe(false);
    expect(PacienteUpdateSchema.safeParse({ ...validBase, phone: "123" }).success).toBe(false);
    expect(PacienteUpdateSchema.safeParse({ ...validBase, cep: "123" }).success).toBe(false);
    expect(PacienteUpdateSchema.safeParse({ ...validBase, birthDate: "2999-01-01" }).success).toBe(false);
  });
});
