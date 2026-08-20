import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AppointmentRequestDetails } from "./AppointmentRequestDetails";
import { AppointmentRequest } from "@/types";

const base: AppointmentRequest = {
  id: 1,
  patientAccountId: 5,
  clinicId: 2,
  clinicName: "Clínica Centro",
  patientName: "João Silva",
  requestedDate: "2026-08-25T14:00:00",
  reason: "Avaliação inicial",
  status: "Pending",
  responseReason: null,
  cancelledBy: null,
  respondedAt: null,
  appointmentId: null,
  createdAt: "2026-08-19T10:00:00",
};

describe("AppointmentRequestDetails", () => {
  it("mostra paciente, motivo e ações quando pendente", async () => {
    const onAccept = vi.fn();
    const onReject = vi.fn();
    const onCancel = vi.fn();
    render(
      <AppointmentRequestDetails request={base} onAccept={onAccept} onReject={onReject} onCancel={onCancel} />,
    );

    expect(screen.getByText("João Silva")).toBeInTheDocument();
    expect(screen.getByText(/Avaliação inicial/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Aceitar" }));
    expect(onAccept).toHaveBeenCalledWith(base);
    await userEvent.click(screen.getByRole("button", { name: "Recusar" }));
    expect(onReject).toHaveBeenCalledWith(base);
  });

  it("não oferece ações em status finalizado e mostra motivo da recusa", () => {
    render(
      <AppointmentRequestDetails
        request={{ ...base, status: "Rejected", responseReason: "Agenda cheia" }}
        onAccept={vi.fn()}
        onReject={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.queryByRole("button", { name: "Aceitar" })).not.toBeInTheDocument();
    expect(screen.getByText(/Motivo da recusa/)).toBeInTheDocument();
    expect(screen.getByText(/Agenda cheia/)).toBeInTheDocument();
  });
});
