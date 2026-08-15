import type { TaskTutorial } from "../../../tutorial.types";

export const createMovementTask: TaskTutorial = {
  id: "create-movement",
  moduleId: "stock-movements",
  title: "Registrar movimentação",
  pathname: "/app/estoque/movimentacoes",
  permission: "estoque.movimentacoes.entrada",
  steps: [
    {
      id: "start",
      target: '[data-tutorial="stock-movements-new"]',
      title: "Registre uma movimentação",
      description: "Clique aqui e escolha o tipo de movimentação (ex: Entrada) para começar.",
      placement: "bottom",
      advanceOn: "target-click",
    },
    {
      id: "fields",
      target: '[data-tutorial="movement-form-fields"]',
      title: "Dados da movimentação",
      description: "Selecione o produto e informe a quantidade (ou a nova quantidade, no caso de ajuste).",
      placement: "right",
    },
    {
      id: "save",
      target: '[data-tutorial="movement-form-save"]',
      title: "Finalize o registro",
      description: "Clique em Salvar para registrar a movimentação.",
      placement: "top",
    },
  ],
};
