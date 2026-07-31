import { describe, expect, it } from "vitest";
import { buildEvolutionValuesPayload } from "./evolutionPayload";
import { EvolutionTemplateField } from "@/types/evolution";

const baseField: EvolutionTemplateField = {
  id: 1,
  templateId: 1,
  label: "Campo",
  key: "campo",
  type: "Text",
  unit: "None",
  minValue: null,
  maxValue: null,
  targetValue: null,
  expectedDirection: "Neutral",
  weight: 1,
  required: false,
  showInChart: false,
  isActive: true,
  order: 1,
  optionsJson: null,
};

describe("buildEvolutionValuesPayload", () => {
  it("maps dynamic values to the API value slot expected by each field type", () => {
    const fields: EvolutionTemplateField[] = [
      { ...baseField, id: 1, type: "Scale" },
      { ...baseField, id: 2, type: "Boolean" },
      { ...baseField, id: 3, type: "Text" },
      { ...baseField, id: 4, type: "Percentage" },
    ];

    expect(
      buildEvolutionValuesPayload(fields, {
        1: "7",
        2: true,
        3: "  dor reduzida ",
        4: 82,
      }),
    ).toEqual([
      { fieldId: 1, valueNumber: 7, valueText: null, valueBoolean: null, valueJson: null },
      { fieldId: 2, valueNumber: null, valueText: null, valueBoolean: true, valueJson: null },
      { fieldId: 3, valueNumber: null, valueText: "dor reduzida", valueBoolean: null, valueJson: null },
      { fieldId: 4, valueNumber: 82, valueText: null, valueBoolean: null, valueJson: null },
    ]);
  });

  it("does not include inactive template fields in new payloads", () => {
    expect(
      buildEvolutionValuesPayload(
        [{ ...baseField, id: 10, isActive: false, type: "Number" }],
        { 10: 5 },
      ),
    ).toEqual([]);
  });
});
