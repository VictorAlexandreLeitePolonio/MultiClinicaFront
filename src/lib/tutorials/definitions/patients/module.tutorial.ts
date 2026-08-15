import type { ModuleTutorial } from "../../tutorial.types";

export const patientsTutorial: ModuleTutorial = {
  id: "patients",
  title: "Pacientes",
  pathname: "/app/pacientes",
  steps: [
    {
      id: "list",
      target: '[data-tutorial="patients-list"]',
      title: "Gerencie seus pacientes",
      description: "Aqui ficam todos os pacientes cadastrados na clínica.",
      placement: "top",
    },
    {
      id: "search",
      target: '[data-tutorial="patients-search"]',
      title: "Pesquise rapidamente",
      description: "Encontre um paciente digitando o nome.",
      placement: "bottom",
    },
    {
      id: "filters",
      target: '[data-tutorial="patients-filters"]',
      title: "Use os filtros",
      description: "Refine a lista de pacientes conforme sua necessidade.",
      placement: "bottom",
    },
    {
      id: "new",
      target: '[data-tutorial="patients-new"]',
      title: "Cadastre novos pacientes",
      description: "Por aqui você inicia o cadastro de um novo paciente.",
      placement: "bottom",
    },
    {
      id: "actions",
      target: '[data-tutorial="patients-actions"]',
      title: "Acesse perfil e prontuários",
      description: "Veja o perfil, os detalhes e os prontuários de cada paciente.",
      placement: "left",
    },
  ],
};
