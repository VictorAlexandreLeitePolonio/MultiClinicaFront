import type { TaskTutorial } from "../../../tutorial.types";

export const createSupplierTask: TaskTutorial = {
  id: "create-supplier",
  moduleId: "suppliers",
  title: "Cadastrar fornecedor",
  pathname: "/app/estoque/fornecedores",
  // ponytail: fornecedores não tem permissão própria, reusa a de compras (ver FornecedorList).
  permission: "compras.criar",
  steps: [
    {
      id: "start",
      target: '[data-tutorial="suppliers-new"]',
      title: "Cadastre um novo fornecedor",
      description: "Clique aqui para começar.",
      placement: "bottom",
      advanceOn: "target-click",
    },
    {
      id: "fields",
      target: '[data-tutorial="supplier-form-fields"]',
      title: "Nome do fornecedor",
      description: "Informe o nome do fornecedor.",
      placement: "bottom",
    },
    {
      id: "save",
      target: '[data-tutorial="supplier-form-save"]',
      title: "Finalize o cadastro",
      description: "Clique em Salvar para cadastrar o fornecedor.",
      placement: "top",
    },
  ],
};
