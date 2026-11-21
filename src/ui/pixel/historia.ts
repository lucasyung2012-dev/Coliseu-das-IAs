import { desenhar } from './desenho';

/**
 * Personagens e inimigos do modo História em pixel (docs/HISTORIA.md).
 * Cada um é uma lista curta de formas; o contorno escuro sai sozinho.
 */

// Lívia: túnica azul manchada de tinta, cabelo cacheado preso com o estilete de bronze, bolsa de pergaminhos.
export const LIVIA = desenhar(18, 26, [
  ['Y', 11, 0, 1, 3],
  ['H', 4, 0, 7, 2],
  ['H', 3, 2, 10, 3],
  ['H', 2, 4, 2, 4],
  ['H', 12, 4, 2, 4],
  ['P', 4, 3, 8, 6],
  ['K', 6, 5],
  ['K', 9, 5],
  ['R', 7, 7, 2, 1],
  ['P', 7, 9, 2, 1],
  ['T', 4, 10, 8, 9],
  ['t', 5, 12, 1, 1],
  ['t', 9, 15, 1, 1],
  ['B', 4, 14, 8, 1],
  ['B', 12, 12, 3, 4],
  ['W', 13, 11, 1, 2],
  ['P', 3, 11, 1, 5],
  ['P', 12, 11, 1, 1],
  ['P', 5, 19, 2, 4],
  ['P', 9, 19, 2, 4],
  ['B', 5, 23, 2, 1],
  ['B', 9, 23, 2, 1],
]);
export const PALETA_LIVIA = { H: '#4a2a16', P: '#e8b48a', T: '#3a6ad0', t: '#1a2a5a', B: '#7a4a22', Y: '#f2c14e', R: '#c0484a', W: '#f0e0c0', K: '#140c22' };

// O Censor: três vezes maior, toga de placas enferrujadas, coroa de engrenagens e um olho vermelho.
export const CENSOR = desenhar(28, 34, [
  ['Y', 8, 0, 2, 2],
  ['Y', 13, 0, 2, 2],
  ['Y', 18, 0, 2, 2],
  ['Y', 7, 2, 14, 2],
  ['M', 8, 4, 12, 8],
  ['m', 8, 9, 3, 3],
  ['E', 12, 6, 4, 3],
  ['e', 13, 7, 2, 1],
  ['M', 6, 12, 16, 3],
  ['T', 4, 15, 20, 15],
  ['m', 6, 17, 3, 2],
  ['m', 15, 21, 4, 2],
  ['m', 9, 26, 3, 2],
  ['M', 1, 15, 3, 10],
  ['M', 24, 15, 3, 10],
  ['O', 3, 25, 1, 3],
  ['M', 7, 30, 5, 3],
  ['M', 16, 30, 5, 3],
]);
export const PALETA_CENSOR = { Y: '#c8962a', M: '#8a5a3a', m: '#a8402a', E: '#ff2a2a', e: '#ffd0d0', T: '#5a3a2a', O: '#2a1a10', K: '#140c22' };

// Pretoriano mecânico: elmo com crista vermelha, armadura de aço, escudo e lança.
export const PRETORIANO = desenhar(20, 28, [
  ['R', 7, 0, 6, 2],
  ['S', 6, 2, 8, 6],
  ['K', 7, 5, 6, 1],
  ['E', 8, 5, 1, 1],
  ['E', 11, 5, 1, 1],
  ['S', 5, 8, 10, 10],
  ['s', 7, 10, 6, 1],
  ['s', 7, 13, 6, 1],
  ['R', 1, 9, 5, 10],
  ['Y', 3, 13, 1, 2],
  ['W', 16, 0, 1, 20],
  ['S', 15, 9, 2, 6],
  ['S', 6, 18, 3, 7],
  ['S', 11, 18, 3, 7],
  ['s', 5, 25, 4, 1],
  ['s', 11, 25, 4, 1],
]);
export const PALETA_PRETORIANO = { R: '#b0283a', S: '#a8b0c0', s: '#6a7080', E: '#ff3a3a', Y: '#f2c14e', W: '#c8a070', K: '#140c22' };

// Incinerador: braseiro voador de bronze com um olho vermelho e jatos de vapor embaixo.
export const INCINERADOR = desenhar(18, 18, [
  ['F', 6, 0, 4, 2],
  ['Y', 7, 1, 2, 2],
  ['F', 4, 2, 8, 2],
  ['W', 3, 4, 10, 1],
  ['M', 3, 5, 10, 5],
  ['E', 7, 6, 2, 2],
  ['M', 5, 10, 6, 2],
  ['C', 6, 12, 1, 2],
  ['C', 9, 12, 1, 2],
]);
export const PALETA_INCINERADOR = { F: '#ff6a2a', Y: '#ffd04a', W: '#d8a060', M: '#8a5a2a', E: '#ff2a2a', C: '#9fe8ff', K: '#140c22' };

// A Fornalha: forno de bronze andante; a porta da barriga (D) acende antes do bafo de fogo.
export const FORNALHA = desenhar(30, 32, [
  ['G', 13, 0, 4, 4],
  ['M', 10, 4, 10, 5],
  ['E', 12, 6, 2, 1],
  ['E', 16, 6, 2, 1],
  ['M', 5, 9, 20, 13],
  ['W', 5, 9, 20, 1],
  ['D', 10, 12, 10, 7],
  ['K', 10, 14, 10, 1],
  ['K', 10, 16, 10, 1],
  ['M', 1, 10, 4, 9],
  ['M', 25, 10, 4, 9],
  ['G', 0, 18, 5, 3],
  ['G', 25, 18, 5, 3],
  ['M', 7, 22, 6, 6],
  ['M', 17, 22, 6, 6],
  ['G', 6, 28, 8, 2],
  ['G', 16, 28, 8, 2],
]);
export const paletaFornalha = (acesa: boolean) => ({ G: '#4a3a30', M: '#9a6a3a', W: '#d8a060', E: '#ff2a2a', D: acesa ? '#ff7a2a' : '#3a1a10', K: '#140c22' });
