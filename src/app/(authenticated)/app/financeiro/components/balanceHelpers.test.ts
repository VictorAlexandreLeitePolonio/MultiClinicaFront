import { describe, expect, it } from "vitest";
import { formatPeriod, localIso, presetRange } from "./BalancePeriodFilter";
import { outcomeShare } from "./BalanceSummary";
import { averageTicket } from "./BalanceOperations";

describe("formatPeriod", () => {
  it("junta o mês quando o período cabe nele", () => {
    expect(formatPeriod("2026-11-01", "2026-11-30")).toBe("1 a 30 de novembro de 2026");
  });
  it("mostra os dois meses no mesmo ano", () => {
    expect(formatPeriod("2026-10-04T00:00:00Z", "2026-11-02")).toBe("4 de outubro a 2 de novembro de 2026");
  });
  it("usa datas numéricas entre anos", () => {
    expect(formatPeriod("2025-12-20", "2026-01-05")).toBe("20/12/2025 a 05/01/2026");
  });
});

describe("presetRange", () => {
  it("usa a data civil local, não UTC", () => {
    // 23h em São Paulo já é o dia seguinte em UTC.
    const lateNight = new Date(2026, 10, 2, 23, 30);
    expect(localIso(lateNight)).toBe("2026-11-02");
    expect(presetRange("7d", lateNight)).toEqual({ startDate: "2026-10-27", endDate: "2026-11-02" });
  });
  it("deixa o mês corrente para o back", () => {
    expect(presetRange("month")).toEqual({});
  });
});

describe("indicadores", () => {
  it("calcula a proporção das saídas sobre as entradas", () => {
    expect(outcomeShare({ totalIncome: 2000, totalOutcome: 500 })).toBe(0.25);
    expect(outcomeShare({ totalIncome: 0, totalOutcome: 500 })).toBeNull();
  });
  it("calcula o ticket médio só com pagamentos", () => {
    expect(averageTicket({ appointmentIncome: 2920, paidAppointmentCount: 7 })).toBeCloseTo(417.14, 2);
    expect(averageTicket({ appointmentIncome: 0, paidAppointmentCount: 0 })).toBeNull();
  });
});
