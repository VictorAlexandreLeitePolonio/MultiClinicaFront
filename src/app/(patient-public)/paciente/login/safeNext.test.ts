import { describe, expect, it } from "vitest";
import { safeNext } from "./safeNext";

describe("safeNext", () => {
  it.each([
    ["https://x.com", "/paciente"],
    ["//x.com", "/paciente"],
    ["/\\\\x.com", "/paciente"],
    [null, "/paciente"],
    ["", "/paciente"],
    ["/paciente/agendamentos", "/paciente/agendamentos"],
    ["/hub?clinica=a", "/hub?clinica=a"],
  ])("resolve %s para %s", (next, expected) => {
    expect(safeNext(next)).toBe(expected);
  });
});
