import { describe, expect, it } from "vitest";
import { firstName } from "./DashboardCommandBar";

describe("firstName", () => {
  it("pula o título antes do nome", () => {
    expect(firstName("Dra. Ana Ribeiro")).toBe("Ana");
    expect(firstName("dr João Souza")).toBe("João");
  });

  it("usa o primeiro nome quando não há título", () => {
    expect(firstName("Mariana Costa")).toBe("Mariana");
  });

  it("devolve vazio sem nome", () => {
    expect(firstName(null)).toBe("");
    expect(firstName("   ")).toBe("");
  });
});
