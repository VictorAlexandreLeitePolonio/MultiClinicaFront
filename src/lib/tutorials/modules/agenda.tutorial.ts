import type { ModuleTutorial } from "../tutorial.types";

export const agendaTutorial: ModuleTutorial = {
  id: "agenda",
  title: "Agenda",
  pathname: "/app/agenda",
  steps: [
    {
      id: "view-mode",
      target: '[data-tutorial="agenda-view-mode"]',
      title: "Escolha como visualizar sua agenda",
      description:
        "Alterne entre a visualização em lista e o calendário conforme sua rotina.",
      placement: "bottom",
    },
    {
      id: "filters",
      target: '[data-tutorial="agenda-filters"]',
      title: "Encontre os agendamentos certos",
      description: "Use os filtros para visualizar agendamentos conforme o status.",
      placement: "bottom",
    },
    {
      id: "new",
      target: '[data-tutorial="agenda-new"]',
      title: "Crie um novo agendamento",
      description: "Por aqui você inicia o cadastro de um novo horário para o paciente.",
      placement: "bottom",
    },
    {
      id: "search",
      target: '[data-tutorial="agenda-search"]',
      title: "Busque rapidamente",
      description: "Pesquise um agendamento utilizando o nome do paciente.",
      placement: "bottom",
    },
    {
      id: "list",
      target: '[data-tutorial="agenda-list"]',
      title: "Gerencie sua agenda",
      description: "Aqui ficam os agendamentos e suas principais informações.",
      placement: "top",
    },
  ],
};
