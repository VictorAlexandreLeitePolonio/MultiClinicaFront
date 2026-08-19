import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppointmentCard } from "./AppointmentCard";
import { PatientAppointment } from "@/types";

const appointment: PatientAppointment = {
  appointmentId: 10,
  clinicId: 1,
  clinicName: "Clínica Centro",
  clinicSlug: "clinica-centro",
  professionalName: "Dra. Ana",
  appointmentDate: "2026-08-25T14:30:00",
  status: "Scheduled",
};

describe("AppointmentCard", () => {
  it("expõe clínica, profissional, data, horário e status", () => {
    render(<AppointmentCard appointment={appointment} />);
    expect(screen.getByText("Clínica Centro")).toBeInTheDocument();
    expect(screen.getByText("Dra. Ana")).toBeInTheDocument();
    expect(screen.getByText("Agendada")).toBeInTheDocument();
    expect(screen.getByText("14:30")).toBeInTheDocument();
  });

  it("não renderiza campos clínicos sensíveis", () => {
    render(<AppointmentCard appointment={appointment} />);
    expect(screen.queryByText(/prontuário/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/pagamento/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/evolução/i)).not.toBeInTheDocument();
  });
});
