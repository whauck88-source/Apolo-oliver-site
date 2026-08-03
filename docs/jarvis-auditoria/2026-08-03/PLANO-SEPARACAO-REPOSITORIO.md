# PLANO DE SEPARAÇÃO DO REPOSITÓRIO — Jarvis Hauck

Elaborado em 03/08/2026 · deriva do risco **R9** e da dívida **D10** da auditoria.

> **Este documento é plano, não execução.** Nenhum comando aqui foi rodado. Nenhum arquivo foi
> movido entre repositórios. A migração depende da decisão **D-1** do fundador.

---

# 1. Objetivo

Separar o Jarvis do repositório `whauck88-source/Apolo-oliver-site` e criar um repositório
independente, provisoriamente chamado **`jarvis-hauck`**.

**Por que:** hoje dois produtos sem relação nenhuma dividem o mesmo repositório, o mesmo histórico,
o mesmo PR e o mesmo pipeline da Vercel. Consequências já observadas nesta sessão:

- Todo push do Jarvis dispara **dois builds** da Vercel do site de um artista (`apolo-oliver-site` e
  `apolo-simples`) — chegaram a rodar 12+ builds desnecessários durante o desenvolvimento.
- O histórico e o PR #1 misturam assistente de voz com loja digital, vitrine e checkout Stripe.
- O Jarvis herda o ciclo de deploy, os revisores e as proteções de branch de um produto alheio.

**O que NÃO é motivo:** exposição pública do arquivo. A auditoria inicialmente afirmou isso e
**corrigiu** — o Next.js serve como estático apenas `public/`, e o Jarvis está na raiz. Ver o R9
corrigido em `MATRIZ-RISCOS.md`.

---

# 2. Inventário exato a migrar

## 2.1 Vai — código (2 arquivos)

| Arquivo | Tamanho | Hash atual (blob) |
|---|---|---|
| `jarvis-hauck.html` | 160 KB | `4770414d6832180063ead82579c3a44a5208081f` |
| `server.js` | 17 KB | `40504994c35f0073c54490222d55682ca60a5444` |

## 2.2 Vai — documentação (6 arquivos)

Toda a pasta `docs/jarvis-auditoria/2026-08-03/`:

`AUDITORIA-JARVIS.md` · `INVENTARIO-ARQUIVOS.md` · `MATRIZ-INTEGRACOES.md` · `MATRIZ-RISCOS.md` ·
`PLANO-PROXIMAS-ETAPAS.md` · `PLANO-SEPARACAO-REPOSITORIO.md` (este arquivo)

## 2.3 Vai — histórico de commits

| SHA | Mensagem | Conteúdo |
|---|---|---|
| `2bc4782` | Add Jarvis-style voice assistant (Hauck) | Parte 1 |
| `02caec4` | Add calendar, email, news and morning digest modules | Parte 2 |
| `3b75e53` | Add premium design layer and fullscreen FACE cockpit | Parte 3 |
| `6ab7bd5` | Ignore local `.bak-*` snapshots | `.gitignore` (**parcial** — ver §2.5) |
| `7446a67` | Add technical and functional audit | Auditoria |
| `59d7fa7` | Correct the public-exposure claim in risk R9 | Correção |
| `615546b` | docs: auditoria técnica do Jarvis em 2026-08-03 | Organização |
| *(pendente)* | docs: corrige auditoria e planeja separação do Jarvis | Esta etapa |

**Nenhum desses commits toca arquivo do site Apolo Oliver** — verificado por
`git diff --name-only 792b100..HEAD`, que lista apenas os arquivos do Jarvis e a documentação.
Isso é o que torna a separação limpa: não há commit misto para desembaraçar.

## 2.4 Vai — configuração a criar no destino (não existe hoje)

| Arquivo | Conteúdo |
|---|---|
| `.gitignore` | `*.bak-*`, `node_modules/`, `.DS_Store`, e futuramente `jarvis.config.json` (credenciais da Etapa 3 do plano de correções) |
| `README.md` | Como rodar: `node server.js` + abrir o HTML; passo a passo do ⚙ |

## 2.5 **NÃO** vai

| Item | Por quê |
|---|---|
| `package.json`, `next.config.js`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js` | São do Next.js. **O Jarvis tem zero dependências de build** — não precisa de nenhum deles |
| `src/**` (28 arquivos) | Vitrine, loja, admin e rotas de API do site do artista |
| `public/media/**` (10 arquivos, 4,4 MB) | Vídeos e posters do hero do site |
| `.env.local.example` | Variáveis de Supabase e Stripe — **nada a ver com o Jarvis** |
| `.gitignore` atual | Contém regras do Next (`/.next/`, `next-env.d.ts`, `.vercel`). Criar um novo enxuto no destino, em vez de copiar |
| `jarvis-hauck.html.bak-*` | Backup local, já ignorado pelo git. O histórico é o backup |
| Commits `792b100` e anteriores | História do site do artista (hero em vídeo, Beatport, Supabase) |
| Integrações da Vercel do repo atual | Devem **permanecer** apontando para o site. O Jarvis não precisa de deploy — roda em `file://` |

---

# 3. Estratégias possíveis

## Opção A — Cópia limpa, sem histórico

Criar o repositório novo e copiar os 8 arquivos num commit inicial único.

| Critério | Avaliação |
|---|---|
| **Vantagens** | Trivial. Zero risco de arrastar segredo ou lixo. Histórico do destino nasce limpo e legível |
| **Riscos** | Perde a autoria e a cronologia das 3 fases de construção e da auditoria. Perde o rastro de *por que* cada decisão foi tomada |
| **Complexidade** | Muito baixa |
| **Preserva histórico** | **Não** |
| **Recomendação** | Aceitável só se o histórico for considerado descartável. **Não é o caso aqui** — os commits documentam a evolução e a auditoria |

## Opção B — `git subtree split`

Extrair um subdiretório como branch com histórico próprio.

| Critério | Avaliação |
|---|---|
| **Vantagens** | Nativo do git, sem instalar nada. Preserva histórico do subdiretório |
| **Riscos** | **Só funciona bem quando os arquivos estão todos sob um mesmo diretório.** Aqui, `jarvis-hauck.html` e `server.js` estão na **raiz** do repo, misturados com arquivos do Next.js. Um split da raiz traria o site inteiro junto |
| **Complexidade** | Média — exigiria antes mover tudo para uma pasta `jarvis/`, criando um commit artificial só para viabilizar o split |
| **Preserva histórico** | Sim, do subdiretório |
| **Recomendação** | **Inadequada para este layout.** Só valeria se o Jarvis já morasse numa pasta própria |

## Opção C — `git filter-repo`

Reescrever o histórico mantendo apenas os caminhos do Jarvis.

| Critério | Avaliação |
|---|---|
| **Vantagens** | Resultado mais fiel: preserva datas, autoria e mensagens, e **reescreve** os commits para conterem só os arquivos do Jarvis. Funciona com arquivos na raiz, que é exatamente o caso |
| **Riscos** | Ferramenta externa (`pip install git-filter-repo`). Reescreve SHAs — todos os hashes mudam. Se rodada por engano no repo original em vez de num clone, **destrói o histórico do site**. Exige clone dedicado e descartável |
| **Complexidade** | Média — comando único, mas com pré-requisitos rígidos |
| **Preserva histórico** | **Sim, integralmente** |
| **Recomendação** | **Melhor opção técnica**, desde que executada sobre um clone isolado e nunca sobre o repositório de trabalho |

## Opção D — Migração manual dos commits (`cherry-pick` / `format-patch`)

Criar o repo novo e aplicar os 8 commits um a um.

| Critério | Avaliação |
|---|---|
| **Vantagens** | Controle total, commit a commit. Sem ferramenta externa. Dá para revisar cada um antes de aplicar |
| **Riscos** | Manual e sujeito a erro humano. Os commits contêm apenas arquivos do Jarvis, então aplicariam limpo — mas cada `cherry-pick` precisa de conferência. Datas de autoria preservam-se; as de commit, não |
| **Complexidade** | Média-alta — 8 operações + verificação |
| **Preserva histórico** | Sim, com pequena perda de metadados |
| **Recomendação** | Boa alternativa se não quiser instalar `git-filter-repo`. Mais trabalhosa que a C, com resultado quase equivalente |

---

# 4. Estratégia recomendada

## **Opção C — `git filter-repo`, executada sobre um clone descartável**

**Por quê, para este caso especificamente:**

1. **Os arquivos estão na raiz.** Isso elimina a Opção B, que é a alternativa nativa mais óbvia.
2. **O histórico tem valor real aqui.** Os 8 commits documentam três fases de construção mais uma
   auditoria com 45 testes e duas correções factuais. Jogar isso fora (Opção A) apagaria o rastro de
   decisões que o próprio plano de correções referencia.
3. **Os commits já são limpos.** Nenhum deles mistura Jarvis com o site — verificável por
   `git diff --name-only`. Isso torna a reescrita previsível: nada a resolver manualmente.
4. **O risco principal é neutralizável.** O perigo do `filter-repo` é rodá-lo no lugar errado. A
   mitigação é operacional e absoluta: **executar apenas num clone novo, em pasta temporária, que
   pode ser apagado**. O repositório de trabalho nunca é tocado.

**Plano B, se `git-filter-repo` não puder ser instalado:** Opção D (cherry-pick manual dos 8
commits). Resultado quase equivalente, sem dependência externa.

**Decisão que continua sendo sua (D-1):** se o histórico não importar, a Opção A resolve em 10
minutos e com risco praticamente nulo. A recomendação acima pressupõe que ele importa.

---

# 5. Checklist pré-migração

Nada abaixo modifica o repositório. É tudo verificação.

- [ ] **`git status --short`** — a árvore precisa estar limpa. Nada pendente, nada não rastreado.
- [ ] **Confirmar a branch** — `git branch --show-current` deve retornar
      `claude/jarvis-primeiro-prompt-x64d3v`.
- [ ] **Decidir o destino do PR #1** — hoje ele contém os commits do Jarvis. Definir se será
      fechado sem merge (recomendado, já que o código vai para outro repo) ou mergeado antes.
- [ ] **Criar tag de segurança** no estado atual:
      `git tag pre-separacao-jarvis-20260803 && git push origin pre-separacao-jarvis-20260803`
      Essa tag é a âncora do rollback (§8).
- [ ] **Registrar os hashes atuais** para conferência pós-migração:
      - `jarvis-hauck.html` → `4770414d6832180063ead82579c3a44a5208081f`
      - `server.js` → `40504994c35f0073c54490222d55682ca60a5444`
      - HEAD da branch → anotar no momento da migração
- [ ] **Confirmar que nenhum segredo está versionado.** A auditoria já verificou que os dois
      arquivos de código **não contêm credenciais** (senhas e chaves só existem em runtime, no
      `localStorage`). Reconfirmar antes de tornar público:
      `git log -p --all -- jarvis-hauck.html server.js | grep -iE "sk-ant|password|senha.*=|private-"`
- [ ] **Verificar o `.gitignore`** — hoje ignora `.env*.local`, `.env` e `*.bak-*`. Confirmar que
      nenhum `.env` foi commitado em algum momento do histórico: `git log --all --name-only | grep -i env`
- [ ] **Mapear as integrações da Vercel** — dois projetos ligados a este repo:
      `apolo-oliver-site` (`prj_ulgPGSjZMqtxMZqOhJsVaRpJIMo2`) e `apolo-simples`
      (`prj_NNdbpCm1ew0lt7wcOTJAUKzlBRkw`). **Ambos devem continuar apontando para o repo atual.**
      O `jarvis-hauck` **não deve** ser conectado à Vercel — ele não tem deploy.
- [ ] **Mapear builds e deploys** — confirmar que nenhum workflow do GitHub Actions depende dos
      arquivos do Jarvis (hoje não há `.github/workflows/` no repo).
- [ ] **Decidir a visibilidade** do `jarvis-hauck`: privado ou público. Recomendação: **privado**
      até a Etapa 3 do plano de correções (credenciais fora do navegador), porque o README vai
      descrever onde o usuário cola senha de app.

---

# 6. Checklist de migração

> **Não executar sem a autorização do fundador.** Passos escritos para serem seguidos em ordem.

### Fase 1 — Preparar o destino
1. Criar o repositório `jarvis-hauck` no GitHub, **vazio** (sem README, sem `.gitignore`, sem licença).
2. Anotar a URL do remote.

### Fase 2 — Extrair com histórico (num clone descartável)
3. `cd $(mktemp -d)` — trabalhar fora da pasta do projeto.
4. `git clone --no-local <caminho-ou-url-do-repo-atual> jarvis-extract && cd jarvis-extract`
5. Conferir que está no clone e **não** no repo de trabalho: `git remote -v` e `pwd`.
6. `pip install git-filter-repo` (se necessário).
7. Extrair só os caminhos do Jarvis:
   ```
   git filter-repo \
     --path jarvis-hauck.html \
     --path server.js \
     --path docs/jarvis-auditoria/
   ```
8. Conferir o resultado: `git log --oneline` deve mostrar os commits do Jarvis, e
   `git ls-files` deve listar exatamente 8 arquivos.
9. Confirmar que nenhum arquivo do site sobrou: `git log --all --name-only | grep -E "^src/|^public/|package.json"`
   deve retornar vazio.

### Fase 3 — Publicar
10. `git remote add origin <url-do-jarvis-hauck>`
11. `git push -u origin <branch>` (considerar renomear para `main`).
12. Adicionar no destino: `.gitignore` enxuto e `README.md` (conteúdo em §2.4).

### Fase 4 — Limpar a origem (**só depois de validar a Fase 3 inteira**)
13. No repo `Apolo-oliver-site`, em branch nova:
    `git rm jarvis-hauck.html server.js && git rm -r docs/jarvis-auditoria/`
14. Commit: `chore: move o Jarvis para o repositório jarvis-hauck` — com o link do repo novo no corpo.
15. Abrir PR, confirmar que o build da Vercel do site continua verde, e só então mergear.
16. Fechar o PR #1 sem merge, com um comentário apontando para o repositório novo.
17. Apagar localmente `jarvis-hauck.html.bak-pre-design-20260803`.

---

# 7. Checklist pós-migração

### Funcional — o Jarvis
- [ ] Clonar o `jarvis-hauck` do zero, numa pasta limpa.
- [ ] `node server.js` sobe e imprime o banner na **porta 4242**.
- [ ] `curl http://127.0.0.1:4242/status` retorna `{"antena":"online",...}`.
- [ ] Allowlist ainda bloqueia: domínio fora da lista → 403; host IMAP fora da lista → 403.
- [ ] Abrir `jarvis-hauck.html` com dois cliques: boot → ativação → app, sem erro no console.
- [ ] O grafo do Second Brain renderiza com 19 nós.
- [ ] O ⚙ abre e as quatro abas trocam.
- [ ] A tecla `F` abre a FACE; `Esc` fecha.
- [ ] **Os dados do usuário sobreviveram** — o `localStorage` é por origem (`file://` + caminho).
      Se o arquivo mudar de pasta, **as notas e a chave da API podem não aparecer**. Ver o risco
      RS-6 no §9: exportar antes é obrigatório.

### Funcional — o site Apolo Oliver
- [ ] `npm install && npm run build` continua passando.
- [ ] Os dois projetos da Vercel buildam verde após a remoção.
- [ ] A vitrine, a loja e o admin continuam funcionando no preview.

### Isolamento — o motivo da separação
- [ ] Um push no `jarvis-hauck` **não** dispara nenhum build da Vercel.
- [ ] Um push no `Apolo-oliver-site` continua disparando os dois builds dele.

### Documentação e histórico
- [ ] Os links relativos entre os cinco relatórios continuam resolvendo (todos apontam apenas
      entre si, dentro da mesma pasta — verificado em 03/08/2026).
- [ ] `git log --oneline` no destino mostra os commits das três fases mais a auditoria.
- [ ] `git log --follow jarvis-hauck.html` mostra a evolução completa do arquivo.

### Testes críticos a repetir
- [ ] T09 `/status` · T10 e T11 allowlist · T12 preflight · T13 e T14 SSRF
- [ ] T23–T30 parser ICS (TZID, UTC, dia inteiro, RRULE, EXDATE, cancelado, quebrado, unfolding)
- [ ] T31–T33 triagem em lote e cache por Message-ID
- [ ] T35–T37 antena offline, sem chave, sem internet
- [ ] T41 responsivo em 1440 / 390 / 360 px

---

# 8. Rollback

O rollback é **barato porque nada é destrutivo até a Fase 4**. Até lá, o repositório original está
intacto e a migração é puramente aditiva.

### Se falhar durante as Fases 1–3 (extração e publicação)
Nada a desfazer no repo original — todo o trabalho aconteceu num clone temporário.
1. Apagar a pasta temporária.
2. Apagar o repositório `jarvis-hauck` no GitHub (ou deixá-lo vazio e tentar de novo).
3. O `Apolo-oliver-site` segue exatamente como estava.

### Se falhar na Fase 4 (remoção da origem), antes do merge
1. Fechar o PR de remoção sem mergear.
2. `git checkout claude/jarvis-primeiro-prompt-x64d3v` — os arquivos continuam lá.

### Se falhar depois do merge da Fase 4
1. `git revert <sha-do-commit-de-remocao>` — traz os arquivos de volta com um commit novo,
   sem reescrever histórico.
2. Alternativa, se preferir o estado exato de antes:
   `git checkout pre-separacao-jarvis-20260803 -- jarvis-hauck.html server.js docs/jarvis-auditoria/`
3. A tag `pre-separacao-jarvis-20260803` garante que **nenhum código ou histórico se perde**, mesmo
   que o repositório `jarvis-hauck` seja apagado por completo.

### Garantia de fundo
Enquanto a tag existir no `origin`, todo o estado pré-migração é recuperável com um comando.
**A tag só deve ser apagada quando o critério de conclusão do §10 estiver integralmente cumprido.**

---

# 9. Matriz de riscos da migração

| # | Risco | Probab. | Impacto | Prevenção | Rollback |
|---|---|---|---|---|---|
| **RS-1** | Rodar `git filter-repo` no repositório de trabalho em vez do clone, destruindo o histórico do site | Baixa | **Crítico** | Executar só em `$(mktemp -d)`; conferir `pwd` e `git remote -v` antes; o clone tem remote diferente | Tag `pre-separacao` + o `origin` intacto no GitHub |
| **RS-2** | Perder o histórico do Jarvis por escolher a Opção A por pressa | Média | Médio | Seguir a Opção C recomendada; se optar pela A, que seja decisão consciente e registrada | Reextrair da tag: o histórico continua no repo original |
| **RS-3** | Quebrar o build do site ao remover arquivos (Fase 4) | **Muito baixa** | Alto | Nenhum arquivo do Next.js referencia o Jarvis (verificado por grep na auditoria). Validar via PR antes do merge | `git revert` do commit de remoção |
| **RS-4** | Vercel criar deploy automático para o `jarvis-hauck` | Baixa | Baixo | Não conectar o repo novo à Vercel. Se conectar por engano, desconectar em Settings → Git | Desconectar; nenhum dado se perde |
| **RS-5** | Segredo escondido no histórico virar público ao abrir o repo | Baixa | **Alto** | Rodar as buscas do §5 **antes** de publicar; começar com o repositório **privado** | Se vazar: repo privado imediatamente + revogar a credencial exposta |
| **RS-6** | **Usuário perder notas e chave da API** porque o `localStorage` é vinculado ao caminho do arquivo | **Alta** | **Alto** | **Exportar antes de mover.** Hoje **não existe exportação** (risco R8 da auditoria) — o que torna a Etapa 4 do plano de correções um **pré-requisito prático** desta migração | Manter o arquivo antigo no lugar original até confirmar que os dados migraram |
| **RS-7** | Links dos relatórios quebrarem para quem já os salvou | Média | Baixo | Deixar no `Apolo-oliver-site` um `docs/jarvis-auditoria/README.md` apontando para o repo novo | Restaurar os arquivos da tag |
| **RS-8** | PR #1 ficar órfão, com commits que não existem mais em nenhuma branch | Média | Baixo | Fechar o PR #1 com comentário explicativo e link para o repo novo | Nenhum: os commits sobrevivem na tag e no repo novo |

> **RS-6 é o risco mais provável e mais subestimado desta migração.** Ele não é técnico do git — é
> do navegador: `localStorage` em `file://` é vinculado à origem, e mover o HTML de pasta pode
> deixar as notas, a chave da API, os links iCal e as senhas de app inacessíveis. Como não há
> exportação hoje, **a Etapa 4 do `PLANO-PROXIMAS-ETAPAS.md` deveria vir antes desta migração**,
> ainda que a separação do repo seja a Etapa 1 daquele plano. Recomendo inverter a ordem, ou ao
> menos fazer um backup manual do `localStorage` pelo DevTools antes de mover qualquer coisa.

---

# 10. Critério de conclusão

A separação só pode ser declarada concluída quando **todos** os itens abaixo forem verdadeiros:

1. O repositório `jarvis-hauck` existe e contém **exatamente 8 arquivos** versionados
   (2 de código + 6 de documentação), mais o `.gitignore` e o `README.md` criados no destino.
2. `git log --oneline` no destino mostra o histórico das três fases de construção e da auditoria —
   **ou**, se a Opção A tiver sido escolhida conscientemente, o commit inicial referencia a tag
   `pre-separacao-jarvis-20260803` do repo de origem.
3. Os hashes de conteúdo de `jarvis-hauck.html` e `server.js` no destino são **idênticos** aos
   registrados no §5.
4. `node server.js` sobe na porta 4242 a partir de um clone limpo, e os testes críticos do §7 passam.
5. O `jarvis-hauck.html` abre com dois cliques e o app funciona ponta a ponta a partir do clone novo.
6. O `Apolo-oliver-site` não contém mais nenhum arquivo do Jarvis, e **ambos** os projetos da Vercel
   buildam verde depois da remoção.
7. Um push no `jarvis-hauck` **não** dispara nenhum build da Vercel — este é o critério que prova
   que o objetivo do §1 foi atingido.
8. Os dados do usuário (notas, chave, configurações) estão acessíveis no novo local, **ou** existe
   um export salvo fora do navegador (ver RS-6).
9. O PR #1 está fechado, com comentário apontando para o repositório novo.
10. A tag `pre-separacao-jarvis-20260803` continua existindo no `origin` — ela só é removida depois
    de pelo menos uma semana de uso normal do repositório novo.

**Enquanto qualquer um dos dez estiver aberto, a migração está em andamento, não concluída.**
