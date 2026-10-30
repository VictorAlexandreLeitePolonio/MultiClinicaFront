import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LandingClinicsShowcase } from "./LandingClinicsShowcase";

vi.mock("@/components/clinic/usePublicClinics", () => ({
  usePublicClinics: () => ({
    data: [
      {
        id: 1,
        slug: "clinica-destaque",
        displayName: "Clínica Alfa",
        logoUrl: null,
        city: "Itapetininga",
        state: "SP",
        categories: [],
        likeCount: 0,
        acceptsAppointmentRequests: false,
        badge: "Featured",
      },
      {
        id: 2,
        slug: "clinica-fundadora",
        displayName: "Clínica Beta",
        logoUrl: null,
        city: "Sorocaba",
        state: "SP",
        categories: [],
        likeCount: 0,
        acceptsAppointmentRequests: false,
        badge: "Founder",
      },
      {
        id: 3,
        slug: "clinica-comum",
        displayName: "Clínica Gama",
        logoUrl: null,
        city: "Tatuí",
        state: "SP",
        categories: [],
        likeCount: 0,
        acceptsAppointmentRequests: false,
        badge: null,
      },
    ],
    isLoading: false,
    isError: false,
  }),
}));

vi.mock("@/components/clinic/ClinicDetailModal", () => ({
  ClinicDetailModal: () => null,
}));

describe("LandingClinicsShowcase", () => {
  it("mostra os selos de destaque e fundadora", () => {
    render(<LandingClinicsShowcase />);

    expect(screen.getByText("Destaque")).toBeInTheDocument();
    expect(screen.getByText("Fundadora")).toBeInTheDocument();
    expect(screen.getAllByText(/Destaque|Fundadora/)).toHaveLength(2);
  });
});
