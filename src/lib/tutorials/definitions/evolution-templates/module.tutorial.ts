import type { ModuleTutorial } from "../../tutorial.types";

export const evolutionTemplatesTutorial: ModuleTutorial = {
  id: "evolution-templates",
  title: "Modelos de Evolução",
  pathname: "/app/modelos-evolucao",
  steps: [
    {
      id: "list",
      target: '[data-tutorial="evolution-templates-list"]',
      title: "Modelos de evolução",
      description: "Aqui ficam os modelos usados para agilizar o registro de evoluções.",
      placement: "top",
    },
    {
      id: "new",
      target: '[data-tutorial="evolution-templates-new"]',
      title: "Crie um novo modelo",
      description: "Administradores podem criar novos modelos de evolução por aqui.",
      placement: "bottom",
      roles: ["Administrador"],
    },
    {
      id: "actions",
      target: '[data-tutorial="evolution-templates-actions"]',
      title: "Gerencie os modelos",
      description: "Veja os detalhes de cada modelo ou desative os que não usa mais.",
      placement: "left",
    },
  ],
};
