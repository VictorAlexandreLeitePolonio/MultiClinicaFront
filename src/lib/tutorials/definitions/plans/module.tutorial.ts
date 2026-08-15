import type { ModuleTutorial } from "../../tutorial.types";

export const plansTutorial: ModuleTutorial = {
  id: "plans",
  title: "Planos",
  pathname: "/app/planos",
  roles: ["Administrador"],
  steps: [
    {
      id: "new",
      target: '[data-tutorial="plans-new"]',
      title: "Crie um novo plano",
      description: "Por aqui você inicia o cadastro de um novo plano.",
      placement: "bottom",
    },
    {
      id: "search",
      target: '[data-tutorial="plans-search"]',
      title: "Pesquise rapidamente",
      description: "Encontre um plano digitando o nome.",
      placement: "bottom",
    },
    {
      id: "list",
      target: '[data-tutorial="plans-list"]',
      title: "Gerencie seus planos",
      description: "Aqui ficam todos os planos oferecidos pela clínica.",
      placement: "top",
    },
    {
      id: "actions",
      target: '[data-tutorial="plans-actions"]',
      title: "Edite ou remova",
      description: "Veja os detalhes ou remova um plano por aqui.",
      placement: "left",
    },
  ],
};
