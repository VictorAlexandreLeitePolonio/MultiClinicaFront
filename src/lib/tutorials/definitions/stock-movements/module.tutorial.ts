import type { ModuleTutorial } from "../../tutorial.types";

export const stockMovementsTutorial: ModuleTutorial = {
  id: "stock-movements",
  title: "Movimentações",
  pathname: "/app/estoque/movimentacoes",
  permission: "estoque.movimentacoes.visualizar",
  steps: [
    {
      id: "new",
      target: '[data-tutorial="stock-movements-new"]',
      title: "Registre uma movimentação",
      description: "Entrada, saída, venda, uso interno, perda ou ajuste — inicie por aqui.",
      placement: "bottom",
    },
    {
      id: "filters",
      target: '[data-tutorial="stock-movements-filters"]',
      title: "Filtre as movimentações",
      description: "Filtre por produto ou por tipo de movimentação.",
      placement: "bottom",
    },
    {
      id: "types",
      target: '[data-tutorial="stock-movements-types"]',
      title: "Tipos de movimentação",
      description: "Cada tipo representa uma forma diferente de o estoque mudar de quantidade.",
      placement: "bottom",
    },
    {
      id: "list",
      target: '[data-tutorial="stock-movements-list"]',
      title: "Acompanhe o histórico",
      description: "Aqui ficam todas as movimentações registradas.",
      placement: "top",
    },
  ],
};
