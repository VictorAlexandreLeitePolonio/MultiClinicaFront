import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { EvolutionTemplateField } from "@/types/evolution";
import { EvolutionFieldInput, parseEvolutionSelectOptions } from "./EvolutionFieldInput";

function field(overrides: Partial<EvolutionTemplateField> = {}): EvolutionTemplateField {
  return {
    id: 11,
    templateId: 1,
    label: "Dor",
    key: "dor",
    type: "Number",
    unit: "Cm",
    minValue: null,
    maxValue: null,
    targetValue: 10,
    expectedDirection: "Decrease",
    weight: 1,
    required: true,
    showInChart: true,
    isActive: true,
    order: 1,
    optionsJson: null,
    ...overrides,
  };
}

test("mostra rótulo, obrigatório, valor anterior e unidade", () => {
  render(
    <EvolutionFieldInput
      field={field()}
      value={7}
      onChange={vi.fn()}
      previousValue={9}
    />,
  );

  expect(screen.getByText("Dor")).toBeInTheDocument();
  expect(screen.getByText("*")).toBeInTheDocument();
  expect(screen.getByText("antes: 9")).toBeInTheDocument();
  expect(screen.getByText("cm · Meta: 10")).toBeInTheDocument();
  expect(screen.getByRole("spinbutton")).toHaveValue(7);
});

test("edita número e texto", async () => {
  const numberChange = vi.fn();
  const { rerender } = render(
    <EvolutionFieldInput field={field()} value={7} onChange={numberChange} />,
  );

  const input = screen.getByRole("spinbutton");
  fireEvent.change(input, { target: { value: "8" } });
  expect(numberChange).toHaveBeenLastCalledWith("8");

  const textChange = vi.fn();
  rerender(
    <EvolutionFieldInput
      field={field({ type: "Text", unit: "None", label: "Observação", required: false })}
      value=""
      onChange={textChange}
      showRequired={false}
    />,
  );

  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Melhora" } });
  expect(textChange).toHaveBeenLastCalledWith("Melhora");
});

test("lê as opções de seleção e alterna o sim/não", async () => {
  expect(
    parseEvolutionSelectOptions('[{"label":"Leve","value":1},{"label":"Forte","value":3}]'),
  ).toEqual([
    { label: "Leve", value: 1 },
    { label: "Forte", value: 3 },
  ]);
  expect(parseEvolutionSelectOptions("inválido")).toEqual([]);

  const selectChange = vi.fn();
  const { rerender } = render(
    <EvolutionFieldInput
      field={field({
        type: "SelectScore",
        unit: "Score",
        label: "Intensidade",
        optionsJson: '[{"label":"Leve","value":1},{"label":"Forte","value":3}]',
      })}
      value=""
      onChange={selectChange}
    />,
  );

  await userEvent.selectOptions(screen.getByRole("combobox"), "3");
  expect(selectChange).toHaveBeenLastCalledWith("3");

  const booleanChange = vi.fn();
  rerender(
    <EvolutionFieldInput
      field={field({ type: "Boolean", unit: "None", label: "Reflexo" })}
      value={false}
      onChange={booleanChange}
    />,
  );

  await userEvent.click(screen.getByRole("checkbox"));
  expect(booleanChange).toHaveBeenCalledWith(true);
});
