import type { TaskTutorial } from "../../../tutorial.types";

export const updateSettingsTask: TaskTutorial = {
  id: "update-settings",
  moduleId: "settings",
  title: "Atualizar configurações",
  pathname: "/app/configuracoes",
  permission: "clinic.settings.update",
  steps: [
    {
      id: "identity",
      target: '[data-tutorial="settings-identity"]',
      title: "Identidade da clínica",
      description: "Comece atualizando o nome de exibição da sua clínica.",
      placement: "right",
    },
    {
      id: "colors",
      target: '[data-tutorial="settings-colors"]',
      title: "Cores da clínica",
      description: "Personalize as cores primária, secundária e de destaque.",
      placement: "top",
    },
    {
      id: "contact",
      target: '[data-tutorial="settings-contact"]',
      title: "Dados de contato",
      description: "Atualize o email e telefone de contato.",
      placement: "right",
    },
    {
      id: "save",
      target: '[data-tutorial="settings-save"]',
      title: "Salve as alterações",
      description: "Clique em Salvar alterações para aplicar.",
      placement: "top",
    },
  ],
};
