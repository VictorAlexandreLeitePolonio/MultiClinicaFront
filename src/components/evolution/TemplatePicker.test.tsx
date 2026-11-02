import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, expect, test, vi } from "vitest";
import { EvolutionTemplate } from "@/types/evolution";
import { TemplatePicker } from "./TemplatePicker";

const service = vi.hoisted(() => ({
  getEvolutionTemplates: vi.fn(),
}));

vi.mock(
  "@/app/(authenticated)/app/modelos-evolucao/services/evolution.service",
  () => service,
);

function template(overrides: Partial<EvolutionTemplate> = {}): EvolutionTemplate {
  return {
    id: 1,
    name: "Escala de dor",
    description: null,
    category: "Dor",
    isActive: true,
    isDefault: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function renderPicker(onSelect = vi.fn(), selectedTemplateIds: number[] = []) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <TemplatePicker selectedTemplateIds={selectedTemplateIds} onSelect={onSelect} />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  service.getEvolutionTemplates.mockReset();
});

test("lista fichas ativas, ignora selecionadas e filtra pela busca", async () => {
  const onSelect = vi.fn().mockResolvedValue(undefined);
  service.getEvolutionTemplates.mockResolvedValue({
    data: [
      template(),
      template({ id: 2, name: "Amplitude de movimento", category: "Mobilidade" }),
      template({ id: 3, name: "Ficha inativa", isActive: false }),
    ],
    page: 1,
    pageSize: 100,
    totalCount: 3,
    totalPages: 1,
  });

  renderPicker(onSelect, [2]);
  await userEvent.click(screen.getByRole("button", { name: "Adicionar ficha" }));

  expect(await screen.findByText("Escala de dor")).toBeInTheDocument();
  expect(screen.queryByText("Amplitude de movimento")).not.toBeInTheDocument();
  expect(screen.queryByText("Ficha inativa")).not.toBeInTheDocument();

  await userEvent.type(screen.getByPlaceholderText("Buscar ficha de medição..."), "dor");
  expect(screen.getByText("Escala de dor")).toBeInTheDocument();

  await userEvent.click(screen.getByText("Escala de dor"));

  await waitFor(() => expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 1 })));
});

test("ensina quando não há ficha ativa disponível", async () => {
  service.getEvolutionTemplates.mockResolvedValue({
    data: [],
    page: 1,
    pageSize: 100,
    totalCount: 0,
    totalPages: 0,
  });

  renderPicker();
  await userEvent.click(screen.getByRole("button", { name: "Adicionar ficha" }));

  expect(
    await screen.findByText("Nenhuma ficha de medição ativa disponível."),
  ).toBeInTheDocument();
});
