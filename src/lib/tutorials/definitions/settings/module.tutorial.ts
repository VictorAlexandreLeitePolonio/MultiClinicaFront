import type { ModuleTutorial } from "../../tutorial.types";

export const settingsTutorial: ModuleTutorial = {
  id: "settings",
  title: "Configurações",
  pathname: "/app/configuracoes",
  permission: "clinic.settings.view",
  steps: [
    {
      id: "identity",
      target: '[data-tutorial="settings-identity"]',
      title: "Identidade da clínica",
      description: "Atualize o nome de exibição da sua clínica.",
      placement: "right",
    },
    {
      id: "logo",
      target: '[data-tutorial="settings-logo"]',
      title: "Logo da clínica",
      description: "Configure a URL da logo que aparece no sistema.",
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
      description: "Mantenha o email e telefone de contato sempre atualizados.",
      placement: "right",
    },
    {
      id: "preview",
      target: '[data-tutorial="settings-preview"]',
      title: "Veja o resultado",
      description: "Acompanhe em tempo real como as mudanças ficam visualmente.",
      placement: "left",
    },
    {
      id: "save",
      target: '[data-tutorial="settings-save"]',
      title: "Salve as alterações",
      description: "Não esqueça de salvar depois de fazer suas alterações.",
      placement: "top",
      permission: "clinic.settings.update",
    },
  ],
};
