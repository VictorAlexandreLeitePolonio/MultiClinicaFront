import type { ModuleTutorial } from "../../tutorial.types";

export const paymentsTutorial: ModuleTutorial = {
  id: "payments",
  title: "Pagamentos",
  pathname: "/app/pagamentos",
  roles: ["Administrador", "Recepcao"],
  steps: [
    {
      id: "list",
      target: '[data-tutorial="payments-list"]',
      title: "Visão geral",
      description: "Acompanhe todos os pagamentos registrados na clínica.",
      placement: "top",
    },
    {
      id: "search",
      target: '[data-tutorial="payments-search"]',
      title: "Localizar pagamento",
      description: "Pesquise rapidamente pelo nome do paciente.",
      placement: "bottom",
    },
    {
      id: "filters",
      target: '[data-tutorial="payments-filters"]',
      title: "Filtrar situação",
      description: "Filtre os pagamentos conforme a situação desejada.",
      placement: "bottom",
    },
    {
      id: "new",
      target: '[data-tutorial="payments-new"]',
      title: "Registrar pagamento",
      description: "Por aqui você inicia o registro de um novo pagamento.",
      placement: "bottom",
    },
    {
      id: "status",
      target: '[data-tutorial="payments-status"]',
      title: "Acompanhar status",
      description: "O status mostra se o pagamento está pago, pendente ou cancelado.",
      placement: "left",
    },
  ],
};
