# Agendamento por profissional e agenda diária

## Objetivo

Permitir que administrador, profissional ou recepcionista da clínica agende um paciente para um profissional escolhido, sem associar automaticamente a consulta a quem preencheu o formulário. Durante o cadastro, mostrar a agenda do profissional na data selecionada para facilitar a escolha de um horário sem conflito. O servidor deve impedir que duas consultas agendadas ocupem o mesmo intervalo do mesmo profissional, inclusive quando forem salvas simultaneamente.

## Estado atual

- O formulário de cadastro envia `professionalId` com o ID do usuário logado. O back já aceita `professionalId`, vincula a consulta a esse usuário e registra o criador separadamente em `CreatedByUserId`.
- A API de consultas lista por data, mas não filtra por profissional. O cadastro manual não valida conflitos e grava duração padrão de 60 minutos.
- A edição muda data e status, mas conserva o profissional vinculado. A aceitação de uma solicitação de paciente também cria uma consulta agendada.
- A clínica tem fuso e duração de horário configuráveis, com padrão `America/Sao_Paulo` e 60 minutos. A configuração de jornada do profissional e de horário de funcionamento ainda não foi feita por todos os usuários.

## Regras de negócio

1. O profissional é escolhido explicitamente no cadastro. São elegíveis apenas usuários ativos da mesma clínica com papel `Profissional` ou `Administrador`. `Recepcao` nunca pode ser vinculado como profissional. A autorização para criar consultas continua a seguir as permissões atuais da API.
2. A data e a hora informadas no formulário representam a hora local do fuso configurado da clínica, independentemente do fuso do navegador. O front converte esse valor para ISO/UTC e mantém o campo `appointmentDate` existente no envio. Datas locais inexistentes na mudança de horário de verão são recusadas com mensagem compreensível.
3. Novas consultas manuais usam `AppointmentSlotDurationMinutes` da clínica. Consultas existentes conservam sua duração gravada quando a data é alterada. Apenas consultas com status `Scheduled` ocupam horário.
4. Criar consulta ou mover uma consulta agendada para outra data exige data futura e intervalo inteiro livre para aquele profissional. O conflito é a interseção entre `[início, início + duração)` e outra consulta agendada e não excluída da mesma clínica e do mesmo profissional. Horários consecutivos são permitidos. Na edição, a própria consulta é excluída da busca de conflito e o profissional vinculado não muda.
5. A verificação e a gravação precisam ser coordenadas no servidor para que duas operações simultâneas não confirmem o mesmo intervalo. Todos os caminhos que criam ou movem consultas `Scheduled`, inclusive o aceite de solicitações de pacientes, devem usar a mesma proteção de conflito. Um conflito retorna erro de domínio identificável e mensagem exibível no formulário.
6. **Adiado, para uma etapa futura:** validar jornada configurada do profissional e horário de funcionamento da clínica no agendamento manual. Nenhuma dessas configurações bloqueia o cadastro ou a mudança de data nesta etapa. O painel deve deixar claro que “livre” significa apenas ausência de consulta conflitante. A inclusão futura dessas duas validações deve ocorrer quando os usuários tiverem configurado essas opções.

## API e dados

- Criar uma consulta autenticada da agenda diária, com `professionalId` e data civil `YYYY-MM-DD`. A API resolve a clínica pelo usuário autenticado, verifica se o profissional é elegível e consulta os agendamentos do dia segundo o fuso da clínica. Não retorna dados de outra clínica.
- A resposta informa data, fuso, duração e horários sugeridos de 07h a 20h, cada um com início, fim e estado livre/ocupado. Inclui as consultas `Scheduled` do profissional, com horário e nome do paciente, inclusive as que começam fora da faixa sugerida. Horários ocupados consideram sobreposição do intervalo inteiro, não apenas igualdade da hora inicial. A consulta diária não aplica jornada nem horário de funcionamento.
- Disponibilizar ao formulário a lista completa de profissionais elegíveis da clínica, sem depender apenas da primeira página de `/api/users`. Dados mínimos: ID e nome.
- O cadastro e a edição continuam enviando `appointmentDate` em ISO/UTC, conforme o contrato atual. O front converte a hora da clínica antes do envio. A API mantém `CreatedByUserId` como autor e `UserId` como profissional.
- Solicitações de pacientes pendentes não são atribuídas a um profissional; portanto não aparecem como consultas ocupadas no painel de um profissional específico. A regra existente de disponibilidade do fluxo público permanece.

## Interface

- Adicionar seletor obrigatório de profissional ao formulário de novo agendamento. Reutilizar padrões de select, cartão, tipografia, cores e estados da Agenda.
- Depois que profissional e data forem escolhidos, mostrar a agenda diária à direita do formulário em telas largas e abaixo em telas estreitas. Não há modal sobreposto. O painel apresenta horários sugeridos de 07h a 20h; os ocupados mostram horário e paciente, e os livres podem ser clicados para preencher data e hora. O campo permanece editável para horários fora da faixa sugerida.
- Exibir estados de carregamento, erro com opção de tentar novamente e dia sem consultas. A troca de profissional ou data atualiza o painel e não deve exibir temporariamente dados do filtro anterior como se fossem atuais.
- Exibir junto ao painel a explicação de que a disponibilidade considera apenas consultas agendadas. A recusa do servidor por conflito ou data inválida aparece junto ao campo de data e hora, sem limpar o formulário. A edição da consulta recebe a mesma mensagem de erro, sem ganhar seletor de profissional nesta etapa.
- Usar animação somente se ajudar a perceber a abertura do painel; manter a interação rápida e respeitar preferência por movimento reduzido. Labels, foco visível e estados de botão devem funcionar com teclado.

## Verificação

- Back: cobrir elegibilidade e isolamento por clínica; conversão do fuso; duração configurada; sobreposição parcial e horários consecutivos; conflito na criação, na edição e no aceite de solicitação; duas gravações simultâneas para o mesmo intervalo; ausência de bloqueio por jornada e funcionamento.
- Front: verificar seleção do profissional, atualização do painel por profissional/data, clique em horário livre, visualização de ocupados e preservação do formulário após erro do servidor. Conferir layout em desktop e celular.
- Executar compilação, lint e testes focados; antes de declarar implementação concluída, executar `software-quality-gate` com ferramentas fora dos repositórios e conferir `git status` antes e depois.

## Limites

- Esta etapa altera os fluxos internos de cadastro e edição e a leitura da agenda diária. Não altera a interface pública de solicitação pelo paciente nem permite trocar o profissional de uma consulta existente.
- Não requer migração de dados para separar criador e profissional: o modelo já possui campos distintos. Se a garantia contra concorrência exigir ajuste de esquema, ele deve ser limitado à integridade de consultas agendadas.
