import type { TaskTutorial } from "../../../tutorial.types";

export const createPatientTask: TaskTutorial = {
  id: "create-patient",
  moduleId: "patients",
  title: "Cadastrar paciente",
  pathname: "/app/pacientes",
  steps: [
    {
      id: "start",
      target: '[data-tutorial="patients-new"]',
      title: "Cadastre um novo paciente",
      description: "Clique aqui para começar.",
      placement: "bottom",
      advanceOn: "target-click",
    },
    {
      id: "personal",
      target: '[data-tutorial="patient-form-personal"]',
      title: "Dados pessoais",
      description: "Preencha nome, e-mail, documentos e telefone do paciente.",
      placement: "right",
    },
    {
      id: "address",
      target: '[data-tutorial="patient-form-address"]',
      title: "Endereço",
      description: "Complete o endereço do paciente. O CEP preenche o resto automaticamente.",
      placement: "right",
    },
    {
      id: "save",
      target: '[data-tutorial="patient-form-save"]',
      title: "Finalize o cadastro",
      description: "Clique em Cadastrar para salvar o paciente.",
      placement: "top",
    },
  ],
};
