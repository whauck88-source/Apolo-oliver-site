# DECISÕES DO FUNDADOR — Jarvis Hauck

**Data da aprovação:** 03/08/2026 · **Aprovado por:** Willian Hauck (fundador)
**Origem:** §14 de [`AUDITORIA-JARVIS.md`](AUDITORIA-JARVIS.md) — "Decisões que precisam do fundador"

Este documento registra as sete decisões aprovadas. **Ele é registro, não execução.** Nenhuma etapa
foi iniciada e nenhum arquivo de código foi alterado até aqui.

---

## Quadro-resumo

| # | Decisão | Resposta | Alinhada à recomendação da auditoria? |
|---|---|---|---|
| D-1 | Jarvis sai do repo do Apolo Oliver? | **SIM**, condicionada à Etapa 4 | Sim, com condição adicional |
| D-2 | Chave da Anthropic sai do navegador? | **SIM** | Sim |
| D-3 | Memória viva pede confirmação? | **SIM**, na forma mais estrita | Sim, e vai além do mínimo sugerido |
| D-4 | Notion vira fonte oficial? | **SIM**, leitura apenas nesta fase | Sim |
| D-5 | Jarvis vai ter tarefas? | **NÃO** | Sim |
| D-6 | Google Fonts? | **FICA** | Sim |
| D-7 | Manter "abrir com dois cliques"? | **REAVALIAR** via `npm start` | Sim |

---

## D-1 · Separação do repositório — **SIM, com condição**

> O Jarvis deve sair do repositório do Apolo Oliver, **mas somente depois de concluir e validar a
> Etapa 4 de backup/export**.

**Resolve:** R9 (MÉDIO) e D10.

**A condição é a parte importante.** Ela inverte a ordem que o `PLANO-PROXIMAS-ETAPAS.md` propunha
(Etapa 1 primeiro) e adota a ressalva levantada no `PLANO-SEPARACAO-REPOSITORIO.md` §9, risco
**RS-6**: o `localStorage` em `file://` é vinculado à origem, então mover o HTML de pasta pode
deixar notas, chave da API, links iCal e senhas de app inacessíveis. Como hoje **não existe
exportação** (risco R8), migrar antes da Etapa 4 arriscaria perda de dados reais.

**Ordem de execução resultante:** Etapa 4 (backup/export) → validação → Etapa 1 (separação).

---

## D-2 · Chave da Anthropic fora do navegador — **SIM**

> A chave da Anthropic deve sair do navegador e ficar na antena local.

**Resolve:** R7 (MÉDIO), e é parte da Etapa 3.

**Consequência assumida:** o navegador deixa de fazer a chamada direta e o header
`anthropic-dangerous-direct-browser-access` deixa de ser necessário. A chamada passa a sair da
antena (`POST /ia`), com a chave em variável de ambiente ou arquivo local de permissão `600`.
O app passa a **exigir a antena** para conversar — hoje ela já é obrigatória para agenda,
e-mail e notícias, então a perda prática é pequena. Ver também D-7.

---

## D-3 · Memória viva com confirmação — **SIM, na forma estrita**

> Toda gravação na memória viva deve exigir **confirmação explícita** antes de entrar no Second
> Brain, sempre com **origem**, **data** e **possibilidade de desfazer**.

**Resolve:** o dano do R2 (ALTO) e parte do R6.

Esta resposta é **mais rigorosa que o mínimo** sugerido pela auditoria, que aceitava como
alternativa apenas marcar a origem sem pedir confirmação. A decisão adotada exige as duas coisas:
confirmação **e** rastreabilidade completa.

**Requisitos que passam a valer para qualquer nota criada por `[[SAVE:]]`:**
1. Confirmação explícita do usuário antes de persistir.
2. Campo de **origem** (`manual` · `automatica` · `notion`).
3. Campo de **data** de criação.
4. Ação de **desfazer** disponível.

Vale registrar que isso ataca a *consequência* do R2, não a *causa*. A sanitização do contexto
externo e a delimitação dado-versus-instrução (Etapa 2) continuam necessárias — a confirmação é a
segunda barreira, não a única.

---

## D-4 · Notion como fonte oficial — **SIM, somente leitura nesta fase**

> O Notion será a fonte oficial. Nesta fase, o Jarvis apenas **lê, interpreta e prioriza**; nenhuma
> escrita automática.

Confirma o **Ajuste 1** proposto no §10.3 da auditoria: o Second Brain passa a ser uma **projeção**
do Notion, não uma cópia bidirecional. Direção única elimina resolução de conflito por construção.

**Fronteira desta fase:** nenhuma escrita automática no Notion. Notas geradas pelo Jarvis entram
como sugestões sujeitas à aprovação (coerente com D-3). Escrita no Notion fica para etapa posterior,
via n8n, e exigirá decisão nova.

---

## D-5 · Tarefas — **NÃO**

> As tarefas permanecem exclusivamente no Notion. O Jarvis apenas prioriza, resume e comunica.

**Elimina o risco de duas fontes de tarefa** identificado em §10.2. Como o Jarvis hoje não tem
tarefas (só notas), o risco era zero e **assim permanece** — a decisão o mantém fechado em vez de
abri-lo.

Também fixa a fronteira com o app assistente atual: priorização e voz no Jarvis; posse da tarefa no
Notion; o app segue como painel móvel.

---

## D-6 · Google Fonts — **FICA**

> Manter Google Fonts por enquanto, aceitando degradação visual quando estiver offline.

**Risco aceito conscientemente:** R10 (BAIXO). Space Grotesk e JetBrains Mono vêm de CDN; sem
internet o app cai no fallback do sistema e fica visualmente pior, mas **funciona**. Também implica
uma requisição ao Google a cada abertura.

Contradiz a regra original de "zero dependências externas" da Parte 1 — contradição **conhecida e
aceita**, registrada aqui para não ser redescoberta como problema depois.

---

## D-7 · "Abrir com dois cliques" — **REAVALIAR**

> Planejar um único comando `npm start` que ligue a antena e abra o aplicativo, **desde que isso não
> reduza a segurança**.

A cláusula final é uma **condição de aceitação**, não um detalhe: a mudança só se justifica se o
resultado for igual ou mais seguro que hoje.

**O que precisa ser verificado antes de adotar:**
- Se o `npm start` servir o app por `http://localhost` em vez de `file://`, a origem muda — e isso
  **tem duas consequências**: (a) o `localStorage` atual, gravado sob `file://`, não é herdado
  (mesma família do RS-6 — exportar antes); (b) a política de CORS da antena muda de figura, o que
  pode ser aproveitado para **fechar** o R4 com uma allowlist de origem real.
- Introduzir `npm` cria a primeira dependência de pacote do projeto, que hoje tem zero. Avaliar se
  um script Node puro (sem `package.json`) atende — o `server.js` já roda só com a biblioteca padrão.

**Status:** decisão de **planejar e avaliar**, não de implementar. Requer proposta escrita e nova
aprovação antes de virar código.

---

## Impacto no plano de etapas

As decisões **não invalidam** o `PLANO-PROXIMAS-ETAPAS.md`. Alteram uma ordem e endurecem um
requisito:

| Ordem original | Ordem após as decisões | Motivo |
|---|---|---|
| 1 · Separar repo | **1 · Backup/export (era 4)** | D-1 condicionou a separação à Etapa 4 (risco RS-6) |
| 2 · Blindar injeção | 2 · Separar repo (era 1) | Liberada depois da validação do export |
| 3 · Credenciais fora do navegador | 3 · Blindar injeção | D-3 tornou o requisito mais estrito |
| 4 · Backup/export | 4 · Credenciais fora do navegador | Inclui D-2 e a avaliação de D-7 |
| 5 · Notion (leitura) | 5 · Notion (leitura) | Inalterada, confirmada por D-4 |

**Fora de escopo por decisão explícita:** tarefas no Jarvis (D-5) e escrita automática no Notion
(D-4). Ambas exigiriam decisão nova para voltar à mesa.

---

## Estado no momento do registro

- **Branch:** `claude/jarvis-primeiro-prompt-x64d3v`
- **`jarvis-hauck.html`** → `4770414d6832180063ead82579c3a44a5208081f` (inalterado desde `6ab7bd5`)
- **`server.js`** → `40504994c35f0073c54490222d55682ca60a5444` (inalterado desde `6ab7bd5`)
- **Nenhuma etapa iniciada.** Este documento apenas registra as decisões.
