import type { ModuleTutorial } from "../../tutorial.types";

export const purchasesTutorial: ModuleTutorial = {
  id: "purchases",
  title: "Compras",
  pathname: "/app/estoque/compras",
  permission: "compras.visualizar",
  steps: [
    {
      id: "new",
      target: '[data-tutorial="purchases-new"]',
      title: "Registre uma compra",
      description: "Por aqui você inicia o registro de uma nova compra.",
      placement: "bottom",
    },
    {
      id: "filters",
      target: '[data-tutorial="purchases-filters"]',
      title: "Filtre suas compras",
      description: "Filtre por fornecedor ou por status.",
      placement: "bottom",
    },
    {
      id: "list",
      target: '[data-tutorial="purchases-list"]',
      title: "Acompanhe suas compras",
      description: "Aqui ficam todas as compras registradas.",
      placement: "top",
    },
    {
      id: "status",
      target: '[data-tutorial="purchases-status"]',
      title: "Acompanhe o status",
      description: "O status mostra em que etapa cada compra está.",
      placement: "bottom",
    },
    {
      id: "actions",
      target: '[data-tutorial="purchases-actions"]',
      title: "Veja os detalhes",
      description: "Acesse os detalhes completos de cada compra.",
      placement: "left",
    },
  ],
};
