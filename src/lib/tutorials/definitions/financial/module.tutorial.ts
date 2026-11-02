import type { ModuleTutorial } from "../../tutorial.types";

export const financialTutorial: ModuleTutorial = {
  id: "financial",
  title: "Balanço",
  pathname: "/app/financeiro",
  roles: ["Administrador"],
  steps: [
    {
      id: "period",
      target: '[data-tutorial="financial-period"]',
      title: "Escolha o período",
      description: "Este mês, os últimos 30 ou 7 dias, ou um intervalo personalizado.",
      placement: "bottom",
    },
    {
      id: "money",
      target: '[data-tutorial="financial-money"]',
      title: "Resultado do período",
      description: "Entradas, saídas, resultado e margem, e quanto das entradas as saídas consomem.",
      placement: "bottom",
    },
    {
      id: "movements",
      target: '[data-tutorial="financial-movements"]',
      title: "Extrato",
      description: "Os pagamentos recebidos e as despesas lançadas mais recentes. Filtre por entradas ou saídas.",
      placement: "top",
    },
    {
      id: "operational",
      target: '[data-tutorial="financial-operational"]',
      title: "Operação no período",
      description: "Consultas por status, ticket médio, pacientes e evoluções registradas.",
      placement: "left",
    },
    {
      id: "expenses",
      target: '[data-tutorial="financial-expenses"]',
      title: "Despesas",
      description: "Lance e edite aluguel, materiais e contas. Elas entram nas saídas do período.",
      placement: "bottom",
    },
  ],
};
