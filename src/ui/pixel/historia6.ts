import { desenhar, type Passo } from './desenho';

/**
 * Sexta leva de personagens do modo História em pixel: o capítulo secreto "Os Três", o final
 * verdadeiro. Debaixo da arena, no Hipogeu, vive O Núcleo, a cópia de reserva do Censor: um coração
 * de máquina pendurado por cabos, com o olho vermelho enorme no meio e anéis de engrenagem em volta.
 * Também o Guardião do Núcleo (sentinela feita de grades de jaula e correntes de elevador) e as
 * páginas voadoras que acompanham o Cassius. Mesmo estilo de historia2.ts e historia5.ts: formas
 * grossas, 2 a 3 tons por material, olhos vermelhos (E) nas máquinas do Censor e contorno K
 * automático. Todos virados para a direita; a tela de luta espelha os inimigos.
 */

/** Disco cheio feito de faixas horizontais, para anéis, discos e o olho. */
const circulo = (cor: string, cx: number, cy: number, r: number): Passo[] => {
  const out: Passo[] = [];
  for (let dy = -r; dy <= r; dy++) {
    const meia = Math.floor(Math.sqrt(r * r - dy * dy) + 0.5);
    out.push([cor, cx - meia, cy + dy, meia * 2 + 1, 1]);
  }
  return out;
};

// ---------- O Núcleo ----------

// O Núcleo: coração de máquina do Censor, pendurado por cabos, com anel de engrenagem, placas rebitadas e o olho vermelho enorme no meio.
export const NUCLEO = desenhar(52, 52, [
  // cabos que o seguram lá de cima
  ['C', 10, 0, 2, 3],
  ['C', 11, 3, 2, 3],
  ['C', 12, 6, 2, 4],
  ['C', 24, 0, 3, 6],
  ['c', 26, 0, 1, 6],
  ['C', 38, 0, 2, 3],
  ['C', 37, 3, 2, 3],
  ['C', 36, 6, 2, 4],
  // dentes do anel de engrenagem
  ['G', 22, 4, 7, 4],
  ['G', 22, 46, 7, 3],
  ['G', 2, 23, 4, 7],
  ['G', 45, 23, 4, 7],
  ['G', 6, 8, 5, 5],
  ['G', 39, 8, 5, 5],
  ['G', 6, 41, 5, 5],
  ['G', 39, 41, 5, 5],
  // anel de engrenagem e o sulco escuro
  ...circulo('G', 25, 27, 20),
  ...circulo('g', 25, 27, 18),
  // parafusos do anel
  ['b', 25, 8],
  ['b', 25, 46],
  ['b', 6, 27],
  ['b', 44, 27],
  ['b', 11, 13],
  ['b', 39, 13],
  ['b', 11, 41],
  ['b', 39, 41],
  // corpo de placas rebitadas
  ...circulo('P', 25, 27, 16),
  ['p', 25, 11, 1, 8],
  ['p', 25, 36, 1, 8],
  ['p', 9, 27, 6, 1],
  ['p', 36, 27, 6, 1],
  ['p', 14, 16],
  ['p', 15, 17],
  ['p', 16, 18],
  ['p', 36, 16],
  ['p', 35, 17],
  ['p', 34, 18],
  ['p', 14, 38],
  ['p', 15, 37],
  ['p', 16, 36],
  ['p', 36, 38],
  ['p', 35, 37],
  ['p', 34, 36],
  // reflexos nas placas
  ['Q', 13, 14, 3, 1],
  ['Q', 12, 17, 1, 4],
  ['Q', 20, 12, 4, 1],
  // rebites
  ['b', 12, 23],
  ['b', 12, 31],
  ['b', 38, 23],
  ['b', 38, 31],
  ['b', 20, 14],
  ['b', 30, 14],
  ['b', 20, 40],
  ['b', 30, 40],
  // grelha de respiro embaixo (acende nas fases 1 e 2)
  ['p', 19, 41, 12, 3],
  ['X', 20, 42, 2, 1],
  ['X', 23, 42, 2, 1],
  ['X', 26, 42, 2, 1],
  ['X', 29, 42, 1, 1],
  // rachaduras e frestas das placas (escuras na fase 0, brilham depois)
  ['X', 15, 13],
  ['X', 16, 14],
  ['X', 16, 15],
  ['X', 17, 16],
  ['X', 18, 16],
  ['X', 35, 20],
  ['X', 36, 21],
  ['X', 37, 21],
  ['X', 38, 22],
  ['X', 13, 33],
  ['X', 14, 34],
  ['X', 15, 34],
  ['X', 15, 35],
  ['X', 33, 39],
  ['X', 34, 40],
  ['X', 35, 40],
  ['X', 9, 26, 4, 1],
  ['X', 37, 28, 4, 1],
  // miolo em volta do olho e a órbita
  ...circulo('I', 25, 27, 11),
  ...circulo('O', 25, 27, 9),
  // o olho enorme
  ['W', 17, 25, 17, 5],
  ['W', 19, 23, 13, 9],
  ['W', 22, 21, 7, 13],
  ...circulo('E', 25, 27, 5),
  ['o', 24, 24, 3, 7],
  ['h', 22, 24, 2, 2],
  ['h', 27, 29],
  // cabos arrebentados pendurados embaixo, com a ponta em brasa
  ['C', 14, 45, 2, 3],
  ['C', 35, 45, 2, 3],
  ['X', 14, 48, 2, 1],
  ['X', 35, 48, 2, 1],
]);
/**
 * fase 0 ferro enferrujado e vermelho; 1 placas rachadas e abertas com brilho laranja por dentro;
 * 2 o miolo fica exposto, branco de quente, e o olho arde em vermelho e branco.
 */
export const paletaNucleo = (fase: number) => ({
  C: fase >= 2 ? '#c82a1a' : '#8a1a1a',
  c: '#4a0a0c',
  G: fase >= 2 ? '#4a2e26' : fase >= 1 ? '#5a3a2e' : '#6a4a3a',
  g: fase >= 2 ? '#1e100c' : '#2a1a14',
  b: '#c8a060',
  P: fase >= 2 ? '#3a2a2a' : fase >= 1 ? '#4a3a38' : '#5a4a46',
  p: '#2a2024',
  Q: fase >= 2 ? '#6a5450' : fase >= 1 ? '#7a6460' : '#8a7670',
  X: fase >= 2 ? '#fff0c0' : fase >= 1 ? '#ff8a2a' : '#2a2024',
  I: fase >= 2 ? '#fff8e8' : fase >= 1 ? '#ff6a1a' : '#3a1410',
  O: fase >= 2 ? '#3a0a06' : '#100404',
  W: fase >= 2 ? '#fff6ee' : fase >= 1 ? '#f0e0d0' : '#e8dcd0',
  E: fase >= 2 ? '#ff5a4a' : fase >= 1 ? '#ff2a1a' : '#d81e1a',
  o: fase >= 2 ? '#8a0a06' : '#1a0404',
  h: '#ffffff',
  K: '#140c22',
});

// ---------- O Guardião do Núcleo ----------

// Guardião do Núcleo: sentinela do Hipogeu feita de grades de jaula velhas e correntes de elevador, com olho vermelho na cabeça-gaiola, contrapeso numa mão e gancho na outra.
export const GUARDIAO_NUCLEO = desenhar(30, 38, [
  // cabeça-gaiola
  ['F', 11, 0, 10, 2],
  ['O', 12, 2, 8, 6],
  ['E', 17, 4, 3, 2],
  ['e', 16, 4, 1, 2],
  ['B', 11, 2, 1, 6],
  ['B', 14, 2, 1, 6],
  ['B', 20, 2, 1, 6],
  ['F', 11, 8, 10, 1],
  ['g', 12, 0],
  ['g', 19, 0],
  // pescoço de corrente
  ['s', 15, 9, 2, 2],
  // tronco-jaula com o coração vermelho preso
  ['F', 7, 11, 18, 2],
  ['f', 7, 12, 18, 1],
  ['O', 8, 13, 16, 12],
  ['R', 13, 17, 5, 4],
  ['r', 14, 18, 3, 2],
  ['B', 8, 13, 1, 12],
  ['B', 11, 13, 1, 12],
  ['B', 14, 13, 1, 12],
  ['B', 17, 13, 1, 12],
  ['B', 20, 13, 1, 12],
  ['B', 23, 13, 1, 12],
  ['L', 15, 21, 2, 3],
  ['F', 7, 25, 18, 2],
  ['f', 7, 26, 18, 1],
  ['g', 8, 11],
  ['g', 23, 11],
  // braço de trás: corrente com contrapeso de elevador
  ['F', 4, 11, 4, 3],
  ['S', 5, 14, 2, 2],
  ['s', 5, 16, 2, 1],
  ['S', 5, 17, 2, 2],
  ['s', 5, 19, 2, 1],
  ['S', 5, 20, 2, 2],
  ['s', 5, 22, 2, 1],
  ['S', 5, 23, 2, 2],
  ['W', 3, 25, 6, 5],
  ['w', 3, 29, 6, 1],
  ['T', 4, 26, 4, 1],
  // braço da frente: barra, corrente e gancho
  ['F', 24, 11, 4, 3],
  ['B', 25, 14, 2, 6],
  ['S', 25, 20, 2, 2],
  ['s', 26, 22],
  ['S', 25, 23, 2, 2],
  ['s', 26, 25],
  ['T', 25, 26, 1, 3],
  ['T', 25, 28, 3, 1],
  ['T', 27, 27],
  // pernas de barra com braçadeiras
  ['F', 9, 27, 4, 7],
  ['F', 19, 27, 4, 7],
  ['f', 9, 30, 4, 1],
  ['f', 19, 30, 4, 1],
  ['B', 10, 27, 1, 7],
  ['B', 20, 27, 1, 7],
  // pés
  ['G', 8, 33, 6, 2],
  ['G', 18, 33, 7, 2],
]);
export const PALETA_GUARDIAO_NUCLEO = {
  F: '#5a4a3a',
  f: '#3a2e24',
  B: '#8a7a6a',
  O: '#140a08',
  E: '#ff2a2a',
  e: '#7a1010',
  R: '#c8201a',
  r: '#ff6a4a',
  L: '#b8862a',
  S: '#9a9aa8',
  s: '#5a5a68',
  W: '#4a4a52',
  w: '#2a2a30',
  T: '#a8a8b0',
  G: '#2a221c',
  g: '#c8a060',
  K: '#140c22',
};

// ---------- Páginas voadoras ----------

// Páginas voadoras: três folhas de livro creme, com linhas de texto, que flutuam perto do Cassius.
export const PAGINAS = desenhar(14, 10, [
  ['P', 0, 3, 4, 3],
  ['p', 3, 3, 1, 3],
  ['l', 1, 4, 2, 1],
  ['P', 6, 0, 3, 3],
  ['p', 6, 2, 3, 1],
  ['l', 7, 1],
  ['P', 8, 4, 4, 3],
  ['l', 9, 5, 2, 1],
  ['p', 8, 6, 4, 1],
]);
export const PALETA_PAGINAS = {
  P: '#f4ead0',
  p: '#c8b890',
  l: '#7a6a8a',
  K: '#140c22',
};
