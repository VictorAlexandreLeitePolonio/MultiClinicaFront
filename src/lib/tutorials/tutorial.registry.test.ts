import { describe, expect, it } from "vitest";
import { resolveTutorialByPathname } from "./tutorial.registry";

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

  it("retorna null para /app/pacientes", () => {
    expect(resolveTutorialByPathname("/app/pacientes")).toBeNull();
  });
});
