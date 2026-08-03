# MATRIZ DE INTEGRAÇÕES — o que o Jarvis lê, grava e altera

Auditoria de 03/08/2026 · commit `6ab7bd5`

## Resumo em uma linha

**O Jarvis é hoje um sistema somente-leitura para o mundo externo.** Ele lê de 5 fontes, grava
apenas no `localStorage` do navegador e **não altera nada em nenhuma plataforma externa**.

---

## 1. Matriz principal

| Serviço | 1. Só LÊ | 2. GRAVA local | 3. ALTERA externamente | Como | Status |
|---|---|---|---|---|---|
| **Google Agenda** | ✅ eventos via link iCal secreto | cache em `jarvis_cal_cache` | ❌ **nada** — não cria, move nem apaga evento | `GET /proxy` → `calendar.google.com` | Implementado |
| **Gmail** | ✅ 20 e-mails recentes da INBOX | cache em `jarvis_mail_cache` + triagem | ❌ **nada** — não envia, responde, apaga, arquiva nem marca como lido | `POST /emails` → IMAP `EXAMINE` + `BODY.PEEK` | Implementado |
| **Google News** | ✅ RSS por assunto | cache em `jarvis_news_cache` | ❌ nada | `GET /proxy` → `news.google.com` | Implementado |
| **Open-Meteo** | ✅ geocoding + previsão do dia | lat/lon em `jarvis_geo` | ❌ nada | `fetch` direto do navegador (CORS liberado) | Implementado |
| **Anthropic** | ✅ envia prompt, recebe texto | histórico só em memória (perdido no reload) | ❌ nada além da própria chamada | `POST /v1/messages` | Implementado |
| **localStorage** | ✅ lê 8 chaves | ✅ escreve 8 chaves | — | API do navegador | Implementado |
| **Arquivos locais** | ✅ o próprio HTML | ❌ **não grava arquivo nenhum** | — | — | Implementado |
| **Google Fonts** | ✅ Space Grotesk + JetBrains Mono | cache do navegador | ❌ nada | `<link>` no `<head>` | Implementado |
| **Notion** | ❌ | ❌ | ❌ | — | **NÃO IMPLEMENTADO** |
| **n8n** | ❌ | ❌ | ❌ | — | **NÃO IMPLEMENTADO** |
| **App assistente atual** | ❌ | ❌ | ❌ | — | **NÃO IMPLEMENTADO** |
| **Supabase / Stripe** | ❌ | ❌ | ❌ | pertencem ao site Apolo Oliver, não ao Jarvis | Fora de escopo |

**Verificado por varredura:** as strings `notion` e `n8n` aparecem **uma única vez** em todo o
projeto — dentro do texto da nota "Fato-Hype" do Second Brain. Não há cliente, credencial,
endpoint nem código de integração.

---

## 2. O que sai da máquina, para onde

### Vai para a **Anthropic** (`api.anthropic.com`)

| Chamada | Conteúdo enviado | Frequência |
|---|---|---|
| Chat normal | System prompt (3.628 chars medidos) = identidade + **as 19 notas do Second Brain inteiras** + agenda de hoje compacta + contagem de e-mails de ação + histórico da sessão | 1 por pergunta |
| Triagem de e-mail | Por e-mail: remetente, assunto e ~200 chars do trecho | 1 por lote de e-mails **novos** |
| Morning Digest | Pacote compacto: data, clima, eventos de hoje, resumos dos e-mails de ação, top 3 manchetes por assunto, 1–2 metas | 1 por dia |

### Verificado empiricamente — **NÃO** sai para a Anthropic

Capturei o corpo real da requisição e conferi:

- ❌ senha de app do Gmail — **não aparece**
- ❌ link secreto iCal — **não aparece**
- ❌ chave da API em corpo (vai no header `x-api-key`, como deve)

### Vai para **Open-Meteo**

Nome da cidade (uma vez, no geocoding) e lat/lon. Sem identificador do usuário.

### Vai para a **antena local** (`127.0.0.1:4242`)

Link iCal secreto e a senha de app do Gmail — **não saem da máquina**, só trafegam entre o
navegador e o processo Node local, que por sua vez fala com Google/Gmail.

### Nunca sai da máquina

Conteúdo integral dos e-mails além do trecho de 200 chars enviado na triagem; corpo completo
dos eventos; todas as senhas e links secretos; a chave da Anthropic (exceto como header de auth).

---

## 3. Fluxo de dados (leitura)

```
Google Agenda ──iCal──┐
Google News ───RSS────┼──► server.js (127.0.0.1:4242) ──► navegador ──► localStorage
Gmail ─────────IMAP───┘                                       │
                                                              ├──► Anthropic (prompt)
Open-Meteo ───────────────────────────────────────────────────┘
```

Nenhuma seta aponta de volta para os serviços externos. **O Jarvis não tem caminho de escrita.**

---

## 4. Implicação para a arquitetura futura

Como o Jarvis não escreve em lugar nenhum, ele hoje é **um leitor e um sintetizador**, não um
agente. Qualquer integração com Notion ou n8n será a **primeira** capacidade de escrita do
sistema — e é exatamente aí que aparecem os riscos de duplicação de estado, ação não autorizada
e prompt injection com consequência real. Ver `MATRIZ-RISCOS.md` §Injeção e `AUDITORIA-JARVIS.md` §8.
