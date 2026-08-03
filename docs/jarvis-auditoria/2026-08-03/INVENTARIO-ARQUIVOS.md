# INVENTÁRIO DE ARQUIVOS — Jarvis Hauck

Auditoria de 03/08/2026 · branch `claude/jarvis-primeiro-prompt-x64d3v` · commit `6ab7bd5`

> **Achado estrutural nº 1:** o Jarvis vive dentro do repositório **`apolo-oliver-site`**, um projeto
> Next.js 14 + Supabase + Stripe do site de um artista. São dois produtos sem relação nenhuma
> compartilhando a mesma pasta e o mesmo deploy da Vercel. Nenhum arquivo do Next.js referencia o
> Jarvis e vice-versa — a convivência é acidental, não arquitetural.

---

## 1. Arquivos do Jarvis (o produto auditado)

### `jarvis-hauck.html` — ATIVO · núcleo do produto
| Campo | Valor |
|---|---|
| Finalidade | Aplicação inteira: assistente de voz, Second Brain, agenda, e-mails, notícias, digest e cockpit FACE |
| Tamanho | 160 KB · 3.780 linhas · 3 blocos `<style>` (19 KB + 22,5 KB + 9,4 KB) e 2 blocos `<script>` (82 KB + 15,5 KB) |
| Dependências | Nenhuma biblioteca. APIs nativas: `SpeechRecognition`, `speechSynthesis`, `DOMParser`, `Intl.DateTimeFormat`, `MutationObserver`, `canvas`, `fetch`, `localStorage` |
| Lê | `localStorage` (8 chaves), `server.js` via HTTP em `127.0.0.1:4242`, Anthropic, Open-Meteo, Google Fonts |
| Grava | `localStorage` apenas. **Não escreve em nenhum sistema externo** |
| Integrações | Anthropic Messages API · Open-Meteo (direto) · Google Agenda e Google News (via antena) · Gmail IMAP (via antena) · Google Fonts (CDN) |
| Riscos | Arquivo único de 160 KB sem build nem testes; credenciais em `localStorage` puro; títulos de agenda externa entram no system prompt (ver MATRIZ-RISCOS) |
| Estado | **Ativo.** Único ponto de entrada do usuário |

**Composição interna (3 camadas sobrepostas):**

| Bloco | Origem | Tamanho | Observação |
|---|---|---|---|
| `<style>` sem id | Parte 1 | 19,2 KB | **110 dos seus seletores hoje são sobrescritos** pelo design-layer |
| `<style id="design-layer">` | Parte 3 | 22,5 KB | 171 seletores, sistema de tokens |
| `<style id="face-layer">` | Parte 3 | 9,4 KB | 67 seletores, só 1 colide com o original |
| `<script>` #0 | Partes 1 + 2 | 81,9 KB | Núcleo + módulos, tudo numa IIFE |
| `<script>` #1 | Parte 3 | 15,5 KB | FACE, IIFE separada, comunica por DOM |

### `server.js` — ATIVO · a antena
| Campo | Valor |
|---|---|
| Finalidade | Proxy CORS local + cliente IMAP mínimo. Existe só para contornar a política de origem do navegador |
| Tamanho | 17 KB · ~520 linhas |
| Dependências | Só biblioteca padrão do Node: `http`, `https`, `tls`. Zero `npm install` |
| Lê | `calendar.google.com` e `news.google.com` (allowlist); `imap.gmail.com` porta 993 |
| Grava | **Nada.** Sem disco, sem banco, sem estado. IMAP usa `EXAMINE` + `BODY.PEEK` (somente leitura) |
| Integrações | Google Agenda (iCal), Google News (RSS), Gmail (IMAP) |
| Riscos | `Access-Control-Allow-Origin: *` sem validação de `Origin` nem de `Host` (ver MATRIZ-RISCOS) |
| Estado | **Ativo.** Sem ele, agenda/e-mails/notícias ficam offline; o resto do app continua |

### `jarvis-hauck.html.bak-pre-design-20260803` — LEGADO · duplicado
| Campo | Valor |
|---|---|
| Finalidade | Snapshot manual antes da camada de design |
| Tamanho | 112 KB |
| Estado | **Legado e redundante.** O histórico do git já cobre (commit `02caec4`). Está no `.gitignore`, existe só no disco local |
| Risco | Baixo — mas contém uma cópia integral do app, incluindo a estrutura onde credenciais são gravadas em runtime (o arquivo em si não tem credenciais) |
| Recomendação | Apagar. `git show 02caec4:jarvis-hauck.html` recupera o mesmo conteúdo |

---

## 2. Arquivos do site Apolo Oliver (não fazem parte do Jarvis)

Todos **ativos** para o outro produto, **nenhum** tocado pelo Jarvis.

| Arquivo/pasta | Finalidade | Integrações |
|---|---|---|
| `package.json` | Next 14.2, React 18, Supabase, Stripe | — |
| `src/app/page.tsx` + `src/components/vitrine/*` (9 arq.) | Vitrine do artista: hero em vídeo, manifesto, catálogo, booking, EPK, agenda | Supabase |
| `src/app/loja/*`, `src/components/loja/CheckoutButton.tsx` | Loja digital | Stripe |
| `src/app/admin/*` (6 páginas) | Painel: conteúdo, produtos, vendas, agenda, login | Supabase |
| `src/app/api/checkout`, `api/webhook`, `api/download/[orderId]` | Rotas de pagamento e entrega | Stripe + Supabase |
| `src/lib/supabase/*` (3 arq.), `src/lib/stripe.ts`, `src/lib/types.ts` | Clientes e tipos | Supabase, Stripe |
| `public/media/*` (10 arq., 4,4 MB) | Vídeos e posters do hero | — |
| `next.config.js`, `tailwind.config.ts`, `tsconfig.json`, `postcss.config.js` | Build | — |
| `.env.local.example` | Modelo de variáveis (Supabase, Stripe, site URL) | — |
| `.gitignore` | Ignora `node_modules`, `.next`, `.env*`, `*.bak-*` | — |

**Tabelas Supabase usadas pelo site:** `admin_users`, `artists`, `authority_numbers`, `content_blocks`, `orders`, `products`, `schedule_events`.

---

## 3. Verificações de duplicação e conflito

| Verificação | Resultado |
|---|---|
| Funções JS declaradas duas vezes | **Nenhuma** (varredura das 2 IIFEs) |
| Funções declaradas e nunca chamadas | **Nenhuma** |
| Variáveis declaradas e nunca lidas | **Nenhuma** |
| Referência ao Jarvis dentro do app Next.js | **Nenhuma** |
| Referência ao Next.js dentro do Jarvis | **Nenhuma** |
| Conflito de porta (Next 3000 × antena 4242) | **Nenhum** |
| Menção a Notion ou n8n no código | **Nenhuma** — só o texto de uma nota do Second Brain |
| Cor do tema definida em mais de um lugar | **Sim, 3**: `:root --theme/--accent`, `CONFIG.themeColor/accentColor` e `--primary/--brand2`. Coerentes hoje porque `applyTheme()` propaga de `CONFIG` para as vars, mas os literais `#00d4ff`/`#00ff9d` aparecem repetidos |

---

## 4. Arquivos criados por esta auditoria (documentação, não código)

`AUDITORIA-JARVIS.md` · `INVENTARIO-ARQUIVOS.md` · `MATRIZ-INTEGRACOES.md` · `MATRIZ-RISCOS.md` · `PLANO-PROXIMAS-ETAPAS.md`
