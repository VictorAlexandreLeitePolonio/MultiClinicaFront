import {
  EvolutionFieldType,
  EvolutionTemplateField,
  PatientEvolutionValue,
} from "@/types/evolution";

export type EvolutionFormValue = string | number | boolean | null | undefined;
export type EvolutionFormValues = Record<number, EvolutionFormValue>;

const numericFieldTypes: EvolutionFieldType[] = [
  "Number",
  "Scale",
  "Percentage",
  "SelectScore",
];

export function isNumericEvolutionField(type: EvolutionFieldType): boolean {
  return numericFieldTypes.includes(type);
}

export function buildEvolutionValuesPayload(
  fields: EvolutionTemplateField[],
  values: EvolutionFormValues,
): PatientEvolutionValue[] {
  return fields
    .filter((field) => field.isActive)
    .map((field) => {
      const rawValue = values[field.id];
      const base = {
        fieldId: field.id,
        valueNumber: null,
        valueText: null,
        valueBoolean: null,
        valueJson: null,
      };

      if (isNumericEvolutionField(field.type)) {
        const valueNumber =
          rawValue === "" || rawValue === null || rawValue === undefined
            ? null
            : Number(rawValue);

        return {
          ...base,
          valueNumber: Number.isFinite(valueNumber) ? valueNumber : null,
        };
      }

      if (field.type === "Boolean") {
        return {
          ...base,
          valueBoolean: typeof rawValue === "boolean" ? rawValue : Boolean(rawValue),
        };
      }

      return {
        ...base,
        valueText: typeof rawValue === "string" ? rawValue.trim() : null,
      };
    })
    .filter((value) =>
      value.valueNumber !== null ||
      value.valueText !== null ||
      value.valueBoolean !== null
    );
}

export function getInitialEvolutionFormValues(
  fields: EvolutionTemplateField[],
  evolutionValues?: PatientEvolutionValue[],
): EvolutionFormValues {
  const valueByFieldId = new Map(
    evolutionValues?.map((value) => [value.fieldId, value]) ?? [],
  );

  return fields.reduce<EvolutionFormValues>((acc, field) => {
    const existing = valueByFieldId.get(field.id);
    if (!existing) {
      acc[field.id] = field.type === "Boolean" ? false : "";
      return acc;
    }

    if (isNumericEvolutionField(field.type)) {
      acc[field.id] = existing.valueNumber ?? "";
    } else if (field.type === "Boolean") {
      acc[field.id] = existing.valueBoolean ?? false;
    } else {
      acc[field.id] = existing.valueText ?? "";
    }

    return acc;
  }, {});
}
