import { describe, expect, it } from "vitest";
import { canAccessTutorial, filterAccessibleSteps, resolveTutorialByPathname } from "./tutorial.registry";
import type { TutorialStep } from "./tutorial.types";

describe("resolveTutorialByPathname", () => {
  it("resolve /app/agenda para o tutorial da agenda", () => {
    expect(resolveTutorialByPathname("/app/agenda")?.id).toBe("agenda");
  });

  it("resolve /app/agenda?mode=create ignorando query string", () => {
    expect(resolveTutorialByPathname("/app/agenda?mode=create")?.id).toBe("agenda");
  });

  it("retorna null para /app", () => {
    expect(resolveTutorialByPathname("/app")).toBeNull();
  });

  it("retorna null para uma rota fora de /app", () => {
    expect(resolveTutorialByPathname("/login")).toBeNull();
  });
});

describe("canAccessTutorial", () => {
  it("permite quando não há restrição", () => {
    expect(canAccessTutorial({}, "Recepcao", () => false)).toBe(true);
  });

  it("bloqueia quando a role do usuário não está na lista", () => {
    expect(canAccessTutorial({ roles: ["Administrador"] }, "Recepcao", () => true)).toBe(false);
  });

  it("permite quando a role do usuário está na lista", () => {
    expect(canAccessTutorial({ roles: ["Administrador"] }, "Administrador", () => true)).toBe(true);
  });

  it("bloqueia quando não há usuário e há restrição de role", () => {
    expect(canAccessTutorial({ roles: ["Administrador"] }, undefined, () => true)).toBe(false);
  });

  it("bloqueia quando can(permission) retorna false", () => {
    expect(canAccessTutorial({ permission: "estoque.produtos.visualizar" }, "Recepcao", () => false)).toBe(
      false,
    );
  });

  it("permite quando can(permission) retorna true", () => {
    expect(canAccessTutorial({ permission: "estoque.produtos.visualizar" }, "Recepcao", () => true)).toBe(
      true,
    );
  });
});

describe("filterAccessibleSteps", () => {
  const steps: TutorialStep[] = [
    { id: "public", target: "[data-a]", title: "Público", description: "" },
    { id: "admin-only", target: "[data-b]", title: "Admin", description: "", roles: ["Administrador"] },
    {
      id: "permission-only",
      target: "[data-c]",
      title: "Permissão",
      description: "",
      permission: "clinic.settings.update",
    },
  ];

  it("mantém apenas os steps acessíveis para a role/permission do usuário", () => {
    const result = filterAccessibleSteps(steps, "Recepcao", () => false);
    expect(result.map((s) => s.id)).toEqual(["public"]);
  });

  it("mantém todos os steps para quem tem role e permission", () => {
    const result = filterAccessibleSteps(steps, "Administrador", () => true);
    expect(result.map((s) => s.id)).toEqual(["public", "admin-only", "permission-only"]);
  });
});
