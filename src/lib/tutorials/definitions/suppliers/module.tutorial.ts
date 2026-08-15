import type { ModuleTutorial } from "../../tutorial.types";

export const suppliersTutorial: ModuleTutorial = {
  id: "suppliers",
  title: "Fornecedores",
  pathname: "/app/estoque/fornecedores",
  permission: "compras.visualizar",
  steps: [
    {
      id: "new",
      target: '[data-tutorial="suppliers-new"]',
      title: "Cadastre um fornecedor",
      description: "Por aqui você inicia o cadastro de um novo fornecedor.",
      placement: "bottom",
    },
    {
      id: "search",
      target: '[data-tutorial="suppliers-search"]',
      title: "Pesquise rapidamente",
      description: "Encontre um fornecedor digitando o nome.",
      placement: "bottom",
    },
    {
      id: "list",
      target: '[data-tutorial="suppliers-list"]',
      title: "Gerencie seus fornecedores",
      description: "Aqui ficam todos os fornecedores cadastrados.",
      placement: "top",
    },
    {
      id: "actions",
      target: '[data-tutorial="suppliers-actions"]',
      title: "Edite ou inative",
      description: "Edite os dados ou ative/inative um fornecedor por aqui.",
      placement: "left",
    },
  ],
};
