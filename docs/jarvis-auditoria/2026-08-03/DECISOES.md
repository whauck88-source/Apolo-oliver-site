# DECISÕES FUNDADORAS — HAUCK

**Data da aprovação:** 03/08/2026 · **Aprovado por:** Willian Hauck (fundador)
**Origem:** §14 de [`AUDITORIA-JARVIS.md`](AUDITORIA-JARVIS.md) — "Decisões que precisam do fundador"

Este documento é **registro, não execução**. Nenhuma etapa foi iniciada e nenhum arquivo de código
foi alterado.

O texto das oito decisões abaixo, em citação, é a **redação oficial do fundador** e prevalece sobre
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

## Escopo fechado por decisão explícita

- **Tarefas no Hauck** (D-5) — fora de escopo.
- **Escrita automática no Notion** (D-4) — fora de escopo nesta fase.

Ambas exigiriam decisão nova para voltar à mesa.

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
