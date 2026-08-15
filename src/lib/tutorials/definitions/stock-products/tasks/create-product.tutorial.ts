import type { TaskTutorial } from "../../../tutorial.types";

export const createProductTask: TaskTutorial = {
  id: "create-product",
  moduleId: "stock-products",
  title: "Cadastrar produto",
  pathname: "/app/estoque/produtos",
  permission: "estoque.produtos.criar",
  steps: [
    {
      id: "start",
      target: '[data-tutorial="stock-products-new"]',
      title: "Cadastre um novo produto",
      description: "Clique aqui para começar.",
      placement: "bottom",
      advanceOn: "target-click",
    },
    {
      id: "fields",
      target: '[data-tutorial="product-form-fields"]',
      title: "Dados do produto",
      description: "Preencha nome, categoria, códigos, valores de compra/venda e quantidade mínima.",
      placement: "top",
    },
    {
      id: "save",
      target: '[data-tutorial="product-form-save"]',
      title: "Finalize o cadastro",
      description: "Clique em Salvar para cadastrar o produto.",
      placement: "top",
    },
  ],
};
