import type { ModuleTutorial } from "../../tutorial.types";

export const medicalRecordsTutorial: ModuleTutorial = {
  id: "medical-records",
  title: "Prontuários",
  pathname: "/app/prontuarios",
  roles: ["Administrador", "Profissional"],
  steps: [
    {
      id: "new",
      target: '[data-tutorial="medical-records-new"]',
      title: "Crie um novo prontuário",
      description: "Por aqui você inicia o registro de um novo prontuário.",
      placement: "bottom",
    },
    {
      id: "search",
      target: '[data-tutorial="medical-records-search"]',
      title: "Busque pelo paciente",
      description: "Encontre prontuários digitando o nome do paciente.",
      placement: "bottom",
    },
    {
      id: "list",
      target: '[data-tutorial="medical-records-list"]',
      title: "Acompanhe os prontuários",
      description: "Aqui ficam todos os prontuários registrados.",
      placement: "top",
    },
    {
      id: "patient",
      target: '[data-tutorial="medical-records-patient"]',
      title: "Acesse o histórico do paciente",
      description: "Clique no nome do paciente para ver todos os prontuários dele.",
      placement: "right",
    },
  ],
};
