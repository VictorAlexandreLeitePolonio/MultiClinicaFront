import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ClinicMap } from "./ClinicMap";

describe("ClinicMap", () => {
  it("mantém estado discreto quando não há coordenadas", () => {
    render(
      <ClinicMap
        latitude={null}
        longitude={null}
        displayName="Clínica"
        address="Rua X"
      />,
    );

    expect(screen.getByText("Localização no mapa indisponível")).toBeInTheDocument();
  });
});
