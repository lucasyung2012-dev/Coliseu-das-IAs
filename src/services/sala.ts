/**
 * Sala online por código (Duelo online). Os dois aparelhos conversam direto um com
 * o outro (WebRTC, pelo PeerJS); o serviço gratuito do PeerJS só "apresenta" os
 * dois no começo, usando o código da sala. Nada do jogo passa por servidor nosso.
 * O PeerJS só é carregado quando alguém abre a sala online.
 */
import type { DataConnection, Peer as TipoPeer } from 'peerjs';
import { lerMensagem, type MensagemOnline, type ModoOnline } from '@/game/duelo/online';

const PREFIXO = 'coliseu-das-ias-v1-';

export interface Sala {
  codigo: string;
  papel: 'anfitriao' | 'convidado';
  enviar: (m: MensagemOnline) => void;
  /** Recebe as mensagens do outro aparelho; devolve uma função para parar de ouvir. */
  ouvir: (f: (m: MensagemOnline) => void) => () => void;
  /** Avisa quando a conexão cair (o outro saiu ou a internet caiu). */
  aoCair: (f: () => void) => () => void;
  fechar: () => void;
}

export class ErroSala extends Error {
  constructor(
    public motivo: 'codigo-em-uso' | 'sala-nao-encontrada' | 'sem-internet' | 'outro',
    mensagem: string,
  ) {
    super(mensagem);
  }
}

async function novoPeer(id?: string): Promise<TipoPeer> {
  const { Peer } = await import('peerjs');
  const peer = id ? new Peer(id, { debug: 0 }) : new Peer({ debug: 0 });
  return new Promise((ok, falha) => {
    peer.on('open', () => ok(peer));
    peer.on('error', (e: { type?: string }) => {
      peer.destroy();
      if (e.type === 'unavailable-id') falha(new ErroSala('codigo-em-uso', 'Esse código já está em uso.'));
      else if (e.type === 'network' || e.type === 'server-error' || e.type === 'socket-error')
        falha(new ErroSala('sem-internet', 'Não deu para conectar. Confira a internet e tente de novo.'));
      else falha(new ErroSala('outro', 'Não deu para abrir a sala. Tente de novo.'));
    });
  });
}

function embrulhar(peer: TipoPeer, conn: DataConnection, codigo: string, papel: Sala['papel']): Sala {
  const ouvintes = new Set<(m: MensagemOnline) => void>();
  const quedas = new Set<() => void>();
  let fechada = false;
  conn.on('data', (bruto) => {
    const m = lerMensagem(bruto);
    if (m) ouvintes.forEach((f) => f(m));
  });
  const cair = () => {
    if (fechada) return;
    fechada = true;
    quedas.forEach((f) => f());
  };
  conn.on('close', cair);
  conn.on('error', cair);
  peer.on('disconnected', () => {
    // Perdeu o serviço de apresentação: a conexão direta pode continuar viva.
  });
  return {
    codigo,
    papel,
    enviar: (m) => {
      if (!fechada && conn.open) conn.send(m);
    },
    ouvir: (f) => {
      ouvintes.add(f);
      return () => ouvintes.delete(f);
    },
    aoCair: (f) => {
      quedas.add(f);
      return () => quedas.delete(f);
    },
    fechar: () => {
      fechada = true;
      try {
        conn.close();
      } finally {
        peer.destroy();
      }
    },
  };
}

/**
 * Cria a sala com o código e espera o amigo entrar. `aoAbrir` avisa quando a sala
 * já está no ar (para mostrar o código); a promessa termina quando o amigo conecta.
 */
export async function criarSala(modo: ModoOnline, codigo: string, aoAbrir: () => void, cancelado: () => boolean): Promise<Sala> {
  const peer = await novoPeer(`${PREFIXO}${modo}-${codigo}`);
  aoAbrir();
  return new Promise((ok, falha) => {
    peer.on('connection', (conn) => {
      // Só um convidado por sala.
      if (cancelado()) {
        conn.close();
        return;
      }
      conn.on('open', () => ok(embrulhar(peer, conn, codigo, 'anfitriao')));
    });
    peer.on('error', () => falha(new ErroSala('sem-internet', 'A sala caiu. Confira a internet e crie outra.')));
  });
}

/** Entra na sala do amigo pelo código. */
export async function entrarNaSala(modo: ModoOnline, codigo: string): Promise<Sala> {
  const peer = await novoPeer();
  return new Promise((ok, falha) => {
    const conn = peer.connect(`${PREFIXO}${modo}-${codigo}`, { reliable: true, serialization: 'json' });
    const desistir = window.setTimeout(() => {
      peer.destroy();
      falha(new ErroSala('sala-nao-encontrada', 'Não achei essa sala. Confira o código e se o seu amigo criou a sala neste mesmo combate.'));
    }, 12_000);
    conn.on('open', () => {
      window.clearTimeout(desistir);
      ok(embrulhar(peer, conn, codigo, 'convidado'));
    });
    peer.on('error', (e: { type?: string }) => {
      window.clearTimeout(desistir);
      peer.destroy();
      falha(
        e.type === 'peer-unavailable'
          ? new ErroSala('sala-nao-encontrada', 'Não achei essa sala. Confira o código e se o seu amigo criou a sala neste mesmo combate.')
          : new ErroSala('sem-internet', 'Não deu para conectar. Confira a internet e tente de novo.'),
      );
    });
  });
}
