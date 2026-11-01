import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { ConsultationStatusIcon } from "./ConsultationStatusIcon";

test.each([
  ["Recording", "Consulta em gravação"],
  ["Processing", "Consulta em processamento"],
  ["Ready", "Relatório pronto"],
  ["Interrupted", "Consulta interrompida"],
  ["Failed", "Falha na consulta"],
] as const)("mostra o ícone de %s com o rótulo em português", (status, label) => {
  render(<ConsultationStatusIcon status={status} />);

  expect(screen.getByRole("img", { name: label })).toBeInTheDocument();
});

test("distingue relatório revisado de pronto", () => {
  render(<ConsultationStatusIcon status="Ready" reviewed />);

  expect(
    screen.getByRole("img", { name: "Relatório revisado" }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("img", { name: "Relatório pronto" }),
  ).not.toBeInTheDocument();
});

test("não renderiza nada sem relatório", () => {
  const { container } = render(<ConsultationStatusIcon status={null} />);

  expect(container).toBeEmptyDOMElement();
});
