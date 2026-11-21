import { desenhar, xadrez, type Passo } from './desenho';

/**
 * Quinta leva de personagens do modo História em pixel: o caminho de Helios, a IA
 * observadora de estrelas (dourado, azul-céu e sol). Os Apagadores de Estrelas, o
 * Eclipse, o Caçador de Sombras nos telhados, a guarda noturna, os aquedutos, o templo
 * de Apolo, a velha Sibila e a sua cópia corrompida, o Gigante de Sombras e o mascote
 * Lumen. Mesmo estilo de historia3.ts e historia4.ts: formas grossas, 2 a 3 tons por
 * material, olhos vermelhos (E) nas máquinas do Censor e contorno K automático. Todos
 * virados para a direita; a tela de luta espelha os inimigos.
 */

/** Disco cheio feito de faixas horizontais, para rodas, discos e halos. */
const circulo = (cor: string, cx: number, cy: number, r: number): Passo[] => {
  const out: Passo[] = [];
  for (let dy = -r; dy <= r; dy++) {
    const meia = Math.floor(Math.sqrt(r * r - dy * dy) + 0.5);
    out.push([cor, cx - meia, cy + dy, meia * 2 + 1, 1]);
  }
  return out;
};

// ---------- Os Apagadores de Estrelas ----------

// Apagador de Estrelas: drone voador com hélice, olho vermelho e braço com abafador de vela, soltando fumaça escura.
export const APAGADOR = desenhar(24, 22, [
  // hélice e eixo
  ['S', 4, 0, 12, 1],
  ['s', 9, 1, 2, 2],
  // aletas laterais
  ['M', 3, 5, 2, 4],
  ['m', 3, 8, 2, 1],
  // corpo
  ['M', 5, 3, 10, 8],
  ['W', 5, 3, 10, 1],
  ['m', 5, 10, 10, 1],
  ['g', 6, 5],
  ['g', 6, 8],
  ['O', 10, 5, 4, 3],
  ['E', 11, 6, 2, 1],
  // escape
  ['m', 8, 11, 4, 2],
  // braço e abafador de vela
  ['N', 15, 6, 4, 1],
  ['N', 18, 6, 1, 3],
  ['Y', 17, 9, 3, 2],
  ['Z', 17, 9, 1, 2],
  ['Y', 16, 11, 5, 2],
  ['y', 16, 12, 5, 1],
  ['O', 17, 13, 3, 1],
  // fumaça escura
  ['F', 18, 15],
  ['f', 17, 16, 2, 1],
  ...xadrez('F', 6, 13, 7, 4),
  ['f', 7, 17, 3, 1],
]);
export const PALETA_APAGADOR = {
  S: '#9a9aa8',
  s: '#4a4a58',
  M: '#3a3a4a',
  W: '#6a6a80',
  m: '#1e1e28',
  g: '#c8a060',
  O: '#120808',
  E: '#ff2a2a',
  N: '#8a6a3a',
  Y: '#b8862a',
  y: '#6a4a18',
  Z: '#e8c070',
  F: '#2a2434',
  f: '#4a4258',
  K: '#140c22',
};

// Apagador Grande: autômato que anda com um sino abafador enorme nas costas e uma vara de apagar luzes.
export const APAGADOR_GRANDE = desenhar(30, 34, [
  // sino abafador nas costas
  ['Y', 4, 0, 3, 2],
  ['Y', 3, 2, 5, 3],
  ['Y', 2, 5, 7, 4],
  ['Y', 1, 9, 9, 5],
  ['Y', 0, 14, 11, 4],
  ['Z', 3, 3, 1, 10],
  ['y', 8, 6, 1, 11],
  ['y', 0, 17, 11, 1],
  ['O', 2, 18, 7, 1],
  // fumaça saindo do sino
  ...xadrez('F', 2, 19, 7, 3),
  ['f', 3, 22, 3, 1],
  // alça do sino
  ['B', 9, 10, 4, 2],
  // tronco
  ['M', 11, 8, 10, 13],
  ['W', 11, 8, 10, 1],
  ['m', 11, 20, 10, 1],
  ['m', 15, 9, 1, 11],
  ['g', 13, 11],
  ['g', 18, 11],
  ['g', 13, 17],
  ['g', 18, 17],
  // cabeça com chaminé
  ['m', 17, 0, 2, 1],
  ['M', 16, 1, 7, 7],
  ['W', 16, 1, 7, 1],
  ['O', 19, 3, 4, 2],
  ['E', 21, 3, 2, 1],
  ['m', 16, 7, 7, 1],
  // vara com abafador
  ['N', 24, 5, 1, 21],
  ['Y', 25, 3, 3, 3],
  ['Z', 25, 3, 1, 3],
  ['y', 25, 6, 3, 1],
  // braço da frente
  ['M', 21, 10, 3, 6],
  ['m', 22, 16, 3, 2],
  // cinto
  ['B', 10, 21, 12, 2],
  ['Y', 15, 21, 2, 2],
  // pernas em passada
  ['M', 11, 23, 3, 6],
  ['M', 18, 23, 3, 6],
  ['m', 11, 25, 3, 1],
  ['m', 18, 25, 3, 1],
  ['G', 10, 29, 5, 2],
  ['G', 17, 29, 6, 2],
]);
export const PALETA_APAGADOR_GRANDE = {
  Y: '#b8862a',
  y: '#6a4a18',
  Z: '#e8c070',
  O: '#120808',
  F: '#2a2434',
  f: '#4a4258',
  B: '#4a3020',
  M: '#3a3a4a',
  W: '#6a6a80',
  m: '#1e1e28',
  g: '#c8a060',
  E: '#ff2a2a',
  N: '#8a6a3a',
  G: '#16161e',
  K: '#140c22',
};

// ---------- O Eclipse ----------

// O Eclipse: disco negro flutuante com engrenagens, coroa de luz em volta e um olho vermelho fraco no centro.
export const ECLIPSE = desenhar(44, 44, [
  // raios da coroa
  ['C', 19, 0, 3, 3],
  ['C', 19, 38, 3, 3],
  ['C', 0, 19, 3, 3],
  ['C', 38, 19, 3, 3],
  ['C', 5, 5, 3, 3],
  ['C', 33, 5, 3, 3],
  ['C', 5, 33, 3, 3],
  ['C', 33, 33, 3, 3],
  // anel da coroa
  ...circulo('C', 20, 20, 17),
  ...circulo('c', 20, 20, 16),
  // disco de ferro
  ...circulo('D', 20, 20, 14),
  ...circulo('N', 20, 20, 12),
  // parafusos da borda
  ['g', 20, 7],
  ['g', 20, 33],
  ['g', 7, 20],
  ['g', 33, 20],
  ['g', 11, 11],
  ['g', 29, 11],
  ['g', 11, 29],
  ['g', 29, 29],
  // raios da engrenagem e reflexo
  ['D', 20, 9, 1, 6],
  ['D', 20, 26, 1, 6],
  ['D', 9, 20, 6, 1],
  ['D', 26, 20, 6, 1],
  ['W', 10, 13, 1, 4],
  ['W', 12, 10, 4, 1],
  // olho vermelho fraco
  ['O', 17, 18, 7, 5],
  ['e', 18, 19, 5, 3],
  ['E', 19, 20, 3, 1],
]);
/** fase 0 coroa prateada e fria; 1+ a coroa arde em laranja e o olho esquenta. */
export const paletaEclipse = (fase: number) => ({
  C: fase >= 1 ? '#ffb02a' : '#c8d0e0',
  c: fase >= 1 ? '#ff5a1a' : '#7a8498',
  D: '#2a2838',
  N: '#0e0a16',
  W: '#4a4660',
  g: '#8a7a5a',
  O: '#08040a',
  e: fase >= 1 ? '#a8202a' : '#6a1418',
  E: fase >= 1 ? '#ff4a3a' : '#c0202a',
  K: '#140c22',
});

// ---------- Telhados à noite ----------

// O Caçador de Sombras: autômato encapuzado dos telhados, corrente com gancho numa mão e lanterna de luz vermelha na outra.
export const CACADOR_SOMBRAS = desenhar(32, 40, [
  // capuz
  ['H', 9, 1, 2, 3],
  ['H', 11, 0, 8, 3],
  ['h', 11, 0, 8, 1],
  ['H', 10, 3, 10, 6],
  ['O', 14, 4, 5, 4],
  ['E', 16, 5, 2, 1],
  ['m', 15, 7, 3, 1],
  // capa
  ['H', 8, 9, 14, 20],
  ['H', 6, 24, 18, 5],
  ['h', 8, 9, 1, 15],
  ['j', 12, 14, 1, 14],
  ['j', 17, 18, 1, 10],
  ['H', 7, 29, 2, 1],
  ['H', 12, 29, 3, 1],
  ['H', 18, 29, 2, 1],
  // peito de metal à mostra
  ['M', 14, 10, 4, 8],
  ['m', 14, 13, 4, 1],
  ['g', 15, 15],
  // ombreira e braço da frente
  ['M', 18, 9, 5, 3],
  ['W', 18, 9, 5, 1],
  ['M', 22, 12, 3, 5],
  ['m', 24, 16, 2, 2],
  // corrente e gancho
  ['S', 26, 18],
  ['s', 26, 19],
  ['S', 26, 20],
  ['s', 27, 21],
  ['S', 27, 22],
  ['s', 27, 23],
  ['S', 27, 24],
  ['T', 27, 25, 1, 3],
  ['T', 24, 28, 4, 1],
  ['T', 24, 26, 1, 2],
  ['t', 25, 28, 2, 1],
  // braço de trás com a lanterna vermelha
  ['M', 5, 12, 3, 6],
  ['m', 5, 18, 3, 1],
  ['Y', 6, 19],
  ['Y', 4, 20, 5, 1],
  ['R', 4, 21, 5, 4],
  ['r', 5, 22, 3, 2],
  ['Y', 6, 21, 1, 4],
  ['Y', 4, 25, 5, 1],
  ['Q', 3, 22, 1, 2],
  ['Q', 9, 22, 1, 2],
  // pernas e botas
  ['M', 11, 30, 3, 5],
  ['M', 17, 30, 3, 5],
  ['G', 10, 35, 5, 2],
  ['G', 16, 35, 6, 2],
]);
export const PALETA_CACADOR = {
  H: '#2a2238',
  h: '#4a3e5a',
  j: '#16121e',
  O: '#08040a',
  E: '#ff2a2a',
  M: '#5a5a6a',
  W: '#9a9aac',
  m: '#2e2e3a',
  g: '#c8a060',
  S: '#a8a8b8',
  s: '#5a5a68',
  T: '#d0d8e0',
  t: '#7a8494',
  Y: '#8a6a3a',
  R: '#c0202a',
  r: '#ff7a5a',
  Q: '#ff4a3a',
  G: '#16161e',
  K: '#140c22',
};

// Pretoriano Noturno: guarda da noite de armadura azul-escura segmentada, capa roxa e besta pronta para atirar.
export const PRETORIANO_NOTURNO = desenhar(24, 34, [
  // penacho
  ['P', 7, 0, 7, 2],
  ['P', 6, 1, 1, 3],
  // capa
  ['C', 4, 10, 3, 14],
  ['c', 4, 22, 3, 2],
  // elmo
  ['A', 8, 2, 8, 7],
  ['W', 8, 2, 8, 1],
  ['D', 8, 6, 2, 3],
  ['O', 11, 5, 5, 2],
  ['E', 14, 5, 2, 1],
  ['D', 10, 9, 5, 1],
  // tronco segmentado com lua
  ['A', 7, 10, 10, 9],
  ['W', 7, 10, 10, 1],
  ['D', 7, 13, 10, 1],
  ['D', 7, 16, 10, 1],
  ['D', 7, 18, 10, 1],
  ['L', 9, 11, 1, 2],
  ['L', 10, 12],
  // saiote de couro
  ['B', 7, 19, 10, 3],
  ['b', 8, 19, 1, 3],
  ['b', 11, 19, 1, 3],
  ['b', 14, 19, 1, 3],
  // pernas e grevas
  ['D', 8, 22, 3, 6],
  ['D', 13, 22, 3, 6],
  ['A', 8, 24, 3, 3],
  ['A', 13, 24, 3, 3],
  ['G', 7, 28, 5, 2],
  ['G', 12, 28, 6, 2],
  // braços
  ['A', 15, 12, 3, 3],
  ['D', 16, 14, 2, 2],
  // besta: coronha, arco, corda e virote
  ['N', 14, 14, 8, 2],
  ['n', 14, 15, 8, 1],
  ['M', 20, 10, 1, 10],
  ['m', 19, 10],
  ['m', 19, 19],
  ['s', 19, 11, 1, 8],
  ['T', 16, 13, 6, 1],
]);
export const PALETA_PRETORIANO_NOTURNO = {
  P: '#3a2a5a',
  C: '#2a1a48',
  c: '#160e2a',
  A: '#2a3a6a',
  W: '#6a8ac8',
  D: '#1a2448',
  O: '#08040a',
  E: '#ff2a2a',
  L: '#c8d8f0',
  B: '#4a3020',
  b: '#2a1a10',
  G: '#12121a',
  N: '#6a4a2a',
  n: '#3a2818',
  M: '#5a5a6a',
  m: '#2e2e3a',
  s: '#d8d0b8',
  T: '#c8d0d8',
  K: '#140c22',
};

// Morcego Mecânico: morcego de lata com asas de membrana presas em engrenagens e olho vermelho.
export const MORCEGO_MECANICO = desenhar(26, 16, [
  // asa de trás
  ['P', 2, 3, 8, 4],
  ['P', 0, 5, 3, 3],
  ['P', 2, 7, 2, 2],
  ['P', 6, 7, 2, 2],
  ['S', 4, 3, 1, 5],
  ['S', 7, 3, 1, 4],
  ['Y', 7, 2, 3, 3],
  ['Y', 8, 1],
  ['y', 8, 3],
  // asa da frente
  ['P', 15, 7, 7, 3],
  ['P', 19, 5, 4, 3],
  ['P', 16, 10, 2, 2],
  ['P', 20, 10, 2, 1],
  ['S', 18, 7, 1, 4],
  ['S', 21, 5, 1, 5],
  // corpo
  ['M', 10, 4, 5, 6],
  ['W', 10, 4, 5, 1],
  ['m', 10, 9, 5, 1],
  ['g', 12, 6],
  // engrenagem da asa da frente
  ['Y', 14, 7, 3, 3],
  ['y', 15, 8],
  // cabeça com orelhas, olho e presas
  ['M', 14, 0, 1, 2],
  ['M', 17, 0, 1, 2],
  ['M', 14, 2, 5, 5],
  ['W', 14, 2, 5, 1],
  ['E', 16, 3, 2, 1],
  ['O', 15, 6, 3, 1],
  ['T', 16, 6],
  // pés
  ['m', 11, 10, 1, 2],
  ['m', 13, 10, 1, 2],
]);
export const PALETA_MORCEGO = {
  P: '#3a2a3e',
  S: '#8a8a9c',
  Y: '#c8962a',
  y: '#7a5a18',
  M: '#4a4a58',
  W: '#8a8a9c',
  m: '#26262e',
  g: '#c8a060',
  E: '#ff2a2a',
  O: '#120808',
  T: '#e8e8e0',
  K: '#140c22',
};

// ---------- Os aquedutos ----------

// Guarda do Aqueduto: autômato de bronze com tanque d'água nas costas, escudo de roda de válvula e canhão de água.
export const GUARDA_AQUEDUTO = desenhar(26, 34, [
  // tanque nas costas
  ['C', 4, 7, 4, 10],
  ['c', 4, 16, 4, 1],
  ['Y', 4, 10, 4, 1],
  ['L', 5, 12, 1, 3],
  // cabeça em domo
  ['M', 9, 1, 7, 6],
  ['W', 9, 1, 7, 1],
  ['O', 12, 3, 4, 2],
  ['E', 14, 3, 2, 1],
  ['m', 9, 6, 7, 1],
  // tronco
  ['M', 8, 7, 10, 11],
  ['W', 8, 7, 10, 1],
  ['m', 8, 17, 10, 1],
  ['P', 12, 9, 1, 8],
  ['g', 10, 10],
  ['g', 15, 10],
  // escudo de roda de válvula
  ...circulo('V', 5, 19, 5),
  ...circulo('v', 5, 19, 3),
  ['V', 5, 15, 1, 9],
  ['V', 1, 19, 9, 1],
  ['Y', 4, 18, 3, 3],
  ['y', 5, 19],
  // braço da frente com canhão de água
  ['M', 17, 9, 3, 5],
  ['P', 18, 12, 4, 4],
  ['p', 18, 15, 4, 1],
  ['Y', 22, 11, 2, 6],
  ['O', 23, 13, 1, 2],
  // pingos
  ['L', 23, 18],
  ['l', 22, 20],
  // cinto
  ['B', 8, 18, 10, 2],
  ['Y', 12, 18, 2, 2],
  // pernas
  ['M', 9, 20, 3, 7],
  ['M', 14, 20, 3, 7],
  ['m', 9, 23, 3, 1],
  ['m', 14, 23, 3, 1],
  ['G', 8, 27, 5, 3],
  ['G', 13, 27, 6, 3],
]);
export const PALETA_GUARDA_AQUEDUTO = {
  C: '#b8642a',
  c: '#6a3418',
  Y: '#c8962a',
  y: '#7a5a18',
  L: '#a8e8ff',
  l: '#3a8ad0',
  M: '#a87a3a',
  W: '#e0b070',
  m: '#5a3a1a',
  O: '#120808',
  E: '#ff2a2a',
  P: '#5a6470',
  p: '#2e343c',
  g: '#e8d0a0',
  V: '#a83a2a',
  v: '#3a1410',
  B: '#4a3020',
  G: '#2a2a34',
  K: '#140c22',
};

// O Guardião do Aqueduto: colosso de pedra e bronze feito de arcos, com água caindo dos ombros e olho vermelho.
export const GUARDIAO_AQUEDUTO = desenhar(42, 46, [
  // cabeça de bronze
  ['N', 18, 0, 4, 1],
  ['N', 15, 1, 10, 8],
  ['Z', 15, 1, 10, 1],
  ['n', 15, 8, 10, 1],
  ['O', 17, 4, 7, 3],
  ['E', 21, 4, 2, 2],
  ['e', 22, 4],
  ['n', 18, 9, 4, 1],
  // canal dos ombros com água por cima
  ['A', 3, 9, 34, 1],
  ['S', 2, 10, 36, 4],
  ['W', 2, 10, 36, 1],
  ['s', 2, 13, 36, 1],
  // água caindo dos ombros
  ['A', 0, 12, 2, 14],
  ['a', 0, 14, 1, 10],
  ['A', 38, 12, 2, 14],
  ['a', 39, 14, 1, 10],
  ['a', 0, 26, 2, 1],
  ['a', 38, 26, 2, 1],
  // braços de coluna e punhos de bronze
  ['S', 3, 14, 4, 12],
  ['s', 3, 25, 4, 1],
  ['S', 33, 14, 4, 12],
  ['s', 33, 25, 4, 1],
  ['N', 2, 26, 6, 4],
  ['n', 2, 29, 6, 1],
  ['N', 32, 26, 6, 4],
  ['n', 32, 29, 6, 1],
  // tronco com dois arcos e núcleo de bronze
  ['S', 8, 14, 24, 14],
  ['s', 8, 27, 24, 1],
  ['O', 12, 18, 5, 8],
  ['O', 13, 17, 3, 1],
  ['O', 23, 18, 5, 8],
  ['O', 24, 17, 3, 1],
  ['N', 18, 16, 4, 8],
  ['Z', 19, 18, 2, 2],
  ['s', 9, 16, 2, 1],
  ['s', 28, 22, 3, 1],
  ['s', 9, 25, 2, 1],
  // rachaduras (soltam água a partir da fase 1)
  ['c', 6, 11],
  ['c', 7, 12],
  ['c', 33, 11],
  ['c', 34, 12],
  ['c', 14, 15, 1, 2],
  ['c', 15, 17],
  ['c', 29, 15],
  ['c', 30, 16, 1, 2],
  ['c', 10, 23],
  ['c', 11, 24],
  ['v', 13, 14],
  ['v', 31, 14],
  ['v', 4, 17],
  ['v', 35, 18],
  // quadril em arco e pernas de pilar
  ['S', 9, 28, 22, 3],
  ['W', 9, 28, 22, 1],
  ['N', 19, 28, 2, 2],
  ['S', 9, 31, 7, 11],
  ['S', 24, 31, 7, 11],
  ['S', 16, 31],
  ['S', 23, 31],
  ['s', 9, 31, 1, 9],
  ['s', 24, 31, 1, 9],
  ['c', 12, 34],
  ['c', 13, 35, 1, 2],
  ['c', 27, 33, 1, 2],
  ['N', 8, 40, 9, 2],
  ['N', 23, 40, 9, 2],
  // poça entre as pernas
  ['A', 17, 41, 6, 1],
]);
/** fase 0 pedra inteira; 1+ rachaduras abertas espirrando água. */
export const paletaGuardiaoAqueduto = (fase: number) => ({
  N: '#c08a3a',
  n: '#7a5420',
  Z: '#f0c070',
  O: '#120c10',
  E: fase >= 1 ? '#ff5a3a' : '#ff2a2a',
  e: fase >= 1 ? '#ffffff' : '#ffd0d0',
  S: '#b8ac94',
  s: '#7a705e',
  W: '#e0d8c4',
  A: '#3a8ad0',
  a: '#a8e0ff',
  c: fase >= 1 ? '#a8e8ff' : '#7a705e',
  v: fase >= 1 ? '#f0faff' : '#b8ac94',
  K: '#140c22',
});

// ---------- O templo de Apolo ----------

// Sacerdote de Bronze: autômato do templo de manto vermelho, máscara de bronze e incensário balançando na corrente.
export const SACERDOTE_BRONZE = desenhar(24, 34, [
  // manga de trás
  ['r', 4, 10, 2, 7],
  // capuz e máscara
  ['R', 7, 1, 3, 7],
  ['Y', 9, 0, 7, 1],
  ['N', 9, 1, 7, 7],
  ['Z', 10, 1, 6, 1],
  ['n', 9, 7, 7, 1],
  ['O', 12, 3, 4, 1],
  ['E', 14, 3],
  ['n', 13, 5, 3, 1],
  // manto
  ['R', 6, 8, 12, 16],
  ['R', 5, 18, 14, 6],
  ['R', 4, 24, 16, 4],
  ['r', 6, 8, 1, 16],
  ['r', 9, 12, 1, 15],
  ['r', 15, 14, 1, 13],
  ['r', 4, 27, 16, 1],
  // estola dourada
  ['Y', 11, 8, 2, 19],
  ['y', 11, 12, 2, 1],
  ['y', 11, 18, 2, 1],
  ['y', 11, 24, 2, 1],
  // pés
  ['G', 7, 28, 4, 2],
  ['G', 13, 28, 5, 2],
  // braço da frente e corrente
  ['R', 16, 10, 3, 6],
  ['N', 17, 16, 2, 2],
  ['S', 19, 17],
  ['s', 19, 18],
  ['S', 20, 19],
  ['s', 20, 20],
  // incensário com brasa
  ['Y', 18, 21, 4, 4],
  ['Z', 19, 21, 2, 1],
  ['y', 18, 24, 4, 1],
  ['Q', 19, 23],
  ['Q', 21, 23],
  // fumaça do incenso
  ['F', 21, 17],
  ['f', 20, 15],
  ['F', 21, 13],
]);
export const PALETA_SACERDOTE = {
  R: '#8a2a2a',
  r: '#4a1418',
  Y: '#c8962a',
  y: '#7a5a18',
  N: '#c08a3a',
  Z: '#f0c070',
  n: '#6a4418',
  O: '#120808',
  E: '#ff2a2a',
  G: '#2a2a34',
  S: '#a8a8b8',
  s: '#5a5a68',
  Q: '#ff8a2a',
  F: '#d8d0e0',
  f: '#9a90aa',
  K: '#140c22',
};

// Estátua Viva: Apolo de mármore rachado que ganhou vida, coroa de louros, arco dourado e lira na cintura.
export const ESTATUA_VIVA = desenhar(26, 38, [
  // cabeça, cabelo e louros
  ['s', 8, 3, 2, 5],
  ['S', 9, 2, 7, 7],
  ['W', 10, 3, 4, 1],
  ['Y', 9, 2, 6, 1],
  ['y', 8, 1],
  ['y', 11, 1],
  ['y', 14, 1],
  ['E', 14, 4, 2, 1],
  ['S', 16, 5],
  ['s', 14, 7, 2, 1],
  ['c', 12, 3],
  ['c', 13, 4],
  ['S', 11, 9, 3, 1],
  // tronco e toga
  ['S', 8, 10, 9, 9],
  ['W', 8, 10, 9, 1],
  ['s', 12, 12, 1, 4],
  ['T', 7, 10, 3, 10],
  ['T', 8, 17, 9, 3],
  ['t', 8, 19, 9, 1],
  ['c', 10, 12],
  ['c', 11, 13, 1, 2],
  ['c', 15, 18],
  ['c', 16, 19],
  // braço de trás e lira
  ['S', 5, 11, 2, 6],
  ['Y', 3, 16, 1, 6],
  ['Y', 6, 16, 1, 6],
  ['Y', 3, 17, 4, 1],
  ['Y', 3, 21, 4, 1],
  ['b', 4, 18, 1, 3],
  ['b', 5, 18, 1, 3],
  // pernas e sandálias
  ['S', 9, 20, 3, 11],
  ['S', 14, 20, 3, 11],
  ['s', 9, 26, 3, 1],
  ['s', 14, 26, 3, 1],
  ['c', 15, 23],
  ['c', 16, 24, 1, 2],
  ['N', 8, 31, 5, 2],
  ['N', 14, 31, 5, 2],
  // pedaço do pedestal
  ['S', 6, 33, 14, 1],
  ['s', 6, 34, 14, 1],
  // arco dourado e corda
  ['b', 19, 6, 1, 19],
  ['Y', 19, 5],
  ['Y', 20, 6, 1, 2],
  ['Y', 21, 8, 1, 15],
  ['Y', 20, 23, 1, 2],
  ['Y', 19, 25],
  // braço da frente segurando o arco
  ['S', 17, 11, 2, 5],
  ['S', 18, 15, 2, 2],
]);
export const PALETA_ESTATUA = {
  S: '#d8d4cc',
  W: '#f8f6f0',
  s: '#9a968e',
  T: '#f0e8d8',
  t: '#b8ac98',
  c: '#4a4858',
  Y: '#e0b040',
  y: '#7a9a3a',
  b: '#e8e0c0',
  N: '#a87a3a',
  E: '#ff2a2a',
  K: '#140c22',
};

// ---------- A Sibila ----------

// Sibila: a velha vidente cega, de túnica branca, venda azul-céu, cabelo grisalho comprido e cajado com um pequeno sol.
export const SIBILA = desenhar(18, 30, [
  // cajado com sol
  ['N', 14, 4, 1, 24],
  ['Y', 13, 1, 3, 3],
  ['Z', 14, 2],
  ['Y', 14, 0],
  ['Y', 12, 2],
  // cabelo comprido
  ['H', 4, 1, 7, 3],
  ['I', 5, 1, 4, 1],
  ['H', 3, 3, 3, 14],
  ['h', 3, 10, 2, 6],
  // rosto e venda
  ['P', 7, 3, 5, 5],
  ['P', 12, 5],
  ['B', 6, 4, 6, 1],
  ['b', 4, 5, 1, 2],
  ['p', 9, 7, 2, 1],
  // túnica
  ['R', 4, 8, 9, 3],
  ['R', 5, 11, 7, 8],
  ['R', 3, 19, 10, 7],
  ['r', 3, 25, 10, 1],
  ['r', 7, 12, 1, 12],
  ['r', 10, 14, 1, 10],
  ['Y', 5, 15, 7, 1],
  ['Y', 8, 10],
  // braço segurando o cajado
  ['R', 11, 10, 3, 3],
  ['P', 13, 12, 2, 2],
  // sandálias
  ['N', 5, 26, 3, 1],
  ['N', 9, 26, 3, 1],
]);
export const PALETA_SIBILA = {
  N: '#8a6a3a',
  Y: '#f0c040',
  Z: '#fff4b0',
  H: '#b8b8c0',
  h: '#7a7a88',
  I: '#e8e8f0',
  P: '#e0b090',
  p: '#b08060',
  B: '#8ac8e8',
  b: '#5a98c0',
  R: '#ece8e0',
  r: '#b8b0a8',
  K: '#140c22',
};

// A Sibila Corrompida: cópia de metal da Sibila feita pelo Censor, flutuando, cheia de cabos e com um olho vermelho no lugar da venda.
export const SIBILA_CORROMPIDA = desenhar(32, 42, [
  // cabos no lugar do cabelo
  ['C', 5, 2, 4, 1],
  ['C', 4, 3, 1, 6],
  ['C', 2, 9, 2, 1],
  ['C', 2, 10, 1, 8],
  ['C', 6, 4, 3, 1],
  ['C', 6, 5, 1, 9],
  ['C', 7, 7, 2, 1],
  ['c', 4, 5],
  ['c', 6, 9],
  ['c', 2, 13],
  // capuz e coroa de espinhos
  ['R', 10, 0],
  ['R', 13, 0],
  ['R', 16, 0],
  ['H', 9, 1, 9, 2],
  ['H', 9, 3, 2, 7],
  // rosto de metal e olho vermelho
  ['M', 11, 3, 7, 7],
  ['W', 11, 3, 7, 1],
  ['m', 11, 9, 7, 1],
  ['O', 11, 5, 7, 2],
  ['E', 15, 5, 2, 1],
  ['e', 15, 6, 2, 1],
  // braço de trás com cabos
  ['H', 5, 11, 4, 3],
  ['C', 4, 14, 1, 5],
  ['c', 4, 18],
  // túnica de metal
  ['H', 9, 10, 12, 8],
  ['h', 9, 10, 12, 1],
  ['H', 7, 17, 16, 8],
  ['H', 5, 24, 20, 6],
  ['H', 6, 30, 3, 2],
  ['H', 12, 30, 3, 3],
  ['H', 19, 30, 3, 2],
  ['m', 7, 20, 16, 1],
  ['m', 5, 26, 20, 1],
  ['m', 11, 11, 1, 19],
  ['m', 18, 13, 1, 17],
  ['r', 14, 12, 1, 18],
  ['g', 9, 22],
  ['g', 20, 22],
  ['g', 8, 28],
  ['g', 22, 28],
  // cabos pendurados (ela flutua)
  ['C', 7, 32, 1, 4],
  ['C', 13, 33, 1, 4],
  ['C', 20, 32, 1, 3],
  ['c', 7, 36],
  ['c', 13, 37],
  ['c', 20, 35],
  // cajado com sol apagado e olho
  ['N', 26, 4, 1, 26],
  ['N', 25, 1, 3, 3],
  ['N', 26, 0],
  ['N', 24, 2],
  ['N', 28, 2],
  ['E', 26, 2],
  // braço da frente segurando o cajado
  ['H', 20, 11, 4, 3],
  ['M', 23, 12, 3, 3],
  ['m', 25, 13, 2, 3],
]);
/** fase 0 olho e cabos em brasa fraca; 1+ o olho queima e os cabos soltam faíscas. */
export const paletaSibilaCorrompida = (fase: number) => ({
  C: '#2a2a34',
  c: fase >= 1 ? '#ffd04a' : '#a8283a',
  R: '#a8283a',
  H: '#4a4e5e',
  h: '#8a90a4',
  M: '#9aa0b0',
  W: '#d8dce8',
  m: '#2a2e3a',
  O: '#08040a',
  E: fase >= 1 ? '#ff5a3a' : '#ff2a2a',
  e: fase >= 1 ? '#ffffff' : '#ff8a6a',
  r: fase >= 1 ? '#ff4a2a' : '#8a1a24',
  g: '#c8a060',
  N: '#5a4a3a',
  K: '#140c22',
});

// ---------- A noite do eclipse ----------

// O Gigante de Sombras: colosso de sombra e placas de ferro, olho vermelho e rachaduras de luz vermelha.
export const GIGANTE_SOMBRAS = desenhar(48, 52, [
  // fiapos de sombra acima da cabeça
  ['x', 22, 0, 1, 2],
  ['x', 26, 1, 1, 2],
  // cabeça e chifres
  ['X', 18, 0, 2, 4],
  ['X', 29, 0, 2, 4],
  ['X', 19, 3, 11, 10],
  ['P', 20, 3, 9, 3],
  ['W', 20, 3, 9, 1],
  ['p', 22, 6, 8, 4],
  ['O', 24, 7, 6, 3],
  ['E', 26, 8, 3, 1],
  ['e', 27, 8],
  ['P', 21, 10, 9, 2],
  ['r', 23, 11, 5, 1],
  // ombros e ombreiras com espinhos
  ['X', 6, 13, 36, 8],
  ['P', 6, 10, 2, 2],
  ['P', 10, 10, 2, 2],
  ['P', 36, 10, 2, 2],
  ['P', 40, 10, 2, 2],
  ['P', 4, 12, 10, 6],
  ['W', 4, 12, 10, 1],
  ['p', 4, 17, 10, 1],
  ['P', 33, 12, 11, 6],
  ['W', 33, 12, 11, 1],
  ['p', 33, 17, 11, 1],
  // tronco de sombra
  ['X', 12, 20, 24, 13],
  ...xadrez('x', 13, 29, 22, 3),
  // placas do peito e da barriga
  ['P', 15, 15, 8, 8],
  ['P', 25, 15, 8, 8],
  ['W', 15, 15, 8, 1],
  ['W', 25, 15, 8, 1],
  ['p', 15, 22, 8, 1],
  ['p', 25, 22, 8, 1],
  ['r', 23, 15, 2, 10],
  ['P', 17, 25, 14, 4],
  ['p', 17, 28, 14, 1],
  // rachaduras de luz vermelha
  ['r', 18, 17, 1, 3],
  ['r', 19, 20],
  ['r', 30, 18, 1, 2],
  ['r', 29, 20],
  ['r', 20, 26, 2, 1],
  ['r', 27, 27],
  ['q', 16, 19],
  ['q', 17, 20],
  ['q', 31, 16],
  ['q', 26, 26],
  ['q', 24, 27, 2, 1],
  // braços, braçadeiras e punhos
  ['X', 5, 18, 8, 16],
  ['P', 4, 26, 10, 4],
  ['P', 4, 34, 9, 6],
  ['W', 4, 34, 9, 1],
  ['p', 4, 39, 9, 1],
  ['X', 35, 18, 8, 16],
  ['P', 34, 26, 10, 4],
  ['P', 35, 34, 10, 6],
  ['W', 35, 34, 10, 1],
  ['p', 35, 39, 10, 1],
  ['r', 8, 21, 1, 3],
  ['r', 39, 22, 1, 3],
  ['q', 7, 31],
  ['q', 40, 30],
  // fiapos de sombra nas bordas
  ['x', 2, 20, 2, 3],
  ['x', 3, 28, 1, 4],
  ['x', 44, 22, 1, 4],
  ['x', 44, 30, 1, 3],
  // pernas, grevas e pés
  ['X', 14, 32, 8, 14],
  ['X', 26, 32, 8, 14],
  ...xadrez('x', 15, 33, 6, 3),
  ...xadrez('x', 27, 33, 6, 3),
  ['P', 14, 37, 8, 6],
  ['P', 26, 37, 8, 6],
  ['W', 14, 37, 8, 1],
  ['W', 26, 37, 8, 1],
  ['r', 17, 40, 1, 2],
  ['r', 30, 39, 1, 2],
  ['q', 19, 41],
  ['q', 28, 41],
  ['P', 12, 46, 11, 3],
  ['P', 25, 46, 12, 3],
  ['p', 12, 48, 11, 1],
  ['p', 25, 48, 12, 1],
]);
/** fase 0 rachaduras vermelhas; 1+ novas rachaduras se abrem e a luz fica laranja. */
export const paletaGiganteSombras = (fase: number) => ({
  X: '#1a1426',
  x: '#2e2440',
  P: '#4a4a5a',
  p: '#2a2a36',
  W: '#7a7a90',
  O: '#08040a',
  E: fase >= 1 ? '#ff5a3a' : '#ff2a2a',
  e: fase >= 1 ? '#ffffff' : '#ffd0d0',
  r: fase >= 1 ? '#ff6a2a' : '#c0202a',
  q: fase >= 1 ? '#ffb04a' : '#4a4a5a',
  K: '#140c22',
});

// ---------- O mascote ----------

// Lumen: corujinha mecânica de bronze, mascote de Helios, com olhos âmbar enormes que enxergam no escuro.
export const LUMEN = desenhar(16, 16, [
  // tufos
  ['N', 2, 0, 2, 2],
  ['N', 10, 0, 2, 2],
  // cabeça
  ['N', 2, 1, 10, 5],
  ['Z', 4, 1, 6, 1],
  // olhos âmbar
  ['n', 3, 2, 4, 4],
  ['n', 8, 2, 4, 4],
  ['A', 4, 3, 2, 2],
  ['A', 9, 3, 2, 2],
  ['a', 5, 3],
  ['a', 10, 3],
  // bico
  ['Y', 7, 5, 1, 2],
  // corpo e penas de placa
  ['N', 3, 6, 8, 6],
  ['Z', 5, 7, 4, 4],
  ['n', 5, 8, 4, 1],
  ['n', 5, 10, 4, 1],
  // asas
  ['C', 2, 7, 2, 4],
  ['C', 10, 7, 2, 4],
  ['c', 2, 10, 2, 1],
  ['c', 10, 10, 2, 1],
  // pés
  ['Y', 4, 12, 2, 1],
  ['Y', 8, 12, 2, 1],
]);
export const PALETA_LUMEN = {
  N: '#c08a3a',
  Z: '#f0c070',
  n: '#6a4418',
  A: '#ffb02a',
  a: '#fff0a0',
  Y: '#e0b040',
  C: '#b8642a',
  c: '#6a3418',
  K: '#140c22',
};
