import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PacienteList from "./PacienteList";

const hooks = vi.hoisted(() => ({
  refetch: vi.fn(),
  deletePaciente: vi.fn(),
  changeStatus: vi.fn(),
  importPatients: vi.fn(),
}));

vi.mock("../hooks/pagined", () => ({
  usePacientesPaginated: () => ({
    data: [],
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

describe("PacienteList import action", () => {
  beforeEach(() => {
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
});
