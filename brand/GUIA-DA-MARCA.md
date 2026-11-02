# Cliniq Care — guia da marca (Q-bot)

## A ideia
O Q da Cliniq é a cabeça do robô assistente: rosto de tela, antena com o ponto da marca e uma piscadinha em "+". A cauda atravessa o traço do anel (Q tipográfico), nunca sai dele como cabo de lupa.

## Arquivos
| Arquivo | Uso |
|---|---|
| `cliniq-symbol.svg` | Símbolo sobre fundo claro |
| `cliniq-symbol-on-dark.svg` | Símbolo sobre fundo escuro |
| `cliniq-symbol-small.svg` / `-on-dark` | Corte para 16–32 px (sem sorriso, traços mais grossos) |
| `cliniq-symbol-black.svg`, `export/cliniq-white.svg`, `export/cliniq-mono-00776e.svg` | Uma cor (carimbo, bordado, gravação) |
| `cliniq-lockup-horizontal.svg` / `-on-dark` | Marca principal (header, documentos, e-mail) |
| `cliniq-lockup-stacked.svg` / `-on-dark` | Espaços quadrados (redes, capas) |
| `export/` | favicon.ico/.svg, PNGs 16–512, apple-touch, maskable, `site.webmanifest`, `head-snippet.html` |
| `slides/` | Prancha de apresentação com mockups |

## Cores
| Papel | OKLCH | HEX |
|---|---|---|
| Teal (símbolo no claro, "Care") | `oklch(0.51 0.095 186)` | `#00776E` |
| Teal elétrico (símbolo no escuro) | `oklch(0.72 0.15 182)` | `#00C2AC` |
| Âmbar sinal (ponta da antena, único acento) | `oklch(0.82 0.15 80)` | `#F7B83D` |
| Tinta ("Cliniq" no claro) | `oklch(0.21 0.025 230)` | `#0B1A22` |
| Fundo escuro da marca | `oklch(0.155 0.018 210)` | `#040E10` |

A versão de uma cor sempre usa o mesmo tom para tudo, inclusive a antena.

## Tipografia
Wordmark em Mona Sans (variável), largura 125%: "Cliniq" peso 650, "Care" peso 450, tracking −2%. As letras estão em curvas nos SVGs; não redigite o nome em outra fonte. Mona Sans é licenciada sob SIL OFL 1.1 (uso em logo permitido).

## Área de respiro e tamanho mínimo
- Respiro: no mínimo a altura da cabeça da antena (≈ 1/10 da altura do símbolo) em todos os lados; no lockup, a altura do "C".
- Mínimo: símbolo 16 px (use o corte pequeno até 32 px); lockup horizontal 24 px de altura na tela, 8 mm no impresso.

## Fundos aprovados
Branco e claros da interface → versão clara. `#040E10`, fotos escuras e o teal `#00776E` sólido → versão escura ou branca.

## Não faça
- Esticar, girar, contornar, aplicar sombra, gradiente ou brilho.
- Trocar o "+" por outro olho, remover a antena ou a cauda.
- Recolorir partes com outras cores além das acima, ou usar o âmbar em mais de um elemento.
- Pôr a versão clara sobre fundo escuro (o teal escuro some).

## Pendências
- Busca de anterioridade no INPI antes de registrar a marca (não garantimos disponibilidade).
- O mascote 3D atual (`public/mascot/robot-*.webp`) tem outro estilo; redesenhá-lo no traço do Q-bot para o assistente do app.
