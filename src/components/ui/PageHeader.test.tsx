import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { PageHeader } from "./PageHeader";

test("botão Voltar não ocupa a largura toda e o título equilibra as linhas", () => {
  render(<PageHeader title="Detalhes do Agendamento" onBack={vi.fn()} />);

  const back = screen.getByRole("button", { name: "← Voltar" });
  expect(back.className).toContain("w-auto");
  expect(back.className).not.toContain("w-full");

  const title = screen.getByRole("heading", { name: "Detalhes do Agendamento" });
  expect(title.className).toContain("[text-wrap:balance]");
});

test("não renderiza o botão Voltar sem onBack", () => {
  render(<PageHeader title="Pacientes" />);

  expect(screen.queryByRole("button", { name: "← Voltar" })).not.toBeInTheDocument();
});
