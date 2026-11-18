/**
 * Regras do Duelo em tempo real (protótipo, 19/11/2026). A plateia tem 3 setores,
 * cada um liderado por um jurado; os argumentos são arremessados num setor e o
 * puxam para um lado conforme os gostos do líder (a mesma tabela do Tribunal).
 * Funções puras; o relógio e as animações ficam na tela.
 */
import type { JuradoId } from '../jurados';
import { GOSTOS } from '../tribunal/temas';
import type { Carta } from '../tribunal/dilemas';

export const DURACAO = 60;
export const FOLEGO_MAX = 10;
export const CUSTO = 3;
/** Fôlego que volta por segundo. */
export const FOLEGO_POR_SEGUNDO = 1;
export const APLAUSOS_MAX = 5;
/** Cada setor vai de −10 (todo do rival) a +10 (todo seu). */
export const LIMITE = 10;
export const TAMANHO_MAO = 4;
/** Tempo de voo de um argumento até o setor (ms). */
export const VOO_MS = 1100;

export type Lado = 'eu' | 'rival';

export interface Setor {
  lider: JuradoId;
  valor: number;
}

/** Força de um argumento para o líder de um setor: ama +2, gosta +1, não gosta −1. */
export function forca(carta: Carta, lider: JuradoId): number {
  const g = GOSTOS[lider];
  return carta.temas.reduce((s, t) => s + (t === g.ama ? 2 : t === g.gosta ? 1 : t === g.naoGosta ? -1 : 0), 0);
}

/** Puxa o setor: força positiva puxa para quem lançou; negativa empurra para o outro lado. */
export function puxar(valor: number, f: number, lado: Lado): number {
  const sinal = lado === 'eu' ? 1 : -1;
  const passo = f > 0 ? f * 2 : f * 1.5;
  return Math.max(-LIMITE, Math.min(LIMITE, valor + sinal * passo));
}

/**
 * Choque no ar: dois argumentos indo para o mesmo setor. Passa o mais forte
 * para aquela plateia; empate, os dois somem.
 */
export function choque(minha: Carta, dele: Carta, lider: JuradoId): Lado | 'empate' {
  const a = forca(minha, lider);
  const b = forca(dele, lider);
  return a > b ? 'eu' : b > a ? 'rival' : 'empate';
}

export function placar(setores: Setor[]): { eu: number; rival: number } {
  return {
    eu: setores.filter((s) => s.valor > 0).length,
    rival: setores.filter((s) => s.valor < 0).length,
  };
}

/** Resultado no fim: mais setores ganha; empate em setores, vale a soma das barras. */
export function resultado(setores: Setor[]): 'vitoria' | 'derrota' | 'empate' {
  const p = placar(setores);
  if (p.eu !== p.rival) return p.eu > p.rival ? 'vitoria' : 'derrota';
  const soma = setores.reduce((s, x) => s + x.valor, 0);
  return soma > 0 ? 'vitoria' : soma < 0 ? 'derrota' : 'empate';
}

/**
 * O rival escolhe carta e setor: na maior parte das vezes a jogada que mais
 * puxa um setor ainda disputado; às vezes erra de propósito (conforme a liga).
 */
export function jogadaDoRival(mao: Carta[], setores: Setor[], acerto: number, aleatorio: () => number): { carta: Carta; setor: number } {
  const opcoes = mao.flatMap((carta) =>
    setores.map((s, i) => {
      const f = forca(carta, s.lider);
      // Vale mais puxar um setor que ainda não é dele.
      const peso = f * (s.valor > -LIMITE / 2 ? 1.5 : 0.6);
      return { carta, setor: i, peso };
    }),
  );
  opcoes.sort((a, b) => b.peso - a.peso);
  if (aleatorio() < acerto) return opcoes[0]!;
  return opcoes[Math.floor(aleatorio() * opcoes.length)]!;
}
