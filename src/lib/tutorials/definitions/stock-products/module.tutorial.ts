import type { ModuleTutorial } from "../../tutorial.types";

export const stockProductsTutorial: ModuleTutorial = {
  id: "stock-products",
  title: "Produtos",
  pathname: "/app/estoque/produtos",
  permission: "estoque.produtos.visualizar",
  steps: [
    {
      id: "search",
      target: '[data-tutorial="stock-products-search"]',
      title: "Encontre um produto",
      description: "Pesquise rapidamente pelo nome do produto.",
      placement: "bottom",
    },
    {
      id: "new",
      target: '[data-tutorial="stock-products-new"]',
      title: "Cadastre um produto",
      description: "Por aqui você inicia o cadastro de um novo produto.",
      placement: "bottom",
    },
    {
      id: "list",
      target: '[data-tutorial="stock-products-list"]',
      title: "Gerencie seus produtos",
      description: "Aqui ficam todos os produtos cadastrados na clínica.",
      placement: "top",
    },
    {
      id: "minimum",
      target: '[data-tutorial="stock-products-minimum"]',
      title: "Estoque mínimo",
      description:
        "Defina a quantidade mínima de cada produto — quando o estoque atingir esse limite, ele fica em destaque na lista.",
      placement: "left",
    },
  ],
};
