import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MarketplaceClinicCard } from "./MarketplaceClinicCard";

vi.mock("@/components/ClinicLikeButton", () => ({
  ClinicLikeButton: () => <button type="button">curtir</button>,
}));

const clinic = {
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
  badge: null as "Featured" | "Founder" | null,
};

describe("MarketplaceClinicCard", () => {
  it("abre o detalhe pelo clinicId ao clicar", async () => {
    const onSelect = vi.fn();
    render(<MarketplaceClinicCard clinic={clinic} onSelect={onSelect} />);

    await userEvent.click(screen.getByRole("button", { name: /ver detalhes de clínica exemplo/i }));

    expect(onSelect).toHaveBeenCalledWith(42);
    expect(screen.queryByRole("link")).toBeNull();
  });

  it.each([
    ["Featured", "Destaque"],
    ["Founder", "Fundadora"],
  ] as const)("mostra o selo %s", (badge, label) => {
    render(<MarketplaceClinicCard clinic={{ ...clinic, badge }} onSelect={vi.fn()} />);

    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("não mostra selo quando o badge é nulo", () => {
    render(<MarketplaceClinicCard clinic={clinic} onSelect={vi.fn()} />);

    expect(screen.queryByText("Destaque")).not.toBeInTheDocument();
    expect(screen.queryByText("Fundadora")).not.toBeInTheDocument();
  });
});
