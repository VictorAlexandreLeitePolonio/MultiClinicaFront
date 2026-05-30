import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DataTable } from "./DataTable";

interface Row {
  id: number;
  name: string;
}

const columns = [{ key: "name", label: "Nome" }];

describe("DataTable", () => {
  it("renders rows through the public column API", () => {
    render(
      <DataTable
        columns={columns}
        data={[{ id: 1, name: "Clínica Centro" }]}
        keyExtractor={(row) => row.id}
      />
    );

    expect(screen.getByRole("columnheader", { name: "Nome" })).toBeInTheDocument();
    expect(screen.getByText("Clínica Centro")).toBeInTheDocument();
  });

  it("renders the empty state", () => {
    render(
      <DataTable<Row>
        columns={columns}
        data={[]}
        emptyMessage="Nenhuma clínica encontrada."
        keyExtractor={(row) => row.id}
      />
    );

    expect(screen.getByText("Nenhuma clínica encontrada.")).toBeInTheDocument();
  });

  it("renders the error state with retry", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(
      <DataTable<Row>
        columns={columns}
        data={[]}
        error="Falha ao carregar clínicas."
        keyExtractor={(row) => row.id}
        onRetry={onRetry}
      />
    );

    await user.click(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(screen.getByText("Falha ao carregar clínicas.")).toBeInTheDocument();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
