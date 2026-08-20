import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ClinicAppointmentRequestCta } from "./ClinicAppointmentRequestCta";

let authValue: { isAuthenticated: boolean; isLoading: boolean };
vi.mock("@/contexts/PatientAuthContext", () => ({
  usePatientAuth: () => authValue,
}));

vi.mock("@/app/(patient-authenticated)/paciente/components/RequestAppointmentModal", () => ({
  RequestAppointmentModal: () => <div>modal</div>,
}));

describe("ClinicAppointmentRequestCta", () => {
  it("não renderiza quando a clínica não aceita solicitações", () => {
    authValue = { isAuthenticated: true, isLoading: false };
    const { container } = render(
      <ClinicAppointmentRequestCta clinicId={1} clinicName="C" acceptsAppointmentRequests={false} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("visitante não autenticado é direcionado ao login do paciente", () => {
    authValue = { isAuthenticated: false, isLoading: false };
    render(<ClinicAppointmentRequestCta clinicId={1} clinicName="C" acceptsAppointmentRequests />);
    const link = screen.getByRole("link", { name: /entrar para solicitar/i });
    expect(link).toHaveAttribute("href", "/paciente/login");
  });

  it("paciente autenticado vê o botão de solicitar", () => {
    authValue = { isAuthenticated: true, isLoading: false };
    render(<ClinicAppointmentRequestCta clinicId={1} clinicName="C" acceptsAppointmentRequests />);
    expect(screen.getByRole("button", { name: /solicitar consulta/i })).toBeInTheDocument();
  });
});
