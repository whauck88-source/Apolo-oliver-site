'use strict';

/* ═══════════════════════════════════════════════════════════════
   ⚡ ANTENA DO JARVIS — Hauck
   Node puro. Zero dependências. Zero npm install.
   Roda com:  node server.js
   ═══════════════════════════════════════════════════════════════ */

const http = require('http');
const https = require('https');
const tls = require('tls');

const PORTA = 4242;
const BIND = '127.0.0.1';

/* Só estes domínios podem ser buscados pelo /proxy. Resto = 403. */
const PROXY_ALLOWLIST = ['calendar.google.com', 'news.google.com'];

/* Só estes servidores IMAP podem ser acessados pelo /emails. Resto = 403. */
const IMAP_ALLOWLIST = ['imap.gmail.com'];

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
           '(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

/* ─────────────── utilidades ─────────────── */

function cors(res, extra) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
  if (extra) Object.keys(extra).forEach(k => res.setHeader(k, extra[k]));
}

function json(res, status, obj) {
  cors(res);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
}

/* Mascara qualquer credencial antes de ir para o terminal. */
function mascarar(txt) {
  if (!txt) return '';
  return String(txt)
    .replace(/(private-[^/\s]*\/basic\.ics)/gi, 'private-***/basic.ics')
    .replace(/([?&](senha|password|pass|key|token)=)[^&\s]*/gi, '$1***');
}

function log(msg) {
  const h = new Date().toTimeString().slice(0, 8);
  console.log('[' + h + '] ' + mascarar(msg));
}

/* ─────────────── ROTA: GET /proxy?url=... ─────────────── */

function buscarComRedirect(alvo, restantes, cb) {
  let u;
  try { u = new URL(alvo); } catch (e) { return cb(new Error('URL inválida')); }

  if (u.protocol !== 'https:' && u.protocol !== 'http:') {
    return cb(new Error('Protocolo não permitido'));
  }
  if (PROXY_ALLOWLIST.indexOf(u.hostname) === -1) {
    const err = new Error('Domínio fora da allowlist: ' + u.hostname);
    err.status = 403;
    return cb(err);
  }

  const lib = u.protocol === 'https:' ? https : http;
  const req = lib.get({
    hostname: u.hostname,
    path: u.pathname + u.search,
    port: u.port || (u.protocol === 'https:' ? 443 : 80),
    headers: {
      'User-Agent': UA,
      'Accept': '*/*',
      'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8'
    }
  }, resp => {
    const code = resp.statusCode;

    if (code >= 300 && code < 400 && resp.headers.location) {
      resp.resume();
      if (restantes <= 0) return cb(new Error('Redirects demais'));
      const proximo = new URL(resp.headers.location, u).toString();
      return buscarComRedirect(proximo, restantes - 1, cb);
    }

    const pedacos = [];
    resp.on('data', d => pedacos.push(d));
    resp.on('end', () => {
      cb(null, {
        status: code,
        tipo: resp.headers['content-type'] || 'text/plain; charset=utf-8',
        corpo: Buffer.concat(pedacos)
      });
    });
  });

  req.setTimeout(20000, () => { req.destroy(new Error('Tempo esgotado na busca')); });
  req.on('error', e => cb(e));
}

function rotaProxy(req, res, urlObj) {
  const alvo = urlObj.searchParams.get('url');
  if (!alvo) return json(res, 400, { erro: 'Faltou o parâmetro url' });

  let host = '';
  try { host = new URL(alvo).hostname; } catch (e) {}
  if (PROXY_ALLOWLIST.indexOf(host) === -1) {
    log('proxy BLOQUEADO → ' + host);
    return json(res, 403, { erro: 'Domínio não permitido: ' + host });
  }

  log('proxy → ' + host);

  buscarComRedirect(alvo, 3, (err, resultado) => {
    if (err) {
      log('proxy falhou (' + host + '): ' + err.message);
      return json(res, err.status || 502, { erro: err.message });
    }
    cors(res);
    res.writeHead(resultado.status, { 'Content-Type': resultado.tipo });
    res.end(resultado.corpo);
  });
}

/* ═══════════════ CLIENTE IMAP MÍNIMO (módulo tls nativo) ═══════════════ */

/* Encontra o fim de uma resposta marcada com a tag, respeitando literais {N}. */
function acharFimDaTag(buf, tag) {
  let pos = 0;
  while (pos < buf.length) {
    const nl = buf.indexOf('\r\n', pos, 'latin1');
    if (nl === -1) return -1;
    const linha = buf.slice(pos, nl).toString('latin1');
    const lit = linha.match(/\{(\d+)\}$/);
    if (lit) {
      pos = nl + 2 + parseInt(lit[1], 10);
      if (pos > buf.length) return -1;
      continue;
    }
    if (linha.indexOf(tag + ' ') === 0) return nl + 2;
    pos = nl + 2;
  }
  return -1;
}

/* Quebra a resposta do FETCH em mensagens, separando header e corpo. */
function parseFetch(buf) {
  const msgs = [];
  let cur = null;
  let pos = 0;

  while (pos < buf.length) {
    const nl = buf.indexOf('\r\n', pos, 'latin1');
    if (nl === -1) break;
    const linha = buf.slice(pos, nl).toString('latin1');

    if (/^\* \d+ FETCH/i.test(linha)) {
      cur = { header: '', corpo: '', flags: '' };
      msgs.push(cur);
    }
    if (cur) {
      const fm = linha.match(/FLAGS \(([^)]*)\)/i);
      if (fm && !cur.flags) cur.flags = fm[1];
    }

    const lit = linha.match(/\{(\d+)\}$/);
    if (lit) {
      const tam = parseInt(lit[1], 10);
      const ini = nl + 2;
      const dados = buf.slice(ini, ini + tam).toString('latin1');
      if (cur) {
        if (/HEADER/i.test(linha)) cur.header = dados;
        else if (/TEXT/i.test(linha)) cur.corpo = dados;
        else if (!cur.header) cur.header = dados;
        else cur.corpo = dados;
      }
      pos = ini + tam;
      continue;
    }
    pos = nl + 2;
  }
  return msgs;
}

function normCharset(cs) {
  const c = String(cs || '').toLowerCase().replace(/["']/g, '').trim();
  if (c.indexOf('utf-8') === 0 || c.indexOf('utf8') === 0) return 'utf8';
  if (c.indexOf('iso-8859') === 0 || c.indexOf('windows-1252') === 0 || c.indexOf('latin') === 0) return 'latin1';
  if (c.indexOf('us-ascii') === 0) return 'latin1';
  return 'utf8';
}

/* Decodifica =?UTF-8?B?...?= e =?UTF-8?Q?...?= */
function decodeMime(s) {
  if (!s) return '';
  let t = String(s).replace(/\?=\s+=\?/g, '?==?');
  t = t.replace(/=\?([^?]+)\?([BbQq])\?([^?]*)\?=/g, (m, cs, enc, txt) => {
    try {
      const charset = normCharset(cs);
      if (enc.toUpperCase() === 'B') {
        return Buffer.from(txt, 'base64').toString(charset);
      }
      const bruto = txt.replace(/_/g, ' ')
        .replace(/=([0-9A-Fa-f]{2})/g, (x, h) => String.fromCharCode(parseInt(h, 16)));
      return Buffer.from(bruto, 'latin1').toString(charset);
    } catch (e) { return m; }
  });
  return t;
}

function decodeQuotedPrintable(s) {
  return s.replace(/=\r?\n/g, '')
          .replace(/=([0-9A-Fa-f]{2})/g, (m, h) => String.fromCharCode(parseInt(h, 16)));
}

function unfoldHeader(h) {
  return String(h || '').replace(/\r\n[ \t]+/g, ' ');
}

function headerVal(header, nome) {
  const linhas = unfoldHeader(header).split(/\r?\n/);
  const alvo = nome.toLowerCase() + ':';
  for (let i = 0; i < linhas.length; i++) {
    if (linhas[i].toLowerCase().indexOf(alvo) === 0) {
      return linhas[i].slice(alvo.length).trim();
    }
  }
  return '';
}

function charsetDe(contentType) {
  const m = String(contentType || '').match(/charset="?([^";]+)"?/i);
  return normCharset(m ? m[1] : 'utf-8');
}

function decodeCorpo(texto, cte, charset) {
  let bruto = texto;
  if (cte === 'base64') {
    try { return Buffer.from(bruto.replace(/\s/g, ''), 'base64').toString(charset); }
    catch (e) { return bruto; }
  }
  if (cte === 'quoted-printable') bruto = decodeQuotedPrintable(bruto);
  try { return Buffer.from(bruto, 'latin1').toString(charset); }
  catch (e) { return bruto; }
}

function tirarTags(html) {
  return String(html)
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/* Prefere text/plain; cai para text/html sem tags. */
function extrairTrecho(header, corpo) {
  const ct = headerVal(header, 'content-type');
  const cte = (headerVal(header, 'content-transfer-encoding') || '').toLowerCase();

  if (/multipart/i.test(ct)) {
    const bm = ct.match(/boundary="?([^";]+)"?/i);
    if (bm) {
      const partes = corpo.split('--' + bm[1]);
      let html = '';
      for (let i = 0; i < partes.length; i++) {
        const p = partes[i];
        const idx = p.indexOf('\r\n\r\n');
        if (idx < 0) continue;
        const ph = p.slice(0, idx);
        const pb = p.slice(idx + 4);
        const pct = headerVal(ph, 'content-type');
        const pcte = (headerVal(ph, 'content-transfer-encoding') || '').toLowerCase();
        if (/text\/plain/i.test(pct)) {
          return decodeCorpo(pb, pcte, charsetDe(pct)).replace(/\s+/g, ' ').trim();
        }
        if (/text\/html/i.test(pct) && !html) {
          html = tirarTags(decodeCorpo(pb, pcte, charsetDe(pct)));
        }
      }
      if (html) return html;
    }
  }

  const texto = decodeCorpo(corpo, cte, charsetDe(ct));
  if (/text\/html/i.test(ct)) return tirarTags(texto);
  return texto.replace(/\s+/g, ' ').trim();
}

function buscarEmails(cfg) {
  return new Promise((resolve, reject) => {
    const quantidade = Math.min(Math.max(parseInt(cfg.quantidade, 10) || 20, 1), 50);
    let buf = Buffer.alloc(0);
    let pendente = null;
    let contadorTag = 0;
    let encerrado = false;

    const socket = tls.connect({ host: cfg.host, port: 993, servername: cfg.host });
    socket.setTimeout(30000);

    function falhar(e) {
      if (encerrado) return;
      encerrado = true;
      try { socket.destroy(); } catch (x) {}
      reject(e);
    }

    socket.on('error', e => falhar(new Error('Falha de conexão IMAP: ' + e.message)));
    socket.on('timeout', () => falhar(new Error('Tempo esgotado falando com o servidor de e-mail')));

    socket.on('data', chunk => {
      buf = Buffer.concat([buf, chunk]);
      if (!pendente) return;

      if (pendente.tag === null) {
        const nl = buf.indexOf('\r\n', 0, 'latin1');
        if (nl === -1) return;
        const resposta = buf.slice(0, nl + 2);
        buf = buf.slice(nl + 2);
        const p = pendente; pendente = null;
        p.res(resposta);
        return;
      }

      const fim = acharFimDaTag(buf, pendente.tag);
      if (fim === -1) return;
      const resposta = buf.slice(0, fim);
      buf = buf.slice(fim);
      const p = pendente; pendente = null;
      p.res(resposta);
    });

    function esperarSaudacao() {
      return new Promise(res => { pendente = { tag: null, res: res }; });
    }

    function comando(cmd) {
      contadorTag++;
      const tag = 'j' + contadorTag;
      return new Promise((res, rej) => {
        pendente = { tag: tag, res: res, rej: rej };
        socket.write(tag + ' ' + cmd + '\r\n');
      }).then(resposta => {
        const txt = resposta.toString('latin1');
        const linhas = txt.split('\r\n');
        const final = linhas.filter(l => l.indexOf(tag + ' ') === 0).pop() || '';
        if (/^\S+ (NO|BAD)/i.test(final)) {
          const e = new Error(final.replace(/^\S+ (NO|BAD)\s*/i, ''));
          e.imap = true;
          throw e;
        }
        return resposta;
      });
    }

    socket.on('secureConnect', () => {});

    esperarSaudacao()
      .then(() => comando('LOGIN "' + String(cfg.usuario).replace(/"/g, '\\"') + '" "' +
                          String(cfg.senhaApp).replace(/"/g, '\\"') + '"'))
      .catch(e => {
        throw new Error('Senha de app inválida ou verificação em 2 etapas desativada — ' +
                        'refaça em myaccount.google.com/apppasswords');
      })
      /* EXAMINE = somente leitura. A caixa nunca é modificada. */
      .then(() => comando('EXAMINE INBOX'))
      .then(resp => {
        const m = resp.toString('latin1').match(/\* (\d+) EXISTS/i);
        const total = m ? parseInt(m[1], 10) : 0;
        if (!total) return null;
        const ini = Math.max(1, total - quantidade + 1);
        /* BODY.PEEK = jamais marca como lido. */
        return comando('FETCH ' + ini + ':' + total +
          ' (UID FLAGS BODY.PEEK[HEADER] BODY.PEEK[TEXT]<0.4000>)');
      })
      .then(resp => {
        const itens = [];
        if (resp) {
          const msgs = parseFetch(resp);
          msgs.forEach(m => {
            if (!m.header) return;
            const assunto = decodeMime(headerVal(m.header, 'subject')) || '(sem assunto)';
            const remetente = decodeMime(headerVal(m.header, 'from')) || '(desconhecido)';
            const data = headerVal(m.header, 'date');
            const mid = headerVal(m.header, 'message-id') ||
                        (remetente + '|' + assunto + '|' + data);
            let trecho = '';
            try { trecho = extrairTrecho(m.header, m.corpo); } catch (e) { trecho = ''; }
            itens.push({
              id: mid.replace(/[<>]/g, ''),
              remetente: remetente,
              assunto: assunto,
              data: data,
              trecho: trecho.slice(0, 500),
              lido: /\\Seen/i.test(m.flags)
            });
          });
        }
        itens.reverse();
        return comando('LOGOUT').catch(() => null).then(() => itens);
      })
      .then(itens => {
        encerrado = true;
        try { socket.end(); } catch (e) {}
        resolve(itens);
      })
      .catch(e => falhar(e));
  });
}

/* ─────────────── ROTA: POST /emails ─────────────── */

function rotaEmails(req, res) {
  let corpo = '';
  let tamanho = 0;

  req.on('data', d => {
    tamanho += d.length;
    if (tamanho > 64 * 1024) { req.destroy(); return; }
    corpo += d;
  });

  req.on('end', () => {
    let cfg;
    try { cfg = JSON.parse(corpo); }
    catch (e) { return json(res, 400, { erro: 'JSON inválido' }); }

    if (!cfg.host || !cfg.usuario || !cfg.senhaApp) {
      return json(res, 400, { erro: 'Faltou host, usuário ou senha de app' });
    }
    if (IMAP_ALLOWLIST.indexOf(cfg.host) === -1) {
      log('IMAP BLOQUEADO → ' + cfg.host);
      return json(res, 403, { erro: 'Servidor IMAP não permitido: ' + cfg.host });
    }

    /* A senha nunca aparece no log. */
    log('imap → ' + cfg.host + ' (conta ***)');

    buscarEmails(cfg)
      .then(itens => {
        log('imap ok → ' + itens.length + ' e-mails lidos (nenhum marcado como lido)');
        json(res, 200, { emails: itens });
      })
      .catch(e => {
        log('imap falhou: ' + e.message);
        json(res, 502, { erro: e.message });
      });
  });
}

/* ─────────────── SERVIDOR ─────────────── */

const servidor = http.createServer((req, res) => {
  const urlObj = new URL(req.url, 'http://' + BIND + ':' + PORTA);

  if (req.method === 'OPTIONS') {
    cors(res);
    res.writeHead(204);
    return res.end();
  }

  if (urlObj.pathname === '/status' && req.method === 'GET') {
    return json(res, 200, { antena: 'online', porta: PORTA, versao: '2.0' });
  }

  if (urlObj.pathname === '/proxy' && req.method === 'GET') {
    return rotaProxy(req, res, urlObj);
  }

  if (urlObj.pathname === '/emails' && req.method === 'POST') {
    return rotaEmails(req, res);
  }

  json(res, 404, { erro: 'Rota desconhecida' });
});

servidor.on('error', e => {
  if (e.code === 'EADDRINUSE') {
    console.error('\n❌ A porta ' + PORTA + ' já está ocupada.');
    console.error('   Provavelmente a antena já está rodando em outro terminal.');
    console.error('   Feche o outro terminal, ou descubra quem está usando a porta:');
    console.error('     Linux/Mac:  lsof -i :' + PORTA);
    console.error('     Windows:    netstat -ano | findstr :' + PORTA + '\n');
  } else {
    console.error('\n❌ Erro ao subir a antena: ' + e.message + '\n');
  }
  process.exit(1);
});

servidor.listen(PORTA, BIND, () => {
  console.log('');
  console.log('  ⚡ ANTENA DO JARVIS ONLINE — porta ' + PORTA + '. Pode abrir o jarvis-hauck.html.');
  console.log('');
  console.log('  Escutando só em ' + BIND + ' (ninguém de fora alcança esta antena).');
  console.log('  Liberado para buscar: ' + PROXY_ALLOWLIST.join(', '));
  console.log('  IMAP liberado para:   ' + IMAP_ALLOWLIST.join(', '));
  console.log('  E-mails são lidos com BODY.PEEK — nada é marcado como lido.');
  console.log('');
  console.log('  Deixe este terminal aberto. Ctrl+C encerra a antena.');
  console.log('');
});
