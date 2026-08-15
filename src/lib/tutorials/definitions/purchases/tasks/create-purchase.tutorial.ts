import type { TaskTutorial } from "../../../tutorial.types";

export const createPurchaseTask: TaskTutorial = {
  id: "create-purchase",
  moduleId: "purchases",
  title: "Registrar compra",
  pathname: "/app/estoque/compras",
  permission: "compras.criar",
  steps: [
    {
      id: "start",
      target: '[data-tutorial="purchases-new"]',
      title: "Registre uma nova compra",
      description: "Clique aqui para começar.",
      placement: "bottom",
      advanceOn: "target-click",
    },
    {
      id: "fields",
      target: '[data-tutorial="purchase-form-fields"]',
      title: "Fornecedor e itens",
      description: "Escolha o fornecedor, a data e adicione os itens comprados.",
      placement: "top",
    },
    {
      id: "save",
      target: '[data-tutorial="purchase-form-save"]',
      title: "Finalize a compra",
      description: "Clique em Salvar para registrar a compra.",
      placement: "top",
    },
  ],
};
