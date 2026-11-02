# Cliniq Care — Design

Fonte da verdade: `src/app/globals.css` (tokens) e `src/components/ui/*` (componentes). Este arquivo resume o sistema para quem implementa telas novas.

## Color (Restrained)

| Papel | Claro | Escuro |
|---|---|---|
| Acento primário (ação, seleção, foco) | `#14b8a6` (hover/texto `#0f766e`) | `#67e8f9` para texto de acento |
| Acento suave (fundo de seleção) | `#ecfdf5` / `#ccfbf1` | `#153f3c` |
| Texto principal | `#0f172a` | `#e5e7eb` (`dark:text-white` nos títulos) |
| Texto secundário | `#475569` (mínimo; `#64748b` só em rótulos pequenos de apoio) | `slate-300` |
| Fundo da página | `#f8fffc` | `slate-950` |
| Superfície (cards, painéis) | `#ffffff` | `slate-900` / `#111827` |
| Borda | `#d7f3ea` | `slate-800` |
| Perigo | `red-500`/`red-600` | igual |

Acento só em ação primária, item selecionado e indicadores de estado. Estados de consulta: gravando = vermelho, processando = âmbar, pronto = teal, falhou = vermelho escuro.

## Typography

Inter (400/500/600) em toda a UI. Crimson Text só em páginas públicas/marketing, nunca em UI do app.
Escala fixa em rem: título de página `text-2xl font-bold tracking-tight`, título de seção `text-lg font-bold`, corpo `text-sm`, rótulos `text-xs font-semibold`. `text-wrap: balance` em títulos.

## Shape & elevation

Raio 12px (`rounded-xl`) em controles, 16px (`rounded-2xl`) em superfícies. Sombra suave (`--shadow-md`); botão primário com sombra teal. Sem glass, sem gradiente em texto.

## Components (reusar antes de criar)

`Button` (primary/secondary/outline/danger; use `fullWidth={false}` fora de formulários), `PageHeader`, `Tabs` (Radix; aba ativa com fundo `#ecfdf5`), `FormSection`, `FormField`, `Select`, `DataTable`, `Pagination`, `EmptyState`, `ErrorState`, `Skeleton`, `StatusBadge`, `ConfirmDialog`, `ActionsDropdown`. Ícones: `lucide-react`, 14–18px.

## Layout

App shell: `Sidebar` à esquerda + `Topbar`. Conteúdo com `p-8` e `max-w-6xl`/`max-w-7xl` conforme a tela; formulários longos em uma coluna de até ~720px. Duas colunas (`lg:grid-cols-[minmax(0,1fr)_320px]`) quando há conteúdo principal + resumo lateral. Listas com divisores em vez de grade de cards iguais.

## Motion

Produto: 150–250 ms, `ease-out` forte `cubic-bezier(0.23, 1, 0.32, 1)`. Painel lateral (sheet) entra com `translateX(100%)→0` em 240 ms e sai em 180 ms. Troca de aba: crossfade de opacidade 150 ms. Pressionar: `scale(0.97)` em componentes novos. Nada anima em atalhos de teclado. `prefers-reduced-motion`: só opacidade. Biblioteca disponível: `motion` (`motion/react`) e variantes em `src/lib/motion.ts`.

## Do / Don't

- Do: estados de carregando, vazio (que ensina) e erro em toda tela; foco visível (`focus-visible:ring-4 ring-[#99f6e4]`); dark mode com as classes `dark:` já usadas.
- Don't: bordas laterais coloridas, cards aninhados, modal quando um painel ou inline resolve, eyebrow em caixa alta acima de toda seção, cor saturada em estado inativo.
