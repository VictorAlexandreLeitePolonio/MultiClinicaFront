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
      description: "Selecione o intervalo de datas que você quer analisar.",
      placement: "bottom",
    },
    {
      id: "money",
      target: '[data-tutorial="financial-money"]',
      title: "Resumo financeiro",
      description: "Entradas, saídas e resultado do período em cards resumidos.",
      placement: "bottom",
    },
    {
      id: "result",
      target: '[data-tutorial="financial-result"]',
      title: "Como o resultado se formou",
      description: "Veja cada custo sendo subtraído das entradas até chegar no resultado.",
      placement: "top",
    },
    {
      id: "charts",
      target: '[data-tutorial="financial-charts"]',
      title: "Consultas e estoque",
      description: "Distribuição das consultas por status e das movimentações de estoque.",
      placement: "top",
    },
    {
      id: "operational",
      target: '[data-tutorial="financial-operational"]',
      title: "Indicadores operacionais",
      description: "Acompanhe os principais números operacionais da clínica.",
      placement: "top",
    },
    {
      id: "expenses",
      target: '[data-tutorial="financial-expenses"]',
      title: "Gerencie as despesas",
      description: "Registre e acompanhe as despesas da clínica por aqui.",
      placement: "top",
    },
  ],
};
