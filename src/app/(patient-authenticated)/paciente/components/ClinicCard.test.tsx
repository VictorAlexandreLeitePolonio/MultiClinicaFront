import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ClinicCard } from "./ClinicCard";
import { PatientClinic } from "@/types";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("../services/patient-portal.service", () => ({
  likeClinic: vi.fn(),
  unlikeClinic: vi.fn(),
}));

const base: PatientClinic = {
  id: 1,
  slug: "clinica-centro",
  displayName: "Clínica Centro",
  logoUrl: null,
  coverUrl: null,
  categories: ["Fisioterapia", "Pilates"],
  city: "São Paulo",
  state: "SP",
  likeCount: 187,
  likedByMe: false,
  acceptsAppointmentRequests: true,
};

describe("ClinicCard", () => {
  it("renderiza nome, categorias, localização e contador de likes", () => {
    render(<ClinicCard clinic={base} />);
    expect(screen.getByText("Clínica Centro")).toBeInTheDocument();
    expect(screen.getByText("Fisioterapia")).toBeInTheDocument();
    expect(screen.getByText("Pilates")).toBeInTheDocument();
    expect(screen.getByText("São Paulo / SP")).toBeInTheDocument();
    expect(screen.getByText("187")).toBeInTheDocument();
  });

  it("com slug expõe botão para abrir o detalhe", () => {
    render(<ClinicCard clinic={base} />);
    expect(
      screen.getByRole("button", { name: /ver detalhes de clínica centro/i }),
    ).toBeInTheDocument();
  });

  it("sem slug não vira botão de detalhe", () => {
    render(<ClinicCard clinic={{ ...base, slug: null }} />);
    expect(screen.queryByRole("button", { name: /ver detalhes/i })).not.toBeInTheDocument();
  });
});
