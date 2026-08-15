import type { ModuleTutorial } from "../../tutorial.types";

export const stockCategoriesTutorial: ModuleTutorial = {
  id: "stock-categories",
  title: "Categorias de Produto",
  pathname: "/app/estoque/categorias-produto",
  permission: "estoque.produtos.visualizar",
  steps: [
    {
      id: "new",
      target: '[data-tutorial="stock-categories-new"]',
      title: "Crie uma categoria",
      description: "Organize seus produtos criando novas categorias.",
      placement: "bottom",
    },
    {
      id: "search",
      target: '[data-tutorial="stock-categories-search"]',
      title: "Pesquise rapidamente",
      description: "Encontre uma categoria digitando o nome.",
      placement: "bottom",
    },
    {
      id: "list",
      target: '[data-tutorial="stock-categories-list"]',
      title: "Gerencie suas categorias",
      description: "Aqui ficam todas as categorias de produto cadastradas.",
      placement: "top",
    },
  ],
};
