import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PatientCharge } from "@/types/mercadoPago";
import PatientChargesPage from "./page";

const useMyCharges = vi.fn();

vi.mock("./hooks/usePatientCharges", () => ({
  useMyCharges: () => useMyCharges(),
}));

const pendingCharge: PatientCharge = {
  id: 1,
  clinicName: "Clínica Centro",
  amount: 250,
  referenceMonth: "2026-03-01",
  planName: "Plano Mensal",
  status: "Pending",
  payUrl: "https://cliniq.test/pagar/token-pendente",
};

const paidCharge: PatientCharge = {
  id: 2,
  clinicName: "Clínica Norte",
  amount: 120,
  referenceMonth: "2026-02-01",
  planName: "Plano Básico",
  status: "Paid",
  payUrl: "https://cliniq.test/pagar/token-pago",
};

const query = (data: PatientCharge[]) => ({
  data,
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
});

describe("PatientChargesPage", () => {
  beforeEach(() => {
    useMyCharges.mockReset();
  });

  it("lista as cobranças com as pendentes primeiro", () => {
    useMyCharges.mockReturnValue(query([paidCharge, pendingCharge]));

    render(<PatientChargesPage />);

    const cards = screen.getAllByTestId("patient-charge");
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveTextContent("Clínica Centro");
    expect(cards[0]).toHaveTextContent("Pendente");
    expect(cards[1]).toHaveTextContent("Clínica Norte");
    expect(cards[1]).toHaveTextContent("Paga");
    expect(screen.getByText(/250,00/)).toBeInTheDocument();
  });

  it("mostra o estado vazio quando não há cobranças", () => {
    useMyCharges.mockReturnValue(query([]));

    render(<PatientChargesPage />);

    expect(screen.getByText("Nenhuma cobrança por aqui.")).toBeInTheDocument();
  });

  it("abre o link de pagamento ao clicar em Pagar", async () => {
    useMyCharges.mockReturnValue(query([pendingCharge]));
    const openSpy = vi.spyOn(window, "open").mockReturnValue(null);

    render(<PatientChargesPage />);
    await userEvent.click(screen.getByRole("button", { name: "Pagar" }));

    expect(openSpy).toHaveBeenCalledWith(
      "https://cliniq.test/pagar/token-pendente",
      "_blank",
      "noopener,noreferrer",
    );
    openSpy.mockRestore();
  });
});
