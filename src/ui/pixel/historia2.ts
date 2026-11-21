import { desenhar, xadrez } from './desenho';

/**
 * Segunda leva de personagens do modo História em pixel: os inimigos dos caminhos
 * de Cassius (Ludus, catacumbas, arquivo e Coliseu) e de Octavius (o porto), mais
 * dois aliados humanos da rede rebelde. Mesmo estilo de historia.ts: formas grossas,
 * 2 a 3 tons por material, olhos acesos (vermelho nas máquinas do Censor) e contorno
 * K automático. Todos virados para a direita; a tela de luta espelha os inimigos.
 */

// ---------- Caminho de Cassius ----------

// Cão de Ferro: cão de guarda do Ludus, mandíbula com dentes, olho vermelho, rebites e cauda de corrente.
export const CAO_DE_FERRO = desenhar(30, 22, [
  // cauda de corrente
  ['G', 4, 6, 2, 1],
  ['g', 3, 5, 1, 1],
  ['G', 2, 4, 1, 1],
  ['g', 1, 3, 1, 1],
  ['G', 0, 2, 1, 1],
  // corpo
  ['M', 6, 6, 15, 7],
  ['W', 6, 6, 15, 1],
  ['m', 6, 12, 15, 1],
  ['g', 8, 8],
  ['g', 12, 8],
  ['g', 16, 8],
  ['g', 10, 10],
  // pescoço e cabeça
  ['M', 19, 4, 3, 4],
  ['M', 20, 1, 6, 6],
  ['W', 20, 1, 6, 1],
  ['m', 21, 0, 2, 2],
  ['M', 24, 4, 4, 2],
  ['E', 23, 2, 2, 1],
  // boca aberta com dentes
  ['O', 24, 6, 4, 1],
  ['T', 24, 6],
  ['T', 26, 6],
  ['m', 23, 7, 5, 1],
  // coleira
  ['R', 19, 7, 3, 1],
  // patas
  ['M', 7, 13, 2, 5],
  ['m', 10, 13, 2, 4],
  ['m', 15, 13, 2, 4],
  ['M', 18, 13, 2, 5],
  ['G', 6, 18, 4, 1],
  ['G', 17, 18, 4, 1],
]);
export const PALETA_CAO_DE_FERRO = {
  M: '#5a5f6e',
  W: '#9aa0b0',
  m: '#363a48',
  g: '#c8a060',
  G: '#3a3a44',
  E: '#ff2a2a',
  O: '#1a0a0a',
  T: '#f0f0e0',
  R: '#a8402a',
  K: '#140c22',
};

// Rato-Engrenagem: rato das catacumbas com uma engrenagem nas costas e cauda de cabo.
export const RATO_ENGRENAGEM = desenhar(22, 14, [
  // cauda de cabo com o plugue na ponta
  ['C', 3, 8, 3, 1],
  ['C', 2, 7, 1, 1],
  ['C', 1, 6, 1, 1],
  ['C', 0, 4, 1, 2],
  ['Y', 0, 3],
  // engrenagem nas costas
  ['Y', 8, 1, 5, 4],
  ['Y', 10, 0, 1, 1],
  ['Y', 7, 2, 1, 1],
  ['Y', 13, 2, 1, 1],
  ['y', 10, 2, 1, 1],
  // corpo
  ['M', 6, 5, 9, 5],
  ['m', 6, 9, 9, 1],
  // cabeça
  ['M', 14, 6, 4, 3],
  ['M', 18, 7, 1, 1],
  ['N', 19, 7],
  ['P', 14, 4, 2, 2],
  ['E', 16, 6],
  // patas
  ['G', 7, 10, 2, 1],
  ['G', 12, 10, 2, 1],
]);
export const PALETA_RATO = {
  M: '#6a6070',
  m: '#3a3440',
  Y: '#c8962a',
  y: '#5a3a1a',
  P: '#c87a8a',
  N: '#e88a9a',
  E: '#ff3a3a',
  G: '#2a2a34',
  C: '#b86a3a',
  K: '#140c22',
};

// Arquivista das Sombras: IA do arquivo, alta e encapuzada, gavetas no peito, braços de pergaminho e uma lente violeta.
export const ARQUIVISTA = desenhar(30, 44, [
  // capuz
  ['H', 11, 0, 6, 2],
  ['H', 8, 2, 12, 10],
  ['h', 8, 2, 2, 10],
  ['O', 11, 4, 7, 7],
  ['V', 13, 6, 3, 3],
  ['v', 14, 7, 1, 1],
  // túnica de pergaminho escuro, abrindo para baixo
  ['R', 8, 12, 12, 8],
  ['R', 6, 20, 16, 10],
  ['R', 4, 30, 20, 10],
  ['r', 13, 14, 1, 26],
  ['r', 18, 22, 1, 18],
  ['r', 8, 30, 1, 10],
  ['R', 5, 40, 3, 1],
  ['R', 11, 40, 3, 1],
  ['R', 17, 40, 3, 1],
  ['R', 22, 40, 1, 1],
  // gavetas no peito
  ['D', 10, 15, 8, 3],
  ['d', 13, 16, 2, 1],
  ['D', 10, 19, 8, 3],
  ['d', 13, 20, 2, 1],
  // braços de pergaminho (frente)
  ['A', 20, 14, 4, 2],
  ['S', 24, 12, 3, 6],
  ['s', 24, 12, 3, 1],
  ['s', 24, 17, 3, 1],
  ['A', 21, 22, 3, 2],
  ['S', 24, 21, 3, 5],
  ['s', 24, 25, 3, 1],
  ['A', 22, 30, 2, 2],
  ['P', 24, 29, 3, 4],
  // braços de pergaminho (atrás)
  ['A', 4, 14, 4, 2],
  ['S', 1, 12, 3, 6],
  ['s', 1, 12, 3, 1],
  ['s', 1, 17, 3, 1],
  ['A', 3, 24, 3, 2],
  ['S', 0, 22, 3, 5],
  ['s', 0, 26, 3, 1],
  // runas acesas
  ['V', 7, 34, 1, 1],
  ['V', 20, 26, 1, 1],
]);
/** Com ilusao=true vira uma cópia fantasma (violeta e ciano claros), para as cópias falsas. */
export const paletaArquivista = (ilusao: boolean) =>
  ilusao
    ? {
        H: '#8a7ac8',
        h: '#6a5aa8',
        O: '#2a2a5a',
        V: '#c8f0ff',
        v: '#ffffff',
        R: '#9a8ad8',
        r: '#7a6ab8',
        D: '#a8c8e8',
        d: '#e0f0ff',
        A: '#8aa8d8',
        S: '#d0f0ff',
        s: '#8ac8e8',
        P: '#b8e0f8',
        K: '#3a2a6a',
      }
    : {
        H: '#3a2a1e',
        h: '#24180f',
        O: '#0a0610',
        V: '#b05aff',
        v: '#f0d8ff',
        R: '#4a3a26',
        r: '#2e2216',
        D: '#6a5034',
        d: '#c8962a',
        A: '#5a4a3a',
        S: '#d8c49a',
        s: '#8a7050',
        P: '#c8b080',
        K: '#140c22',
      };

// Pretor de Aço: comandante da Guarda Pretoriana, penacho vermelho, capa, gládio e escudo-torre com o olho do Censor.
export const PRETOR_DE_ACO = desenhar(36, 44, [
  // penacho
  ['P', 9, 0, 10, 2],
  ['P', 7, 1, 3, 3],
  ['p', 10, 0, 8, 1],
  // elmo
  ['S', 10, 2, 9, 8],
  ['s', 10, 7, 2, 3],
  ['O', 13, 5, 6, 2],
  ['E', 15, 5],
  ['E', 17, 5],
  ['Y', 10, 9, 9, 1],
  // capa
  ['C', 4, 10, 5, 28],
  // tronco em gomos
  ['S', 6, 10, 4, 4],
  ['S', 8, 10, 13, 14],
  ['s', 9, 13, 11, 1],
  ['s', 9, 16, 11, 1],
  ['s', 9, 19, 11, 1],
  ['B', 8, 23, 13, 2],
  // saia de tiras de couro
  ['L', 8, 25, 13, 4],
  ['B', 10, 25, 1, 4],
  ['B', 14, 25, 1, 4],
  ['B', 18, 25, 1, 4],
  // pernas
  ['S', 9, 29, 4, 9],
  ['S', 15, 29, 4, 9],
  ['s', 9, 33, 4, 1],
  ['s', 15, 33, 4, 1],
  ['G', 8, 38, 6, 2],
  ['G', 14, 38, 6, 2],
  // braço e gládio erguido
  ['S', 20, 12, 3, 4],
  ['W', 24, 1, 2, 13],
  ['Y', 23, 14, 4, 1],
  ['B', 24, 15, 2, 1],
  // escudo-torre com o olho do Censor
  ['R', 21, 16, 12, 24],
  ['Y', 21, 16, 12, 1],
  ['Y', 21, 39, 12, 1],
  ['Y', 21, 16, 1, 24],
  ['Y', 32, 16, 1, 24],
  ['r', 23, 18, 8, 20],
  ['Y', 26, 20, 2, 3],
  ['Y', 26, 30, 2, 3],
  ['O', 24, 24, 6, 5],
  ['E', 25, 25, 4, 3],
  ['e', 26, 26, 2, 1],
  ['g', 23, 18],
  ['g', 30, 18],
  ['g', 23, 37],
  ['g', 30, 37],
]);
export const PALETA_PRETOR = {
  P: '#c0283c',
  p: '#ff5a6a',
  S: '#a8b0c0',
  s: '#5a6070',
  O: '#140c14',
  E: '#ff3a3a',
  e: '#ffe0e0',
  Y: '#e0b040',
  C: '#7a1424',
  B: '#6a4426',
  L: '#8a5a30',
  G: '#3a3a44',
  W: '#e0e8f0',
  R: '#8a1a2a',
  r: '#5a1018',
  g: '#ffe08a',
  K: '#140c22',
};

// Retiário Mecânico: campeão do Censor com a rede (atrás) e o tridente (na frente).
export const RETIARIO_MECANICO = desenhar(32, 36, [
  // rede pendurada na mão de trás
  ['n', 0, 16, 9, 1],
  ...xadrez('N', 0, 17, 9, 13),
  ['g', 0, 30],
  ['g', 4, 30],
  ['g', 8, 30],
  ['M', 8, 12, 3, 6],
  // cabeça
  ['M', 11, 1, 7, 7],
  ['H', 11, 1, 7, 1],
  ['O', 13, 3, 5, 2],
  ['E', 16, 3, 2, 2],
  // ombreira (galerus)
  ['Y', 7, 8, 5, 4],
  // tronco
  ['M', 11, 8, 8, 10],
  ['m', 11, 12, 8, 1],
  ['m', 11, 15, 8, 1],
  ['B', 10, 18, 10, 2],
  ['B', 11, 20, 8, 3],
  // pernas
  ['M', 11, 23, 3, 8],
  ['M', 16, 23, 3, 8],
  ['G', 10, 31, 5, 2],
  ['G', 16, 31, 5, 2],
  // tridente
  ['W', 23, 4, 1, 28],
  ['S', 21, 1, 1, 3],
  ['S', 23, 0, 1, 4],
  ['S', 25, 1, 1, 3],
  ['S', 21, 4, 5, 1],
  // braço da frente segurando o tridente
  ['M', 19, 10, 3, 3],
  ['M', 21, 12, 3, 3],
  ['m', 22, 14, 2, 2],
]);
export const PALETA_RETIARIO = {
  M: '#7a8090',
  H: '#c0c8d8',
  m: '#4a5060',
  O: '#140c14',
  E: '#ff2a2a',
  Y: '#c8962a',
  B: '#3a5a8a',
  G: '#3a3a44',
  N: '#c8b890',
  n: '#8a7a50',
  g: '#5a5a68',
  W: '#8a6a40',
  S: '#e0e8f0',
  K: '#140c22',
};

// Mirmilão de Bronze: campeão pesado, elmo com crista de peixe, escudo redondo e gládio.
export const MIRMILAO_BRONZE = desenhar(30, 36, [
  // crista de peixe
  ['F', 5, 0, 2, 2],
  ['F', 7, 1, 11, 2],
  ['F', 10, 0, 5, 1],
  ['f', 9, 2, 1, 1],
  ['f', 12, 2, 1, 1],
  ['f', 15, 2, 1, 1],
  // elmo com grade
  ['M', 6, 3, 12, 9],
  ['W', 6, 3, 12, 1],
  ['m', 5, 9, 14, 1],
  ['O', 11, 5, 6, 4],
  ['M', 12, 5, 1, 4],
  ['M', 14, 5, 1, 4],
  ['M', 16, 5, 1, 4],
  ['E', 13, 6],
  ['E', 15, 6],
  // braço de trás com manica
  ['m', 2, 12, 3, 10],
  ['W', 2, 14, 3, 1],
  ['W', 2, 18, 3, 1],
  // tronco de placas
  ['M', 5, 12, 14, 10],
  ['m', 5, 16, 14, 1],
  ['g', 7, 14],
  ['g', 16, 14],
  ['B', 4, 21, 16, 3],
  // pernas grossas
  ['M', 6, 24, 5, 6],
  ['M', 13, 24, 5, 6],
  ['W', 6, 26, 5, 1],
  ['G', 5, 30, 7, 2],
  ['G', 12, 30, 7, 2],
  // gládio acima do escudo
  ['S', 26, 6, 1, 7],
  ['g', 25, 12, 3, 1],
  // escudo redondo
  ['Y', 19, 12, 6, 1],
  ['Y', 17, 13, 10, 1],
  ['Y', 16, 14, 12, 10],
  ['Y', 17, 24, 10, 1],
  ['Y', 19, 25, 6, 1],
  ['y', 18, 15, 8, 8],
  ['W', 21, 18, 2, 2],
]);
export const PALETA_MIRMILAO = {
  F: '#3aa8a0',
  f: '#a0f0e0',
  M: '#b8782a',
  m: '#7a4a1a',
  W: '#f0c070',
  O: '#1a0a06',
  E: '#ff2a2a',
  B: '#5a3a20',
  g: '#ffe08a',
  G: '#4a3020',
  Y: '#d8a040',
  y: '#8a5a20',
  S: '#e0e8f0',
  K: '#140c22',
};

// Dimaquero: campeão veloz e magro, em investida, com duas espadas curvas.
export const DIMAQUERO = desenhar(30, 34, [
  // lenço esvoaçando
  ['R', 10, 0, 2, 3],
  ['R', 7, 7, 4, 2],
  ['R', 5, 8, 2, 1],
  // cabeça
  ['M', 11, 1, 6, 6],
  ['W', 11, 1, 6, 1],
  ['O', 13, 3, 4, 1],
  ['E', 15, 3, 2, 1],
  ['m', 13, 7, 2, 1],
  // tronco magro
  ['M', 11, 8, 6, 9],
  ['m', 11, 11, 6, 1],
  ['m', 11, 14, 6, 1],
  ['R', 11, 16, 6, 2],
  // perna de trás
  ['M', 10, 18, 3, 4],
  ['M', 8, 22, 3, 4],
  ['M', 6, 26, 3, 3],
  ['G', 4, 29, 5, 1],
  // perna da frente
  ['M', 15, 18, 3, 5],
  ['M', 17, 22, 3, 4],
  ['M', 18, 26, 3, 3],
  ['G', 18, 29, 5, 1],
  // braço da frente e espada curva para o alto
  ['M', 17, 8, 4, 2],
  ['M', 20, 7, 2, 2],
  ['m', 21, 6, 2, 2],
  ['Y', 22, 5, 1, 1],
  ['S', 23, 4, 2, 2],
  ['S', 25, 2, 2, 2],
  ['S', 26, 0, 1, 2],
  // braço de trás e espada curva para baixo
  ['M', 8, 9, 3, 2],
  ['M', 6, 10, 2, 4],
  ['m', 5, 14, 2, 2],
  ['Y', 4, 15, 2, 1],
  ['S', 3, 16, 2, 2],
  ['S', 1, 18, 2, 3],
  ['S', 1, 21, 1, 1],
  ['S', 2, 22, 1, 1],
]);
export const PALETA_DIMAQUERO = {
  M: '#5a6a7a',
  W: '#a8b8c8',
  m: '#2a3440',
  O: '#0a0a14',
  E: '#ff2a2a',
  R: '#c0283c',
  G: '#2a2a34',
  S: '#e8f0ff',
  Y: '#f2c14e',
  K: '#140c22',
};

// Leão Mecânico (chefão): juba de engrenagem, respiros de vapor nas costas, garras e mandíbula aberta rugindo.
export const LEAO_MECANICO = desenhar(50, 38, [
  // cauda com engrenagem na ponta
  ['M', 5, 14, 3, 1],
  ['M', 3, 12, 2, 2],
  ['M', 2, 9, 1, 3],
  ['N', 0, 6, 3, 3],
  // vapor e respiros
  ['V', 12, 5, 2, 2],
  ['V', 11, 7, 3, 3],
  ['V', 12, 10, 1, 1],
  ['V', 20, 6, 2, 2],
  ['V', 19, 8, 3, 3],
  ['V', 20, 10, 1, 1],
  ['G', 12, 11, 2, 3],
  ['G', 20, 11, 2, 3],
  // corpo
  ['M', 8, 14, 26, 11],
  ['W', 8, 14, 26, 1],
  ['m', 10, 24, 22, 1],
  ['m', 16, 15, 1, 9],
  ['m', 24, 15, 1, 9],
  ['g', 11, 17],
  ['g', 19, 17],
  ['g', 27, 17],
  ['g', 11, 21],
  ['g', 19, 21],
  ['g', 27, 21],
  // patas e garras
  ['M', 9, 25, 5, 7],
  ['m', 16, 25, 4, 6],
  ['m', 27, 25, 4, 6],
  ['M', 32, 25, 5, 7],
  ['G', 15, 31, 6, 1],
  ['G', 26, 31, 6, 1],
  ['G', 8, 32, 7, 2],
  ['G', 31, 32, 7, 2],
  ['T', 15, 33],
  ['T', 38, 33],
  // juba de engrenagem
  ['N', 31, 3, 14, 20],
  ['N', 35, 1, 2, 2],
  ['N', 40, 1, 2, 2],
  ['N', 45, 7, 2, 2],
  ['N', 45, 13, 2, 2],
  ['N', 29, 8, 2, 2],
  ['N', 29, 15, 2, 2],
  ['N', 35, 23, 2, 2],
  ['N', 40, 23, 2, 2],
  ['n', 33, 5, 10, 16],
  // cabeça
  ['M', 36, 7, 10, 11],
  ['W', 36, 7, 10, 1],
  ['E', 40, 9, 2, 2],
  ['M', 44, 11, 4, 3],
  // boca aberta rugindo
  ['O', 40, 14, 8, 3],
  ['F', 41, 15, 4, 1],
  ['T', 41, 14],
  ['T', 44, 14],
  ['T', 46, 14],
  ['T', 42, 16],
  ['T', 45, 16],
  ['M', 39, 17, 8, 2],
]);
/** Com furia=true a juba e os olhos ficam em brasa. */
export const paletaLeao = (furia: boolean) => ({
  M: furia ? '#b8683a' : '#a87a3a',
  W: furia ? '#ffb070' : '#e0b070',
  m: '#6a4420',
  g: '#ffe08a',
  G: '#3a3028',
  V: '#d8e0e8',
  N: furia ? '#ff4a1a' : '#c8962a',
  n: furia ? '#a01a0a' : '#7a5a1a',
  E: furia ? '#fff0a0' : '#ff2a2a',
  O: '#1a0606',
  T: '#f0f0e0',
  F: furia ? '#ffb02a' : '#ff4a2a',
  K: '#140c22',
});

// Censor Titã: a forma gigante do Censor, feita de pedras do Coliseu, placas enferrujadas, coroa de engrenagem e um olho enorme no peito.
export const CENSOR_TITA = desenhar(56, 60, [
  // coroa de engrenagem
  ['Y', 19, 1, 3, 3],
  ['Y', 25, 0, 4, 4],
  ['Y', 32, 1, 3, 3],
  ['Y', 18, 4, 18, 3],
  ['y', 20, 5, 14, 1],
  // chaminés (soltam vapor nas fases 1 e 2)
  ['v', 7, 7, 2, 3],
  ['v', 45, 7, 2, 3],
  // cabeça e ombros de pedra
  ['S', 14, 7, 26, 8],
  ['s', 22, 7, 1, 8],
  ['s', 31, 7, 1, 8],
  ['s', 14, 11, 26, 1],
  ['S', 4, 10, 12, 10],
  ['S', 38, 10, 12, 10],
  ['s', 4, 14, 12, 1],
  ['s', 38, 14, 12, 1],
  ['R', 6, 11, 5, 2],
  ['R', 42, 16, 5, 2],
  // braços
  ['S', 2, 20, 8, 8],
  ['M', 1, 28, 8, 10],
  ['m', 1, 32, 8, 1],
  ['S', 0, 38, 10, 8],
  ['s', 0, 41, 10, 1],
  ['S', 44, 20, 8, 8],
  ['M', 45, 28, 8, 10],
  ['m', 45, 32, 8, 1],
  ['S', 44, 38, 10, 8],
  ['s', 44, 41, 10, 1],
  // tronco de placas enferrujadas
  ['M', 12, 15, 30, 20],
  ['m', 12, 15, 30, 1],
  ['g', 14, 17],
  ['g', 39, 17],
  ['g', 14, 33],
  ['g', 39, 33],
  ['R', 14, 30, 4, 3],
  ['R', 36, 18, 3, 4],
  ['R', 30, 31, 5, 2],
  ['G', 37, 26, 4, 4],
  ['g', 38, 27, 2, 2],
  ['G', 13, 20, 4, 4],
  ['g', 14, 21, 2, 2],
  // o olho, com anel de engrenagem
  ['Y', 25, 15, 4, 2],
  ['Y', 25, 29, 4, 2],
  ['Y', 18, 21, 2, 4],
  ['Y', 34, 21, 2, 4],
  ['O', 20, 17, 14, 12],
  ['E', 22, 19, 10, 8],
  ['e', 25, 21, 4, 4],
  ['h', 26, 22, 2, 2],
  // quadril
  ['M', 15, 35, 24, 4],
  ['m', 15, 38, 24, 1],
  // pernas de pedra com rachaduras
  ['S', 15, 39, 9, 13],
  ['S', 30, 39, 9, 13],
  ['s', 15, 44, 9, 1],
  ['s', 30, 44, 9, 1],
  ['c', 18, 40, 1, 3],
  ['c', 19, 43, 1, 2],
  ['c', 20, 45, 1, 3],
  ['c', 33, 41, 1, 4],
  ['c', 34, 45, 1, 2],
  ['c', 32, 47, 1, 2],
  // pés
  ['G', 13, 52, 13, 4],
  ['G', 28, 52, 13, 4],
]);
/** fase 0 normal; 1 pernas rachadas soltando vapor; 2 o olho arde em branco e vermelho. */
export const paletaTita = (fase: number) => ({
  S: '#8a7a68',
  s: '#5a4e42',
  Y: '#c8962a',
  y: '#6a4a1a',
  M: '#6a4a3a',
  m: '#3a2820',
  R: '#a8482a',
  O: '#120606',
  E: fase >= 2 ? '#ff6a4a' : '#ff2a2a',
  e: fase >= 2 ? '#ffffff' : '#ff8a6a',
  h: fase >= 2 ? '#ffffff' : '#ffe0e0',
  G: '#3a3028',
  g: '#a8a8b0',
  c: fase >= 1 ? '#ff8a2a' : '#5a4e42',
  v: fase >= 1 ? '#e8eef4' : '#3a3028',
  K: '#100810',
});

// ---------- Caminho de Octavius (o porto) ----------

// Marinheiro de Ferro: autômato marujo com olho de escotilha, mão de gancho e uma âncora.
export const MARINHEIRO_FERRO = desenhar(26, 34, [
  // gorro de marujo
  ['W', 8, 0, 7, 2],
  ['R', 11, 0],
  ['w', 7, 2, 9, 1],
  // cabeça com olho de escotilha
  ['M', 7, 3, 9, 7],
  ['Y', 11, 4, 4, 4],
  ['O', 12, 5, 2, 2],
  ['E', 12, 5, 2, 1],
  ['m', 8, 8, 3, 1],
  // gola
  ['B', 8, 10, 7, 2],
  // tronco de barril
  ['M', 6, 12, 11, 10],
  ['Y', 6, 13, 11, 1],
  ['Y', 6, 20, 11, 1],
  ['g', 8, 16],
  ['g', 14, 16],
  // âncora na mão de trás
  ['G', 1, 8, 4, 2],
  ['G', 2, 10, 2, 16],
  ['G', 0, 11, 6, 1],
  ['G', 0, 22, 1, 2],
  ['G', 5, 22, 1, 2],
  ['G', 0, 24, 6, 2],
  ['M', 3, 13, 3, 5],
  // braço da frente com gancho
  ['M', 17, 13, 3, 5],
  ['S', 19, 18, 3, 1],
  ['S', 21, 15, 1, 3],
  ['S', 20, 15],
  // calças e botas
  ['B', 7, 22, 10, 3],
  ['M', 8, 25, 3, 4],
  ['M', 13, 25, 3, 4],
  ['G', 7, 29, 5, 2],
  ['G', 12, 29, 5, 2],
]);
export const PALETA_MARINHEIRO = {
  W: '#e8ecf0',
  w: '#a8b0c0',
  R: '#c0283c',
  M: '#6a7080',
  m: '#3a3e4a',
  Y: '#c8962a',
  O: '#140c14',
  E: '#ff2a2a',
  B: '#2a4a8a',
  S: '#d0d8e0',
  G: '#3a3a44',
  g: '#a8a8b0',
  K: '#140c22',
};

// Almirante Ferrugem (chefão do porto): bicorne, casaca longa com dragonas, braço-canhão e manchas de ferrugem.
export const ALMIRANTE_FERRUGEM = desenhar(36, 44, [
  // bicorne
  ['H', 9, 0, 12, 2],
  ['H', 5, 2, 20, 4],
  ['H', 3, 4, 2, 2],
  ['H', 25, 4, 2, 2],
  ['Y', 5, 5, 20, 1],
  ['R', 14, 1, 2, 2],
  // cabeça com monóculo
  ['M', 9, 6, 12, 8],
  ['r', 10, 8, 2, 2],
  ['r', 18, 12, 2, 1],
  ['Y', 15, 8, 4, 4],
  ['E', 16, 9, 2, 2],
  ['S', 12, 12, 6, 1],
  // braço de trás
  ['C', 3, 17, 4, 12],
  ['M', 3, 29, 3, 2],
  // casaca longa
  ['C', 6, 14, 18, 24],
  ['c', 14, 14, 2, 24],
  ['Y', 12, 17],
  ['Y', 12, 21],
  ['Y', 17, 17],
  ['Y', 17, 21],
  ['B', 6, 26, 18, 2],
  ['Y', 14, 26, 2, 2],
  ['r', 8, 30, 3, 3],
  ['r', 19, 33, 3, 2],
  ['r', 7, 18, 2, 2],
  // dragonas
  ['Y', 3, 14, 6, 2],
  ['y', 3, 16, 6, 1],
  ['Y', 21, 14, 6, 2],
  ['y', 21, 16, 6, 1],
  // braço-canhão
  ['C', 23, 17, 4, 6],
  ['G', 24, 20, 9, 5],
  ['g', 27, 20, 1, 5],
  ['g', 32, 19, 2, 7],
  ['O', 33, 21, 1, 3],
  // botas
  ['G', 8, 38, 6, 3],
  ['G', 16, 38, 6, 3],
]);
export const PALETA_ALMIRANTE = {
  H: '#2a2030',
  Y: '#e0b040',
  y: '#8a6a20',
  R: '#c0283c',
  M: '#8a5a3a',
  r: '#b8501a',
  E: '#ff2a2a',
  S: '#c8c8d0',
  C: '#2a3a6a',
  c: '#1a2448',
  G: '#3a3a44',
  g: '#a8803a',
  O: '#0a0606',
  B: '#4a3020',
  K: '#140c22',
};

// ---------- Aliados ----------

// Marco Remo: velho capitão do mar, barba branca, quepe, perna de pau e luneta.
export const MARCO_REMO = desenhar(22, 32, [
  // quepe
  ['C', 5, 0, 9, 3],
  ['Y', 5, 2, 9, 1],
  ['c', 10, 3, 6, 1],
  // rosto e cabelo
  ['P', 5, 3, 9, 6],
  ['W', 4, 3, 2, 4],
  ['W', 10, 4, 3, 1],
  ['K', 11, 5],
  ['p', 13, 6, 2, 1],
  // casaco
  ['C', 4, 12, 12, 11],
  ['Y', 11, 16],
  ['Y', 11, 19],
  ['B', 4, 20, 12, 1],
  // barba por cima do casaco
  ['W', 6, 7, 9, 6],
  ['W', 7, 13, 7, 2],
  ['w', 10, 7, 4, 1],
  ['w', 8, 10, 5, 1],
  // braços e luneta
  ['C', 2, 13, 2, 8],
  ['P', 2, 21, 2, 2],
  ['C', 15, 13, 2, 6],
  ['P', 15, 19, 2, 2],
  ['S', 17, 18, 2, 2],
  // perna boa e perna de pau
  ['T', 6, 23, 3, 4],
  ['B', 5, 27, 4, 2],
  ['T', 11, 23, 3, 2],
  ['L', 12, 25, 1, 4],
]);
export const PALETA_MARCO_REMO = {
  C: '#2a3a6a',
  c: '#14203a',
  Y: '#f2c14e',
  P: '#e0a878',
  p: '#c8805a',
  W: '#f0f0f0',
  w: '#c8c8d0',
  K: '#140c22',
  B: '#4a2a14',
  T: '#3a3040',
  L: '#a87a4a',
  S: '#c8962a',
};

// Copista: velho da rede secreta rebelde, capa marrom com capuz, pena na mão e lanterna acesa.
export const COPISTA = desenhar(18, 28, [
  // capuz e rosto
  ['H', 4, 0, 7, 2],
  ['H', 3, 2, 9, 7],
  ['h', 3, 2, 2, 7],
  ['P', 6, 3, 5, 5],
  ['K', 9, 4],
  ['W', 7, 6, 4, 2],
  ['P', 11, 5],
  // capa
  ['H', 3, 9, 10, 15],
  ['H', 2, 16, 12, 8],
  ['h', 6, 10, 1, 14],
  ['h', 10, 14, 1, 10],
  ['Y', 3, 14, 10, 1],
  // braço de trás com a lanterna
  ['H', 1, 10, 2, 4],
  ['P', 1, 14, 2, 1],
  ['G', 0, 15, 4, 1],
  ['L', 0, 16, 4, 4],
  ['G', 0, 20, 4, 1],
  // braço da frente com a pena
  ['H', 12, 10, 2, 4],
  ['P', 13, 13, 2, 2],
  ['F', 14, 8, 1, 5],
  ['F', 15, 7, 1, 3],
  ['O', 13, 15],
  // pés
  ['B', 4, 24, 3, 1],
  ['B', 9, 24, 3, 1],
]);
export const PALETA_COPISTA = {
  H: '#6a4426',
  h: '#4a2c16',
  P: '#e0a878',
  W: '#e8e8e8',
  K: '#140c22',
  Y: '#c8962a',
  G: '#3a3a44',
  L: '#ffd04a',
  F: '#f0f0e0',
  B: '#3a2414',
  O: '#1a1a1a',
};
