import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PatientDashboardPage from "./page";
import { PatientAppointment, PatientAppointmentRequest, PatientClinic } from "@/types";

const upcoming = vi.fn();
const clinics = vi.fn();
const requests = vi.fn();

vi.mock("./hooks/usePatientPortal", () => ({
  useUpcomingAppointments: () => upcoming(),
  useMyClinics: () => clinics(),
  useMyAppointmentRequests: () => requests(),
}));

vi.mock("@/contexts/PatientAuthContext", () => ({
  usePatientAuth: () => ({ patient: { name: "Ana" } }),
}));

const query = <T,>(data: T) => ({ data, isLoading: false, isError: false, refetch: vi.fn() });

const appointment: PatientAppointment = {
  appointmentId: 1,
  clinicId: 1,
  clinicName: "Clínica Centro",
  clinicSlug: "clinica-centro",
  professionalName: "Dra. Ana",
  appointmentDate: "2026-08-25T14:30:00",
  status: "Scheduled",
};

const pendingRequest = { status: "Pending" } as PatientAppointmentRequest;
const acceptedRequest = { status: "Accepted" } as PatientAppointmentRequest;

describe("PatientDashboardPage", () => {
  beforeEach(() => {
    upcoming.mockReset();
    clinics.mockReset();
    requests.mockReset();
  });

  it("destaca a próxima consulta e conta os indicadores", () => {
    upcoming.mockReturnValue(query<PatientAppointment[]>([appointment, { ...appointment, appointmentId: 2 }]));
    clinics.mockReturnValue(query<PatientClinic[]>([{} as PatientClinic, {} as PatientClinic, {} as PatientClinic]));
    requests.mockReturnValue(query<PatientAppointmentRequest[]>([pendingRequest, acceptedRequest]));

    render(<PatientDashboardPage />);

    expect(screen.getByText("Próxima consulta")).toBeInTheDocument();
    expect(screen.getByText("Clínica Centro")).toBeInTheDocument();
    // Consultas futuras = 2, pendentes = 1, clínicas = 3
    expect(screen.getByText("Consultas futuras").parentElement).toHaveTextContent("2");
    expect(screen.getByText("Solicitações pendentes").parentElement).toHaveTextContent("1");
    expect(screen.getByText("Clínicas vinculadas").parentElement).toHaveTextContent("3");
  });

  it("mostra estado vazio quando não há próxima consulta", () => {
    upcoming.mockReturnValue(query<PatientAppointment[]>([]));
    clinics.mockReturnValue(query<PatientClinic[]>([]));
    requests.mockReturnValue(query<PatientAppointmentRequest[]>([]));

    render(<PatientDashboardPage />);

    expect(screen.getByText("Nenhuma consulta agendada")).toBeInTheDocument();
  });
});
