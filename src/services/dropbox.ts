/**
 * Dropbox no navegador, sem servidor (o mesmo esquema do ROUTIG): login OAuth com
 * PKCE e "acesso offline", que devolve um token de renovação de longa duração.
 * Assim o jogo continua conectado no iPad sem pedir login de novo.
 *
 * O app é registrado no Dropbox com acesso "App folder": só enxerga a pasta
 * Aplicativos/<nome do app>, nunca o resto do Dropbox (docs/DROPBOX.md).
 */

const AUTH_URL = 'https://www.dropbox.com/oauth2/authorize';
const TOKEN_URL = 'https://api.dropboxapi.com/oauth2/token';
const API = 'https://api.dropboxapi.com/2';
const CONTENT = 'https://content.dropboxapi.com/2';
const PENDENTE = 'coliseu.dbx.pendente';
const VOLTOU = 'coliseu.dbx.voltou';

export type ModoLogin = 'voltar' | 'codigo';

interface Pendente {
  verificador: string;
  estado: string;
  modo: ModoLogin;
  redirect: string;
}

const b64url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

const aleatorio = (n: number) => b64url(crypto.getRandomValues(new Uint8Array(n)));

async function desafio(verificador: string): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verificador));
  return b64url(new Uint8Array(hash));
}

/** Endereço para onde o Dropbox devolve depois do login (precisa estar cadastrado no app do Dropbox). */
export function enderecoDeVolta(): string {
  return `${location.origin}${location.pathname}`;
}

function lerPendente(): Pendente | null {
  try {
    return JSON.parse(localStorage.getItem(PENDENTE) ?? 'null') as Pendente | null;
  } catch {
    return null;
  }
}

/**
 * Abre o login do Dropbox. "voltar" sai do jogo e volta sozinho com o código;
 * "codigo" abre o Dropbox em outra aba, que mostra um código para colar no jogo
 * (para quando a volta falhar, como às vezes no app instalado no iPad).
 */
export async function abrirLogin(chave: string, modo: ModoLogin): Promise<void> {
  const verificador = aleatorio(48);
  const estado = aleatorio(16);
  const redirect = modo === 'voltar' ? enderecoDeVolta() : '';
  localStorage.setItem(PENDENTE, JSON.stringify({ verificador, estado, modo, redirect } satisfies Pendente));
  const q = new URLSearchParams({
    client_id: chave,
    response_type: 'code',
    code_challenge: await desafio(verificador),
    code_challenge_method: 'S256',
    token_access_type: 'offline',
  });
  if (modo === 'voltar') {
    q.set('redirect_uri', redirect);
    q.set('state', estado);
    location.assign(`${AUTH_URL}?${q}`);
  } else {
    window.open(`${AUTH_URL}?${q}`, '_blank', 'noopener');
  }
}

/**
 * Chamado ao abrir o jogo, antes do roteador: se a página voltou do Dropbox com
 * `?code=…`, guarda o código, limpa o endereço e leva para as Configurações (onde fica a conta).
 */
export function capturarVolta(): void {
  try {
    const q = new URLSearchParams(location.search);
    const code = q.get('code');
    const state = q.get('state');
    const error = q.get('error');
    if (!code && !error) return;
    const p = lerPendente();
    if (!p || p.modo !== 'voltar' || state !== p.estado) return;
    sessionStorage.setItem(VOLTOU, JSON.stringify(code ? { code } : { error }));
    history.replaceState(null, '', `${location.pathname}#/configuracoes`);
  } catch {
    /* sem armazenamento: o login só não termina sozinho */
  }
}

/** Código devolvido pelo Dropbox na volta do login (lido uma vez). */
export function pegarVolta(): { code?: string; error?: string } | null {
  try {
    const v = sessionStorage.getItem(VOLTOU);
    if (!v) return null;
    sessionStorage.removeItem(VOLTOU);
    return JSON.parse(v) as { code?: string; error?: string };
  } catch {
    return null;
  }
}

let acesso: { valor: string; ate: number; renovacao: string } | null = null;

interface RespostaToken {
  access_token?: string;
  expires_in?: number;
  refresh_token?: string;
  error?: string;
}

async function pedirToken(body: URLSearchParams): Promise<RespostaToken> {
  const r = await fetch(TOKEN_URL, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
  const j = (await r.json().catch(() => ({}))) as RespostaToken;
  if (!r.ok || !j.access_token) throw new Error(j.error === 'invalid_grant' ? 'dbx-expirado' : `dbx-token ${r.status}`);
  return j;
}

/** Troca o código do login pelo token de renovação (guardado neste aparelho). */
export async function terminarLogin(chave: string, code: string): Promise<string> {
  const p = lerPendente();
  if (!p) throw new Error('dbx-estado');
  const body = new URLSearchParams({ grant_type: 'authorization_code', code: code.trim(), code_verifier: p.verificador, client_id: chave });
  if (p.redirect) body.set('redirect_uri', p.redirect);
  const j = await pedirToken(body);
  localStorage.removeItem(PENDENTE);
  if (!j.refresh_token) throw new Error('dbx-token');
  acesso = { valor: j.access_token!, ate: Date.now() + (j.expires_in ?? 14400) * 1000, renovacao: j.refresh_token };
  return j.refresh_token;
}

/** Token de acesso válido, renovado em silêncio com o token de renovação. */
export async function tokenDeAcesso(chave: string, renovacao: string): Promise<string> {
  if (acesso && acesso.renovacao === renovacao && Date.now() < acesso.ate - 60_000) return acesso.valor;
  const j = await pedirToken(new URLSearchParams({ grant_type: 'refresh_token', refresh_token: renovacao, client_id: chave }));
  acesso = { valor: j.access_token!, ate: Date.now() + (j.expires_in ?? 14400) * 1000, renovacao };
  return j.access_token!;
}

export async function quemSou(token: string): Promise<{ email: string; nome: string }> {
  const r = await fetch(`${API}/users/get_current_account`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) throw new Error(`dbx conta ${r.status}`);
  const j = (await r.json()) as { email?: string; name?: { display_name?: string } };
  return { email: j.email ?? '', nome: j.name?.display_name ?? '' };
}

/** Lê um arquivo de texto da pasta do app; null se ele ainda não existe. */
export async function lerArquivo(token: string, nome: string): Promise<string | null> {
  const r = await fetch(`${CONTENT}/files/download`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Dropbox-API-Arg': JSON.stringify({ path: `/${nome}` }) } });
  if (r.status === 409) return null;
  if (!r.ok) throw new Error(`dbx ler ${r.status}`);
  return r.text();
}

/** Cria ou substitui um arquivo de texto na pasta do app. */
export async function gravarArquivo(token: string, nome: string, texto: string): Promise<void> {
  const r = await fetch(`${CONTENT}/files/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/octet-stream', 'Dropbox-API-Arg': JSON.stringify({ path: `/${nome}`, mode: 'overwrite', mute: true }) },
    body: texto,
  });
  if (!r.ok) throw new Error(`dbx gravar ${r.status}`);
}

/** Sai do Dropbox neste aparelho (invalida o token; os arquivos ficam). */
export async function sair(chave: string, renovacao: string): Promise<void> {
  try {
    const t = await tokenDeAcesso(chave, renovacao);
    await fetch(`${API}/auth/token/revoke`, { method: 'POST', headers: { Authorization: `Bearer ${t}` } });
  } catch {
    /* sem internet ou já inválido: só esquece neste aparelho */
  }
  acesso = null;
}
