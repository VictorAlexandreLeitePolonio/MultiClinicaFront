import { describe, expect, it } from "vitest";
import { resolvePostLoginPath } from "./postLoginPath";

describe("resolvePostLoginPath", () => {
  it("usa o next relativo que aponta para o app", () => {
    expect(resolvePostLoginPath("/app", "/app/configuracoes/plano?assinar=Pro&ciclo=Monthly")).toBe(
      "/app/configuracoes/plano?assinar=Pro&ciclo=Monthly",
    );
  });

  it("ignora URL absoluta e caminho protocol-relative", () => {
    expect(resolvePostLoginPath("/app", "https://evil.com")).toBe("/app");
    expect(resolvePostLoginPath("/app", "//evil.com")).toBe("/app");
  });

  it("mantém o destino padrão de quem não acessa o app da clínica", () => {
    expect(resolvePostLoginPath("/superadmin", "/app/configuracoes/plano")).toBe("/superadmin");
  });
});
