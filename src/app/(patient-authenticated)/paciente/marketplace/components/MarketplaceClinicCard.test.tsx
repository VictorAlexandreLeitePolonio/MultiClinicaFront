import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MarketplaceClinicCard } from "./MarketplaceClinicCard";

vi.mock("@/components/ClinicLikeButton", () => ({
  ClinicLikeButton: () => <button type="button">curtir</button>,
}));

describe("MarketplaceClinicCard", () => {
  it("navega para o detalhe usando clinicId e não slug", () => {
    render(
      <MarketplaceClinicCard
        clinic={{
          id: 42,
          slug: "clinica-exemplo",
          displayName: "Clínica Exemplo",
          logoUrl: null,
          coverUrl: null,
          categories: [{ id: 1, name: "Psicologia", slug: "psicologia" }],
          city: "Itapetininga",
          state: "SP",
          likeCount: 10,
          likedByMe: false,
          acceptsAppointmentRequests: true,
        }}
      />,
    );

    expect(screen.getByRole("link", { name: /ver detalhes de clínica exemplo/i })).toHaveAttribute(
      "href",
      "/paciente/marketplace/clinicas/42",
    );
    expect(screen.getByRole("button", { name: "curtir" }).closest("a")).toBeNull();
  });
});
