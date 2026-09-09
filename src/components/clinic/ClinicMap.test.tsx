import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ClinicMap } from "./ClinicMap";

const { mapConstructor, setWorkerUrl } = vi.hoisted(() => ({
  mapConstructor: vi.fn(),
  setWorkerUrl: vi.fn(),
}));

vi.mock("maplibre-gl", () => {
  class Map {
    constructor(options: unknown) {
      mapConstructor(options);
    }

    addControl() {
      return this;
    }

    on() {
      return this;
    }

    remove() {}
  }

  class NavigationControl {}

  class Popup {
    setText() {
      return this;
    }
  }

  class Marker {
    setLngLat() {
      return this;
    }

    setPopup() {
      return this;
    }

    addTo() {
      return this;
    }
  }

  return { Map, Marker, NavigationControl, Popup, setWorkerUrl };
});

describe("ClinicMap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv(
      "NEXT_PUBLIC_MAP_STYLE_URL",
      "https://tiles.openfreemap.org/styles/bright",
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

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

  it("configura o worker same-origin antes de criar o mapa", async () => {
    render(
      <ClinicMap
        latitude={-23.59}
        longitude={-48.05}
        displayName="Clínica"
        address="Rua X"
      />,
    );

    await waitFor(() => expect(mapConstructor).toHaveBeenCalledOnce());

    expect(setWorkerUrl).toHaveBeenCalledWith(
      "/maplibre/maplibre-gl-worker.mjs",
    );
    expect(setWorkerUrl.mock.invocationCallOrder[0]).toBeLessThan(
      mapConstructor.mock.invocationCallOrder[0],
    );
  });
});
