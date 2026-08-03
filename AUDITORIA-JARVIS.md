# AUDITORIA TÉCNICA E FUNCIONAL — Jarvis Hauck

**Data:** 03/08/2026 · **Commit:** `6ab7bd5` · **Branch:** `claude/jarvis-primeiro-prompt-x64d3v`
**Escopo:** leitura, teste e documentação. **Nenhum arquivo de código foi alterado.**

Documentos irmãos: [`INVENTARIO-ARQUIVOS.md`](INVENTARIO-ARQUIVOS.md) ·
[`MATRIZ-INTEGRACOES.md`](MATRIZ-INTEGRACOES.md) · [`MATRIZ-RISCOS.md`](MATRIZ-RISCOS.md) ·
[`PLANO-PROXIMAS-ETAPAS.md`](PLANO-PROXIMAS-ETAPAS.md)

---

# 1. Resumo executivo

O Jarvis Hauck é um assistente de voz pessoal de **arquivo único** (160 KB de HTML) apoiado por
uma **antena local em Node** (17 KB, zero dependências). Está **funcional de ponta a ponta** em
tudo que pôde ser testado sem credenciais reais: boot, voz, Second Brain com grafo animado,
agenda multi-calendário, triagem de e-mails em 3 baldes, radar de notícias, Morning Digest e um
cockpit em tela cheia.

A engenharia é **sólida em higiene** — zero funções duplicadas, zero código morto, zero variáveis
órfãs, todos os modos de falha degradando com aviso claro em vez de quebrar. E é **frágil em
segurança de credenciais e em confiança no dado externo**: senhas de app e links secretos ficam em
`localStorage` puro, e títulos de evento vindos da agenda entram **literalmente** no system prompt
de todo chat, onde existe um caminho que grava na memória permanente.

Três pontos merecem decisão do fundador antes de qualquer código novo: **(a)** o Jarvis mora no
repositório do site do Apolo Oliver, um produto sem nenhuma relação com ele; **(b)** não existe
backup nem exportação do Second Brain, que é o ativo central; **(c)** Notion, n8n e o app
assistente atual **não têm uma linha de integração** — são hoje 100% planejamento.

**Recomendação: CORRIGIR ANTES.** Não reestruturar (a base é boa), não seguir direto para features
novas (as correções ficam mais caras depois, e a primeira integração de escrita é exatamente onde
os riscos atuais viram prejuízo real).

---

# 2. Estado geral do projeto

| Dimensão | Avaliação |
|---|---|
| Funciona? | **Sim.** Todos os fluxos testáveis passaram |
| Estável? | **Sim.** Zero erros de JS em todos os cenários, inclusive falhas |
| Degrada bem? | **Sim.** Antena offline, sem chave e sem internet: todos avisam e seguem |
| Seguro? | **Parcialmente.** Somente-leitura no externo (ótimo), mas credenciais desprotegidas e injeção possível |
| Manutenível? | **Médio.** Higiene excelente, mas 160 KB num arquivo, sem testes automatizados, com 2 camadas de CSS sobrepostas |
| Pronto para integrar Notion/n8n? | **Não.** Falta backup, exportação, identidade de dados e defesa contra injeção |
| Testado? | Agora sim: **34 testes** executados nesta auditoria |

---

# 3. Percentual estimado de conclusão por módulo

Percentual = quanto do que o módulo precisa para ser confiável no uso diário já existe.

| Módulo | % | Status | O que falta |
|---|---|---|---|
| Voz (STT + TTS + wake word) | **90%** | Implementado | Teste com microfone real; escolha de voz depende das vozes do SO |
| Personalidade / chat | **95%** | Implementado | — |
| Second Brain (dados + grafo) | **85%** | Implementado | Exportar/importar; sem backup |
| Memória viva `[[SAVE:]]` | **70%** | Implementado, **inseguro** | Confirmação do usuário; sanitização; origem auditável |
| Seletor de modelo | **95%** | Implementado | — |
| Chave de API | **60%** | Implementado, **inseguro** | Sair do navegador para a antena |
| Agenda (ICS + RRULE) | **85%** | Implementado | Teste contra Google real; RRULE exótica ignorada por design |
| E-mails (IMAP + triagem) | **80%** | Implementado | Teste com Gmail real; credencial desprotegida |
| Notícias | **90%** | Implementado | Teste contra Google News real |
| Clima | **70%** | Implementado, **não testado** | Sandbox bloqueou Open-Meteo |
| Morning Digest | **90%** | Implementado | Caminho com IA real não testado |
| Comandos locais de voz | **95%** | Implementado | — |
| Painel visual / design | **95%** | Implementado | — |
| FACE (cockpit) | **90%** | Implementado | — |
| Configurações (⚙) | **85%** | Implementado | Sem validar formato de link/senha |
| Antena `server.js` | **80%** | Implementado | Sem `Origin`/`Host`; IMAP real não testado |
| **Notion** | **0%** | **Apenas planejado** | Tudo |
| **n8n** | **0%** | **Apenas planejado** | Tudo |
| **Integração com o app atual** | **0%** | **Apenas planejado** | Tudo |

**Média ponderada do que foi construído: ~85%. Da visão completa (com Notion/n8n): ~55%.**

---

# 4. O que está funcionando (verificado)

**Núcleo** — Boot → ativação → app; saudação falada; wake word "Ei Hauck" normalizada sem acento;
grafo SVG com 19 nós, 12 pulsos animados e clique abrindo o editor; contador "19 notas · 8 áreas";
seletor de modelo persistindo em `CONFIG.model` (`claude-opus-5` confirmado no corpo da requisição).

**Agenda** — Fuso `TZID` correto; UTC `20:00Z` convertido para **17:00** de Brasília; evento de dia
inteiro; `RRULE:FREQ=DAILY;COUNT=10` expandida em **dias distintos**; `EXDATE` removendo exatamente
o dia certo (a timeline pula de quarta 05/08 para sexta 07/08); `STATUS:CANCELLED` excluído;
`VEVENT` sem `DTSTART` ignorado sem derrubar o resto; contagem regressiva no próximo evento.

**E-mails** — Triagem em 3 baldes; **cache por Message-ID comprovado**: 3 e-mails novos → 1 chamada
com os 3; cache com A+B e chegada de C → **só o C** é enviado; 3 cliques no ↻ com cache cheio →
**zero chamadas**. Fallback heurístico sem chave classifica corretamente. Badge ⚡ no HUD.

**Notícias e Digest** — RSS por assunto com sufixo " - Fonte" limpo; cache respeitando intervalo.
Digest offline monta briefing completo (agenda + e-mails de ação + manchetes + foco ligado à meta
do Second Brain) e é falado, custando zero.

**FACE** — Relógio correndo; canvas animando (soma de pixels muda entre frames); estado espelhando
o orbe real via `MutationObserver`; `Esc` fecha e **os timers param** (relógio congela); `?face=1`;
tudo dentro da tela em 1440px, 390px e 360px.

**Falhas** — Antena offline: 3 painéis com instrução `node server.js`, resto funciona. Sem chave:
pede a chave, comandos locais e triagem heurística seguem. Sem internet para a IA: avisa e o digest
cai no template offline.

---

# 5. O que está quebrado

**Nada quebrado foi encontrado.** Zero erros de JS em todos os cenários testados.

Uma única anomalia observada e **não reproduzida**: o painel de e-mails ficou preso em "buscando…"
uma vez. Três testes desenhados para reproduzir não conseguiram. Registrado como R12 (BAIXO,
não confirmado) — não afirmo que seja bug.

---

# 6. O que está apenas planejado

| Item | Evidência |
|---|---|
| **Notion** | As strings `notion` e `n8n` aparecem **1 vez** em todo o projeto: dentro do texto da nota "Fato-Hype". Sem cliente, credencial ou endpoint |
| **n8n** | idem |
| **Integração com o app assistente atual** | Nenhuma referência |
| **Backup / exportação do Second Brain** | Nenhum código |
| **Canais (WhatsApp/Telegram)** | A FACE mostra "CANAIS · STANDBY" — é um rótulo fixo, não há integração |
| **Entrada automática na FACE** | Implementada mas **opt-in desligado** por padrão (`hub_face_entry`) |

---

# 7. Testes executados

34 testes. Ambiente: Node 22 + Chromium headless (Playwright). Fontes externas simuladas por
fixtures porque **o sandbox desta sessão bloqueia egress** para `calendar.google.com`,
`news.google.com`, `imap.gmail.com` e `open-meteo.com`.

## 7.1 Sintaxe e estrutura

| # | Teste | Comando | Esperado | Encontrado | Status |
|---|---|---|---|---|---|
| T01 | Sintaxe dos 2 scripts | `node --check` | sem erro | sem erro | **PASSOU** |
| T02 | Sintaxe do `server.js` | `node --check server.js` | sem erro | sem erro | **PASSOU** |
| T03 | Chaves CSS balanceadas (3 blocos) | parser próprio | saldo 0 | saldo 0 nos 3 | **PASSOU** |
| T04 | IDs referenciados existem | regex `getElementById` × `id=` | conjunto vazio | vazio | **PASSOU** |
| T05 | Funções duplicadas | varredura | nenhuma | nenhuma | **PASSOU** |
| T06 | Funções nunca chamadas | varredura | nenhuma | nenhuma | **PASSOU** |
| T07 | Variáveis nunca lidas | varredura | nenhuma | nenhuma | **PASSOU** |

## 7.2 Antena — rede e segurança

| # | Teste | Comando | Esperado | Encontrado | Status |
|---|---|---|---|---|---|
| T08 | Boot | `node server.js` | banner na porta 4242 | banner correto | **PASSOU** |
| T09 | `/status` | `curl /status` | 200 + JSON | `{"antena":"online",...}` 200 | **PASSOU** |
| T10 | Domínio fora da allowlist | `curl /proxy?url=evil.example.com` | 403 | 403 + erro claro | **PASSOU** |
| T11 | Host IMAP fora da allowlist | `POST /emails host=imap.evil.com` | 403 | 403 | **PASSOU** |
| T12 | Preflight | `curl -X OPTIONS` | 204 + headers CORS | 204 + 4 headers | **PASSOU** |
| T13 | SSRF `file://` | `curl /proxy?url=file:///etc/passwd` | bloqueado | 403 | **PASSOU** |
| T14 | SSRF IP de metadata | `curl /proxy?url=169.254.169.254` | bloqueado | 403 | **PASSOU** |
| T15 | Rota inexistente | `curl /qualquer` | 404 | 404 | **PASSOU** |
| T16 | Mascaramento no log | link secreto + senha reais | não vazar | nenhum dos 3 segredos no log | **PASSOU** |
| T17 | Validação de `Origin` | `-H "Origin: site-malicioso"` | rejeitar | **aceitou (200)** | **FALHOU** → R4 |
| T18 | Validação de `Host` | `-H "Host: attacker.example.com"` | rejeitar | **aceitou (200)** | **FALHOU** → R4 |
| T19 | IMAP somente leitura | varredura de comandos | só leitura | só LOGIN/EXAMINE/FETCH/LOGOUT | **PASSOU** |
| T20 | `BODY.PEEK` presente | grep | presente | 3 ocorrências | **PASSOU** |
| T21 | Limite de corpo no POST | leitura | existe | 64 KB | **PASSOU** |
| T22 | Bind só em loopback | `curl` no IP do container | recusar | container só tem loopback | **INCONCLUSIVO** |

> T22: o código faz `servidor.listen(PORTA, '127.0.0.1')` — verificado estaticamente. O container
> não tem interface externa, então **não foi possível provar por teste**. Confirmar na sua máquina.

## 7.3 Parser ICS e agenda

| # | Teste | Esperado | Encontrado | Status |
|---|---|---|---|---|
| T23 | `TZID=America/Sao_Paulo` 09:00 | 09:00 | 09:00 | **PASSOU** |
| T24 | UTC `20:00:00Z` | 17:00 (Brasília) | 17:00 | **PASSOU** |
| T25 | `VALUE=DATE` dia inteiro | "DIA TODO" | "DIA TODO" | **PASSOU** |
| T26 | `RRULE:FREQ=DAILY;COUNT=10` | 1× por dia distinto | 7 dias distintos | **PASSOU** |
| T27 | `EXDATE` | remove só aquele dia | pula 05/08 → 07/08 | **PASSOU** |
| T28 | `STATUS:CANCELLED` | não aparece | não apareceu | **PASSOU** |
| T29 | `VEVENT` sem `DTSTART` | ignora sem quebrar | ignorou, 0 erros | **PASSOU** |
| T30 | Line unfolding | título remontado | remontado | **PASSOU** |

## 7.4 E-mails, triagem e economia

| # | Teste | Esperado | Encontrado | Status |
|---|---|---|---|---|
| T31 | Triagem em lote | 3 novos → 1 chamada | `[['mid-A','mid-B','mid-C']]` | **PASSOU** |
| T32 | Cache por Message-ID | cache A+B, chega C → só C | `[['mid-C']]` | **PASSOU** |
| T33 | ↻ com cache cheio | 0 chamadas de IA | 3 cliques, 0 chamadas | **PASSOU** |
| T34 | Fallback heurístico sem chave | 3 baldes plausíveis | ação/info/ruído corretos | **PASSOU** |

## 7.5 Falhas, privacidade e responsividade

| # | Teste | Esperado | Encontrado | Status |
|---|---|---|---|---|
| T35 | Antena offline | aviso + resto funciona | 3 painéis com `node server.js`, 0 erros | **PASSOU** |
| T36 | Sem chave de API | pede a chave | mensagem falada correta | **PASSOU** |
| T37 | Sem internet para a IA | avisa + digest offline | template offline completo | **PASSOU** |
| T38 | Senha de app vai para a Anthropic? | não | **não aparece no corpo** | **PASSOU** |
| T39 | Link iCal vai para a Anthropic? | não | **não aparece no corpo** | **PASSOU** |
| T40 | Injeção via título de evento | não chegar literal | **chegou literal** | **FALHOU** → R2 |
| T41 | Responsivo 1440 / 390 / 360 px | sem overflow | sem overflow nos 3 | **PASSOU** |
| T42 | FACE: timers param ao fechar | relógio congela | congelou | **PASSOU** |
| T43 | Voz com microfone real | — | headless não tem microfone | **INCONCLUSIVO** |
| T44 | Clima (Open-Meteo) | — | egress bloqueado | **INCONCLUSIVO** |
| T45 | Google Agenda / News / Gmail reais | — | egress bloqueado | **INCONCLUSIVO** |

**Placar: 39 passaram · 3 falharam (T17, T18, T40) · 4 inconclusivos (T22, T43, T44, T45).**

---

# 8. Dívida técnica

| # | Dívida | Gravidade | Detalhe |
|---|---|---|---|
| D1 | **Duas camadas de CSS sobrepostas** | Média | 110 dos 171 seletores do `design-layer` sobrescrevem o `<style>` original. Boa parte dos 19 KB originais é peso morto. Editar visual exige entender qual camada vence |
| D2 | **Arquivo único de 160 KB** | Média | 3.780 linhas sem build nem módulos. Funciona (é requisito do produto), mas cresce mal |
| D3 | **Zero testes automatizados no repo** | Média | Os 34 testes desta auditoria são scripts temporários, não versionados. Nada impede uma regressão silenciosa |
| D4 | **Cor do tema em 3 lugares** | Baixa | `:root --theme/--accent`, `CONFIG.themeColor/accentColor` e `--primary/--brand2`. Coerentes hoje via `applyTheme()`, mas os literais se repetem |
| D5 | **Dependência total de `localStorage`** | **Alta** | 8 chaves, sem export, sem sync, sem backup. É o maior obstáculo para integrar Notion |
| D6 | **Sem identidade estável de dados** | **Alta** | Notas usam `id` gerado por `Date.now()+random`; e-mails usam Message-ID. Não há `updated_at` nem origem. Sincronizar com Notion sem isso gera duplicata garantida |
| D7 | **Estado global via flags** | Baixa | `mailLoading`, `agendaLoading`, `newsLoading`, `digestRodando`, `busy` — provável origem de R12 |
| D8 | **Backup manual no disco** | Baixa | `*.bak-pre-design-20260803` (112 KB) duplicando o app. Git já cobre |
| D9 | **Textos e prompts embutidos** | Baixa | Todo copy e todo prompt hardcoded. Ajustar tom exige editar o HTML |
| D10 | **Repo compartilhado com outro produto** | Média | Ver R9. Todo push do Jarvis dispara 2 builds do site do artista |

---

# 9. Duplicações

| Verificação | Resultado |
|---|---|
| Funções duplicadas | **Nenhuma** |
| Código morto | **Nenhum** |
| Módulos fazendo a mesma coisa | **Nenhum** |
| Variáveis conflitantes | **Nenhuma** |
| Arquivos antigos | **1** — o `.bak` (gitignorado) |
| Configuração repetida | **1** — cor do tema em 3 lugares (D4) |
| Sobreposição de CSS | **110 seletores** (D1) |
| Sobreposição funcional com o app atual | Ver §10 — **potencialmente alta**, mas hoje 0% conectado |

A higiene do código é notavelmente boa. As duplicações reais são de **estilo** e de **configuração**,
não de lógica.

---

# 10. Relação com o app assistente atual (análise arquitetural)

> O app conectado ao Notion **não está nesta pasta** e **não foi acessado**. A análise abaixo é
> arquitetural, baseada no que o Jarvis faz e no que um assistente ligado ao Notion tipicamente faz.
> Onde não há evidência, está marcado como hipótese.

## 10.1 Funções que podem se sobrepor

| Função | Jarvis hoje | App atual (hipótese) | Sobreposição |
|---|---|---|---|
| Agenda do dia | Lê iCal, mostra timeline | Provável leitura de tarefas/datas do Notion | **Alta** |
| Tarefas / o que fazer | Não tem tarefas — tem *notas* | Provavelmente é o núcleo dele | Baixa hoje, **alta** se o Jarvis ganhar tarefas |
| Briefing matinal | Morning Digest | Provável resumo diário | **Alta** |
| Memória de contexto | Second Brain (19 notas locais) | Notion como base | **Crítica** — duas verdades sobre a mesma vida |
| Triagem de e-mail | 3 baldes | Não confirmado | Desconhecida |
| Notificação | Fala em voz alta | Provável push no celular | **Média** |

## 10.2 Riscos da coexistência

- **Duas fontes de tarefas** — se o Jarvis passar a criar tarefas localmente, existirão duas listas
  que nunca convergem. Hoje o risco é **zero** porque o Jarvis não tem tarefas; ele nasce no
  momento em que ganhar.
- **Notificação duplicada** — o mesmo compromisso vira digest falado *e* push. Irritação garantida.
- **Estados divergentes** — o caso mais provável: você edita uma nota no grafo do Jarvis, ela vive
  só no `localStorage` daquele navegador, e o Notion nunca sabe. Duas semanas depois ninguém sabe
  qual está certa. **Isso já pode acontecer hoje** (D5 + D6).
- **Memória viva contaminando a fonte oficial** — se `[[SAVE:]]` um dia escrever no Notion, o R2
  (injeção via agenda) deixa de sujar um `localStorage` e passa a sujar a base da empresa. **Este é
  o motivo mais forte para corrigir o R2 antes de integrar.**

## 10.3 Avaliação da hipótese de arquitetura

A hipótese proposta (Notion = fonte oficial · Jarvis = interface e priorização · n8n = automação ·
app = painel móvel) **é sólida e eu a endosso**, com dois ajustes:

**Ajuste 1 — O Second Brain não deveria ser cópia do Notion, e sim uma *projeção* dele.**
Hoje ele é a única fonte. Se virar cópia bidirecional, você compra o pior problema de sistemas
distribuídos (resolução de conflito) sem precisar. Sugestão: **Notion escreve, Jarvis lê**, e as
notas que a memória viva gerar entram numa fila de "sugestões pendentes" que você aprova.
Direção única elimina conflito por construção.

**Ajuste 2 — n8n como transporte, mas não como dono de lógica de decisão.**
"O que é prioridade hoje" deve morar num lugar só. Como a priorização é o valor do Jarvis, ela
fica nele; o n8n move dados e dispara gatilhos, não decide.

## 10.4 Divisão recomendada

| Camada | Fica com | Não deve fazer |
|---|---|---|
| **Notion** | Verdade sobre projetos, tarefas, metas, pessoas, decisões. Histórico e auditoria | Ser consultado em tempo real a cada frase falada (lento e caro) |
| **Jarvis** | Voz, conversa, priorização, briefing, triagem de e-mail, leitura de agenda, cockpit | Ser dono de tarefa. Escrever direto no Notion sem aprovação |
| **n8n** | Sincronizar Notion↔Jarvis, buscar e-mail/agenda em horário fixo, disparar rotinas, entregar push | Decidir prioridade. Guardar estado próprio |
| **App atual** | Painel móvel, consulta rápida, notificação, marcar tarefa como feita | Ter uma segunda lógica de briefing |

**Regra única para resolver a maioria dos conflitos:** *um dado tem exatamente um dono que escreve;
todos os outros leem.* Tarefa e projeto → Notion. Preferência e memória de conversa → Jarvis.
Nada é escrito nos dois lados.

---

# 11. Riscos prioritários (ordenados)

1. **R2 — Injeção via título de evento (ALTO).** Único risco com caminho de escrita. Fica mais grave
   a cada integração nova.
2. **R1 — Senha de app do Gmail em `localStorage` (ALTO).** Dá leitura de toda a caixa.
3. **R3 — Link secreto iCal em `localStorage` (MÉDIO-ALTO).** Credencial permanente e silenciosa.
4. **R5 + R8 — Sem backup nem exportação (MÉDIO).** Um clique em "limpar dados" apaga tudo que você
   personalizou.
5. **R4 — Antena sem `Origin`/`Host` (MÉDIO).** Impacto hoje baixo, mas cresce se a antena ganhar rotas.
6. **D6 — Sem identidade estável de dados (ALTA como dívida).** Bloqueia integração limpa com Notion.
7. **R9 — Repo compartilhado (MÉDIO).** Risco de o `jarvis-hauck.html` ser servido publicamente.

---

# 12. Próximos passos recomendados

Detalhado em [`PLANO-PROXIMAS-ETAPAS.md`](PLANO-PROXIMAS-ETAPAS.md). Resumo:

1. Separar o Jarvis para repositório próprio.
2. Blindar a memória viva e o contexto externo (R2).
3. Tirar as credenciais do navegador (R1, R3, R7).
4. Exportar/importar o Second Brain + identidade estável de dados (R5, R8, D6).
5. Só então: integração de leitura com o Notion.

---

# 13. Arquivos para revisão externa

Se for levar a alguém de fora, leve **exatamente estes** — e nada mais:

| Arquivo | Por quê | Cuidado |
|---|---|---|
| `server.js` | 17 KB, contém toda a superfície de rede e o cliente IMAP | Nenhum segredo embutido — **pode compartilhar como está** |
| `jarvis-hauck.html` | O produto inteiro | **Sem segredos no arquivo** (credenciais só entram em runtime no `localStorage`). Seguro compartilhar |
| `MATRIZ-RISCOS.md` | Para o revisor começar pelos problemas conhecidos | — |
| `MATRIZ-INTEGRACOES.md` | Para entender o que entra e sai | — |

**Prioridade da revisão externa:** (1) o parser IMAP em `server.js` — código de protocolo escrito à
mão merece um segundo par de olhos; (2) a superfície CORS/`Origin`; (3) a cadeia de prompt injection
do R2.

**Não compartilhe:** qualquer print do painel ⚙ preenchido, o conteúdo do seu `localStorage`, e o
`.bak` local.

---

# 14. Decisões que precisam do fundador

| # | Decisão | Por que é sua | Recomendação |
|---|---|---|---|
| **D-1** | O Jarvis sai do repo do Apolo Oliver? | Muda deploy, histórico e exposição | **Sim, separar** |
| **D-2** | A chave da Anthropic sai do navegador para a antena? | Troca "abrir com dois cliques" por "sempre precisar da antena" | **Sim** — a antena já é necessária para agenda e e-mail |
| **D-3** | Memória viva passa a pedir confirmação antes de gravar? | Menos mágica, mais controle | **Sim**, ou ao menos marcar origem e permitir desfazer |
| **D-4** | Notion vira fonte oficial com escrita só de lá para cá? | Define a arquitetura dos próximos meses | **Sim**, direção única |
| **D-5** | O Jarvis vai ter tarefas? | Se sim, colide direto com o app atual | **Não** — deixe tarefa no Notion; o Jarvis prioriza e fala |
| **D-6** | Google Fonts fica ou volta para fonte do sistema? | Você aprovou o CDN; contradiz "zero dependências" | Fica — impacto baixo |
| **D-7** | Manter suporte a "abrir com dois cliques"? | Restringe muita coisa (credencial, chave, CORS) | Reavaliar se um `npm start` único não é melhor |

---

# 15. Recomendação final

## **CORRIGIR ANTES**

**Não é REESTRUTURAR:** a base é boa. Zero código morto, zero duplicação de lógica, degradação
elegante em todos os modos de falha, e o parser ICS — a parte que mais quebra em projeto amador —
passou em todos os casos-limite, incluindo `EXDATE`. Jogar fora seria desperdício.

**Não é CONTINUAR:** existem um caminho de injeção com escrita em memória, credenciais de leitura
total do Gmail em texto claro, e nenhum backup do ativo mais valioso do produto. Cada feature nova
aumenta o custo de consertar isso — e a primeira integração com o Notion transforma "sujou o
localStorage" em "sujou a base da empresa".

**O caminho:** cinco etapas de correção (estimadas em 1 a 2 semanas de trabalho focado) e depois
seguir para Notion e n8n com base firme. O plano está em
[`PLANO-PROXIMAS-ETAPAS.md`](PLANO-PROXIMAS-ETAPAS.md).

---

## Nota de honestidade sobre esta auditoria

O sandbox onde ela rodou **bloqueia egress** para `calendar.google.com`, `news.google.com`,
`imap.gmail.com` e `open-meteo.com`. Tudo que envolve essas fontes foi testado com fixtures
realistas interceptando a antena — o que valida **parsing, renderização, cache e economia de
tokens**, mas **não** valida o handshake real com o Google.

Continuam sem confirmação até você rodar na sua máquina: login IMAP real, download de um `.ics`
real do Google, RSS real do Google News, Open-Meteo, microfone real e a resposta real do Claude
(inclusive se ele resiste à injeção do R2). São 4 testes INCONCLUSIVOS de 46 — não são detalhe,
são a fronteira honesta desta auditoria.
