import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LandingSmoothLink } from "./LandingSmoothLink";

const { scrollTo } = vi.hoisted(() => ({ scrollTo: vi.fn() }));

vi.mock("./SmoothScroll", () => ({
  useLenis: () => ({ scrollTo }),
}));

function renderTarget() {
  const target = document.createElement("section");
  target.id = "funcionalidades";
  document.body.appendChild(target);
  return target;
}

describe("LandingSmoothLink", () => {
  beforeEach(() => {
    scrollTo.mockClear();
    document.querySelectorAll("#funcionalidades").forEach((node) => node.remove());
  });

  it("delega a rolagem para o Lenis, descontando o cabeçalho fixo", async () => {
    const target = renderTarget();
    render(
      <LandingSmoothLink href="#funcionalidades">Ver como funciona</LandingSmoothLink>,
    );

    await userEvent.click(screen.getByRole("link", { name: "Ver como funciona" }));

    expect(scrollTo).toHaveBeenCalledWith(target, { offset: -72, immediate: false });
    expect(window.location.hash).toBe("#funcionalidades");
  });

  it("não anima quando a âncora é ativada pelo teclado", async () => {
    const target = renderTarget();
    render(<LandingSmoothLink href="#funcionalidades">Ir para funcionalidades</LandingSmoothLink>);

    const link = screen.getByRole("link", { name: "Ir para funcionalidades" });
    link.focus();
    await userEvent.keyboard("{Enter}");

    expect(scrollTo).toHaveBeenCalledWith(expect.any(HTMLElement), {
      offset: -72,
      immediate: true,
    });
    expect(scrollTo.mock.calls[0][0]).toBe(target);
  });
});
