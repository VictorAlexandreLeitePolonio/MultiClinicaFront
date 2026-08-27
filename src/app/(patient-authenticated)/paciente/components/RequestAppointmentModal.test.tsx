import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RequestAppointmentModal } from "./RequestAppointmentModal";

const { mutateAsync, refetch, toastError } = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  refetch: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: toastError } }));
vi.mock("../hooks/usePatientPortal", () => ({
  useCreateAppointmentRequest: () => ({ mutateAsync, isPending: false }),
  useClinicAvailability: () => ({
    data: {
      date: "2026-08-27",
      durationMinutes: 60,
      timeZoneId: "America/Sao_Paulo",
      slots: [{ start: "2026-08-27T10:00:00-03:00", end: "2026-08-27T11:00:00-03:00", capacity: 1 }],
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
    await user.type(date, "2026-08-27");
    await user.click(screen.getByRole("button", { name: "10:00" }));
    await user.type(screen.getByLabelText(/Motivo/), "Avaliação inicial");
    await user.click(screen.getByRole("button", { name: "Enviar solicitação" }));

    await waitFor(() => expect(refetch).toHaveBeenCalled());
    expect(date).toHaveValue("2026-08-27");
    expect(screen.getByLabelText(/Motivo/)).toHaveValue("Avaliação inicial");
    expect(screen.getByRole("button", { name: "10:00" })).toHaveAttribute("aria-pressed", "false");
    expect(toastError).toHaveBeenCalledWith(
      "O horário selecionado não está mais disponível. Escolha outro horário.",
    );
  });
});
