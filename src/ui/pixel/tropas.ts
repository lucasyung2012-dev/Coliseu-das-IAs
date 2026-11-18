import { desenhar, type Passo } from './desenho';
import type { Paleta } from './Sprite';
import type { TipoTropa } from '@/game/duelo/motor';

/**
 * As tropas do Duelo (cada uma é um tipo de argumento), olhando para a direita.
 * C = cor do lado (verde você, vermelho o rival); D = a mesma cor mais escura.
 */
const LEGIONARIO: Passo[] = [
  ['C', 4, 0, 3, 1], // penacho
  ['M', 3, 1, 5, 3], // capacete
  ['W', 4, 1],
  ['S', 4, 3, 4, 2], // rosto
  ['K', 6, 3],
  ['C', 3, 5, 5, 4], // túnica
  ['G', 3, 8, 5, 1], // cinto
  ['S', 8, 6, 1, 2], // braço
  ['B', 9, 3, 2, 1], // pergaminho (o argumento)
  ['N', 9, 4, 2, 4],
  ['B', 9, 8, 2, 1],
  ['S', 4, 9, 1, 3], // pernas
  ['S', 6, 9, 1, 3],
  ['B', 3, 12, 2, 1],
  ['B', 6, 12, 2, 1],
];

const CENTURIAO: Passo[] = [
  ['C', 1, 0, 9, 1], // crista atravessada, de centurião
  ['M', 3, 1, 6, 3],
  ['W', 4, 1],
  ['S', 4, 3, 4, 2],
  ['K', 7, 3],
  ['M', 2, 5, 7, 5], // couraça
  ['W', 3, 5, 1, 2],
  ['C', 2, 10, 7, 2], // saiote
  ['D', 3, 10, 1, 2],
  ['D', 5, 10, 1, 2],
  ['D', 7, 10, 1, 2],
  ['S', 3, 12, 1, 2],
  ['S', 6, 12, 1, 2],
  ['B', 2, 14, 2, 1],
  ['B', 6, 14, 2, 1],
  ['D', 9, 3, 4, 10], // escudo grande na frente
  ['C', 10, 4, 2, 8],
  ['G', 10, 7, 2, 2],
];

const ARQUEIRO: Passo[] = [
  ['B', 3, 0, 4, 2], // capuz
  ['S', 4, 2, 3, 2],
  ['K', 6, 2],
  ['B', 1, 3, 1, 5], // aljava nas costas
  ['W', 1, 2],
  ['C', 3, 4, 4, 5],
  ['G', 3, 8, 4, 1],
  ['S', 7, 5, 2, 1], // braço puxando a corda
  ['W', 9, 2, 1, 7], // corda
  ['B', 9, 1], // arco
  ['B', 10, 2],
  ['B', 11, 3, 1, 5],
  ['B', 10, 8],
  ['B', 9, 9],
  ['S', 4, 9, 1, 3],
  ['S', 6, 9, 1, 3],
  ['B', 3, 12, 2, 1],
  ['B', 6, 12, 2, 1],
];

export const TROPAS: Record<TipoTropa, string[]> = {
  legionario: desenhar(14, 15, LEGIONARIO),
  centuriao: desenhar(15, 17, CENTURIAO),
  arqueiro: desenhar(14, 15, ARQUEIRO),
};

export function paletaTropa(cor: string, escura: string): Paleta {
  return {
    K: '#140c22',
    M: '#b9c2dc',
    W: '#ffffff',
    S: '#e9b48a',
    G: '#f2c14e',
    B: '#7a4a2a',
    N: '#efe2bd',
    C: cor,
    D: escura,
  };
}
