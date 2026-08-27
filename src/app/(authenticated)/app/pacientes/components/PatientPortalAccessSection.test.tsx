import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PatientPortalAccessSection } from "./PatientPortalAccessSection";
import { PatientCreatedResponse } from "@/types";

const provision = vi.fn();
const resend = vi.fn();
const { toastSuccess, toastError } = vi.hoisted(() => ({
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("../hooks/portalAccess", () => ({
  useProvisionPortalAccess: () => ({ provisionPortalAccess: provision, isPending: false }),
  useResendPortalInvite: () => ({ resendPortalInvite: resend, isPending: false }),
}));

vi.mock("sonner", () => ({ toast: { success: toastSuccess, error: toastError } }));

const response = (overrides: Partial<PatientCreatedResponse> = {}): PatientCreatedResponse => ({
  id: 1,
  patientId: 1,
  patientAccountId: 10,
  patientAccountStatus: "PendingActivation",
  linkResult: "CreatedAccount",
  invitationSent: true,
  ...overrides,
});

describe("PatientPortalAccessSection", () => {
  beforeEach(() => {
    provision.mockReset();
    resend.mockReset();
    toastSuccess.mockReset();
    toastError.mockReset();
  });

  it("não renderiza nada enquanto o status é desconhecido", () => {
    const { container } = render(
      <PatientPortalAccessSection patientId={1} status={undefined} onChanged={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("paciente legado sem acesso: exibe 'Criar acesso' e provisiona", async () => {
    provision.mockResolvedValue(response({ linkResult: "CreatedAccount" }));
    const onChanged = vi.fn();
    render(<PatientPortalAccessSection patientId={7} status={null} onChanged={onChanged} />);

    expect(screen.getByText("Acesso ao portal — Sem acesso")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /reenviar convite/i })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /criar acesso/i }));

    expect(provision).toHaveBeenCalledWith(7);
    await waitFor(() => expect(onChanged).toHaveBeenCalled());
  });

  it("prioriza a falha de convite quando uma conta existente continua pendente", async () => {
    provision.mockResolvedValue(
      response({
        patientAccountStatus: "PendingActivation",
        linkResult: "LinkedExistingAccount",
        invitationSent: false,
      }),
    );
    render(<PatientPortalAccessSection patientId={7} status={null} onChanged={vi.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: /criar acesso/i }));

    await waitFor(() =>
      expect(toastSuccess).toHaveBeenCalledWith(
        "Acesso vinculado, mas não foi possível enviar o convite. Tente reenviá-lo.",
      ),
    );
  });

  it("não trata ausência de convite como falha para conta existente ativa", async () => {
    provision.mockResolvedValue(
      response({
        patientAccountStatus: "Active",
        linkResult: "LinkedExistingAccount",
        invitationSent: false,
      }),
    );
    render(<PatientPortalAccessSection patientId={7} status={null} onChanged={vi.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: /criar acesso/i }));

    await waitFor(() =>
      expect(toastSuccess).toHaveBeenCalledWith(
        "Paciente vinculado a uma conta MultiClínica existente.",
      ),
    );
    expect(toastError).not.toHaveBeenCalled();
  });

  it("conta pendente: exibe 'Reenviar convite' e reenvia", async () => {
    resend.mockResolvedValue(response({ linkResult: "AlreadyLinked" }));
    const onChanged = vi.fn();
    render(
      <PatientPortalAccessSection patientId={9} status="PendingActivation" onChanged={onChanged} />,
    );

    expect(screen.getByText("Acesso ao portal — Convite pendente")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /criar acesso/i })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /reenviar convite/i }));

    expect(resend).toHaveBeenCalledWith(9);
    await waitFor(() => expect(onChanged).toHaveBeenCalled());
  });

  it("informa erro quando o reenvio não envia o convite", async () => {
    resend.mockResolvedValue(response({ invitationSent: false, linkResult: "AlreadyLinked" }));
    render(
      <PatientPortalAccessSection patientId={9} status="PendingActivation" onChanged={vi.fn()} />,
    );

    await userEvent.click(screen.getByRole("button", { name: /reenviar convite/i }));

    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith(
        "Não foi possível reenviar o convite agora. Tente novamente.",
      ),
    );
    expect(toastSuccess).not.toHaveBeenCalled();
  });

  it("conta ativa: não oferece nenhuma ação", () => {
    render(<PatientPortalAccessSection patientId={1} status="Active" onChanged={vi.fn()} />);
    expect(screen.getByText("Acesso ao portal — Conta ativa")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
