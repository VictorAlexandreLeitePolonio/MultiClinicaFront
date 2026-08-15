import type { TaskTutorial } from "../../../tutorial.types";

export const createAppointmentTask: TaskTutorial = {
  id: "create-appointment",
  moduleId: "agenda",
  title: "Criar agendamento",
  pathname: "/app/agenda",
  steps: [
    {
      id: "start",
      target: '[data-tutorial="agenda-new"]',
      title: "Crie um novo agendamento",
      description: "Clique aqui para começar.",
      placement: "bottom",
      advanceOn: "target-click",
    },
    {
      id: "patient",
      target: '[data-tutorial="agenda-form-patient"]',
      title: "Escolha o paciente",
      description: "Selecione o paciente para este agendamento.",
      placement: "right",
    },
    {
      id: "datetime",
      target: '[data-tutorial="agenda-form-datetime"]',
      title: "Data e horário",
      description: "Escolha quando o agendamento vai acontecer.",
      placement: "right",
    },
    {
      id: "save",
      target: '[data-tutorial="agenda-form-save"]',
      title: "Finalize o agendamento",
      description: "Clique em Cadastrar para salvar.",
      placement: "top",
    },
  ],
};
