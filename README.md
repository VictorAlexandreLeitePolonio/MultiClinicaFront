# ProjetoLP — Front-end

Interface web desenvolvida em **Next.js 15** para o sistema de gestão da clínica de fisioterapia da Dra. Laiza Polonio. O projeto consome a API REST do ProjetoLPBack e oferece uma experiência fluida, responsiva e visualmente alinhada à identidade da marca.

---

## Para quem é

Sistema interno utilizado pela equipe da clínica, com interface adaptada ao perfil de cada usuário:

- **Admin** — visão completa: pacientes, agenda, pagamentos, planos, prontuários, usuários e controle financeiro
- **Fisio** — visão restrita: pacientes, agenda e prontuários

---

## Tecnologias

| Tecnologia | Uso |
|-----------|-----|
| Next.js 15 (App Router) | Framework principal |
| TypeScript | Tipagem estática |
| Tailwind CSS | Estilização |
| motion/react (Framer Motion) | Animações e transições |
| React Hook Form | Gerenciamento de formulários |
| Zod | Validação de schemas |
| Axios | Requisições HTTP |
| Sonner | Toast notifications |
| Recharts | Gráficos de evolução financeira |
| Lucide React | Ícones |
| js-cookie | Gerenciamento de cookies |

---

## Módulos

### Autenticação
- Login com JWT via cookie HttpOnly
- Redirecionamento automático por estado de autenticação
- Controle de UI baseado em `user.role`
- Cookie `secure` em produção

### Pacientes
- Listagem paginada com busca e filtros (status, pagamento, agendamento)
- Cadastro e edição com validação Zod
- Toggle ativo/inativo com modal de confirmação
- Formatação de CPF e RG em tempo real

### Agenda
- Listagem de consultas com filtros por status e data
- Agendamento com validação de data futura
- Correção de timezone para horários locais (datetime-local → ISO)

### Prontuários
- Registro clínico completo
- Upload de contrato PDF e imagens de exames
- Validação de tamanho de arquivo (máx. 10MB)
- Cleanup de Object URLs para evitar memory leaks

### Pagamentos
- Controle de pagamentos mensais por paciente e plano
- Filtros por status, paciente e mês de referência
- Guard de `userId` para evitar registros com ID inválido
- Selects filtrados por pacientes e planos ativos

### Planos
- CRUD de planos com badge de status (ativo/inativo)
- Toggle ativo/inativo nas actions da listagem
- Validação de valor positivo no schema Zod

### Usuários
- Gerenciamento de usuários do sistema (somente Admin)

### Financeiro
- Cards de balanço mensal (entradas, saídas, saldo líquido)
- Gráfico de evolução dos últimos 1, 3, 6 ou 12 meses
- Registro e controle de gastos mensais
- Filtro de mês via FilterPopover com mês atual como padrão
- Validação de formato MM/YYYY no mês de referência

### Bem-vindo
- Dashboard com agendamentos do dia
- Card de balanço do mês atual (somente Admin)
- Saudação personalizada com base no horário
- Contador animado de agendamentos

---

## Arquitetura

### Estrutura por módulo
Cada rota tem sua própria pasta com `page.tsx`, `components/`, `hooks/` e `schemas/`:
```
src/app/(authenticated)/[modulo]/
├── page.tsx              # Componente principal
├── components/           # Componentes específicos do módulo
│   └── [Modulo]List.tsx
│   └── [Modulo]Register.tsx
├── hooks/                # Hooks de operação
│   ├── pagined/index.ts  # Hook paginado (via factory)
│   ├── insert/index.ts   # Hook de criação (via useApiMutation)
│   ├── update/index.ts   # Hook de atualização
│   ├── delete/index.ts   # Hook de exclusão
│   └── getId/index.ts    # Hook de busca por ID
└── schemas/
    └── [modulo].schema.ts # Schema Zod de validação
```

### Hooks Reutilizáveis (Abstrações)

#### `createPaginatedHook<T, F>` — Factory de hooks paginados
Local: `src/lib/hooks/createPaginatedHook.ts`

Elimina ~480 linhas de código duplicado em 6 hooks paginados. Cada módulo agora exporta seu hook em ~15 linhas:

```typescript
export const usePacientesPaginated = createPaginatedHook<Patient, PacienteFilters>({
  endpoint: "/api/patients",
  buildParams: (search, filters) => { /* ... */ },
  errorMessage: "Erro ao carregar pacientes.",
});
```

**Recursos:**
- Debounce de 400ms na busca
- Reset automático de página ao alterar filtros
- Normalização de resposta paginada ou array
- Error handling padronizado com toast

#### `useApiMutation<TPayload, TResponse>` — Hook genérico de mutação
Local: `src/lib/hooks/useApiMutation.ts`

Elimina ~360 linhas de código duplicado em ~18 hooks de create/update/delete:

```typescript
export function usePacienteDelete() {
  const { mutate: deletePaciente, isPending, error } = useApiMutation<number, void>({
    mutationFn: (id) => api.delete(`/api/patients/${id}`).then(() => undefined),
    errorMessage: "Erro ao excluir paciente.",
  });
  return { deletePaciente, isPending, error };
}
```

**Recursos:**
- Estado `isPending` e `error` automáticos
- Toast de erro padronizado
- Re-throw para tratamento no componente

#### `StatusBadge` — Componente de badge de status
Local: `src/components/ui/StatusBadge.tsx`

Substitui funções inline duplicadas em 3+ listas:

```tsx
<StatusBadge
  status={row.status}
  mapping={{
    Pending: { label: "Pendente", className: "bg-yellow-100..." },
    Paid: { label: "Pago", className: "bg-green-100..." },
  }}
/>
```

### Navegação por query params
Rotas utilizam `?mode=list|create|view&id=X` sem rotas aninhadas, simplificando a arquitetura de navegação.

### Padrões de código
- **Erros via toast** — todas as respostas de erro da API são capturadas e exibidas como notificação
- **Utilitário `getApiErrorMessage`** — extrai `response.data.message` de forma padronizada
- **Validação Zod** — schemas declarativos servem tanto para validação quanto para tipagem dos formulários
- **Axios interceptors** — guard contra múltiplos redirects em respostas 401 paralelas

---

## Identidade Visual

O design foi completamente redesenhado para refletir a identidade da Dra. Laiza Polonio, utilizando o tom de teal/sage do logo (#5a9c94) como cor primária.

### Paleta de Cores

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-primary` | `#5a9c94` | Botões primários, focus states, badges |
| `--color-primary-dark` | `#4a8880` | Hover states, sombras |
| `--color-primary-muted` | `#e8f4f3` | Backgrounds de tabela, cards |
| `--color-secondary` | `#1a2a4a` | Textos principais, sidebar escuro |
| `--color-bg-warm` | `#f7f5f1` | Fundo principal (efeito papel) |
| `--color-bg-card` | `#fdfcfa` | Cards e inputs (quase branco quente) |
| `--color-bg-sidebar` | `#1e2d4a` | Sidebar escuro (navy profundo) |

### Elementos Visuais
- **Sombras físicas offset** — 3-6px de deslocamento para efeito rústico
- **Bordas de 2px** — estilo consistente em todos os elementos
- **Border radius de 2-3px** — leve arredondamento mantendo caráter rústico
- **Tipografia serif (Crimson Text)** — títulos e labels de formulário
- **Tipografia sans (Inter)** — corpo de texto e dados

### Componentes Redesenhados
- **Sidebar** — navy escuro com logo em destaque e nome da clínica
- **Buttons** — teal primário com sombra física
- **FormField/PasswordField** — focus ring teal, fundo warm
- **DataTable** — header teal suave, hover em teal muito claro
- **PageHeader** — linha decorativa teal abaixo do título
- **FormSection** — dot/acento teal antes do título

---

## Animações

A plataforma conta com animações sutis que melhoram a experiência sem distrair:

### Alto Impacto
| Componente | Animação | Descrição |
|-----------|----------|-----------|
| DataTable | `staggerContainerSlow` + `fadeSlideUp` | Linhas entrando sequencialmente |
| PageHeader | `slideFromLeft` | Título deslizando da esquerda |
| AppointmentCard | `hoverLift` | Elevação e sombra no hover |
| Modais | `scaleIn` | Entrada com spring natural |

### Médio Impacto
| Componente | Animação | Descrição |
|-----------|----------|-----------|
| SearchInput | `pulse` | Ícone de lupa pulsa ao focar |
| FilterPopover | `slideDown` | Dropdown deslizando com spring |
| FormSection | `staggerContainer` | Seções aparecendo progressivamente |
| GreetingBanner | `useMotionValue` | Contador animado 0 → N |

### Sutil
| Componente | Animação | Descrição |
|-----------|----------|-----------|
| SidebarLink | `layoutId` | Indicador ativo deslizando (shared layout) |
| ActionsDropdown | `hoverShift` | Itens deslizando x:2 no hover |
| Skeleton | shimmer | Gradiente animado em loop |

---

## Bug Fixes Recentes

### Correções Críticas
- **Login** — página reconstruída com formulário completo (removido redirect incondicional)
- **AuthContext** — `initialLoading` corrigido (inicia `true` para evitar redirect prematuro)
- **Timezone** — conversão de `datetime-local` preserva fuso horário local em Agenda
- **userId** — guard adicionado em Pagamentos para evitar `userId: 0`
- **API 401** — flag `isRedirectingToLogin` previne múltiplos redirects/toasts paralelos
- **Cookies** — flag `secure: true` em produção para `auth_user`
- **Login hook** — `axios.isAxiosError()` substitui cast inseguro de `AxiosError`
- **Formatters** — `formatCPF` e `formatRG` funcionam corretamente com inputs parciais
- **Prontuários** — cleanup de Object URLs + validação de 10MB no upload

### Validações
- **Planos** — `z.number().positive()` ao invés de `.min(0.01)`
- **Financeiro** — regex `^\d{2}/\d{4}$` para mês de referência

---

## Como rodar

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev
```

A aplicação sobe em `http://localhost:3000`. A API deve estar rodando em `http://localhost:5062` (ou conforme configurado em `NEXT_PUBLIC_API_BASE_URL`).

---

## Estrutura de Pastas

```
src/
├── app/
│   ├── (authenticated)/     # Rotas protegidas (requer login)
│   │   ├── agenda/
│   │   ├── pacientes/
│   │   ├── pagamentos/
│   │   ├── planos/
│   │   ├── prontuarios/
│   │   ├── usuarios/
│   │   ├── financeiro/
│   │   └── bem-vindo/
│   └── (public)/             # Rotas públicas
│       └── login/
├── components/
│   ├── layout/               # Sidebar, SidebarLink
│   └── ui/                   # Componentes reutilizáveis
│       ├── Button.tsx
│       ├── DataTable.tsx
│       ├── FormField.tsx
│       ├── PageHeader.tsx
│       ├── StatusBadge.tsx
│       └── ...
├── contexts/
│   └── AuthContext.tsx       # Contexto de autenticação
├── lib/
│   ├── api.ts                # Instância Axios + interceptors
│   ├── hooks/                # Hooks genéricos
│   │   ├── createPaginatedHook.ts
│   │   └── useApiMutation.ts
│   ├── motion.ts             # Variantes de animação
│   └── pagination.ts         # Utilitários de paginação
├── types/
│   └── index.ts              # Tipos globais
└── utils/
    ├── formatters.ts         # CPF, RG, telefone, data
    └── apiError.ts           # Tratamento de erros
```

---

## O que aprendi construindo este projeto

Este projeto marcou minha evolução como desenvolvedor front-end, consolidando conhecimentos em React moderno e padrões de arquitetura de aplicações reais:

- **Next.js App Router** — roteamento baseado em sistema de arquivos, layouts aninhados, separação entre rotas públicas e autenticadas com grupos `(public)` e `(authenticated)`
- **TypeScript avançado** — interfaces, tipos utilitários, generics nos hooks e componentes (`PagedResult<T>`, `Column<T>`, `createPaginatedHook<T, F>`), inferência com `z.infer`
- **Gerenciamento de estado sem libs externas** — `useState`, `useCallback`, `useEffect` bem combinados para substituir Redux em casos simples
- **Hooks customizados e factories** — abstração de padrões repetidos em factories reutilizáveis, reduzindo ~840 linhas de código duplicado
- **Validação com Zod + React Hook Form** — schemas declarativos que servem tanto para validação quanto para tipagem automática dos formulários
- **Autenticação com JWT em cookies** — fluxo completo de login, proteção de rotas, leitura do contexto de usuário e controle de UI por role
- **Componentes de UI reutilizáveis** — DataTable genérica, FilterPopover, Pagination, ActionsDropdown, StatusBadge, StatusToggleModal compartilhados entre todos os módulos
- **Animações com Framer Motion** — transições entre views, stagger animations, shared layout animations, spring physics
- **Design system** — criação de uma identidade visual coesa alinhada à marca, com tokens de cor, sombra e tipografia consistentes
- **Visualização de dados com Recharts** — gráfico de linhas múltiplas com tooltip personalizado, formatação de eixos e seleção dinâmica de período
- **Boas práticas de UX** — debounce em buscas, feedback visual em loading/error, toasts para sucesso e erro, confirmação antes de ações destrutivas, animações sutis que guiam o olhar
- **Refatoração incremental** — identificação de padrões duplicados e extração em abstrações sem quebrar interfaces existentes
- **Organização e escalabilidade** — padrão de estrutura de pastas que permite adicionar novos módulos seguindo convenções já estabelecidas
