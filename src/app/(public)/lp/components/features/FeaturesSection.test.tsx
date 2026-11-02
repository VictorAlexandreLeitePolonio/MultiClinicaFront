import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { FeaturesSection } from "./FeaturesSection";
import { IntegrationSection } from "./IntegrationSection";

beforeAll(() => {
  class MockIntersectionObserver {
    root = null;
    rootMargin = "";
    thresholds = [];
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }

  class MockResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  vi.stubGlobal("ResizeObserver", MockResizeObserver);
});

describe("FeaturesSection", () => {
  it("mostra as quatro funcionalidades da clínica", () => {
    render(<FeaturesSection />);

    for (const title of [
      "Consulta gravada com relatório SOAP",
      "Prontuário com evolução que se mede",
      "Agenda e copiloto no WhatsApp",
      "Cobrança online",
    ]) {
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    }
  });
});

describe("IntegrationSection", () => {
  it("mostra os cinco nós de integração ligados à Cliniq Care", () => {
    render(<IntegrationSection />);

    expect(screen.getByRole("heading", { name: "Tudo conversa com tudo" })).toBeInTheDocument();

    for (const label of ["WhatsApp", "Agenda", "Prontuário", "Mercado Pago", "Copiloto IA"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });
});
