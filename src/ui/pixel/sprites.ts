import type { Paleta } from './Sprite';

// Desenhos em pixel. Legenda:
// K contorno · M metal · W brilho · S pele · G ouro · B couro
// C cor da IA · D cor da IA escura · H cabelo · T toga · A acessório · O lente

/** Gladiador de frente: escudo à esquerda, espada erguida à direita. 16 × 20. */
export const GLADIADOR = [
  '......CCCC......',
  '.....CCCCCC.....',
  '.....KKKKKK.....',
  '....KMMMMMMK....',
  '....KMWMMMMK....',
  '....KMKKKKMK....',
  '....KMKSSKMK....',
  '....KMMSSMMK....',
  '.....KKKKKK.....',
  '..CCKGGGGGGKCC.W',
  '.KCKGMMMMMMGKCKW',
  'KDDKMMGMMGMMKCKW',
  'KDGDKMMMMMMKSSKW',
  'KDDDKMMMMMMKSSKG',
  'KDGDKBBBBBBK.KK.',
  'KDDDKBGBBGBK....',
  '.KDK.KSK.KSK....',
  '..K..KSK.KSK....',
  '.....KSK.KSK....',
  '....KBBK.KBBK...',
];

const BUSTO = [
  '...HHHHHH...',
  '..HHHHHHHH..',
  '..HSSSSSSH..',
  '..SKSSSSKS..',
  '..SSSSSSSS..',
  '..SSSKKSSS..',
  '...SSSSSS...',
  '....SSSS....',
  '..TTTTTTTT..',
  '.TTTWTTTTTT.',
  'TTTTWWTTTTTT',
  'TTTTTWTTTTTT',
];

export type Acessorio = 'oculos' | 'louros' | 'boina' | 'chapeu' | 'protetor' | 'nenhum';

const TROCAS: Record<Acessorio, Record<number, string>> = {
  nenhum: {},
  oculos: { 3: '..OKOSSOKO..' },
  louros: { 0: '..AHHHHHHA..', 1: '.AHHHHHHHHA.' },
  boina: { 0: '..AAAAAAA...', 1: '.AAAAAAAAA..' },
  chapeu: { 0: '...AAAAAA...', 1: '.AAAAAAAAAA.' },
  protetor: { 3: '..AKAAAAKA..' },
};

/** Busto de jurado (ou do Pretor) com o acessório pedido. 12 × 12. */
export function gradeBusto(acessorio: Acessorio): string[] {
  const trocas = TROCAS[acessorio];
  return BUSTO.map((linha, i) => trocas[i] ?? linha);
}

/** Martelo do Pretor. 8 × 6. */
export const MARTELO = ['BBBBB...', 'BBBBB...', '..B.....', '...B....', '....B...', '.....B..'];

/** Ramo de louros (o da direita é o mesmo, espelhado). 10 × 10. */
export const LOUROS = [
  '....G.....',
  '...GG.....',
  '..GG.G....',
  '.GG..GG...',
  '.G..GG....',
  'GG.GG.....',
  'G..G......',
  'GGG.......',
  '.GG.......',
  '..G.......',
];

const BASE: Paleta = {
  K: '#140c22',
  M: '#b9c2dc',
  W: '#ffffff',
  S: '#e9b48a',
  G: '#f2c14e',
  B: '#7a4a2a',
  O: '#9fe8ff',
};

/** "r g b" → "rgb(r g b)", com fator para escurecer. */
function rgb(cor: string, fator = 1): string {
  const [r, g, b] = cor.split(' ').map((n) => Math.round(Number(n) * fator));
  return `rgb(${r} ${g} ${b})`;
}

export function paletaGladiador(corIa: string): Paleta {
  return { ...BASE, C: rgb(corIa), D: rgb(corIa, 0.55) };
}

export function paletaBusto(toga: string, cabelo: string, acessorio: string): Paleta {
  return { ...BASE, T: toga, W: '#ffffff55', H: cabelo, A: acessorio };
}

export const PALETA_OURO: Paleta = { G: '#f2c14e' };
export const PALETA_MARTELO: Paleta = { B: '#a06a3a' };
