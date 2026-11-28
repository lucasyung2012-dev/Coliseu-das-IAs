import { desenhar } from './desenho';

/**
 * O POVO DE ROMA COM DESENHO PRÓPRIO (27/11/2026, pedido do Lucas: "personagens melhores").
 * Antes, o povo, a feirante, o zelador e a Pintora eram o Copista com outra cor. Agora cada um
 * tem o seu jeito (18 × 28, contorno automático).
 */

// O homem do povo: cabelo curto, túnica verde-oliva com cinto e um pão debaixo do braço.
export const POVO = desenhar(18, 28, [
  ['H', 4, 1, 7, 2],
  ['P', 4, 3, 7, 5],
  ['H', 4, 3, 1, 2],
  ['H', 10, 3, 1, 1],
  ['K', 6, 5],
  ['K', 9, 5],
  ['m', 7, 7, 2, 1],
  ['P', 6, 8, 3, 1],
  ['T', 3, 9, 9, 10],
  ['t', 3, 9, 1, 10],
  ['t', 7, 9, 1, 3],
  ['Y', 3, 14, 9, 1],
  ['T', 1, 9, 2, 2],
  ['P', 1, 11, 2, 5],
  ['T', 12, 9, 2, 2],
  ['P', 12, 11, 2, 4],
  ['L', 12, 14, 4, 2],
  ['l', 13, 14, 1, 1],
  ['l', 15, 15, 1, 1],
  ['P', 4, 19, 2, 4],
  ['P', 8, 19, 2, 4],
  ['B', 4, 23, 3, 1],
  ['B', 8, 23, 3, 1],
]);
export const PALETA_POVO = { H: '#4a2a14', P: '#d8a070', K: '#140c22', m: '#8a4a3a', T: '#7a8a4a', t: '#5a6a34', Y: '#8a5a2a', B: '#4a2a14', L: '#c88a3a', l: '#a86a2a' };

// A feirante: lenço vermelho na cabeça, vestido azul, avental claro e o cesto de frutas.
export const FEIRANTE = desenhar(18, 28, [
  ['R', 3, 0, 9, 3],
  ['R', 11, 2, 2, 2],
  ['H', 3, 3, 1, 4],
  ['P', 4, 3, 7, 5],
  ['K', 6, 5],
  ['K', 9, 5],
  ['r', 5, 6],
  ['r', 10, 6],
  ['m', 7, 7, 2, 1],
  ['D', 3, 9, 10, 8],
  ['D', 2, 16, 12, 7],
  ['W', 5, 11, 6, 11],
  ['Y', 3, 11, 10, 1],
  ['P', 1, 10, 2, 5],
  ['P', 13, 10, 2, 4],
  ['B', 12, 14, 5, 4],
  ['b', 12, 15, 5, 1],
  ['O', 12, 13],
  ['G', 14, 13],
  ['O', 16, 13],
  ['B', 4, 23, 3, 1],
  ['B', 9, 23, 3, 1],
]);
export const PALETA_FEIRANTE = { R: '#c0283c', P: '#e0a878', K: '#140c22', r: '#e07a6a', m: '#8a3a2a', H: '#3a2414', D: '#2a6aa0', W: '#f0e8d8', Y: '#c8962a', B: '#8a5a2a', b: '#6a4220', O: '#e8582a', G: '#6ab83a' };

// O zelador do aqueduto: velho de barba branca, gorro e casaco azuis e a chave grande da comporta.
export const ZELADOR = desenhar(18, 28, [
  ['A', 4, 0, 7, 3],
  ['a', 4, 2, 7, 1],
  ['P', 4, 3, 7, 4],
  ['W', 5, 3, 2, 1],
  ['W', 8, 3, 2, 1],
  ['K', 6, 4],
  ['K', 9, 4],
  ['W', 4, 6, 7, 4],
  ['W', 5, 10, 5, 1],
  ['P', 7, 6],
  ['A', 3, 10, 10, 12],
  ['a', 7, 11, 1, 11],
  ['Y', 8, 12],
  ['Y', 8, 15],
  ['Y', 8, 18],
  ['B', 3, 16, 10, 1],
  ['A', 1, 11, 2, 6],
  ['P', 1, 17, 2, 1],
  ['A', 13, 11, 2, 6],
  ['P', 13, 17, 2, 1],
  ['Y', 14, 9, 3, 1],
  ['Y', 14, 10, 1, 2],
  ['Y', 16, 10, 1, 2],
  ['Y', 15, 12, 1, 7],
  ['Y', 16, 16],
  ['Y', 16, 18],
  ['B', 4, 22, 3, 2],
  ['B', 9, 22, 3, 2],
]);
export const PALETA_ZELADOR = { A: '#3a6a9a', a: '#24466a', P: '#e0a878', W: '#f0f0f0', K: '#140c22', Y: '#d8a83a', B: '#3a2414' };

// A Pintora de Estrelas: capuz azul-noite, avental sujo de tinta dourada, pincel e balde de tinta.
export const PINTORA = desenhar(18, 28, [
  ['N', 4, 0, 8, 3],
  ['N', 3, 2, 10, 7],
  ['n', 3, 2, 2, 7],
  ['P', 6, 3, 5, 5],
  ['H', 6, 3, 5, 1],
  ['K', 7, 5],
  ['K', 10, 5],
  ['G', 6, 6],
  ['m', 8, 7, 2, 1],
  ['N', 3, 9, 10, 14],
  ['n', 3, 9, 1, 14],
  ['W', 5, 11, 6, 10],
  ['G', 6, 13],
  ['G', 9, 15],
  ['G', 7, 16, 2, 1],
  ['G', 7, 18],
  ['G', 10, 19],
  ['P', 13, 10, 2, 4],
  ['B', 14, 5, 1, 6],
  ['G', 14, 3, 1, 2],
  ['P', 1, 12, 2, 2],
  ['M', 0, 14, 4, 4],
  ['G', 0, 14, 4, 1],
  ['G', 1, 18],
  ['B', 4, 23, 3, 1],
  ['B', 9, 23, 3, 1],
]);
export const PALETA_PINTORA = { N: '#1a2a5a', n: '#101a3a', P: '#e0b090', H: '#2a1a10', K: '#140c22', G: '#f2c14e', m: '#a85a4a', W: '#e8e0d0', B: '#6a4a2a', M: '#8a8a98' };

// O arauto dos Jogos: louros na cabeça, túnica vermelha com barra dourada e a trombeta.
export const ARAUTO = desenhar(18, 28, [
  ['L', 4, 1, 7, 1],
  ['H', 4, 2, 7, 2],
  ['L', 3, 2],
  ['L', 11, 2],
  ['P', 4, 3, 7, 5],
  ['K', 6, 5],
  ['K', 9, 5],
  ['m', 7, 7, 2, 1],
  ['V', 3, 9, 10, 13],
  ['v', 3, 9, 1, 13],
  ['Y', 3, 20, 10, 1],
  ['Y', 7, 9, 1, 11],
  ['P', 1, 10, 2, 5],
  ['V', 13, 9, 2, 3],
  ['P', 13, 12, 2, 2],
  ['Y', 11, 8, 6, 1],
  ['Y', 15, 6, 1, 3],
  ['Y', 16, 5, 1, 5],
  ['B', 4, 22, 3, 2],
  ['B', 9, 22, 3, 2],
]);
export const PALETA_ARAUTO = { L: '#4a8a3a', H: '#3a2414', P: '#e0a878', K: '#140c22', m: '#8a3a2a', V: '#b0202c', v: '#7a1018', Y: '#e8b84a', B: '#4a2a14' };
