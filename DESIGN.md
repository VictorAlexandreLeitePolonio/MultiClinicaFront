# Cliniq Care — Design

Fonte da verdade: `src/app/globals.css` (tokens) e `src/components/ui/*` (componentes). Este arquivo resume o sistema para quem implementa telas novas.

## Color (Restrained, OKLCH)

Tokens em `src/app/globals.css` (nomes antigos mantidos, valores em OKLCH). Não escreva hex novo.

| Papel | Token | Claro | Escuro |
|---|---|---|---|
| Acento primário | `--color-primary` / `--color-primary-dark` (texto) | `oklch(0.72 0.15 182)` / `oklch(0.51 0.095 186)` | igual; texto de acento `--color-primary-light` |
| Fundo de seleção | `--color-primary-muted` | `oklch(0.955 0.035 180)` | `oklch(0.3 0.05 185)` |
| Sinal (IA, estados vivos) | `--signal` | `oklch(0.82 0.15 80)` | igual |
| Texto | `--color-secondary` | `oklch(0.21 0.025 230)` | `oklch(0.93 0.008 220)` |
| Texto secundário | `--color-gray-600` | `oklch(0.52 0.025 240)` | `oklch(0.72 0.02 225)` |
| Fundo / superfície / borda | `--color-bg-warm` / `--color-bg-card` / `--color-gray-200` | | |
| LP (sempre escura, `.theme-lp`) | `--lp-bg`, `--lp-surface`, `--lp-line`, `--lp-ink`, `--lp-muted` | | |

Acento só em ação primária, item selecionado e indicadores de estado. Estados de consulta: gravando = vermelho, processando = âmbar, pronto = teal, falhou = vermelho escuro.

## Typography

Mona Sans Variable em toda a UI (`--font-sans`). Títulos da LP com `.font-wide` (largura 125%). Números, horários, valores e dados em Geist Mono (`font-mono`).
Escala fixa em rem: título de página `text-2xl font-bold tracking-tight`, título de seção `text-lg font-bold`, corpo `text-sm`, rótulos `text-xs font-semibold`. `text-wrap: balance` em títulos.

## Shape & elevation

Raio 12px (`rounded-xl`) em controles, 16px (`rounded-2xl`) em superfícies. Sombra suave (`--shadow-md`); botão primário com sombra teal. Sem glass, sem gradiente em texto.

## Components (reusar antes de criar)

`Button` (primary/secondary/outline/danger; use `fullWidth={false}` fora de formulários), `PageHeader`, `Tabs` (Radix; aba ativa com fundo `#ecfdf5`), `FormSection`, `FormField`, `Select`, `DataTable`, `Pagination`, `EmptyState`, `ErrorState`, `Skeleton`, `StatusBadge`, `ConfirmDialog`, `ActionsDropdown`. Ícones: `lucide-react`, 14–18px.

## Layout

App shell: `Sidebar` à esquerda + `Topbar`. Conteúdo com `p-8` e `max-w-6xl`/`max-w-7xl` conforme a tela; formulários longos em uma coluna de até ~720px. Duas colunas (`lg:grid-cols-[minmax(0,1fr)_320px]`) quando há conteúdo principal + resumo lateral. Listas com divisores em vez de grade de cards iguais.

## Motion

Produto: 150–250 ms, `ease-out` forte `cubic-bezier(0.23, 1, 0.32, 1)`. Painel lateral (sheet) entra com `translateX(100%)→0` em 240 ms e sai em 180 ms. Troca de aba: crossfade de opacidade 150 ms. Pressionar: `scale(0.97)` em componentes novos. Nada anima em atalhos de teclado. `prefers-reduced-motion`: só opacidade. Curvas e springs em `src/lib/motion.ts` (`ease`, `spring`, `easeCss`). Troca de tema: View Transition com círculo a partir do botão (420 ms). Libs: `motion/react`, Magic UI em `src/components/magicui`, `cmdk` (⌘K, sem animação), `@number-flow/react` (números que mudam).

## Do / Don't

- Do: estados de carregando, vazio (que ensina) e erro em toda tela; foco visível (`focus-visible:ring-2 ring-[var(--color-primary)]`); dark mode com as classes `dark:` já usadas.
- Don't: bordas laterais coloridas, cards aninhados, modal quando um painel ou inline resolve, eyebrow em caixa alta acima de toda seção, cor saturada em estado inativo.
