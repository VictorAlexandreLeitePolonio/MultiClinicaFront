import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PatientShell } from "./PatientShell";

vi.mock("next/navigation", () => ({
  usePathname: () => "/paciente/marketplace",
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock("@/contexts/PatientAuthContext", () => ({
  usePatientAuth: () => ({ logout: vi.fn() }),
}));

describe("PatientShell", () => {
  it("exibe Marketplace na navegação desktop e mobile", () => {
    render(<PatientShell>conteúdo</PatientShell>);

    const links = screen.getAllByRole("link", { name: "Marketplace" });
    expect(links).toHaveLength(2);
    links.forEach((link) => expect(link).toHaveAttribute("href", "/paciente/marketplace"));
  });
});
