import type { LucideIcon } from "lucide-react";
import {
  Activity,
  CalendarDays,
  CreditCard,
  FileText,
  Package,
  ShieldCheck,
  Users,
} from "lucide-react";

export type LandingModuleId =
  | "agenda"
  | "pacientes"
  | "prontuarios"
  | "financeiro"
  | "pagamentos"
  | "evolucao"
  | "estoque"
  | "permissoes";

export interface LandingModule {
  id: LandingModuleId;
  label: string;
  title: string;
  description: string;
  icon: LucideIcon;
  metric: string;
  metricLabel: string;
  highlights: readonly string[];
}

export const DEFAULT_LANDING_MODULE_ID: LandingModuleId = "agenda";

export const landingModules: readonly LandingModule[] = [
  {
    id: "agenda",
    label: "Agenda",
    title: "O dia começa com clareza",
    description: "Visualize horários, profissionais e status dos atendimentos em um só lugar.",
    icon: CalendarDays,
    metric: "12",
    metricLabel: "atendimentos hoje",
    highlights: ["Agenda por profissional", "Status em tempo real", "Próximo atendimento"],
  },
  {
    id: "pacientes",
    label: "Pacientes",
    title: "Cada história no lugar certo",
    description: "Encontre rapidamente o perfil, o histórico e os próximos passos de cada paciente.",
    icon: Users,
    metric: "248",
    metricLabel: "pacientes ativos",
    highlights: ["Perfil completo", "Busca rápida", "Histórico conectado"],
  },
  {
    id: "prontuarios",
    label: "Prontuários",
    title: "Mais contexto para cada atendimento",
    description: "Registre evoluções, anexos e informações clínicas com uma visão organizada.",
    icon: FileText,
    metric: "36",
    metricLabel: "evoluções no mês",
    highlights: ["Registro estruturado", "Anexos", "Modelos reutilizáveis"],
  },
  {
    id: "financeiro",
    label: "Balanço",
    title: "A operação também precisa de visão",
    description: "Acompanhe entradas, despesas e o movimento da clínica com leitura simples.",
    icon: CreditCard,
    metric: "R$ 18,4k",
    metricLabel: "movimento do período",
    highlights: ["Saldo por período", "Despesas da clínica", "Movimentações recentes"],
  },
  {
    id: "pagamentos",
    label: "Pagamentos",
    title: "Fechamentos sem perder tempo",
    description: "Organize pagamentos por plano e acompanhe o que já foi recebido.",
    icon: CreditCard,
    metric: "94%",
    metricLabel: "recebimentos conciliados",
    highlights: ["Planos", "Histórico", "Status de recebimento"],
  },
  {
    id: "evolucao",
    label: "Evolução",
    title: "Progresso que dá para acompanhar",
    description: "Transforme registros de atendimento em uma visão contínua do tratamento.",
    icon: Activity,
    metric: "8",
    metricLabel: "acompanhamentos ativos",
    highlights: ["Linha do tempo", "Metas de tratamento", "Resumo por paciente"],
  },
  {
    id: "estoque",
    label: "Estoque",
    title: "O que a clínica usa, sob controle",
    description: "Acompanhe produtos, compras e movimentações sem depender de planilhas soltas.",
    icon: Package,
    metric: "32",
    metricLabel: "itens monitorados",
    highlights: ["Produtos", "Compras", "Alertas de estoque"],
  },
  {
    id: "permissoes",
    label: "Permissões",
    title: "Cada pessoa vê o que precisa",
    description: "Organize times e acessos para manter a operação segura e objetiva.",
    icon: ShieldCheck,
    metric: "4",
    metricLabel: "perfis de acesso",
    highlights: ["Times por clínica", "Acessos controlados", "Dados isolados"],
  },
];
