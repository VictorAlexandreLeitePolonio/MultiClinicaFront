import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RequestAppointmentModal } from "./RequestAppointmentModal";

// Data sempre no futuro: o input tem min={hoje} e uma data fixa quebraria o teste com o tempo.
const { mutateAsync, refetch, toastError, futureDate } = vi.hoisted(() => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  const offset = date.getTimezoneOffset() * 60_000;
  return {
    mutateAsync: vi.fn(),
    refetch: vi.fn(),
    toastError: vi.fn(),
    futureDate: new Date(date.getTime() - offset).toISOString().slice(0, 10),
  };
});

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: toastError } }));
vi.mock("../hooks/usePatientPortal", () => ({
  useCreateAppointmentRequest: () => ({ mutateAsync, isPending: false }),
  useClinicAvailability: () => ({
    data: {
      date: futureDate,
      durationMinutes: 60,
      timeZoneId: "America/Sao_Paulo",
      slots: [{ start: `${futureDate}T10:00:00-03:00`, end: `${futureDate}T11:00:00-03:00`, capacity: 1 }],
    },
    isLoading: false,
    isError: false,
    refetch,
  }),
}));

describe("RequestAppointmentModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mutateAsync.mockRejectedValue({
      isAxiosError: true,
      response: { status: 409, data: { code: "SlotUnavailable" } },
    });
  });

  it("keeps date and reason, clears only the slot and refetches on SlotUnavailable", async () => {
    const user = userEvent.setup();
    render(<RequestAppointmentModal open clinicId={4} clinicName="Clínica" onClose={vi.fn()} />);

    const date = screen.getByLabelText("Data");
    await user.clear(date);
    await user.type(date, futureDate);
    await user.click(screen.getByRole("button", { name: "10:00" }));
    await user.type(screen.getByLabelText(/Motivo/), "Avaliação inicial");
    await user.click(screen.getByRole("button", { name: "Enviar solicitação" }));

    await waitFor(() => expect(refetch).toHaveBeenCalled());
    expect(date).toHaveValue(futureDate);
    expect(screen.getByLabelText(/Motivo/)).toHaveValue("Avaliação inicial");
    expect(screen.getByRole("button", { name: "10:00" })).toHaveAttribute("aria-pressed", "false");
    expect(toastError).toHaveBeenCalledWith(
      "O horário selecionado não está mais disponível. Escolha outro horário.",
    );
  });
});
