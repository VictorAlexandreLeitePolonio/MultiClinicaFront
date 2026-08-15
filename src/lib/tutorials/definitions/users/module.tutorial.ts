import type { ModuleTutorial } from "../../tutorial.types";

export const usersTutorial: ModuleTutorial = {
  id: "users",
  title: "Usuários",
  pathname: "/app/usuarios",
  roles: ["Administrador"],
  steps: [
    {
      id: "new",
      target: '[data-tutorial="users-new"]',
      title: "Crie um novo usuário",
      description: "Por aqui você inicia o cadastro de um novo usuário do sistema.",
      placement: "bottom",
    },
    {
      id: "search",
      target: '[data-tutorial="users-search"]',
      title: "Pesquise rapidamente",
      description: "Encontre um usuário digitando o nome.",
      placement: "bottom",
    },
    {
      id: "list",
      target: '[data-tutorial="users-list"]',
      title: "Gerencie os usuários",
      description: "Aqui ficam todos os usuários com acesso ao sistema.",
      placement: "top",
    },
    {
      id: "role",
      target: '[data-tutorial="users-role"]',
      title: "Entenda os perfis",
      description: "O perfil de cada usuário define o que ele pode acessar no sistema.",
      placement: "left",
    },
    {
      id: "actions",
      target: '[data-tutorial="users-actions"]',
      title: "Gerencie o acesso",
      description: "Veja os detalhes ou remova o acesso de um usuário por aqui.",
      placement: "left",
    },
  ],
};
