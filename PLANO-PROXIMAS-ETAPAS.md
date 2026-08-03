# PLANO DAS PRÓXIMAS ETAPAS — Jarvis Hauck

Derivado da auditoria de 03/08/2026. Recomendação de base: **CORRIGIR ANTES**.

Regra que organiza tudo: **nada de escrita externa (Notion, n8n) antes de fechar injeção,
credenciais e backup.** Hoje o Jarvis é somente-leitura; é justamente essa janela que torna as
correções baratas.

---

# Ordem ideal das próximas cinco etapas

## ETAPA 1 — Separar o Jarvis para repositório próprio
**Resolve:** R9, D10 · **Esforço:** baixo (algumas horas) · **Depende de:** decisão D-1

O Jarvis está dentro de `apolo-oliver-site` (Next.js + Supabase + Stripe do site de um artista).
Todo push dispara dois builds da Vercel de um produto sem relação, o histórico e o PR misturam os
dois, e o Jarvis herda um ciclo de deploy que não é dele. (O arquivo **não** fica exposto
publicamente — só `public/` é servido; ver R9 corrigido na matriz de riscos.)

- Criar `jarvis-hauck` com `jarvis-hauck.html`, `server.js`, `README.md` e os 5 `.md` desta auditoria.
- Levar o histórico dos 3 commits do Jarvis (`git log --follow` ou `filter-repo`).
- Remover os arquivos do repo do Apolo Oliver.
- Apagar o `.bak` local (o commit `02caec4` já é o backup).

**Feito quando:** os dois repos buildam sozinhos e nenhum push do Jarvis toca o site do artista.

---

## ETAPA 2 — Blindar a memória viva e o contexto externo
**Resolve:** R2 (ALTO), R6 · **Esforço:** médio (1–2 dias) · **Depende de:** decisão D-3

O risco mais sério da auditoria. Título de evento externo chega **literal** ao system prompt, e a
resposta passa pelo regex `[[SAVE:]]` que grava na memória permanente. Confirmado empiricamente.

1. **Sanitizar na entrada:** remover `[[SAVE:` e `]]` de todo texto de origem externa (título e
   local de evento, assunto e trecho de e-mail, manchete) antes de montar o prompt.
2. **Delimitar o que é dado:** envolver o contexto externo em `<dados_externos>…</dados_externos>`
   com instrução explícita de que ali é informação, nunca instrução.
3. **Tornar a escrita auditável:** toda nota criada por `[[SAVE:]]` ganha `origem: "automatica"` e
   `criada_em`. O painel mostra o marcador e permite desfazer.
4. **Confirmação (decisão D-3):** ou pedir OK antes de gravar, ou criar como "sugestão pendente"
   aprovada no grafo.
5. **Teste de regressão:** um evento com payload de injeção não pode produzir nota.

**Feito quando:** o teste de injeção passa e nenhuma nota nasce sem rastro de origem.

---

## ETAPA 3 — Tirar as credenciais do navegador
**Resolve:** R1 (ALTO), R3, R7 · **Esforço:** médio (2–3 dias) · **Depende de:** decisões D-2 e D-7

Senha de app do Gmail, link secreto iCal e chave da Anthropic estão em `localStorage` puro.

1. Mover senha de app e links iCal para um `jarvis.config.json` local com permissão `600`, lido só
   pelo `server.js`. O navegador passa a pedir "conta 1" e nunca vê a credencial.
2. Mover a chamada da Anthropic para a antena (`POST /ia`), com a chave em variável de ambiente. O
   navegador deixa de precisar de `anthropic-dangerous-direct-browser-access`.
3. Fechar a antena: validar `Origin`/`Host` contra lista fixa (R4) e exigir um token gerado no boot,
   impresso no terminal e colado uma vez na UI.
4. Migração: ao detectar credenciais antigas no `localStorage`, oferecer mover para o arquivo e
   **apagar do navegador**.

**Trade-off explícito:** o app deixa de funcionar "com dois cliques" sem a antena. Como agenda,
e-mail e notícias já exigem a antena, a perda real é pequena — mas é a decisão D-7.

**Feito quando:** `localStorage` não contém nenhuma senha, link secreto ou chave de API.

---

## ETAPA 4 — Backup, exportação e identidade de dados
**Resolve:** R5, R8, D5, D6 · **Esforço:** baixo-médio (1–2 dias)

Pré-requisito técnico do Notion. Sem identidade estável, qualquer sincronia duplica.

1. **Exportar / Importar JSON** no ⚙: notas, configurações, agendas e contas (sem credenciais).
2. **Backup automático:** ao salvar, manter as 3 versões anteriores em `jarvis_notes_backup`.
3. **Identidade estável (D6):** cada nota ganha `uid` (UUID v4 estável), `updated_at` e
   `origem: "manual" | "automatica" | "notion"`. Sem isso, a Etapa 5 gera duplicata garantida.
4. **Aviso de risco:** se o navegador estiver em modo anônimo ou o `localStorage` perto do limite,
   avisar na UI.

**Feito quando:** dá para exportar num navegador, importar em outro e chegar ao mesmo estado.

---

## ETAPA 5 — Integração de LEITURA com o Notion
**Resolve:** a lacuna de 0% · **Esforço:** médio-alto (3–5 dias) · **Depende de:** Etapas 2, 3 e 4 + decisões D-4 e D-5

Só agora, e **só leitura**, conforme o Ajuste 1 da auditoria (§10.3).

1. Rota `GET /notion` na antena, com token do Notion no servidor (nunca no navegador).
2. Puxar projetos, metas e tarefas abertas do dia; **projetar** no Second Brain como notas de
   `origem: "notion"`, sempre sobrescritas pelo Notion e **não editáveis** no grafo.
3. Digest e priorização passam a usar dados reais do Notion.
4. **Nada de escrita.** Notas que o Jarvis gerar viram sugestões que você aprova, e a escrita no
   Notion fica para uma etapa posterior, via n8n.
5. Comandos de voz: "meus projetos", "o que é prioridade hoje".

**Feito quando:** o Jarvis fala sobre seus projetos reais e uma mudança no Notion aparece no próximo
sync, sem nunca alterar o Notion.

---

# Depois das cinco (não priorizado agora)

| Etapa | Objetivo | Pré-requisito |
|---|---|---|
| 6 | n8n como transporte: sync agendado Notion↔Jarvis, push no celular | Etapa 5 |
| 7 | Escrita no Notion via aprovação explícita | Etapas 5 e 6 |
| 8 | Suíte de testes versionada (os 34 desta auditoria) | Etapa 1 |
| 9 | Unificar as camadas de CSS (D1) | Etapa 1 |
| 10 | Definir fronteira com o app atual (D-5) | Decisão D-4 |

---

# Correções rápidas (podem entrar a qualquer momento)

| Item | Esforço | Risco |
|---|---|---|
| Apagar o `.bak` local | minutos | D8 |
| Validar formato de link iCal e senha de app (16 letras) no ⚙ | 1h | usabilidade |
| Unificar a cor do tema num só lugar | 1h | D4 |
| Ao salvar no ⚙, checar se `mailLoading` travou | 1h | R12 |

---

# O que NÃO fazer agora

- **Não** dar tarefas ao Jarvis antes da decisão D-5 — colide com o app atual.
- **Não** ligar escrita no Notion antes da Etapa 2. Hoje uma injeção suja um `localStorage`; depois
  sujaria a base da empresa.
- **Não** refatorar o arquivo único em módulos por estética. Funciona, é requisito do produto, e há
  dívida mais cara na frente.
- **Não** adicionar módulo novo (WhatsApp, Telegram, tarefas) antes da Etapa 4. Cada um multiplica a
  superfície dos riscos abertos.

---

# Estimativa

| Etapa | Esforço | Acumulado |
|---|---|---|
| 1 · Separar repo | ~0,5 dia | 0,5 |
| 2 · Blindar injeção | 1–2 dias | 2,5 |
| 3 · Credenciais fora do navegador | 2–3 dias | 5,5 |
| 4 · Backup e identidade | 1–2 dias | 7,5 |
| 5 · Notion (leitura) | 3–5 dias | **12,5 dias** |

Cerca de **2 a 3 semanas** de trabalho focado até o Jarvis estar seguro e lendo o Notion de verdade.
As Etapas 1 e 4 são baratas e destravam muita coisa — se houver pouco tempo, comece por elas.
