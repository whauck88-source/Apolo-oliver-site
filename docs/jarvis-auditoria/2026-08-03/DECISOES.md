# DECISÕES FUNDADORAS — HAUCK

**Data da aprovação:** 03/08/2026 · **Aprovado por:** Willian Hauck (fundador)
**Origem:** §14 de [`AUDITORIA-JARVIS.md`](AUDITORIA-JARVIS.md) — "Decisões que precisam do fundador"

Este documento é **registro, não execução**. Nenhuma etapa foi iniciada e nenhum arquivo de código
foi alterado.

O texto das nove decisões abaixo, em citação, é a **redação oficial do fundador** e prevalece sobre
qualquer outra formulação em qualquer documento deste repositório. O que vem depois de cada citação
são **observações técnicas** — elas informam a execução, mas **não** condicionam nem restringem a
decisão.

---

## Quadro-resumo

| # | Decisão | Resposta |
|---|---|---|
| D-1 | Separação do repositório | **Separar** e criar repositório próprio |
| D-2 | Credenciais no navegador | **Todas** (Anthropic, senha de app, iCal) vão para a antena |
| D-3 | Memória viva | **Não grava automaticamente** — sugestão pendente com aprovação |
| D-4 | Notion | **Fonte oficial**; o Hauck apenas lê nesta fase |
| D-5 | Tarefas no Hauck | **Não terá** lista própria |
| D-6 | Google Fonts | **Permanece** |
| D-7 | "Abrir com dois cliques" | **Não é requisito absoluto** |
| D-8 | Nome oficial | **HAUCK**; "Jarvis" é legado |
| D-9 | Papel do Hauck | **Portal de orquestração** entre Will e os agentes |

---

## D-1 · Separação do repositório

> Separar o Hauck do repositório do Apolo Oliver e criar repositório próprio.

**Resolve:** R9 (MÉDIO) e D10 da auditoria.

**Observação operacional (não é condição da decisão):** o `PLANO-SEPARACAO-REPOSITORIO.md` §9
registra o risco **RS-6** — o `localStorage` em `file://` é vinculado à origem, então mover o arquivo
de pasta pode deixar notas, chave de API, links iCal e senhas de app inacessíveis, e hoje não existe
exportação (R8). Fica como alerta de execução: exportar ou fazer backup manual dos dados do
navegador antes de mover.

---

## D-2 · Credenciais fora do navegador

> Chave da Anthropic, senha de app do Gmail e links secretos iCal devem sair do navegador e ficar
> protegidos na antena local.

**Resolve:** R1 (ALTO), R3 (MÉDIO-ALTO) e R7 (MÉDIO) — os três riscos de credencial da auditoria.

**Observações técnicas:**
- Hoje as três vivem em `localStorage` puro: `anthropic_key`, `jarvis_emails[].senhaApp` e
  `jarvis_calendars[].url`.
- Com a chave da Anthropic na antena, a chamada passa a sair do servidor e o header
  `anthropic-dangerous-direct-browser-access` deixa de ser necessário.
- O app passa a exigir a antena para conversar. A antena já é obrigatória para agenda, e-mail e
  notícias — ver também D-7.

---

## D-3 · Memória viva com aprovação

> A memória viva não grava automaticamente. Ela cria uma sugestão pendente que exige aprovação
> explícita do usuário.

**Resolve:** o dano do R2 (ALTO) e parte do R6.

**Observações técnicas:**
- O mecanismo definido é **sugestão pendente**: nada entra no Second Brain sem aprovação.
- Para a sugestão ser auditável e reversível, cada registro deve carregar **origem** e **data**, com
  ação de **desfazer** disponível.
- Isso ataca a *consequência* do R2, não a *causa*. A sanitização do contexto externo e a
  delimitação dado-versus-instrução continuam necessárias — a aprovação é a segunda barreira.

---

## D-4 · Notion como fonte oficial

> O Notion será a fonte oficial de projetos, tarefas, metas e decisões. O Hauck inicialmente apenas
> lê esses dados.

Confirma o **Ajuste 1** do §10.3 da auditoria: o Second Brain passa a ser uma **projeção** do Notion,
não uma cópia bidirecional. Direção única elimina resolução de conflito por construção.

**Escopo da fonte oficial:** projetos, tarefas, metas e decisões.

**Fronteira desta fase:** leitura apenas. Nenhuma escrita automática no Notion. Escrita fica para
etapa posterior e exigirá decisão nova.

---

## D-5 · Sem lista de tarefas própria

> O Hauck não terá uma lista própria de tarefas. Ele prioriza, resume e conversa sobre as tarefas
> pertencentes ao Notion.

**Elimina** o risco de duas fontes de tarefa identificado em §10.2 da auditoria. Como o Hauck hoje
não tem tarefas (só notas), o risco era zero e assim permanece.

Também fixa a fronteira com o app assistente atual: priorização e voz no Hauck; posse da tarefa no
Notion.

---

## D-6 · Google Fonts

> Google Fonts permanece por enquanto, aceitando a dependência externa e o fallback quando estiver
> offline.

**Risco aceito conscientemente:** R10 (BAIXO). Space Grotesk e JetBrains Mono vêm de CDN; sem
internet o app cai no fallback do sistema e fica visualmente pior, mas funciona. Implica também uma
requisição ao Google a cada abertura.

Contradiz a regra original de "zero dependências externas" da Parte 1 — contradição **conhecida e
aceita**, registrada para não ser redescoberta como problema depois.

---

## D-7 · "Abrir com dois cliques" não é requisito absoluto

> O modo "abrir com dois cliques" não é requisito absoluto. O Hauck pode exigir que a antena seja
> iniciada por um comando único, atalho ou `npm start`.

Destrava as correções de segurança do D-2, que eram limitadas justamente por esse requisito.

**Observações técnicas:**
- Se o app passar a ser servido por `http://localhost` em vez de `file://`, a origem muda. Isso tem
  duas consequências: **(a)** o `localStorage` gravado sob `file://` não é herdado — mesma família do
  RS-6, exportar antes; **(b)** a política de origem da antena passa a poder usar uma allowlist real,
  o que permite **fechar o R4**.
- `npm start` introduziria a primeira dependência de pacote num projeto que hoje tem zero. Um script
  Node puro ou um atalho de sistema atende igual — o `server.js` já roda só com a biblioteca padrão.
  A decisão admite as três formas: comando único, atalho ou `npm start`.

---

## D-8 · Nome oficial do produto

> O nome oficial do produto e do assistente é HAUCK. "Jarvis" é apenas o nome legado usado durante o
> desenvolvimento e deverá ser substituído progressivamente em interface, documentação e novo
> repositório, sem renomeações em massa nesta etapa.

**Aplicação imediata:** este documento adota HAUCK. O assistente já se chama "Hauck" na interface
desde a Parte 1 (`CONFIG.name`), e a wake word é "Ei Hauck" — a interface **já está correta**.

**O que ainda carrega o nome legado, por decisão explícita de não renomear em massa agora:**

| Item | Situação |
|---|---|
| `jarvis-hauck.html` | nome de arquivo — renomear só na criação do repositório próprio (D-1) |
| `docs/jarvis-auditoria/2026-08-03/` | caminho desta pasta — manter, é registro histórico datado |
| `AUDITORIA-JARVIS.md` e demais relatórios | manter; são o registro da auditoria como foi feita |
| Chaves de `localStorage` (`jarvis_notes`, `jarvis_settings`, etc.) | **não renomear** — renomear apagaria os dados do usuário |
| Branch `claude/jarvis-primeiro-prompt-x64d3v` | manter até a separação |

**Alerta:** as chaves de `localStorage` são o caso em que renomear **destrói dado**. Se algum dia
forem migradas, precisa de rotina de migração, não de substituição de texto.

---

## D-9 · Hauck como portal de orquestração

> O HAUCK será o portal de orquestração entre Will, Nilo, Clau e futuros agentes especializados.

### Função do Hauck

- compreender a intenção de Will;
- identificar qual agente é mais adequado para cada demanda;
- preparar e encaminhar briefings com o contexto necessário;
- preservar a especialidade e o papel de cada agente;
- acompanhar respostas e tarefas encaminhadas;
- comparar pareceres quando houver mais de uma análise;
- apresentar convergências, divergências, riscos e decisões pendentes;
- registrar no Notion somente o que tiver sido aprovado;
- manter Will como autoridade final sobre qualquer ação, envio ou alteração externa.

### Papéis iniciais

| Ator | Papel |
|---|---|
| **Will** | fundador, direção, intenção e decisão final |
| **Hauck** | contexto, priorização, orquestração e acompanhamento |
| **Nilo** | auditoria externa, contraponto, revisão crítica e red team |
| **Clau** | execução técnica, construção, documentação e operação |
| **Notion** | fonte oficial de projetos, tarefas, metas e decisões |
| **n8n** | transporte, sincronização e disparo de rotinas, sem decidir prioridades |
| **App móvel** | consulta, acompanhamento e notificações |

### Regras arquiteturais

1. O Hauck **não deve fingir ser** Nilo ou Clau.
2. Cada agente mantém identidade, função e responsabilidade próprias.
3. **Nenhuma mensagem, tarefa ou arquivo será enviado a outro agente sem autorização explícita de
   Will**, salvo automações previamente aprovadas.
4. O Hauck **poderá preparar** o pacote de encaminhamento antes da autorização.
5. Respostas recebidas deverão ser resumidas **sem apagar** pontos relevantes ou divergências.
6. Quando duas IAs discordarem, o Hauck apresentará as opções e **solicitará decisão humana**.
7. Nenhum agente será tratado como fonte oficial de tarefas ou decisões. A fonte oficial continuará
   sendo o **Notion**.
8. Nesta etapa, a decisão é **somente conceitual e arquitetural**. Não implementar integrações entre
   agentes.

### Coerência com as decisões anteriores

| Ponto | Decisão que sustenta |
|---|---|
| Notion como fonte oficial, nenhum agente a substitui | **D-4** |
| Registrar no Notion só o aprovado | **D-3** (sugestão pendente) e **D-4** (leitura nesta fase) |
| Will como autoridade final sobre envio ou alteração externa | **D-3** |
| Hauck prioriza e acompanha, mas não possui tarefas | **D-5** |

**Observações técnicas:**
- A regra 3 é a mesma barreira do D-3, aplicada a um segundo domínio: lá o que exigia aprovação era
  a escrita na memória; aqui é o envio a outro agente. Vale registrar que hoje o Hauck **não tem
  nenhum caminho de escrita externa** — a `MATRIZ-INTEGRACOES.md` confirma que ele só lê. A regra
  nasce, portanto, antes da capacidade que ela regula, que é a ordem correta.
- A regra 5 ("sem apagar divergências") é o ponto que mais depende de disciplina de implementação:
  resumir é comprimir, e comprimir é onde divergência se perde. Quando isso virar código, o resumo
  de pareceres conflitantes deve preservar a discordância de forma explícita, não diluí-la.
- A regra 8 mantém esta decisão fora do escopo de execução. Nenhuma integração entre agentes foi
  criada, e nenhuma está planejada nas cinco etapas do `PLANO-PROXIMAS-ETAPAS.md`.

---

## Registro complementar — evolução possível

O modelo de orquestração descrito no D-9 **poderá futuramente evoluir para um produto comercial** de
orquestração pessoal de agentes especializados.

Isso é registro de intenção, **não faz parte do escopo técnico atual** e não altera nenhuma das nove
decisões. Nenhuma etapa do plano vigente pressupõe ou prepara essa evolução.

---

## Escopo fechado por decisão explícita

- **Tarefas no Hauck** (D-5) — fora de escopo.
- **Escrita automática no Notion** (D-4) — fora de escopo nesta fase.
- **Integrações entre agentes** (D-9, regra 8) — fora de escopo nesta etapa; a decisão é conceitual.

Todas exigiriam decisão nova para voltar à mesa.

---

## Estado no momento do registro

- **Branch:** `claude/jarvis-primeiro-prompt-x64d3v`
- **`jarvis-hauck.html`** → `4770414d6832180063ead82579c3a44a5208081f` (inalterado desde `6ab7bd5`)
- **`server.js`** → `40504994c35f0073c54490222d55682ca60a5444` (inalterado desde `6ab7bd5`)
- **Nenhuma etapa iniciada.**

---

## Histórico deste documento

### 03/08/2026 — versão 1 (commit `1a93ae5`)

Registrou sete decisões, a partir da primeira formulação do fundador.

### 03/08/2026 — versão 2 (esta)

Substituída pela redação oficial das **oito** decisões. Mudanças em relação à versão 1:

| # | O que mudou |
|---|---|
| D-1 | **Removida a condição** "somente depois de concluir e validar a Etapa 4". O RS-6 permanece registrado como observação de execução, não como condição |
| D-2 | **Escopo ampliado** de apenas a chave da Anthropic para as três credenciais: chave da Anthropic, senha de app do Gmail e links secretos iCal. Passa a resolver R1 e R3, além de R7 |
| D-3 | Mecanismo explicitado como **sugestão pendente**; origem, data e desfazer passam de requisito da decisão a observação técnica |
| D-4 | **Escopo enumerado**: projetos, tarefas, metas e decisões. Removida a menção a "via n8n", que não estava na decisão |
| D-5 | Sem mudança de conteúdo |
| D-6 | Sem mudança de conteúdo; a dependência externa passa a ser citada explicitamente |
| D-7 | **Invertida de restritiva para permissiva.** Removidas a cláusula "desde que não reduza a segurança" e a exigência de "proposta escrita e nova aprovação", que não constam da decisão oficial. Admite comando único, atalho ou `npm start` |
| D-8 | **Nova decisão** — nome oficial HAUCK |

**Também removido:** a tabela "Impacto no plano de etapas" da versão 1, que reordenava as cinco
etapas do `PLANO-PROXIMAS-ETAPAS.md` com base na condição do D-1. Como a condição não faz parte da
decisão oficial, a reordenação perdeu fundamento e foi retirada em vez de mantida incorreta. O
`PLANO-PROXIMAS-ETAPAS.md` **não foi alterado** — segue com a ordem original.

### 03/08/2026 — versão 3 (esta)

**Acrescentada a D-9 — Hauck como portal de orquestração**, com função, papéis iniciais dos sete
atores e as oito regras arquiteturais. Somada uma seção de registro complementar sobre a evolução
possível para produto comercial, marcada como fora do escopo técnico atual.

**As decisões D-1 a D-8 foram preservadas integralmente** — nenhuma linha do texto oficial delas foi
tocada nesta versão. As únicas alterações fora do bloco novo foram: a contagem "oito" → "nove" no
cabeçalho, uma linha nova no quadro-resumo, e uma linha nova em "Escopo fechado" apontando a regra 8
da D-9.

Nenhuma integração entre agentes foi implementada. A D-9 é conceitual e arquitetural, conforme a sua
própria regra 8.
