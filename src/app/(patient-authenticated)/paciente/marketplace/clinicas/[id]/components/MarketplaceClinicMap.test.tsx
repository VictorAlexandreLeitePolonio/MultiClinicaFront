import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MarketplaceClinicMap } from "./MarketplaceClinicMap";

describe("MarketplaceClinicMap", () => {
  it("mantém estado discreto quando não há coordenadas", () => {
    render(
      <MarketplaceClinicMap
        latitude={null}
        longitude={null}
        displayName="Clínica"
        address="Rua X"
      />,
    );

    expect(screen.getByText("Localização no mapa indisponível")).toBeInTheDocument();
  });
});
