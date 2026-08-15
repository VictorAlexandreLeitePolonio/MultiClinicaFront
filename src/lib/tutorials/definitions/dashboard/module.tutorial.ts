import type { ModuleTutorial } from "../../tutorial.types";

export const dashboardTutorial: ModuleTutorial = {
  id: "dashboard",
  title: "Início",
  pathname: "/app",
  steps: [
    {
      id: "greeting",
      target: '[data-tutorial="dashboard-greeting"]',
      title: "Bem-vindo ao painel",
      description: "Aqui você tem um resumo rápido do seu dia assim que entra no sistema.",
      placement: "bottom",
    },
    {
      id: "metrics",
      target: '[data-tutorial="dashboard-metrics"]',
      title: "Principais indicadores",
      description: "Acompanhe os números mais importantes da sua rotina de um só lugar.",
      placement: "bottom",
    },
    {
      id: "actions",
      target: '[data-tutorial="dashboard-actions"]',
      title: "Atalhos da sua rotina",
      description: "Acesse rapidamente as ações mais usadas do seu perfil.",
      placement: "top",
    },
    {
      id: "evolutions",
      target: '[data-tutorial="dashboard-evolutions"]',
      title: "Evoluções clínicas",
      description: "Veja um resumo das evoluções registradas recentemente.",
      placement: "top",
    },
    {
      id: "today",
      target: '[data-tutorial="dashboard-today"]',
      title: "Agenda de hoje",
      description: "Seus agendamentos do dia aparecem aqui, sempre atualizados.",
      placement: "top",
    },
  ],
};
