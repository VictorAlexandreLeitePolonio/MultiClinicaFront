import type { TaskTutorial } from "../../../tutorial.types";

export const createRecordTask: TaskTutorial = {
  id: "create-record",
  moduleId: "medical-records",
  title: "Criar prontuário",
  pathname: "/app/prontuarios",
  roles: ["Administrador", "Profissional"],
  steps: [
    {
      id: "start",
      target: '[data-tutorial="medical-records-new"]',
      title: "Crie um novo prontuário",
      description: "Clique aqui para começar.",
      placement: "bottom",
      advanceOn: "target-click",
    },
    {
      id: "general",
      target: '[data-tutorial="medical-records-form-general"]',
      title: "Informações gerais",
      description: "Selecione o paciente e defina um título para o prontuário.",
      placement: "right",
    },
    {
      id: "anamnese",
      target: '[data-tutorial="medical-records-form-anamnese"]',
      title: "Anamnese",
      description: "Registre a patologia, a queixa principal e o histórico do paciente.",
      placement: "right",
    },
    {
      id: "session",
      target: '[data-tutorial="medical-records-form-session"]',
      title: "Sessão e orientações",
      description: "Descreva a sessão de hoje e as orientações domiciliares.",
      placement: "right",
    },
    {
      id: "save",
      target: '[data-tutorial="medical-records-form-save"]',
      title: "Finalize o prontuário",
      description: "Clique em Salvar Prontuário para concluir.",
      placement: "top",
    },
  ],
};
