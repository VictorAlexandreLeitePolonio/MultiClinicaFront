import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ClinicDetailModal } from "./ClinicDetailModal";

vi.mock("@/contexts/PatientAuthContext", () => ({
  PatientAuthProvider: ({ children }: { children: ReactNode }) => children,
}));

vi.mock("./usePublicClinic", () => ({
  usePublicClinic: () => ({ isLoading: true, isError: false, notFound: false }),
}));

vi.mock("@/app/(patient-authenticated)/paciente/marketplace/hooks/useMarketplace", () => ({
  useMarketplaceClinic: () => ({ isLoading: true, isError: false }),
}));

describe("ClinicDetailModal", () => {
  it("mantém a rolagem no conteúdo liberado pelo Radix", () => {
    render(
      <ClinicDetailModal
        source={{ mode: "public", slug: "clinica-teste" }}
        onClose={vi.fn()}
      />,
    );

    const dialog = screen.getByRole("dialog");

    expect(dialog.closest(".overflow-y-auto")).toBe(dialog);
    expect(dialog).toHaveClass("max-h-[calc(100dvh-2rem)]");
  });
});
