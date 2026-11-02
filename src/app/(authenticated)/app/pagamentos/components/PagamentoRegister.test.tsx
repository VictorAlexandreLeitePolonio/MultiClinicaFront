import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MercadoPagoStatus } from "@/types/mercadoPago";
import PagamentoRegister from "./PagamentoRegister";
import { getPatients } from "@/app/(authenticated)/app/pacientes/services/patients.service";
import { useMercadoPagoStatus } from "@/app/(authenticated)/app/configuracoes/hooks/useMercadoPago";

const insertPagamento = vi.fn();
const onSave = vi.fn();

const connected: MercadoPagoStatus = {
  connected: true,
  liveMode: true,
  revoked: false,
  acceptPix: true,
  acceptCredit: true,
  maxInstallments: 6,
  acceptDebit: true,
};

const disconnected: MercadoPagoStatus = {
  ...connected,
  connected: false,
  liveMode: false,
};

const patients = [
  {
    id: 2,
    name: "Ana Souza",
    email: "ana@example.com",
    cpf: null,
    rg: null,
    phone: null,
    rua: null,
    numero: null,
    bairro: null,
    cidade: null,
    estado: null,
    cep: null,
    birthDate: null,
    isActive: true,
    appointmentStatus: null,
    paymentStatus: null,
  },
  {
    id: 3,
    name: "Bruno Lima",
    email: null,
    cpf: null,
    rg: null,
    phone: null,
    rua: null,
    numero: null,
    bairro: null,
    cidade: null,
    estado: null,
    cep: null,
    birthDate: null,
    isActive: true,
    appointmentStatus: null,
    paymentStatus: null,
  },
];

vi.mock("../hooks/insert", () => ({
  usePagamentoInsert: () => ({ insertPagamento, isPending: false }),
}));

vi.mock("../hooks/usePlanos", () => ({
  usePlanos: () => ({
    data: [
      {
        id: 4,
        name: "Mensal",
        valor: 150,
        tipoPlano: "Mensal",
        tipoSessaoId: 1,
        tipoSessaoName: "Sessão",
        createdAt: "2026-01-01T00:00:00Z",
      },
    ],
    loading: false,
    error: null,
  }),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: 1 } }),
}));

vi.mock("@/app/(authenticated)/app/configuracoes/hooks/useMercadoPago", () => ({
  useMercadoPagoStatus: vi.fn(),
}));

vi.mock("@/app/(authenticated)/app/pacientes/services/patients.service", () => ({
  getPatients: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

function renderForm() {
  return render(<PagamentoRegister onBack={vi.fn()} onSave={onSave} />);
}

async function fillCommonFields() {
  await screen.findByRole("option", { name: "Ana Souza" });
  await userEvent.selectOptions(screen.getByLabelText(/Paciente/), "2");
  await userEvent.selectOptions(screen.getByLabelText(/Plano/), "4");
  fireEvent.change(screen.getByLabelText(/Mês de Referência/), {
    target: { value: "2026-10-01" },
  });
}

describe("PagamentoRegister", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getPatients).mockResolvedValue({
      data: patients,
      page: 1,
      pageSize: 20,
      totalCount: patients.length,
      totalPages: 1,
    });
    vi.mocked(useMercadoPagoStatus).mockReturnValue({ data: connected } as never);
  });

  it("alterna entre Manual e Online e esconde forma/status no modo online", async () => {
    renderForm();
    await fillCommonFields();

    expect(screen.getByLabelText(/Forma de pagamento/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Status/)).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("radio", { name: /Online \(Mercado Pago\)/ }),
    );

    expect(screen.queryByLabelText(/Forma de pagamento/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Status/)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("radio", { name: /Manual/ }));

    expect(screen.getByLabelText(/Forma de pagamento/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Status/)).toBeInTheDocument();
  });

  it("não oferece Online quando o Mercado Pago não está conectado", async () => {
    vi.mocked(useMercadoPagoStatus).mockReturnValue({ data: disconnected } as never);

    renderForm();

    expect(
      screen.queryByRole("radio", { name: /Online \(Mercado Pago\)/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Manual/ })).toBeChecked();
  });

  it("não oferece Online quando o status do Mercado Pago falha (402/erro)", async () => {
    vi.mocked(useMercadoPagoStatus).mockReturnValue({
      data: undefined,
      isError: true,
    } as never);

    renderForm();

    expect(
      screen.queryByRole("radio", { name: /Online \(Mercado Pago\)/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Manual/ })).toBeChecked();
  });

  it("envia o payload manual com sendOnline false", async () => {
    renderForm();
    await fillCommonFields();

    await userEvent.selectOptions(screen.getByLabelText(/Forma de pagamento/), "Pix");
    await userEvent.selectOptions(screen.getByLabelText(/Status/), "Paid");
    await userEvent.click(screen.getByRole("button", { name: "Cadastrar" }));

    await waitFor(() =>
      expect(insertPagamento).toHaveBeenCalledWith(
        expect.objectContaining({
          patientId: 2,
          planId: 4,
          referenceMonth: "2026-10-01",
          paymentMethod: "Pix",
          status: "Paid",
          sendOnline: false,
          responsavelId: 1,
        }),
      ),
    );
    expect(toast.success).toHaveBeenCalledWith("Pagamento cadastrado com sucesso!");
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("envia o payload online pendente e a caixa marcada por padrão", async () => {
    renderForm();
    await fillCommonFields();

    await userEvent.click(
      screen.getByRole("radio", { name: /Online \(Mercado Pago\)/ }),
    );

    const checkbox = screen.getByRole("checkbox", {
      name: /Enviar cobrança por e-mail ao salvar/,
    });
    expect(checkbox).toBeChecked();
    expect(checkbox).toBeEnabled();

    await userEvent.click(screen.getByRole("button", { name: "Cadastrar" }));

    await waitFor(() =>
      expect(insertPagamento).toHaveBeenCalledWith(
        expect.objectContaining({
          patientId: 2,
          planId: 4,
          referenceMonth: "2026-10-01",
          paymentMethod: "Online (Mercado Pago)",
          status: "Pending",
          sendOnline: true,
          responsavelId: 1,
        }),
      ),
    );
    expect(toast.success).toHaveBeenCalledWith("Cobrança criada e enviada por e-mail.");
  });

  it("desativa a caixa e não envia e-mail quando o paciente não tem e-mail", async () => {
    renderForm();
    await screen.findByRole("option", { name: "Bruno Lima" });
    await userEvent.selectOptions(screen.getByLabelText(/Paciente/), "3");
    await userEvent.selectOptions(screen.getByLabelText(/Plano/), "4");
    fireEvent.change(screen.getByLabelText(/Mês de Referência/), {
      target: { value: "2026-10-01" },
    });

    await userEvent.click(
      screen.getByRole("radio", { name: /Online \(Mercado Pago\)/ }),
    );

    const checkbox = screen.getByRole("checkbox", {
      name: /Enviar cobrança por e-mail ao salvar/,
    });
    expect(checkbox).not.toBeChecked();
    expect(checkbox).toBeDisabled();
    expect(
      screen.getByText(
        "Cadastre o e-mail do paciente para enviar por e-mail. O link pode ser copiado depois na lista.",
      ),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Cadastrar" }));

    await waitFor(() =>
      expect(insertPagamento).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentMethod: "Online (Mercado Pago)",
          status: "Pending",
          sendOnline: false,
        }),
      ),
    );
    expect(toast.success).toHaveBeenCalledWith("Pagamento cadastrado com sucesso!");
  });
});
