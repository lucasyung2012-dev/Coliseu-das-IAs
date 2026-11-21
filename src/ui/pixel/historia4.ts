import { desenhar, xadrez } from './desenho';

/**
 * Quarta leva de personagens do modo História em pixel: o caminho de Octavius nos
 * capítulos 4 a 6 (os telhados e esgotos da Subura, a feira, a batalha noturna no cais
 * e o Coliseu alagado), com o Almirante Ferrugem reconstruído em aço e o aliado Caio.
 * Mesmo estilo de historia2.ts e historia3.ts: formas grossas, 2 a 3 tons por material,
 * olhos vermelhos (E) nas máquinas do Censor e contorno K automático. Todos virados
 * para a direita; a tela de luta espelha os inimigos.
 */

// ---------- Subura: telhados e esgotos ----------

// Vigia de Telhado: autômato magro de capuz, luneta no olho e funda pendurada na mão de trás.
export const VIGIA_TELHADO = desenhar(24, 34, [
  // capuz e cabeça
  ['H', 8, 0, 8, 2],
  ['H', 8, 2, 2, 5],
  ['M', 10, 2, 6, 6],
  ['W', 10, 2, 6, 1],
  ['O', 12, 4, 4, 2],
  ['E', 13, 4],
  ['m', 11, 7, 5, 1],
  // luneta no olho
  ['Y', 15, 4, 5, 2],
  ['y', 15, 5, 5, 1],
  ['Y', 19, 3, 2, 4],
  ['L', 20, 4, 1, 2],
  // braço da frente segurando a luneta
  ['M', 14, 9, 3, 3],
  ['m', 16, 6, 2, 4],
  // cachecol e tronco magro
  ['C', 7, 8, 2, 8],
  ['c', 7, 15, 2, 1],
  ['M', 9, 8, 6, 10],
  ['C', 9, 8, 6, 1],
  ['m', 9, 12, 6, 1],
  ['g', 10, 10],
  ['g', 13, 14],
  // braço de trás com a funda e a pedra
  ['M', 5, 10, 2, 6],
  ['m', 5, 16, 2, 2],
  ['N', 4, 18, 1, 4],
  ['N', 7, 18, 1, 4],
  ['H', 3, 22, 6, 2],
  ['s', 5, 22, 2, 1],
  // cinto
  ['B', 8, 18, 8, 2],
  ['Y', 11, 18, 2, 2],
  // pernas finas e pés
  ['M', 9, 20, 2, 8],
  ['M', 13, 20, 2, 8],
  ['m', 9, 24, 2, 1],
  ['m', 13, 24, 2, 1],
  ['G', 8, 28, 4, 2],
  ['G', 12, 28, 5, 2],
]);
export const PALETA_VIGIA_TELHADO = {
  H: '#5a3a2a',
  M: '#7a7a88',
  W: '#b8b8c8',
  m: '#3a3a48',
  O: '#140c14',
  E: '#ff2a2a',
  Y: '#c8962a',
  y: '#8a6418',
  L: '#a8e8ff',
  C: '#a83a2a',
  c: '#6a2018',
  g: '#c8a060',
  N: '#c8a86a',
  s: '#9a9aa4',
  B: '#4a3020',
  G: '#2a2a34',
  K: '#140c22',
};

// Gato de Ferro: grande caçador-autômato dos telhados, quatro patas com garras, orelhas pontudas e olho vermelho.
export const GATO_FERRO = desenhar(30, 22, [
  // cauda erguida
  ['M', 0, 3, 2, 6],
  ['M', 1, 1, 2, 2],
  ['W', 1, 1, 1, 1],
  ['m', 0, 8, 3, 2],
  ['g', 0, 5],
  // corpo
  ['M', 3, 8, 17, 7],
  ['W', 3, 8, 17, 1],
  ['m', 3, 14, 17, 1],
  ['m', 8, 9, 1, 5],
  ['m', 14, 9, 1, 5],
  ['g', 5, 10],
  ['g', 11, 10],
  ['g', 17, 10],
  // peito
  ['M', 18, 10, 4, 5],
  // patas de trás e da frente
  ['m', 7, 15, 3, 4],
  ['M', 3, 15, 3, 4],
  ['m', 19, 15, 3, 4],
  ['M', 15, 15, 3, 4],
  ['S', 4, 16, 1, 1],
  ['S', 16, 16, 1, 1],
  ['G', 2, 19, 5, 1],
  ['G', 7, 19, 4, 1],
  ['G', 14, 19, 5, 1],
  ['G', 19, 19, 4, 1],
  ['T', 22, 19],
  ['T', 18, 19],
  // cabeça com orelhas
  ['M', 19, 1, 2, 3],
  ['M', 24, 1, 2, 3],
  ['R', 20, 2],
  ['R', 25, 2],
  ['M', 19, 4, 8, 7],
  ['W', 19, 4, 8, 1],
  ['O', 22, 6, 4, 2],
  ['E', 24, 6, 2, 1],
  // focinho e dentes
  ['M', 26, 7, 2, 3],
  ['O', 24, 10, 4, 1],
  ['T', 25, 10],
  ['T', 27, 10],
  // coleira com rebite
  ['Y', 19, 10, 3, 1],
  ['g', 20, 11],
]);
export const PALETA_GATO_FERRO = {
  M: '#4a4a58',
  W: '#8a8a9c',
  m: '#26262e',
  g: '#c8a060',
  S: '#a8a8b8',
  G: '#1a1a22',
  T: '#e8e8e0',
  R: '#a8402a',
  O: '#120808',
  E: '#ff2a2a',
  Y: '#c8962a',
  K: '#140c22',
};

// Jacaré de Esgoto: crocodilo mecânico comprido e baixo, placas no dorso, bocarra cheia de dentes e olho vermelho.
export const JACARE_ESGOTO = desenhar(42, 18, [
  // cauda
  ['M', 0, 10, 4, 2],
  ['M', 3, 9, 6, 3],
  ['P', 2, 9],
  ['P', 5, 8],
  // corpo com placas
  ['M', 8, 6, 18, 8],
  ['W', 8, 6, 18, 1],
  ['m', 8, 13, 18, 1],
  ['P', 9, 5, 2, 1],
  ['P', 13, 5, 2, 1],
  ['P', 17, 5, 2, 1],
  ['P', 21, 5, 2, 1],
  ['m', 13, 7, 1, 6],
  ['m', 19, 7, 1, 6],
  ['b', 9, 12, 16, 1],
  ['g', 11, 9],
  ['g', 16, 9],
  ['g', 22, 9],
  ['R', 15, 7],
  ['R', 23, 11],
  // lodo do esgoto
  ['s', 10, 13, 3, 1],
  ['s', 20, 13, 2, 1],
  // cabeça e olho
  ['M', 26, 6, 6, 6],
  ['W', 26, 6, 6, 1],
  ['m', 26, 11, 5, 1],
  ['M', 28, 4, 3, 2],
  ['W', 28, 4, 3, 1],
  ['O', 28, 5, 3, 1],
  ['E', 29, 5],
  // mandíbula de cima, boca aberta e dentes
  ['M', 32, 6, 8, 3],
  ['W', 32, 6, 8, 1],
  ['O', 38, 7],
  ['O', 31, 9, 9, 2],
  ['T', 32, 9],
  ['T', 34, 9],
  ['T', 36, 9],
  ['T', 38, 9],
  ['T', 33, 10],
  ['T', 35, 10],
  ['T', 37, 10],
  // mandíbula de baixo
  ['M', 31, 11, 9, 2],
  ['m', 31, 12, 9, 1],
  // patas
  ['m', 14, 14, 2, 1],
  ['G', 13, 15, 4, 1],
  ['M', 10, 14, 3, 1],
  ['G', 9, 15, 5, 1],
  ['M', 22, 14, 3, 1],
  ['G', 21, 15, 5, 1],
]);
export const PALETA_JACARE = {
  M: '#4a6a3a',
  W: '#7a9a5a',
  m: '#2a3e22',
  P: '#8a8a6a',
  b: '#a8a87a',
  g: '#c8a060',
  R: '#a85a2a',
  s: '#6a8a2a',
  O: '#120808',
  E: '#ff2a2a',
  T: '#e8e8d8',
  G: '#1a2a14',
  K: '#140c22',
};

// Limpador de Esgoto: autômato-barril de capacete com lanterna, tanque nas costas e um grande escovão.
export const LIMPADOR_ESGOTO = desenhar(26, 32, [
  // lanterna no capacete
  ['G', 12, 0, 3, 1],
  ['A', 12, 1, 3, 2],
  ['a', 13, 1],
  // capacete e visor
  ['M', 8, 3, 9, 5],
  ['W', 8, 3, 9, 1],
  ['O', 11, 5, 5, 2],
  ['E', 13, 5, 2, 1],
  // tanque nas costas
  ['C', 4, 8, 3, 8],
  ['c', 4, 15, 3, 1],
  ['c', 4, 10, 3, 1],
  // corpo de barril com sujeira
  ['M', 7, 8, 11, 11],
  ['W', 7, 8, 11, 1],
  ['m', 7, 11, 11, 1],
  ['m', 7, 15, 11, 1],
  ['s', 8, 17, 3, 1],
  ['s', 14, 16, 2, 1],
  ['s', 9, 13],
  // braço de trás
  ['m', 5, 16, 2, 2],
  // cinto
  ['B', 7, 19, 11, 2],
  // pernas e botas
  ['M', 8, 21, 3, 5],
  ['M', 14, 21, 3, 5],
  ['G', 7, 26, 5, 3],
  ['G', 13, 26, 5, 3],
  // braço da frente com o escovão
  ['M', 18, 10, 3, 4],
  ['H', 21, 4, 1, 21],
  ['m', 20, 13, 3, 2],
  ['N', 19, 24, 5, 3],
  ['Y', 19, 24, 5, 1],
  ['n', 19, 27, 5, 1],
  ...xadrez('s', 19, 27, 5, 1),
]);
export const PALETA_LIMPADOR = {
  G: '#2a2a34',
  A: '#ffb02a',
  a: '#fff0a0',
  M: '#5a7068',
  W: '#90a8a0',
  m: '#2e3c38',
  O: '#140c14',
  E: '#ff2a2a',
  C: '#b8703a',
  c: '#7a4420',
  s: '#6a8a2a',
  B: '#4a3020',
  H: '#8a5a2a',
  N: '#6a4426',
  Y: '#c8962a',
  n: '#c8a86a',
  K: '#140c22',
};

// ---------- A feira da Subura ----------

// Feirante Autômato: cesto de frutas na cabeça, avental listrado e braços que viram pratos de balança.
export const FEIRANTE_AUTOMATO = desenhar(26, 32, [
  // frutas e cesto
  ['R', 9, 0, 2, 2],
  ['Y', 12, 0, 2, 2],
  ['V', 15, 1, 2, 1],
  ['N', 8, 2, 10, 3],
  ['n', 8, 4, 10, 1],
  ...xadrez('n', 9, 2, 8, 1),
  // cabeça
  ['M', 9, 5, 8, 6],
  ['W', 9, 5, 8, 1],
  ['O', 12, 7, 4, 2],
  ['E', 14, 7],
  ['m', 13, 10, 3, 1],
  // tronco e avental listrado
  ['M', 8, 11, 10, 10],
  ['B', 8, 20, 10, 1],
  ['A', 9, 13, 8, 9],
  ['a', 9, 15, 8, 1],
  ['a', 9, 18, 8, 1],
  // braço de trás com prato de balança e peso
  ['M', 4, 12, 4, 2],
  ['c', 3, 14, 1, 3],
  ['c', 6, 14, 1, 3],
  ['S', 2, 17, 6, 1],
  ['s', 3, 18, 4, 1],
  ['G', 4, 16, 2, 1],
  // braço da frente com prato de balança e fruta
  ['M', 18, 12, 4, 2],
  ['c', 19, 14, 1, 3],
  ['c', 22, 14, 1, 3],
  ['S', 18, 17, 6, 1],
  ['s', 19, 18, 4, 1],
  ['R', 20, 16, 2, 1],
  // pernas e pés
  ['M', 9, 22, 3, 5],
  ['M', 14, 22, 3, 5],
  ['m', 9, 24, 3, 1],
  ['m', 14, 24, 3, 1],
  ['G', 8, 27, 5, 2],
  ['G', 13, 27, 5, 2],
]);
export const PALETA_FEIRANTE = {
  R: '#d83a2a',
  Y: '#ff9a2a',
  V: '#4ab83a',
  N: '#c8a060',
  n: '#8a6a3a',
  M: '#8a7a6a',
  W: '#c0b0a0',
  m: '#4a4038',
  O: '#140c14',
  E: '#ff2a2a',
  B: '#4a3020',
  A: '#f0ece0',
  a: '#3a8ac8',
  c: '#5a5a64',
  S: '#e0b040',
  s: '#a8802a',
  G: '#2a2a34',
  K: '#140c22',
};

// Guarda da Feira: fiscal de elmo com penacho, cassetete grande erguido e livro de impostos na mão de trás.
export const GUARDA_FEIRA = desenhar(26, 34, [
  // penacho e elmo
  ['P', 9, 0, 7, 2],
  ['S', 8, 2, 9, 7],
  ['W', 8, 2, 9, 1],
  ['O', 11, 5, 6, 2],
  ['E', 14, 5, 2, 1],
  ['s', 8, 7, 2, 2],
  // braço de trás com o livro de impostos
  ['S', 5, 10, 3, 7],
  ['H', 1, 15, 6, 8],
  ['l', 2, 16, 4, 6],
  ['b', 2, 17, 4, 1],
  ['b', 2, 19, 4, 1],
  ['b', 2, 21, 3, 1],
  ['Y', 3, 15, 2, 1],
  ['m', 5, 17, 3, 2],
  // tronco com insígnia
  ['S', 8, 9, 10, 11],
  ['s', 9, 12, 8, 1],
  ['s', 9, 15, 8, 1],
  ['Y', 10, 10, 2, 2],
  // cinto e saia
  ['B', 7, 20, 12, 2],
  ['Y', 12, 20, 2, 2],
  ['L', 8, 22, 10, 3],
  ['B', 10, 22, 1, 3],
  ['B', 14, 22, 1, 3],
  // pernas e botas
  ['S', 9, 25, 3, 4],
  ['S', 14, 25, 3, 4],
  ['G', 8, 29, 5, 2],
  ['G', 13, 29, 5, 2],
  // braço da frente com o cassetete erguido
  ['S', 18, 10, 3, 5],
  ['D', 20, 0, 3, 9],
  ['d', 22, 0, 1, 9],
  ['Y', 20, 3, 3, 1],
  ['Y', 20, 6, 3, 1],
  ['m', 18, 7, 4, 3],
]);
export const PALETA_GUARDA_FEIRA = {
  P: '#3a6ac8',
  S: '#7a8090',
  W: '#c0c8d8',
  s: '#4a5060',
  O: '#140c14',
  E: '#ff2a2a',
  H: '#5a2a14',
  l: '#e8dcb8',
  b: '#a8885a',
  Y: '#e0b040',
  m: '#3a3e4a',
  B: '#4a3020',
  L: '#7a5a30',
  G: '#2a2a34',
  D: '#8a5a2a',
  d: '#5a3818',
  K: '#140c22',
};

// ---------- Batalha noturna no cais ----------

// Sentinela do Cais: vigia noturno de capa escura com lança-lanterna acesa.
export const SENTINELA_CAIS = desenhar(24, 36, [
  // elmo
  ['M', 8, 1, 7, 7],
  ['W', 8, 1, 7, 1],
  ['O', 11, 4, 4, 2],
  ['E', 13, 4],
  ['m', 8, 6, 2, 2],
  // capa e tronco
  ['C', 6, 8, 10, 16],
  ['c', 6, 22, 10, 2],
  ['c', 6, 8, 1, 14],
  ['M', 9, 9, 6, 9],
  ['m', 9, 13, 6, 1],
  ['Y', 8, 8, 8, 1],
  ['B', 9, 17, 6, 1],
  // pernas e botas
  ['M', 9, 24, 2, 6],
  ['M', 13, 24, 2, 6],
  ['G', 8, 30, 4, 2],
  ['G', 12, 30, 4, 2],
  // lança com a lanterna no alto
  ['S', 19, 0, 1, 2],
  ['H', 19, 7, 1, 25],
  ['G', 17, 2, 5, 1],
  ['A', 17, 3, 5, 3],
  ['a', 18, 4, 3, 1],
  ['G', 17, 6, 5, 1],
  // braço da frente segurando a lança
  ['M', 15, 10, 2, 5],
  ['m', 16, 14, 4, 3],
]);
export const PALETA_SENTINELA = {
  M: '#5a6070',
  W: '#9aa0b4',
  m: '#30343e',
  O: '#120808',
  E: '#ff2a2a',
  C: '#1e2a4a',
  c: '#121a30',
  Y: '#c8962a',
  B: '#4a3020',
  G: '#22222a',
  S: '#d0d8e0',
  H: '#6a4426',
  A: '#ffb02a',
  a: '#fff0a0',
  K: '#140c22',
};

// Imediato de Ferro: o braço direito do Almirante, tricórnio, casaca naval, perna de pau, gancho e machado de abordagem.
export const IMEDIATO_FERRO = desenhar(28, 36, [
  // tricórnio
  ['H', 7, 0, 12, 3],
  ['Y', 7, 2, 12, 1],
  ['H', 5, 3, 16, 1],
  // cabeça com olho vermelho e barba de grade
  ['M', 8, 4, 10, 7],
  ['W', 8, 4, 10, 1],
  ['O', 14, 6, 4, 2],
  ['E', 15, 6, 2, 1],
  ['N', 9, 6, 5, 1],
  ['m', 12, 9, 6, 2],
  ['W', 13, 9],
  ['W', 15, 9],
  ['W', 17, 9],
  // braço de trás com gancho
  ['C', 4, 12, 3, 8],
  ['m', 4, 20, 3, 2],
  ['S', 3, 22, 1, 2],
  ['S', 4, 23, 2, 1],
  // casaca com botões e faixa
  ['C', 7, 11, 12, 11],
  ['c', 12, 11, 1, 11],
  ['Y', 14, 13],
  ['Y', 14, 16],
  ['Y', 14, 19],
  ['R', 7, 20, 12, 2],
  ['C', 7, 22, 12, 3],
  ['c', 12, 22, 1, 3],
  // perna de verdade e bota
  ['M', 9, 25, 3, 4],
  ['G', 8, 29, 5, 3],
  // perna de pau
  ['L', 16, 25, 2, 7],
  ['l', 16, 25, 2, 1],
  ['l', 16, 29, 2, 1],
  // braço da frente com o machado de abordagem
  ['D', 21, 5, 2, 16],
  ['S', 23, 4, 2, 6],
  ['w', 25, 4, 1, 6],
  ['S', 19, 6, 2, 2],
  ['C', 19, 12, 3, 5],
  ['m', 20, 16, 3, 3],
]);
export const PALETA_IMEDIATO = {
  H: '#1a1a24',
  Y: '#e0b040',
  M: '#7a6a5a',
  W: '#b8a898',
  m: '#3a3028',
  O: '#120808',
  E: '#ff2a2a',
  N: '#2a1a14',
  S: '#a8a8b8',
  w: '#f0f4ff',
  C: '#2a3a6a',
  c: '#1a2444',
  R: '#b8202c',
  G: '#2a2a34',
  L: '#8a5a30',
  l: '#5a3818',
  D: '#6a4426',
  K: '#140c22',
};

// Almirante Ferrugem reconstruído (chefão): o velho almirante refeito em aço polido, bicorne, dragonas, canos de vapor e dois braços-canhão.
export const ALMIRANTE_ACO = desenhar(40, 46, [
  // canos de vapor nas costas e fumaça
  ['V', 5, 0, 3, 2],
  ['v', 9, 3, 2, 2],
  ['G', 4, 2, 5, 1],
  ['P', 5, 3, 3, 11],
  ['p', 5, 6, 3, 1],
  ['p', 5, 10, 3, 1],
  ['G', 8, 5, 4, 1],
  ['P', 9, 6, 2, 9],
  ['p', 9, 9, 2, 1],
  // braço-canhão de trás (mais baixo)
  ['c', 26, 25, 10, 5],
  ['Y', 28, 25, 1, 5],
  ['Y', 33, 25, 1, 5],
  ['G', 36, 25, 2, 5],
  ['O', 37, 26, 1, 3],
  // bicorne com cocar
  ['H', 12, 0, 14, 4],
  ['Y', 12, 3, 14, 1],
  ['H', 10, 4, 18, 1],
  ['R', 18, 1, 2, 2],
  // cabeça com visor e olho vermelho
  ['M', 13, 5, 12, 9],
  ['W', 13, 5, 12, 1],
  ['O', 16, 8, 8, 3],
  ['E', 19, 8, 3, 2],
  ['e', 20, 8],
  ['S', 15, 12, 9, 1],
  ['m', 14, 13, 10, 1],
  // braço de trás (ombro)
  ['M', 5, 17, 5, 6],
  ['m', 5, 22, 5, 1],
  // tronco de aço com medalhas e manômetro
  ['M', 10, 14, 18, 17],
  ['W', 10, 14, 18, 1],
  ['m', 18, 15, 1, 15],
  ['W', 11, 15, 1, 14],
  ['R', 12, 17, 2, 2],
  ['Y', 12, 19, 2, 1],
  ['R', 15, 17, 2, 2],
  ['Y', 15, 19, 2, 1],
  ['B', 20, 17, 5, 5],
  ['b', 21, 18, 3, 3],
  ['O', 22, 19],
  ['R', 23, 18],
  ['g', 11, 26],
  ['g', 16, 26],
  ['g', 20, 26],
  ['g', 25, 26],
  // dragonas douradas com franja
  ['Y', 6, 14, 8, 3],
  ['Y', 24, 14, 8, 3],
  ...xadrez('y', 6, 17, 8, 1),
  ...xadrez('y', 24, 17, 8, 1),
  // cinto
  ['B', 10, 30, 18, 2],
  ['Y', 18, 30, 2, 2],
  // pernas e botas
  ['M', 12, 32, 5, 7],
  ['M', 21, 32, 5, 7],
  ['m', 12, 35, 5, 1],
  ['m', 21, 35, 5, 1],
  ['G', 10, 39, 8, 4],
  ['G', 20, 39, 8, 4],
  // braço-canhão da frente
  ['M', 27, 15, 4, 5],
  ['C', 28, 18, 9, 6],
  ['W', 28, 18, 9, 1],
  ['c', 28, 23, 9, 1],
  ['Y', 30, 18, 1, 6],
  ['Y', 34, 18, 1, 6],
  ['G', 37, 18, 1, 6],
  ['O', 37, 20, 1, 2],
]);
/** fase 0 aço frio; 1+ canos de vapor em brasa e olho mais quente. */
export const paletaAlmiranteAco = (fase: number) => ({
  V: '#e8eef4',
  v: '#b8c4d0',
  G: '#2a2a34',
  P: fase >= 1 ? '#ff5a1a' : '#8a9098',
  p: fase >= 1 ? '#ffd04a' : '#5a6068',
  H: '#1a1a24',
  Y: '#e0b040',
  y: '#a8802a',
  R: '#c0283c',
  M: '#a8b4c4',
  W: '#e8f0fa',
  m: '#5a6474',
  S: '#d0d8e0',
  O: '#120808',
  E: fase >= 1 ? '#ff5a3a' : '#ff2a2a',
  e: fase >= 1 ? '#ffffff' : '#ffd0d0',
  B: '#3a3a44',
  b: '#f0ece0',
  g: '#c8a060',
  C: '#7a8494',
  c: '#4a5260',
  K: '#140c22',
});

// ---------- O Coliseu alagado ----------

// Tritão Mecânico: campeão do mar da arena, armadura de escamas, crista de barbatana e tridente dourado, de pé sobre uma onda.
export const TRITAO_MECANICO = desenhar(28, 38, [
  // tridente
  ['Y', 19, 0, 1, 3],
  ['Y', 21, 0, 1, 3],
  ['Y', 23, 0, 1, 3],
  ['Y', 19, 3, 5, 1],
  ['Y', 21, 4, 1, 23],
  ['y', 21, 10, 1, 1],
  // crista de barbatana e elmo
  ['N', 9, 1, 8, 2],
  ['n', 9, 2, 8, 1],
  ['S', 9, 3, 8, 7],
  ['W', 9, 3, 8, 1],
  ['O', 12, 6, 5, 2],
  ['E', 14, 6, 2, 1],
  ['s', 9, 8, 2, 2],
  // braço de trás com barbatana no ombro
  ['N', 5, 9, 4, 2],
  ['S', 5, 11, 3, 7],
  ['m', 5, 18, 3, 2],
  // tronco com escamas
  ['S', 8, 10, 10, 11],
  ...xadrez('s', 9, 11, 8, 9),
  ['Y', 8, 21, 10, 2],
  // pernas
  ['S', 9, 23, 3, 5],
  ['S', 14, 23, 3, 5],
  // braço da frente segurando o tridente
  ['S', 18, 11, 3, 4],
  ['m', 20, 13, 3, 3],
  // onda
  ['A', 2, 28, 22, 6],
  ['a', 2, 28, 22, 1],
  ...xadrez('a', 3, 31, 20, 1),
  ['F', 3, 27, 4, 1],
  ['F', 12, 27, 5, 1],
  ['F', 20, 26, 3, 2],
]);
export const PALETA_TRITAO = {
  Y: '#e0b040',
  y: '#a8802a',
  N: '#2a9a9a',
  n: '#1a6060',
  S: '#4a8a9a',
  W: '#8ac8d8',
  s: '#2a5a6a',
  O: '#120808',
  E: '#ff2a2a',
  m: '#24404a',
  A: '#1a4a8a',
  a: '#4a8ad8',
  F: '#e8f4ff',
  K: '#140c22',
};

// Mergulhador: escafandro de latão com capacete redondo, vigia de vidro, mangueira de ar, tanque e arpão.
export const MERGULHADOR = desenhar(26, 34, [
  // mangueira de ar e tanque
  ['H', 4, 4, 2, 1],
  ['H', 3, 5, 1, 7],
  ['C', 3, 12, 4, 9],
  ['c', 3, 12, 4, 1],
  ['c', 3, 20, 4, 1],
  // capacete redondo de latão
  ['M', 8, 0, 10, 1],
  ['M', 6, 1, 14, 9],
  ['M', 8, 10, 10, 1],
  ['W', 8, 1, 6, 1],
  ['m', 6, 9, 14, 1],
  ['g', 7, 5],
  ['g', 19, 5],
  // vigia com olho vermelho
  ['G', 12, 3, 7, 5],
  ['O', 13, 4, 5, 3],
  ['E', 15, 5, 2, 1],
  ['w', 13, 4],
  // roupa de lona com gola de latão
  ['L', 7, 11, 12, 11],
  ['M', 7, 11, 12, 2],
  ['W', 7, 11, 12, 1],
  ['l', 7, 15, 12, 1],
  ['l', 7, 19, 12, 1],
  // cinto de lastro
  ['G', 7, 22, 12, 2],
  ['m', 9, 22, 2, 2],
  ['m', 15, 22, 2, 2],
  // pernas e botas pesadas
  ['L', 8, 24, 4, 4],
  ['L', 14, 24, 4, 4],
  ['M', 7, 28, 6, 3],
  ['M', 13, 28, 6, 3],
  ['m', 7, 30, 6, 1],
  ['m', 13, 30, 6, 1],
  // braço da frente com o arpão
  ['L', 18, 13, 3, 4],
  ['D', 16, 17, 5, 3],
  ['M', 19, 16, 3, 2],
  ['S', 18, 16, 5, 1],
  ['T', 22, 15, 1, 3],
  ['T', 23, 16],
]);
export const PALETA_MERGULHADOR = {
  H: '#3a3a44',
  C: '#b8703a',
  c: '#7a4420',
  M: '#c8962a',
  W: '#f0d070',
  m: '#7a5a18',
  g: '#fff0a0',
  G: '#3a3a44',
  O: '#0a1a2a',
  E: '#ff2a2a',
  w: '#a8e8ff',
  L: '#6a7a5a',
  l: '#4a5640',
  D: '#5a3818',
  S: '#a8a8b8',
  T: '#e8e8f0',
  K: '#140c22',
};

// Campeão Naval do Censor: armadura ornamentada, capa, escudo redondo com o olho do Censor e mangual de âncora.
export const CAMPEAO_NAVAL = desenhar(32, 38, [
  // âncora do mangual, no alto atrás
  ['G', 2, 0, 3, 1],
  ['G', 3, 1, 1, 7],
  ['G', 1, 2, 5, 1],
  ['G', 0, 7, 7, 1],
  ['G', 0, 5, 1, 2],
  ['G', 6, 5, 1, 2],
  ['g', 3, 3, 1, 3],
  // corrente até a mão
  ['c', 3, 8],
  ['C', 3, 9],
  ['c', 3, 10],
  ['C', 3, 11],
  ['c', 3, 12],
  ['C', 3, 13],
  // capa
  ['P', 6, 14, 3, 14],
  ['p', 6, 26, 3, 2],
  // penacho e elmo dourado
  ['R', 10, 0, 9, 2],
  ['r', 10, 1, 9, 1],
  ['S', 10, 2, 9, 8],
  ['W', 10, 2, 9, 1],
  ['Y', 10, 4, 9, 1],
  ['O', 13, 5, 6, 2],
  ['E', 15, 5, 2, 2],
  ['s', 10, 7, 2, 3],
  // braço de trás segurando a corrente
  ['S', 3, 14, 3, 5],
  ['m', 2, 19, 3, 2],
  // tronco ornamentado
  ['S', 9, 10, 12, 13],
  ['W', 9, 10, 12, 1],
  ['Y', 9, 15, 12, 1],
  ['Y', 14, 12, 2, 2],
  ['s', 11, 18, 8, 1],
  ['s', 11, 20, 8, 1],
  // ombreiras
  ['S', 5, 10, 5, 4],
  ['S', 20, 10, 5, 4],
  ['W', 5, 10, 5, 1],
  ['W', 20, 10, 5, 1],
  ['Y', 5, 13, 5, 1],
  ['Y', 20, 13, 5, 1],
  // cinto e saia
  ['B', 9, 23, 12, 2],
  ['Y', 14, 23, 2, 2],
  ['L', 9, 25, 12, 3],
  ['B', 11, 25, 1, 3],
  ['B', 15, 25, 1, 3],
  ['B', 19, 25, 1, 3],
  // pernas e botas
  ['S', 10, 28, 4, 4],
  ['S', 17, 28, 4, 4],
  ['G', 9, 32, 6, 3],
  ['G', 16, 32, 6, 3],
  // braço da frente com o escudo redondo do olho
  ['S', 21, 14, 3, 4],
  ['Y', 22, 13, 5, 1],
  ['Y', 21, 14, 7, 7],
  ['Y', 22, 21, 5, 1],
  ['D', 22, 15, 5, 5],
  ['O', 23, 16, 3, 3],
  ['E', 24, 17],
  ['e', 23, 16],
]);
export const PALETA_CAMPEAO_NAVAL = {
  G: '#3a3a44',
  g: '#7a7a84',
  c: '#5a5a64',
  C: '#9a9aa4',
  P: '#5a2a8a',
  p: '#3a1a5a',
  R: '#c0283c',
  r: '#7a1018',
  S: '#4a6a8a',
  W: '#9ab8d8',
  s: '#2a3e54',
  Y: '#e0b040',
  O: '#120808',
  E: '#ff2a2a',
  e: '#ffd0d0',
  m: '#24323e',
  B: '#4a3020',
  L: '#7a5a30',
  D: '#1a2a4a',
  K: '#140c22',
};

// ---------- Aliado ----------

// Caio: filho adulto de Marco Remo, prisioneiro libertado, cabelo escuro cacheado, túnica rasgada, grilhão partido e olhar bondoso.
export const CAIO = desenhar(18, 30, [
  // cabelo cacheado
  ['H', 5, 0, 7, 2],
  ['H', 4, 1, 9, 3],
  ...xadrez('h', 4, 1, 9, 2),
  ['H', 4, 4, 2, 3],
  // rosto
  ['P', 6, 3, 6, 6],
  ['H', 6, 3, 6, 1],
  ['h', 7, 3],
  ['h', 10, 3],
  ['p', 6, 8, 6, 1],
  ['b', 9, 4, 2, 1],
  ['O', 10, 5],
  ['p', 11, 6],
  ['m', 9, 7, 2, 1],
  ['P', 8, 9, 2, 1],
  // braços
  ['T', 3, 10, 2, 2],
  ['P', 3, 12, 2, 5],
  ['p', 3, 17, 2, 1],
  ['T', 13, 10, 2, 2],
  ['P', 13, 12, 2, 5],
  ['p', 13, 17, 2, 1],
  // grilhão partido no pulso da frente
  ['G', 13, 16, 2, 1],
  ['g', 15, 16],
  // túnica rasgada com remendo e corda
  ['T', 5, 10, 8, 9],
  ['t', 5, 10, 8, 1],
  ['t', 7, 13, 2, 2],
  ['t', 10, 15, 1, 2],
  ['N', 5, 16, 8, 1],
  ['T', 5, 19, 2, 1],
  ['T', 8, 19, 2, 1],
  ['T', 11, 19, 2, 1],
  // pernas e sandálias
  ['P', 6, 20, 2, 5],
  ['P', 10, 20, 2, 5],
  ['B', 5, 25, 3, 2],
  ['B', 10, 25, 3, 2],
]);
export const PALETA_CAIO = {
  H: '#2a1a14',
  h: '#4a3020',
  P: '#c8906a',
  p: '#9a6a48',
  b: '#2a1a14',
  O: '#3a2a1a',
  m: '#8a4a3a',
  T: '#c8b890',
  t: '#8a7a5a',
  N: '#8a6a3a',
  G: '#3a3a44',
  g: '#7a7a84',
  B: '#6a4426',
  K: '#140c22',
};
