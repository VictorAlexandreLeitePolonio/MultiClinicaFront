import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Patient } from "@/types";
import PacienteList from "./PacienteList";

const hooks = vi.hoisted(() => ({
  refetch: vi.fn(),
  deletePaciente: vi.fn(),
  changeStatus: vi.fn(),
  importPatients: vi.fn(),
  patients: [] as Patient[],
}));

vi.mock("../hooks/pagined", () => ({
  usePacientesPaginated: () => ({
    data: hooks.patients,
    page: 1,
    setPage: vi.fn(),
    pageSize: 10,
    setPageSize: vi.fn(),
    totalPages: 0,
    loading: false,
    error: null,
    search: "",
    setSearch: vi.fn(),
    applyFilters: vi.fn(),
    clearFilters: vi.fn(),
    refetch: hooks.refetch,
  }),
}));

vi.mock("../hooks/delete", () => ({
  usePacienteDelete: () => ({ deletePaciente: hooks.deletePaciente, isPending: false }),
}));

vi.mock("../hooks/changeStatus", () => ({
  usePacienteChangeStatus: () => ({ changeStatus: hooks.changeStatus, loading: false }),
}));

vi.mock("../hooks/import", () => ({
  usePatientImport: () => ({ mutate: hooks.importPatients, isPending: false, error: null }),
}));

const patient: Patient = {
  id: 1,
  name: "Ana Souza",
  email: "ana@cliniq.local",
  cpf: null,
  rg: null,
  phone: "11999990000",
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
  nextAppointmentAt: null,
  lastSessionAt: null,
};

const renderList = (onVerPerfil = vi.fn()) =>
  render(
    <PacienteList
      onCreate={vi.fn()}
      onViewDetails={vi.fn()}
      onVerPerfil={onVerPerfil}
    />,
  );

describe("PacienteList import action", () => {
  beforeEach(() => {
    hooks.patients = [];
    window.localStorage.clear();
    hooks.refetch.mockReset();
    hooks.deletePaciente.mockReset();
    hooks.changeStatus.mockReset();
    hooks.importPatients.mockReset();
  });

  it("opens a single-file CSV/XLSX import dialog from the list header", async () => {
    render(<PacienteList onCreate={vi.fn()} onViewDetails={vi.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: /importar pacientes/i }));

    expect(await screen.findByRole("dialog", { name: /importar pacientes/i })).toBeInTheDocument();
    expect(screen.getByText(/apenas a coluna name é obrigatória/i)).toBeInTheDocument();
    expect(screen.getByText(/sem e-mail.*sem notificação/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /baixar template/i })).toHaveAttribute(
      "href", "/templates/template-importacao-pacientes.xlsx",
    );
    expect(screen.getByText(/data de nascimento: dd\/mm\/aaaa ou aaaa-mm-dd/i)).toBeInTheDocument();

    const fileInput = screen.getByLabelText(/arquivo.*xlsx.*csv/i);
    expect(fileInput).toHaveAttribute("accept", ".xlsx,.csv");
    expect(fileInput).not.toHaveAttribute("multiple");
    await userEvent.upload(fileInput, new File(["Name\nMaria"], "patients.csv", { type: "text/csv" }));
    expect(await screen.findByText("patients.csv")).toBeInTheDocument();
  });

  it("shows the row report and refreshes the list when at least one patient was imported", async () => {
    hooks.importPatients.mockResolvedValue({
      importId: "import-1",
      status: "CompletedWithErrors",
      totalRows: 2,
      importedCount: 1,
      rejectedCount: 1,
      emailsQueuedCount: 0,
      emailsSkippedNoEmailCount: 1,
      results: [
        { row: 2, status: "Imported", patientId: 42, emailStatus: "SkippedNoEmail", errors: [] },
        {
          row: 3,
          status: "Rejected",
          patientId: null,
          emailStatus: null,
          errors: [{ field: "Name", code: "EMPTY_FIELD", message: "Nome é obrigatório." }],
        },
      ],
    });
    const user = userEvent.setup();
    render(<PacienteList onCreate={vi.fn()} onViewDetails={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /importar pacientes/i }));
    const file = new File(["Name\nAna\n"], "patients.csv", { type: "text/csv" });
    await user.upload(screen.getByLabelText(/arquivo.*xlsx.*csv/i), file);
    await user.click(screen.getByRole("button", { name: /importar arquivo/i }));

    expect(hooks.importPatients).toHaveBeenCalledWith({ file, idempotencyKey: expect.any(String) });
    expect(await screen.findByText("Importados: 1")).toBeInTheDocument();
    expect(screen.getByText("Rejeitados: 1")).toBeInTheDocument();
    expect(screen.getByText(/linha 3/i)).toBeInTheDocument();
    expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument();
    expect(hooks.refetch).toHaveBeenCalledTimes(1);
  });

  it("alterna para cards e lembra a escolha no localStorage e no próximo render", async () => {
    hooks.patients = [patient];
    const onVerPerfil = vi.fn();
    const user = userEvent.setup();
    const { unmount } = renderList(onVerPerfil);

    await user.click(screen.getByRole("radio", { name: "Cards" }));

    expect(window.localStorage.getItem("cliniq:view:pacientes")).toBe("cards");
    const card = await screen.findByRole("button", { name: "Abrir perfil de Ana Souza" });
    expect(card).toBeInTheDocument();

    await user.click(card);
    expect(onVerPerfil).toHaveBeenCalledWith(1);

    unmount();
    renderList();
    expect(screen.getByRole("button", { name: "Abrir perfil de Ana Souza" })).toBeInTheDocument();
  });

  it("mostra travessão quando o paciente não tem próxima consulta nem última sessão", () => {
    hooks.patients = [patient];
    window.localStorage.setItem("cliniq:view:pacientes", "cards");

    renderList();

    const card = screen.getByRole("button", { name: "Abrir perfil de Ana Souza" });
    expect(within(card).getByText("Próxima consulta")).toBeInTheDocument();
    expect(within(card).getByText("Última sessão")).toBeInTheDocument();
    expect(within(card).getAllByText("—")).toHaveLength(2);
    expect(within(card).getByText("(11) 99999-0000")).toBeInTheDocument();
  });
});
