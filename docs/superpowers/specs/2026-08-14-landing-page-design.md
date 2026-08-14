# Design da nova landing page do MultiClinica

**Data:** 2026-08-14
**Status:** Aprovado para planejamento
**Escopo:** landing page pública em `/`; o onboarding do backoffice fica como fase posterior.

## Objetivo

Transformar a landing page em uma apresentação rápida e memorável do MultiClinica. A página deve permitir que gestores e profissionais de saúde entendam o produto em poucos segundos, explorem uma visão superficial dos módulos sem login e tenham dois próximos passos claros: conhecer a demo ou solicitar acesso real.

A direção escolhida é **Clínica em movimento**: o produto aparece imediatamente no hero, o mascote percorre a narrativa ao longo do scroll e cada seção tem uma densidade diferente. A experiência preserva a identidade healthtech verde-água existente, mas substitui a apresentação genérica de features por demonstração do produto.

## Público e resultado esperado

O público é dividido igualmente entre:

- responsáveis e gestores de clínicas, que precisam entender a visão operacional da solução;
- profissionais de saúde, que precisam reconhecer a utilidade da agenda, pacientes, prontuários e evolução.

Ao terminar o primeiro viewport, a pessoa deve saber o que é o MultiClinica, reconhecer que ele cobre a operação da clínica e conseguir iniciar a demo. Ao terminar a página, deve conseguir explorar o panorama dos módulos, tirar dúvidas básicas e solicitar acesso por indicação.

## Estrutura da página

### Header

O header será compacto, claro e orientado à navegação:

- logo e posicionamento curto do produto;
- links âncora para Módulos, Como funciona e FAQ;
- botão Entrar apontando para `/login`;
- CTA secundário para iniciar a exploração da demo;
- nenhum controle de tema na landing.

O modo claro será aplicado somente ao shell da landing. O backoffice e seu `ThemeProvider` não fazem parte desta entrega.

### Hero

O hero terá composição em duas colunas:

- lado esquerdo com headline focada no produto;
- texto híbrido: promessa clara de produto e transparência de que o acesso real ainda é liberado por indicação;
- CTA primário para explorar o sistema;
- CTA secundário para solicitar acesso;
- lado direito com a mini-demo navegável selecionada no companion visual.

O preview será leve e terá aparência de produto em uso, não de uma ilustração abstrata. O robozinho curioso aparecerá apoiado no preview e apresentará a primeira interação.

### Overview dos módulos

A seção de features genérica será substituída por um overview interativo. Todos os módulos relevantes serão representados, mas cada um terá apenas uma explicação curta e um estado visual simples:

- Agenda;
- Pacientes;
- Prontuários;
- Financeiro/Balanço;
- Pagamentos;
- Evolução;
- Estoque;
- Permissões e times.

Ao selecionar um item, a demo troca o estado do painel e exibe uma microexplicação. A interação não abrirá formulários, não fará chamadas de API e não exigirá autenticação.

### Prova social e ScrollStack

O bloco de depoimentos continuará existindo, mas deixará de apresentar apenas cards isolados em uma área longa. O título da seção fará parte do próprio percurso de scroll e permanecerá associado aos cards enquanto eles entram individualmente.

O comportamento esperado é um stack guiado: cada depoimento ocupa o foco por um período curto, os cards seguintes entram com escala e deslocamento discretos e a pessoa sempre consegue identificar o título da seção. O componente deve continuar utilizável sem motion e em telas pequenas.

### FAQ

A nova seção de perguntas frequentes usará accordion acessível, com uma resposta aberta por vez. As perguntas devem cobrir:

- o que é o MultiClinica;
- quais módulos estão disponíveis;
- como funciona o acesso;
- se a solução atende mais de uma unidade;
- como dados e permissões são organizados;
- se existe demonstração sem login;
- como solicitar liberação;
- como funciona o suporte.

As respostas serão genéricas e honestas, sem inventar integrações, preços, certificações ou garantias não confirmadas pelo produto.

### CTA final

O CTA final será uma composição própria e mais expressiva que o card atual. O mascote aparecerá convidando para a próxima ação, acompanhado de uma frase de fechamento e dois caminhos:

- explorar a demo, retornando à área interativa;
- solicitar acesso, abrindo o contato por e-mail.

O endereço de contato atual será preservado até que exista uma regra de produto diferente.

### Footer

O footer permanecerá simples, com identidade do produto, login, contato e aviso de direitos autorais.

## Mascote e motion

O mascote será um robô curioso e expressivo, com aparência profissional o suficiente para um produto de saúde, mas com personalidade suficiente para ser lembrado.

Na landing, ele aparecerá durante quase todo o scroll por meio de pontos de ancoragem, sem mudar de posição a cada pixel. Os momentos principais serão:

1. hero: apresentação apoiada no preview;
2. módulos: reação ao item selecionado;
3. prova social: aparição curta entre cards;
4. FAQ: postura de observação, sem competir com as perguntas;
5. CTA: convite para agir.

No desktop, a posição será controlada para não cobrir links ou botões. No mobile, o mascote será reposicionado dentro das seções e não ficará fixo sobre o conteúdo.

As animações terão função clara:

- entrada e apresentação;
- troca de estado do preview;
- deslocamento entre âncoras;
- reação curta a uma seleção.

Serão usados movimentos suaves e interrompíveis, com feedback de `:active` nos controles. `prefers-reduced-motion` removerá deslocamentos contínuos e manterá apenas mudanças de opacidade, cor e estado.

## Linguagem visual

A landing será somente clara e preservará a identidade existente:

- fundo branco e mint muito claro;
- primário verde-água;
- destaque ciano para detalhes do mascote e do preview;
- texto navy com contraste forte;
- bordas mint e sombras mais seletivas;
- Inter como tipografia principal;
- uso pontual do serif existente apenas se ele melhorar algum destaque editorial.

O refinamento visual deve reduzir a sensação de grade de cards repetidos. A demonstração do produto será o principal elemento de interesse, enquanto cards de apoio terão hierarquia menor. Hover, foco e active deverão afetar propriedades específicas, com duração curta e curva de saída responsiva.

## Arquitetura de componentes

A implementação deve seguir os componentes da landing já existentes e criar apenas as fronteiras necessárias:

- `LandingHeader`: navegação e CTAs do topo;
- `LandingHero`: copy, CTAs e composição inicial do preview;
- `LandingProductPreview`: estado local do módulo selecionado e painel sintético;
- `LandingMascot`: presença visual e pontos de ancoragem do robô;
- `LandingModuleOverview`: lista de módulos e explicações curtas;
- `LandingTestimonials` e `ScrollStack`: título integrado e stack corrigido;
- `LandingFaq`: accordion controlado e acessível;
- `LandingCTA`: encerramento com os dois caminhos;
- `LandingFooter`: fechamento da página.

O preview deve receber uma lista tipada de módulos, com identificador, título, descrição curta, ícone e dados visuais sintéticos. A seleção permanece em estado local; não deve ser criada uma camada de service, hook de API ou contrato backend para uma demo de marketing.

O mascote pode compartilhar tipos e assets com um futuro onboarding, mas esta etapa não altera o backoffice nem cria o tour autenticado.

## Estados e acessibilidade

O preview deve ter:

- estado inicial previsível;
- módulo selecionado visível por cor, texto e indicação não visual;
- foco de teclado em todos os controles;
- `aria-pressed` ou semântica equivalente para a seleção;
- conteúdo útil disponível sem JavaScript avançado sempre que possível.

O FAQ deve usar botões reais, estados `aria-expanded` e associação clara entre pergunta e resposta. O accordion deve funcionar por teclado e manter contraste suficiente em todos os estados.

A página deve continuar legível em mobile, não depender de hover e não ocultar conteúdo essencial quando o movimento estiver reduzido ou desabilitado.

## Escopo fora desta entrega

O primeiro acesso do backoffice será desenhado como uma fase posterior. A direção aprovada para ele é:

- tour inicial de 3–5 etapas, com progresso e opção de pular;
- mascote disponível depois para reabrir a ajuda;
- explicações conectadas aos módulos e permissões reais.

Nenhum componente autenticado, `ThemeToggle` global, fluxo de login ou contrato backend será alterado nesta fase da landing.

## Validação e critérios de aceite

A entrega será considerada pronta quando:

- a página real em `/` seguir a ordem e a narrativa descritas;
- o `/lp` legado continuar redirecionando corretamente;
- a mini-demo trocar entre todos os módulos definidos sem chamadas de rede;
- o mascote acompanhar os pontos de ancoragem sem bloquear conteúdo;
- o ScrollStack exibir título e cards no mesmo percurso;
- o FAQ abrir e fechar por mouse, teclado e toque;
- o CTA oferecer exploração da demo e solicitação de acesso;
- a LP não mudar para dark mesmo quando o sistema ou o tema global estiverem escuros;
- desktop, mobile e `prefers-reduced-motion` forem verificados;
- TypeScript, lint focado, testes relevantes e `git diff --check` passarem;
- o detector visual do Impeccable for executado uma vez sobre os alvos alterados.
