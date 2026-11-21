import { desenhar } from './desenho';

/**
 * Personagens e inimigos do modo História em pixel (docs/HISTORIA.md).
 * Redesenhados em 21/11/2026 (o Lucas achou os inimigos e o Censor feios): maiores,
 * mais detalhados e cada inimigo com uma forma própria. Desenhados virados para a
 * direita; a tela espelha os inimigos.
 */

// ---------- Aliados ----------

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

// Fio: uma pequena IA de limpeza, redonda, condenada por cantarolar. (Capítulo 2)
export const FIO = desenhar(14, 14, [
  ['M', 3, 1, 6, 1],
  ['M', 2, 2, 8, 6],
  ['W', 3, 2, 6, 1],
  ['E', 4, 4, 1, 1],
  ['E', 7, 4, 1, 1],
  ['m', 4, 6, 4, 1],
  ['A', 5, 0, 2, 1],
  ['M', 1, 8, 10, 2],
  ['G', 2, 10, 2, 2],
  ['G', 8, 10, 2, 2],
]);
export const PALETA_FIO = { M: '#6ab0c8', W: '#c8f0ff', E: '#ffffff', m: '#2a4a5a', A: '#f2c14e', G: '#3a3a48', K: '#140c22' };

// Criança romana (Capítulo 2): túnica vermelha, cabelo escuro.
export const CRIANCA = desenhar(12, 18, [
  ['H', 3, 0, 5, 2],
  ['P', 3, 2, 5, 4],
  ['K', 4, 3],
  ['K', 6, 3],
  ['T', 2, 6, 7, 6],
  ['P', 1, 7, 1, 3],
  ['P', 9, 7, 1, 3],
  ['P', 3, 12, 2, 3],
  ['P', 6, 12, 2, 3],
]);
export const PALETA_CRIANCA = { H: '#2a1a10', P: '#d8a07a', T: '#c0384a', K: '#140c22' };

// ---------- O Censor ----------
// Três vezes maior que os gladiadores: coroa de engrenagens, um olho enorme, placas
// enferrujadas escorrendo óleo, gola alta, capa vermelha e o cetro de engrenagem.
export const CENSOR = desenhar(38, 48, [
  // cetro
  ['G', 1, 6, 4, 4],
  ['g', 2, 7, 2, 2],
  ['W', 2, 10, 2, 32],
  // coroa de engrenagens
  ['Y', 12, 0, 2, 2],
  ['Y', 16, 0, 2, 2],
  ['Y', 20, 0, 2, 2],
  ['Y', 24, 0, 2, 2],
  ['Y', 11, 2, 16, 3],
  ['y', 13, 3, 2, 1],
  ['y', 18, 3, 2, 1],
  ['y', 23, 3, 2, 1],
  // cabeça
  ['M', 12, 5, 14, 11],
  ['m', 12, 5, 2, 11],
  ['R', 15, 13, 1, 3],
  ['R', 23, 12, 1, 4],
  // o olho
  ['O', 16, 7, 6, 5],
  ['E', 17, 8, 4, 3],
  ['e', 18, 9, 2, 1],
  // boca de grade
  ['O', 16, 13, 6, 1],
  // gola alta
  ['C', 9, 16, 20, 3],
  ['Y', 9, 16, 20, 1],
  // ombreiras
  ['M', 5, 18, 8, 5],
  ['M', 25, 18, 8, 5],
  ['m', 5, 18, 8, 1],
  ['m', 25, 18, 8, 1],
  // capa
  ['C', 4, 23, 4, 22],
  ['C', 30, 23, 4, 22],
  // toga de placas
  ['T', 9, 19, 20, 26],
  ['t', 9, 23, 20, 1],
  ['t', 9, 29, 20, 1],
  ['t', 9, 35, 20, 1],
  ['R', 12, 24, 3, 2],
  ['R', 22, 30, 3, 2],
  ['R', 15, 37, 2, 3],
  ['Y', 18, 19, 2, 26],
  // mão no cetro
  ['M', 4, 26, 3, 3],
  // pés
  ['G', 11, 45, 7, 2],
  ['G', 20, 45, 7, 2],
]);
export const PALETA_CENSOR = {
  G: '#6a5030',
  g: '#c8962a',
  W: '#8a6a40',
  Y: '#c8962a',
  y: '#7a5a1a',
  M: '#8a5a3a',
  m: '#5a3a24',
  R: '#a8402a',
  O: '#1a0a0a',
  E: '#ff2a2a',
  e: '#ffe0e0',
  C: '#7a1a24',
  T: '#5a4030',
  t: '#3a2a20',
  K: '#100810',
};
/** O olho do Censor muda para azul no final (quando ele aprende). */
export const paletaCensor = (azul = false) => (azul ? { ...PALETA_CENSOR, E: '#3a8aff', e: '#e0f0ff' } : PALETA_CENSOR);

// ---------- A Guarda Pretoriana ----------
// Elmo com crista vermelha e viseira acesa, armadura em gomos, escudo com a águia.
function pretoriano(arma: 'clava' | 'lanca' | 'gladio', decuriao = false) {
  const armaPassos: [string, number, number, number?, number?][] =
    arma === 'lanca'
      ? [['W', 19, 0, 1, 26], ['S', 18, 0, 3, 2]]
      : arma === 'clava'
        ? [['W', 19, 8, 1, 10], ['G', 18, 5, 3, 4]]
        : [['S', 19, 7, 1, 9], ['Y', 18, 15, 3, 1]];
  return desenhar(24, 32, [
    ['R', 7, 0, 8, decuriao ? 3 : 2],
    ...(decuriao ? ([['R', 5, 1, 12, 1]] as [string, number, number, number, number][]) : []),
    ['S', 6, 3, 10, 7],
    ['s', 6, 3, 10, 1],
    ['O', 8, 6, 6, 1],
    ['E', 9, 6, 1, 1],
    ['E', 12, 6, 1, 1],
    ['s', 6, 9, 10, 1],
    ['S', 5, 10, 12, 10],
    ['s', 7, 12, 8, 1],
    ['s', 7, 15, 8, 1],
    ['s', 7, 18, 8, 1],
    ...(decuriao ? ([['C', 16, 10, 2, 12]] as [string, number, number, number, number][]) : []),
    // escudo com a águia
    ['R', 0, 10, 6, 12],
    ['Y', 2, 14, 2, 3],
    ['Y', 1, 15, 4, 1],
    ['S', 17, 11, 2, 6],
    ...armaPassos,
    ['S', 6, 20, 4, 8],
    ['S', 12, 20, 4, 8],
    ['s', 5, 28, 5, 1],
    ['s', 12, 28, 5, 1],
  ]);
}
export const PRETORIANO = pretoriano('gladio');
export const PRETORIANO_BATEDOR = pretoriano('clava');
export const PRETORIANO_LANCEIRO = pretoriano('lanca');
export const DECURIAO = pretoriano('gladio', true);
export const PALETA_PRETORIANO = { R: '#b0283a', S: '#b8c0d0', s: '#6a7080', O: '#1a1418', E: '#ff3a3a', Y: '#f2c14e', W: '#a8804a', G: '#5a5a68', C: '#8a1a2a', K: '#140c22' };

// ---------- Os Incineradores (cada um com uma forma própria) ----------

// Incinerador: braseiro voador de bronze, grade na frente, três chamas e um olho.
export const INCINERADOR = desenhar(22, 22, [
  ['F', 9, 0, 3, 2],
  ['F', 5, 1, 3, 3],
  ['F', 13, 1, 3, 3],
  ['Y', 6, 2, 1, 2],
  ['Y', 10, 1, 1, 3],
  ['Y', 14, 2, 1, 2],
  ['F', 4, 4, 13, 2],
  ['W', 3, 6, 15, 1],
  ['M', 3, 7, 15, 6],
  ['m', 3, 12, 15, 1],
  ['O', 5, 8, 11, 3],
  ['E', 9, 8, 3, 3],
  ['e', 10, 9, 1, 1],
  ['M', 0, 8, 3, 2],
  ['M', 18, 8, 3, 2],
  ['M', 6, 13, 9, 3],
  ['C', 7, 16, 1, 3],
  ['C', 10, 16, 1, 4],
  ['C', 13, 16, 1, 3],
]);
export const PALETA_INCINERADOR = { F: '#ff6a2a', Y: '#ffd04a', W: '#d8a060', M: '#8a5a2a', m: '#5a3418', O: '#2a1408', E: '#ff2a2a', e: '#ffe0a0', C: '#9fe8ff', K: '#140c22' };

// Incinerador Veloz: corpo fino em gota, asas para trás e jatos azuis.
export const INCINERADOR_VELOZ = desenhar(26, 18, [
  ['M', 8, 5, 12, 7],
  ['W', 9, 5, 10, 1],
  ['M', 19, 6, 3, 5],
  ['M', 22, 7, 2, 3],
  ['O', 17, 7, 4, 3],
  ['E', 19, 8, 2, 1],
  ['M', 9, 1, 6, 4],
  ['m', 10, 2, 4, 2],
  ['M', 9, 12, 6, 4],
  ['m', 10, 13, 4, 2],
  ['F', 3, 6, 5, 2],
  ['F', 1, 9, 7, 2],
  ['Y', 5, 7, 3, 1],
  ['Y', 4, 9, 4, 1],
]);

// Lança-Chamas: braseiro pesado com um tanque nas costas e o bico comprido para a frente.
export const INCINERADOR_LANCA = desenhar(30, 24, [
  ['G', 0, 6, 5, 11],
  ['g', 1, 7, 3, 2],
  ['W', 5, 4, 14, 1],
  ['M', 5, 5, 14, 10],
  ['m', 5, 14, 14, 1],
  ['O', 8, 7, 8, 4],
  ['E', 11, 8, 3, 2],
  ['F', 7, 1, 3, 3],
  ['F', 13, 0, 3, 4],
  ['Y', 14, 1, 1, 2],
  ['M', 19, 9, 4, 3],
  ['S', 23, 9, 5, 2],
  ['F', 27, 8, 1, 4],
  ['M', 8, 15, 8, 3],
  ['C', 10, 18, 1, 3],
  ['C', 13, 18, 1, 3],
]);
export const PALETA_LANCA = { ...PALETA_INCINERADOR, G: '#6a6a78', g: '#c8c8d8', S: '#9a9aa8', F: '#ff2a2a', M: '#6a3a2a', W: '#a86a4a' };

// Incinerador de Guerra: dois braseiros empilhados, placas de ferro e um braço-martelo.
export const INCINERADOR_GUERRA = desenhar(26, 30, [
  ['F', 8, 0, 6, 3],
  ['Y', 10, 1, 2, 2],
  ['W', 5, 3, 12, 1],
  ['M', 5, 4, 12, 7],
  ['O', 7, 6, 8, 2],
  ['E', 10, 6, 2, 2],
  ['m', 4, 11, 14, 2],
  ['F', 6, 13, 10, 2],
  ['W', 4, 15, 14, 1],
  ['M', 4, 16, 14, 8],
  ['m', 6, 18, 2, 4],
  ['m', 14, 18, 2, 4],
  ['O', 9, 18, 4, 3],
  ['M', 18, 16, 3, 3],
  ['G', 20, 12, 5, 7],
  ['M', 7, 24, 8, 3],
  ['C', 8, 27, 1, 2],
  ['C', 13, 27, 1, 2],
]);
export const PALETA_GUERRA = { ...PALETA_INCINERADOR, M: '#4a4a58', W: '#8a8a98', m: '#2a2a34', G: '#3a3a44' };

// Capitão Incinerador: braseiro dourado com elmo de crista vermelha e o estandarte do Censor.
export const CAPITAO_INCINERADOR = desenhar(28, 30, [
  ['R', 9, 0, 8, 2],
  ['R', 7, 1, 2, 2],
  ['Y', 8, 3, 10, 3],
  ['O', 10, 4, 6, 1],
  ['E', 11, 4, 1, 1],
  ['E', 14, 4, 1, 1],
  ['F', 6, 6, 14, 2],
  ['W', 5, 8, 16, 1],
  ['M', 5, 9, 16, 8],
  ['Y', 5, 12, 16, 1],
  ['O', 9, 13, 8, 3],
  ['F', 11, 14, 4, 1],
  ['M', 8, 17, 10, 4],
  ['C', 10, 21, 1, 3],
  ['C', 15, 21, 1, 3],
  ['W', 22, 2, 1, 22],
  ['C', 23, 3, 4, 6],
  ['E', 24, 5, 2, 2],
  ['M', 20, 11, 2, 2],
]);
export const PALETA_CAPITAO = { ...PALETA_INCINERADOR, M: '#b8862a', W: '#ffe08a', Y: '#f2c14e', R: '#c0283c', C: '#5a1a2a', F: '#ff4a6a' };

// ---------- A Fornalha (chefão do Capítulo 1) ----------
// Forno de bronze andante: chaminé, viseira de grade, rebites, a porta da barriga
// (acende antes do bafo de fogo), canos nos ombros e braços com tenazes.
export const FORNALHA = desenhar(46, 48, [
  // chaminé
  ['G', 19, 0, 6, 7],
  ['g', 19, 0, 6, 1],
  // cabeça com viseira de grade
  ['M', 14, 7, 16, 8],
  ['W', 14, 7, 16, 1],
  ['O', 16, 9, 12, 4],
  ['E', 17, 10, 3, 2],
  ['E', 24, 10, 3, 2],
  ['O', 16, 11, 12, 1],
  // corpo
  ['M', 7, 15, 30, 19],
  ['W', 7, 15, 30, 1],
  ['m', 7, 33, 30, 1],
  // rebites
  ['g', 9, 17],
  ['g', 34, 17],
  ['g', 9, 31],
  ['g', 34, 31],
  // porta da barriga com grade
  ['O', 13, 19, 18, 12],
  ['D', 14, 20, 16, 10],
  ['O', 14, 22, 16, 1],
  ['O', 14, 25, 16, 1],
  ['O', 14, 28, 16, 1],
  ['g', 21, 19, 2, 1],
  // canos nos ombros
  ['G', 4, 13, 4, 4],
  ['G', 36, 13, 4, 4],
  // braços com tenazes
  ['M', 2, 17, 5, 11],
  ['M', 37, 17, 5, 11],
  ['G', 0, 28, 3, 6],
  ['G', 4, 28, 3, 6],
  ['G', 37, 28, 3, 6],
  ['G', 41, 28, 3, 6],
  // pernas e esteiras
  ['M', 10, 34, 9, 8],
  ['M', 25, 34, 9, 8],
  ['G', 8, 42, 13, 4],
  ['G', 23, 42, 13, 4],
  ['g', 9, 43, 11, 1],
  ['g', 24, 43, 11, 1],
]);
export const paletaFornalha = (acesa: boolean, furia = 0) => ({
  G: '#3a3028',
  g: '#c8a060',
  M: furia >= 2 ? '#c8502a' : furia === 1 ? '#a8603a' : '#9a6a3a',
  W: furia >= 2 ? '#ffb04a' : '#d8a060',
  m: '#5a3a1a',
  O: '#1a0a06',
  E: acesa || furia >= 2 ? '#ffe04a' : '#ff2a2a',
  D: acesa ? '#ffb02a' : furia >= 1 ? '#8a2a10' : '#3a1a10',
  K: '#140c22',
});

// ---------- O Gladiador de Sucata (Capítulo 2, no Coliseu) ----------
// Montado com pedaços de IAs apagadas: placas que não combinam, um balde de elmo,
// um braço-machado e uma corrente.
export const GLADIADOR_SUCATA = desenhar(30, 34, [
  ['G', 9, 0, 9, 7],
  ['g', 9, 0, 9, 1],
  ['O', 11, 3, 5, 2],
  ['E', 13, 3, 2, 2],
  ['M', 7, 7, 13, 12],
  ['A', 7, 7, 6, 5],
  ['B', 14, 12, 6, 6],
  ['g', 9, 9],
  ['g', 17, 9],
  ['g', 11, 16],
  ['M', 3, 8, 4, 10],
  ['W', 1, 18, 3, 8],
  ['M', 20, 8, 4, 6],
  ['S', 23, 4, 2, 12],
  ['S', 24, 2, 5, 6],
  ['s', 27, 3, 2, 4],
  ['M', 8, 19, 5, 10],
  ['B', 15, 19, 5, 10],
  ['G', 7, 29, 7, 3],
  ['G', 14, 29, 7, 3],
]);
export const PALETA_SUCATA = { G: '#5a5a60', g: '#a8a8b0', O: '#140c10', E: '#ffb02a', M: '#7a5a3a', A: '#4a6a8a', B: '#8a3a2a', S: '#c8c8d0', s: '#6a6a74', W: '#c8a060', K: '#140c22' };

// ---------- Brutus, o Lanista ----------
// Grandalhão, careca, barba grisalha, cicatriz no olho, avental de couro e o braço de bronze.
export const BRUTUS = desenhar(26, 34, [
  ['P', 8, 0, 9, 8],
  ['p', 8, 0, 9, 1],
  ['K', 10, 3, 1, 1],
  ['K', 14, 3, 1, 1],
  ['R', 14, 2, 1, 3],
  ['B', 8, 5, 9, 5],
  ['b', 10, 6, 5, 1],
  ['P', 4, 10, 17, 4],
  ['T', 6, 13, 13, 13],
  ['t', 6, 17, 13, 1],
  ['t', 6, 21, 13, 1],
  ['P', 1, 11, 4, 12],
  ['P', 0, 22, 4, 3],
  ['M', 21, 11, 4, 12],
  ['m', 21, 14, 4, 1],
  ['m', 21, 18, 4, 1],
  ['M', 21, 23, 4, 3],
  ['V', 24, 9, 2, 2],
  ['P', 7, 26, 5, 6],
  ['P', 14, 26, 5, 6],
  ['T', 6, 31, 7, 2],
  ['T', 13, 31, 7, 2],
]);
export const PALETA_BRUTUS = { P: '#c88a5a', p: '#e0a878', K: '#140c22', R: '#8a3a2a', B: '#b8b0a0', b: '#7a6a5a', T: '#6a4426', t: '#4a2a14', M: '#c8962a', m: '#7a5a1a', V: '#e8e8f0' };
