import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HeroSection } from "./HeroSection";

let reducedMotion = false;

vi.mock("next/dynamic", () => ({
  default: () => () => null,
}));

vi.mock("motion/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("motion/react")>();
  return { ...actual, useReducedMotion: () => reducedMotion };
});

function stubMatchMedia(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("prefers-reduced-motion") ? matches : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe("HeroSection", () => {
  beforeEach(() => {
    reducedMotion = false;
    stubMatchMedia(false);
  });

  it("renderiza o título exato e o CTA principal para o cadastro", () => {
    render(<HeroSection />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Sua clínica no automático. Você no paciente.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Começar grátis" })).toHaveAttribute(
      "href",
      "/cadastro",
    );
  });

  it("mostra a demonstração final com a cobrança paga quando reduced motion está ativo", () => {
    reducedMotion = true;
    stubMatchMedia(true);

    render(<HeroSection />);

    expect(screen.getByText("Pago")).toBeInTheDocument();
    expect(screen.getByText("Relatório SOAP")).toBeInTheDocument();
  });
});
