import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ClinicCard } from "./ClinicCard";
import { PatientClinic } from "@/types";

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

  it("navega para o perfil público /clinicas/{slug}", () => {
    render(<ClinicCard clinic={base} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/clinicas/clinica-centro");
  });

  it("sem slug não vira link", () => {
    render(<ClinicCard clinic={{ ...base, slug: null }} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
