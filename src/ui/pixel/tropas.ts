import { desenhar, type Passo } from './desenho';
import type { Paleta } from './Sprite';
import type { TipoTropa } from '@/game/duelo/motor';

/**
 * As tropas do Duelo (cada uma é um tipo de argumento), olhando para a direita,
 * e a Tribuna de cada lado. C = cor da IA do lado; D = a mesma cor mais escura.
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

/** Analogia: cavaleiro com lança. */
const CAVALEIRO: Passo[] = [
  ['M', 5, 0, 3, 1], // capacete
  ['C', 6, 0],
  ['S', 5, 1, 3, 2],
  ['K', 7, 1],
  ['C', 5, 3, 3, 4], // corpo
  ['M', 8, 4, 6, 1], // lança
  ['W', 14, 4],
  ['B', 2, 7, 10, 4], // cavalo
  ['G', 5, 7, 3, 1], // sela
  ['B', 11, 4, 2, 3], // pescoço
  ['B', 12, 3, 3, 2], // cabeça
  ['K', 13, 3],
  ['D', 10, 4, 1, 3], // crina
  ['B', 1, 7, 1, 3], // rabo
  ['B', 3, 11, 1, 3], // patas
  ['B', 5, 11, 1, 3],
  ['B', 9, 11, 1, 3],
  ['B', 11, 11, 1, 3],
];

/** Piada: bobo da corte, com chapéu de guizos. */
const BOBO: Passo[] = [
  ['C', 2, 0, 2, 2],
  ['D', 6, 0, 2, 2],
  ['G', 2, 0],
  ['G', 7, 0],
  ['C', 3, 2, 4, 1],
  ['S', 3, 3, 4, 3],
  ['K', 4, 4],
  ['K', 6, 4],
  ['C', 3, 6, 2, 4],
  ['D', 5, 6, 2, 4],
  ['G', 3, 6, 4, 1], // gola
  ['B', 8, 6, 1, 5], // bastão
  ['G', 8, 5],
  ['C', 3, 10, 1, 3],
  ['D', 6, 10, 1, 3],
  ['B', 2, 13, 2, 1],
  ['B', 6, 13, 2, 1],
];

/** Discurso épico: elefante de guerra com manta. */
const ELEFANTE: Passo[] = [
  ['E', 2, 5, 15, 8], // corpo
  ['C', 5, 4, 8, 4], // manta
  ['G', 5, 7, 8, 1],
  ['E', 15, 3, 6, 7], // cabeça
  ['e', 14, 4, 3, 5], // orelha
  ['K', 18, 5],
  ['W', 19, 9, 2, 1], // presa
  ['E', 20, 8, 2, 5], // tromba
  ['E', 21, 12, 2, 1],
  ['e', 1, 6, 1, 4], // rabo
  ['E', 3, 13, 3, 3], // patas
  ['E', 8, 13, 3, 3],
  ['E', 12, 13, 3, 3],
  ['e', 3, 15, 3, 1],
  ['e', 8, 15, 3, 1],
  ['e', 12, 15, 3, 1],
];

/** Citação de autoridade: senador de toga com faixa da cor do lado. */
const SENADOR: Passo[] = [
  ['G', 3, 0, 4, 1], // louros
  ['S', 3, 1, 4, 3],
  ['K', 6, 2],
  ['T', 2, 4, 6, 9], // toga
  ['C', 3, 5],
  ['C', 4, 6],
  ['C', 5, 7],
  ['C', 6, 8],
  ['C', 7, 9],
  ['S', 8, 3, 1, 3], // braço erguido, discursando
  ['N', 8, 1, 2, 2], // pergaminho
  ['B', 3, 13, 2, 1],
  ['B', 6, 13, 2, 1],
];

/** Estatística: balista. */
const BALISTA: Passo[] = [
  ['B', 2, 6, 12, 2], // base
  ['C', 4, 6, 4, 1],
  ['B', 4, 8, 1, 2],
  ['B', 11, 8, 1, 2],
  ['B', 7, 3, 2, 3], // poste
  ['M', 10, 0, 1, 8], // arco
  ['W', 3, 3, 11, 1], // dardo
  ['M', 14, 3],
];

/** Prova: catapulta com pedra. */
const CATAPULTA: Passo[] = [
  ['B', 1, 9, 14, 2],
  ['C', 2, 9, 4, 1],
  ['K', 2, 11, 3, 2], // rodas
  ['K', 10, 11, 3, 2],
  ['B', 8, 4, 2, 5], // apoio
  ['B', 5, 7], // braço
  ['B', 6, 6],
  ['B', 7, 5],
  ['B', 8, 4],
  ['B', 9, 3],
  ['B', 10, 2],
  ['B', 11, 1],
  ['B', 12, 0, 2, 2], // concha
  ['p', 12, 0, 2, 1], // pedra
];

/** Muralha de lógica: barricada de pedra com estandarte. */
const BARRICADA: Passo[] = [
  ['P', 0, 1, 2, 2],
  ['P', 4, 1, 2, 2],
  ['P', 8, 1, 2, 2],
  ['P', 0, 3, 10, 10],
  ['p', 0, 6, 10, 1],
  ['p', 0, 9, 10, 1],
  ['p', 3, 3, 1, 3],
  ['p', 6, 6, 1, 3],
  ['p', 2, 9, 1, 4],
  ['C', 4, 7, 2, 2],
];

/** Contra-argumento: escudeiro com escudo redondo. */
const ESCUDEIRO: Passo[] = [
  ['M', 3, 0, 4, 3],
  ['C', 4, 0, 2, 1],
  ['S', 3, 3, 4, 2],
  ['K', 6, 3],
  ['C', 2, 5, 5, 4],
  ['S', 3, 9, 1, 3],
  ['S', 5, 9, 1, 3],
  ['B', 2, 12, 2, 1],
  ['B', 5, 12, 2, 1],
  ['D', 7, 3, 5, 8], // escudo redondo
  ['C', 8, 4, 3, 6],
  ['G', 9, 6, 1, 2],
];

/**
 * A Tribuna (a tribuna dos oradores do Fórum romano): plataforma de pedra com
 * colunas de mármore, as pontas de bronze dos navios (os "rostros") e o
 * estandarte do lado.
 */
const TRIBUNA_PASSOS: Passo[] = [
  ['P', 0, 0, 16, 2], // plataforma de cima
  ['p', 0, 2, 16, 1],
  ['P', 1, 3, 14, 17], // corpo
  ['T', 2, 3, 2, 17], // colunas
  ['T', 7, 3, 2, 17],
  ['T', 12, 3, 2, 17],
  ['p', 4, 3, 1, 17],
  ['p', 9, 3, 1, 17],
  ['p', 14, 3, 1, 17],
  ['C', 5, 3, 2, 4], // estandarte
  ['C', 10, 3, 2, 4],
  ['D', 5, 7],
  ['D', 11, 7],
  ['G', 4, 10, 3, 2], // pontas de bronze dos navios
  ['G', 9, 14, 3, 2],
  ['G', 4, 16, 3, 2],
  ['G', 3, 11],
  ['G', 8, 15],
  ['G', 3, 17],
  ['P', 0, 20, 16, 1], // degraus
  ['p', 0, 21, 16, 1],
];
export const TRIBUNA = desenhar(18, 24, TRIBUNA_PASSOS);

export const TROPAS: Record<TipoTropa, string[]> = {
  legionario: desenhar(14, 15, LEGIONARIO),
  exemplo: desenhar(14, 15, LEGIONARIO),
  cavaleiro: desenhar(17, 16, CAVALEIRO),
  bobo: desenhar(12, 16, BOBO),
  centuriao: desenhar(15, 17, CENTURIAO),
  elefante: desenhar(25, 18, ELEFANTE),
  senador: desenhar(12, 16, SENADOR),
  arqueiro: desenhar(14, 15, ARQUEIRO),
  balista: desenhar(17, 12, BALISTA),
  catapulta: desenhar(16, 15, CATAPULTA),
  barricada: desenhar(12, 15, BARRICADA),
  escudeiro: desenhar(14, 15, ESCUDEIRO),
};

/** Largura de cada tropa na arena (% da largura): o elefante é o maior. */
export const LARGURA_TROPA: Record<TipoTropa, number> = {
  legionario: 6,
  exemplo: 4.5,
  cavaleiro: 8,
  bobo: 5,
  centuriao: 7.5,
  elefante: 12,
  senador: 6,
  arqueiro: 6,
  balista: 8,
  catapulta: 8,
  barricada: 6,
  escudeiro: 6.5,
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
    T: '#efe9dc',
    E: '#8d8a99',
    e: '#6a6878',
    C: cor,
    D: escura,
    P: '#9a8a78',
    p: '#6a5c50',
  };
}
