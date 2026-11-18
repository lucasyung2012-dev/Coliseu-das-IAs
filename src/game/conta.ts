import { useSyncExternalStore } from 'react';
import { DROPBOX_APP_KEY } from '@/config';
import { abrirLogin, capturarVolta, gravarArquivo, lerArquivo, quemSou, sair, terminarLogin, tokenDeAcesso, type ModoLogin } from '@/services/dropbox';
import { aoMudarProgresso, juntarProgresso, obterProgresso, substituirProgresso, validarProgresso } from './progresso';

/**
 * Conta do jogador pelo Dropbox (mesmo esquema do ROUTIG) e sincronização do
 * progresso. Com conta: partidas valendo troféus e progresso na nuvem. Sem conta:
 * Modo Treino, com dificuldade escolhida e sem troféus.
 */

const CHAVE_CONTA = 'coliseu.conta';
const CHAVE_DIFICULDADE = 'coliseu.dificuldade';
const ARQUIVO = 'progresso.json';
const ESPERA_ENVIO = 2000;

interface Conta {
  renovacao: string;
  nome: string;
  email: string;
  /** Já juntou o progresso deste aparelho com o da nuvem pelo menos uma vez. */
  jaSincronizou: boolean;
}

export type Situacao = 'parado' | 'sincronizando' | 'ok' | 'erro';

export interface EstadoConta {
  conta: Conta | null;
  situacao: Situacao;
  erro: string | null;
  sincronizadoEm: string | null;
}

function lerConta(): Conta | null {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_CONTA) ?? 'null') as Conta | null;
  } catch {
    return null;
  }
}

let estado: EstadoConta = { conta: lerConta(), situacao: 'parado', erro: null, sincronizadoEm: null };
const ouvintes = new Set<() => void>();

function mudar(parcial: Partial<EstadoConta>) {
  estado = { ...estado, ...parcial };
  if ('conta' in parcial) {
    try {
      if (estado.conta) localStorage.setItem(CHAVE_CONTA, JSON.stringify(estado.conta));
      else localStorage.removeItem(CHAVE_CONTA);
    } catch {
      /* sem armazenamento: vale só nesta visita */
    }
  }
  ouvintes.forEach((f) => f());
}

export function useConta(): EstadoConta {
  return useSyncExternalStore(
    (f) => {
      ouvintes.add(f);
      return () => ouvintes.delete(f);
    },
    () => estado,
    () => estado,
  );
}

/** A conta só existe depois que o app for registrado no Dropbox (chave em src/config.ts). */
export const contaConfigurada = () => DROPBOX_APP_KEY.length > 0;

/** Partidas valendo troféus: com conta conectada (ou enquanto a conta nem existe no jogo). */
export function modoRanqueado(e: EstadoConta = estado): boolean {
  return !contaConfigurada() || e.conta !== null;
}

// ---------- Login ----------

export async function entrarNoDropbox(modo: ModoLogin) {
  if (!contaConfigurada()) return;
  mudar({ erro: null });
  await abrirLogin(DROPBOX_APP_KEY, modo);
}

/** Termina o login com o código (o que voltou sozinho ou o colado pelo jogador). */
export async function concluirLogin(code: string) {
  try {
    mudar({ situacao: 'sincronizando', erro: null });
    const renovacao = await terminarLogin(DROPBOX_APP_KEY, code);
    const quem = await quemSou(await tokenDeAcesso(DROPBOX_APP_KEY, renovacao)).catch(() => ({ nome: '', email: '' }));
    mudar({ conta: { renovacao, nome: quem.nome, email: quem.email, jaSincronizou: false } });
    await sincronizar();
  } catch {
    mudar({ situacao: 'erro', erro: 'Não deu para entrar no Dropbox. Tente de novo ou use "Entrar com código".' });
  }
}

export async function desconectar() {
  const c = estado.conta;
  mudar({ conta: null, situacao: 'parado', erro: null, sincronizadoEm: null });
  if (c) await sair(DROPBOX_APP_KEY, c.renovacao);
}

// ---------- Sincronização ----------

let emAndamento: Promise<void> | null = null;

/** Junta o progresso deste aparelho com o da nuvem e grava o resultado nos dois lugares. */
export function sincronizar(): Promise<void> {
  if (!estado.conta || !contaConfigurada()) return Promise.resolve();
  if (emAndamento) return emAndamento;
  emAndamento = (async () => {
    const conta = estado.conta!;
    mudar({ situacao: 'sincronizando' });
    try {
      const token = await tokenDeAcesso(DROPBOX_APP_KEY, conta.renovacao);
      const local = obterProgresso();
      const texto = await lerArquivo(token, ARQUIVO);
      const nuvem = texto ? validarProgresso(JSON.parse(texto)) : null;
      if (!nuvem) {
        await gravarArquivo(token, ARQUIVO, JSON.stringify(local));
      } else {
        const junto = juntarProgresso(local, nuvem, !conta.jaSincronizou);
        if (junto !== local) substituirProgresso(junto);
        if (junto !== nuvem) await gravarArquivo(token, ARQUIVO, JSON.stringify(junto));
      }
      mudar({ conta: { ...conta, jaSincronizou: true }, situacao: 'ok', erro: null, sincronizadoEm: new Date().toISOString() });
    } catch (e) {
      if (e instanceof Error && e.message === 'dbx-expirado') {
        mudar({ conta: null, situacao: 'erro', erro: 'O acesso ao Dropbox expirou. Entre de novo.' });
      } else {
        mudar({ situacao: 'erro', erro: 'Sem conexão com o Dropbox agora. O progresso continua salvo aqui e sobe depois.' });
      }
    } finally {
      emAndamento = null;
    }
  })();
  return emAndamento;
}

/**
 * Chamado uma vez ao abrir o jogo, antes do roteador: pega a volta do login,
 * sincroniza ao abrir, depois de cada mudança (com uma pequena espera) e ao
 * voltar para o jogo.
 */
export function iniciarConta() {
  if (!contaConfigurada()) return;
  capturarVolta();
  void sincronizar();
  let espera: number | undefined;
  aoMudarProgresso(() => {
    window.clearTimeout(espera);
    espera = window.setTimeout(() => void sincronizar(), ESPERA_ENVIO);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void sincronizar();
  });
}

// ---------- Dificuldade do Modo Treino ----------

export type Dificuldade = 'facil' | 'medio' | 'dificil';

/** No treino, a dificuldade decide quanto o rival acerta a melhor carta. */
export const ACERTO_TREINO: Record<Dificuldade, number> = { facil: 0.3, medio: 0.6, dificil: 0.9 };
export const NOMES_DIFICULDADE: Record<Dificuldade, string> = { facil: 'Fácil', medio: 'Médio', dificil: 'Difícil' };

function lerDificuldade(): Dificuldade {
  try {
    const d = localStorage.getItem(CHAVE_DIFICULDADE);
    return d === 'facil' || d === 'dificil' ? d : 'medio';
  } catch {
    return 'medio';
  }
}

let dificuldade: Dificuldade = lerDificuldade();
const ouvintesDificuldade = new Set<() => void>();

export function escolherDificuldade(d: Dificuldade) {
  dificuldade = d;
  try {
    localStorage.setItem(CHAVE_DIFICULDADE, d);
  } catch {
    /* vale só nesta visita */
  }
  ouvintesDificuldade.forEach((f) => f());
}

export function useDificuldade(): Dificuldade {
  return useSyncExternalStore(
    (f) => {
      ouvintesDificuldade.add(f);
      return () => ouvintesDificuldade.delete(f);
    },
    () => dificuldade,
    () => dificuldade,
  );
}
