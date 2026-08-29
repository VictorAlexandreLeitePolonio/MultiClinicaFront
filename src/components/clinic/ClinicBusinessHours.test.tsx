import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ClinicBusinessHours } from "./ClinicBusinessHours";
import { BusinessHour } from "@/types";

const hours: BusinessHour[] = [
  { id: 1, dayOfWeek: "Monday", startTime: "08:00:00", endTime: "12:00:00" },
  { id: 2, dayOfWeek: "Monday", startTime: "13:00:00", endTime: "18:00:00" },
];

describe("ClinicBusinessHours", () => {
  it("mostra múltiplas faixas do dia e 'Fechado' nos demais", () => {
    render(<ClinicBusinessHours hours={hours} />);
    expect(screen.getByText("08:00 - 12:00, 13:00 - 18:00")).toBeInTheDocument();
    // Domingo (sem faixa) aparece como Fechado — há vários dias fechados.
    expect(screen.getAllByText("Fechado").length).toBeGreaterThan(0);
  });
});
