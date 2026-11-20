import type { Paleta } from './Sprite';
import { desenhar, xadrez, type Passo } from './desenho';
import type { IaId } from '@/game/personagens';
import type { JuradoId } from '@/game/jurados';

// Legenda dos caracteres:
// K contorno · M metal · W branco/brilho · S pele · s pele na sombra · G ouro · B couro/madeira
// C cor da IA · D cor da IA escura · H cabelo · N rede · T toga · t toga na sombra
// A acessório · O lente · P objeto que o personagem segura · R rosado

// ---------- Gladiadores (22 × 26) ----------

/** Cassius (Claude), o Estrategista: capacete de crista alta, escudo retangular grande e gládio. */
const PASSOS_CASSIUS: Passo[] = [
  ['C', 9, 1, 5, 1],
  ['C', 8, 2, 7, 1],
  ['C', 9, 3, 5, 1],
  ['M', 7, 4, 8, 6],
  ['W', 8, 5, 1, 2],
  ['M', 6, 8, 10, 1],
  ['S', 9, 6, 4, 3],
  ['K', 10, 7],
  ['K', 12, 7],
  ['S', 10, 10, 2, 1],
  ['B', 8, 11, 6, 5],
  ['M', 9, 11, 4, 3],
  ['W', 9, 11],
  ['G', 8, 16, 6, 1],
  ['C', 8, 17, 6, 2],
  ['D', 9, 17, 1, 2],
  ['D', 11, 17, 1, 2],
  ['D', 13, 17, 1, 2],
  ['S', 9, 19, 1, 4],
  ['S', 12, 19, 1, 4],
  ['M', 9, 21, 1, 2],
  ['B', 8, 23, 2, 1],
  ['B', 12, 23, 2, 1],
  // escudo (scutum) na frente do corpo
  ['D', 2, 10, 6, 11],
  ['C', 3, 11, 4, 9],
  ['W', 3, 11, 1, 3],
  ['G', 4, 14, 2, 2],
  // braço da espada, com a manica de metal
  ['S', 14, 11, 2, 1],
  ['M', 14, 12, 1, 3],
  ['S', 15, 14],
  ['G', 16, 14],
  ['W', 17, 13],
  ['W', 18, 12],
  ['W', 19, 11],
  ['W', 20, 10],
];

/** Octavius (ChatGPT), o Versátil: sem capacete, faixa na testa, tridente e rede. */
const PASSOS_OCTAVIUS: Passo[] = [
  ['H', 8, 3, 6, 2],
  ['H', 7, 4, 1, 3],
  ['H', 14, 4, 1, 3],
  ['S', 8, 5, 6, 5],
  ['C', 8, 5, 6, 1],
  ['D', 7, 5],
  ['K', 9, 7],
  ['K', 12, 7],
  ['K', 10, 9, 2, 1],
  ['S', 10, 10, 2, 1],
  ['S', 8, 11, 6, 5],
  ['s', 10, 13, 1, 2],
  ['s', 12, 13, 1, 2],
  // proteção de ombro (galerus)
  ['M', 6, 10, 3, 3],
  ['W', 6, 10],
  ['S', 6, 13, 2, 3],
  // rede pendurada na mão esquerda
  ...xadrez('N', 1, 15, 6, 7),
  ['G', 8, 16, 6, 1],
  ['C', 8, 17, 6, 2],
  ['D', 10, 17, 2, 2],
  ['S', 9, 19, 1, 4],
  ['S', 12, 19, 1, 4],
  ['B', 9, 21, 1, 1],
  ['B', 12, 21, 1, 1],
  ['B', 8, 23, 2, 1],
  ['B', 12, 23, 2, 1],
  // tridente
  ['S', 14, 11, 2, 3],
  ['M', 17, 4, 1, 19],
  ['S', 16, 13, 2, 2],
  ['M', 15, 4, 5, 1],
  ['M', 15, 1, 1, 3],
  ['M', 17, 0, 1, 4],
  ['M', 19, 1, 1, 3],
  ['W', 15, 1],
  ['W', 17, 0],
  ['W', 19, 1],
];

/** Helios (Gemini), o Observador: coroa de raios de sol, viseira brilhante, escudo com olho e lança. */
const PASSOS_HELIOS: Passo[] = [
  // capa atrás do corpo
  ['D', 6, 11, 10, 10],
  // raios de sol
  ['G', 10, 1, 2, 3],
  ['G', 7, 2, 1, 2],
  ['G', 14, 2, 1, 2],
  ['G', 5, 4, 2, 1],
  ['G', 15, 4, 2, 1],
  ['M', 8, 4, 6, 6],
  ['W', 8, 5],
  ['C', 8, 7, 6, 1],
  ['W', 9, 7],
  ['S', 9, 9, 4, 1],
  ['S', 10, 10, 2, 1],
  ['M', 8, 11, 6, 5],
  ['C', 10, 12, 2, 2],
  ['W', 10, 12],
  ['G', 8, 16, 6, 1],
  ['M', 8, 17, 6, 2],
  ['C', 8, 18, 6, 1],
  ['S', 9, 19, 1, 4],
  ['S', 12, 19, 1, 4],
  ['M', 9, 20, 1, 3],
  ['M', 12, 20, 1, 3],
  ['B', 8, 23, 2, 1],
  ['B', 12, 23, 2, 1],
  // escudo redondo com o olho que tudo vê
  ['G', 3, 11, 3, 1],
  ['G', 2, 12, 5, 1],
  ['G', 1, 13, 7, 4],
  ['G', 2, 17, 5, 1],
  ['G', 3, 18, 3, 1],
  ['C', 2, 13, 5, 4],
  ['W', 3, 14, 3, 2],
  ['K', 4, 14, 1, 2],
  // lança longa
  ['S', 14, 11, 2, 3],
  ['B', 17, 3, 1, 21],
  ['M', 17, 0, 1, 3],
  ['W', 17, 0],
  ['S', 16, 13, 2, 2],
];

const PASSOS_GLADIADOR: Record<IaId, Passo[]> = { claude: PASSOS_CASSIUS, chatgpt: PASSOS_OCTAVIUS, gemini: PASSOS_HELIOS };

/**
 * O gladiador evolui com a liga (índice 0 = Recrutas … 4 = Imperadores):
 * Centurião ganha capa vermelha, Pretoriano ombreiras douradas e Imperador o
 * manto roxo com faixa dourada na cabeça. Cada liga mantém o que veio antes.
 */
export function gradeGladiador(ia: IaId, liga = 0): string[] {
  const atras: Passo[] = [];
  const frente: Passo[] = [];
  if (liga >= 4) atras.push(['P', 4, 10, 14, 13], ['G', 4, 22, 14, 1]);
  else if (liga >= 2) atras.push(['V', 5, 10, 12, 11]);
  if (liga >= 3) frente.push(['G', 6, 10, 3, 2], ['G', 13, 10, 3, 2]);
  if (liga >= 4) frente.push(['G', 8, 4, 6, 1]);
  return desenhar(23, 26, [...atras, ...PASSOS_GLADIADOR[ia], ...frente]);
}

export const GLADIADORES: Record<IaId, string[]> = { claude: gradeGladiador('claude'), chatgpt: gradeGladiador('chatgpt'), gemini: gradeGladiador('gemini') };

// ---------- Jurados e Pretor (16 × 17, busto) ----------

const TOGA: [string, number, number, number, number] = ['T', 3, 10, 10, 6];

export const JURADOS_PIXEL: Record<JuradoId, string[]> = {
  // Lógico: cabelo penteado, óculos redondos, livro na mão.
  logico: desenhar(16, 17, [
    ['H', 5, 2, 6, 2],
    ['H', 4, 3, 1, 3],
    ['S', 5, 3, 6, 6],
    ['H', 5, 3, 6, 1],
    ['O', 5, 5, 2, 1],
    ['O', 9, 5, 2, 1],
    ['K', 7, 5, 2, 1],
    ['K', 6, 5],
    ['K', 9, 5],
    ['K', 7, 7, 2, 1],
    ['S', 7, 9, 2, 1],
    TOGA,
    ['t', 5, 11, 1, 4],
    ['P', 9, 12, 4, 3],
    ['W', 9, 13, 4, 1],
  ]),
  // Cético: careca, sobrancelha levantada, boca torta, braços cruzados.
  cetico: desenhar(16, 17, [
    ['S', 5, 3, 6, 6],
    ['H', 4, 4, 1, 3],
    ['H', 11, 4, 1, 3],
    ['W', 6, 3, 2, 1],
    ['K', 5, 4, 2, 1],
    ['K', 9, 3, 2, 1],
    ['K', 6, 5],
    ['K', 9, 5],
    ['K', 7, 7, 3, 1],
    ['K', 6, 8],
    ['S', 7, 9, 2, 1],
    TOGA,
    ['S', 4, 12, 8, 2],
    ['s', 7, 12, 2, 2],
    ['t', 4, 14, 8, 1],
  ]),
  // Empático: cabelo comprido, bochechas rosadas, sorriso, mão no coração.
  empatico: desenhar(16, 17, [
    ['H', 4, 2, 8, 9],
    ['S', 5, 4, 6, 5],
    ['H', 5, 3, 6, 1],
    ['K', 6, 5],
    ['K', 9, 5],
    ['R', 5, 6],
    ['R', 10, 6],
    ['K', 6, 7],
    ['K', 9, 7],
    ['K', 7, 8, 2, 1],
    ['S', 7, 9, 2, 1],
    ['T', 3, 11, 10, 5],
    ['P', 6, 12],
    ['P', 8, 12],
    ['P', 6, 13, 3, 1],
    ['P', 7, 14],
    ['S', 9, 13, 2, 1],
  ]),
  // Tradicionalista: idoso, barba branca longa, coroa de louros, cajado.
  tradicionalista: desenhar(16, 17, [
    ['B', 13, 1, 1, 15],
    ['G', 13, 0],
    ['S', 5, 3, 6, 5],
    ['H', 5, 2, 6, 1],
    ['H', 4, 3, 1, 3],
    ['H', 11, 3, 1, 3],
    ['A', 4, 2],
    ['A', 5, 1, 2, 1],
    ['A', 9, 1, 2, 1],
    ['A', 11, 2],
    ['A', 3, 3],
    ['A', 12, 3],
    ['H', 5, 4, 2, 1],
    ['H', 9, 4, 2, 1],
    ['K', 6, 5],
    ['K', 9, 5],
    ['H', 5, 7, 6, 3],
    ['H', 6, 10, 4, 2],
    ['K', 7, 7, 2, 1],
    ['T', 3, 11, 4, 5],
    ['T', 10, 11, 3, 5],
    ['t', 3, 13, 4, 1],
  ]),
  // Estrategista: cabelo curto, cicatriz no olho, sorriso de canto, mapa com rota.
  estrategista: desenhar(16, 17, [
    ['H', 5, 2, 6, 2],
    ['H', 4, 3, 1, 2],
    ['S', 5, 4, 6, 5],
    ['K', 5, 4, 2, 1],
    ['K', 9, 4, 2, 1],
    ['K', 6, 5],
    ['K', 9, 5],
    ['R', 10, 4, 1, 3],
    ['K', 8, 7, 2, 1],
    ['K', 10, 6],
    ['S', 7, 9, 2, 1],
    TOGA,
    ['t', 4, 11, 1, 4],
    ['P', 8, 12, 5, 3],
    ['A', 9, 14],
    ['A', 10, 13],
    ['A', 11, 12],
    ['K', 12, 12],
  ]),
  // Cientista: cabelo espetado, óculos de proteção na testa, cara de "eureka", frasco.
  cientista: desenhar(16, 17, [
    ['H', 4, 1, 1, 2],
    ['H', 6, 0, 1, 2],
    ['H', 8, 1, 1, 1],
    ['H', 10, 0, 1, 2],
    ['H', 12, 1, 1, 2],
    ['H', 4, 2, 9, 2],
    ['S', 5, 4, 6, 5],
    ['A', 4, 3, 8, 1],
    ['O', 5, 3, 2, 1],
    ['O', 9, 3, 2, 1],
    ['K', 6, 5],
    ['K', 9, 5],
    ['K', 7, 7, 2, 2],
    ['S', 7, 9, 2, 1],
    TOGA,
    ['W', 11, 10],
    ['W', 10, 11, 3, 1],
    ['P', 10, 12, 3, 2],
    ['W', 10, 12],
  ]),
  // Comerciante: chapéu, rosto redondo, bigode, saco de moedas.
  comerciante: desenhar(16, 17, [
    ['A', 5, 0, 6, 2],
    ['A', 3, 2, 10, 1],
    ['S', 4, 3, 8, 6],
    ['K', 6, 5],
    ['K', 9, 5],
    ['R', 4, 6],
    ['R', 11, 6],
    ['H', 6, 7, 4, 1],
    ['s', 5, 8, 6, 1],
    ['S', 7, 9, 2, 1],
    ['T', 2, 10, 12, 6],
    ['t', 2, 12, 12, 1],
    ['P', 10, 12, 3, 3],
    ['G', 11, 11],
    ['G', 11, 13],
  ]),
  // Artista: boina, cabelo cacheado, olhos sonhadores, cachecol e pincel.
  artista: desenhar(16, 17, [
    ['H', 4, 3, 1, 4],
    ['H', 11, 3, 1, 4],
    ['H', 4, 7],
    ['H', 11, 7],
    ['S', 5, 3, 6, 6],
    ['A', 4, 1, 7, 2],
    ['A', 10, 0],
    ['K', 5, 5, 2, 1],
    ['K', 9, 5, 2, 1],
    ['K', 7, 7, 2, 1],
    ['P', 5, 9, 6, 1],
    ['P', 9, 10, 1, 2],
    TOGA,
    ['O', 4, 12],
    ['R', 6, 14],
    ['B', 12, 9, 1, 5],
    ['A', 12, 8],
  ]),
};

/** Pretor Supremo: louros de ouro, olhar sério, toga vermelha com faixa dourada. */
export const PRETOR = desenhar(16, 17, [
  ['S', 5, 3, 6, 6],
  ['H', 5, 2, 6, 1],
  ['H', 4, 3, 1, 2],
  ['H', 11, 3, 1, 2],
  ['A', 4, 2],
  ['A', 5, 1, 6, 1],
  ['A', 11, 2],
  ['A', 3, 3],
  ['A', 12, 3],
  ['K', 5, 4, 2, 1],
  ['K', 9, 4, 2, 1],
  ['K', 6, 5],
  ['K', 9, 5],
  ['K', 7, 7, 2, 1],
  ['S', 7, 9, 2, 1],
  ['T', 2, 10, 12, 6],
  ['G', 2, 10, 12, 1],
  ['G', 7, 11, 1, 5],
]);

/** Martelo do Pretor. */
export const MARTELO = ['BBBBB...', 'BBBBB...', '..B.....', '...B....', '....B...', '.....B..'];

/** Ramo de louros (o da direita é o mesmo, espelhado). */
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
  s: '#c48a62',
  G: '#f2c14e',
  B: '#7a4a2a',
  O: '#9fe8ff',
  R: '#f07a8a',
  N: '#d8cfb4',
  V: '#b0202c',
  P: '#6a2a8a',
};

/** "r g b" → "rgb(r g b)", com fator para escurecer. */
function rgb(cor: string, fator = 1): string {
  const [r, g, b] = cor.split(' ').map((n) => Math.round(Number(n) * fator));
  return `rgb(${r} ${g} ${b})`;
}

/** "#rrggbb" escurecido, para a dobra da toga. */
function escurecer(hex: string, fator = 0.7): string {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v * fator));
  return `rgb(${c.join(' ')})`;
}

/** Armadura: a padrão (metal), a da cor da IA (Maestria 10) ou a dourada (Maestria 50). */
export type Armadura = 'padrao' | 'cor' | 'ouro';

/** Armadura da Maestria 50, uma de cada combatente: bronze antigo, almirante e ouro solar. */
const OURO_DA_IA: Record<string, Paleta> = {
  claude: { M: '#b8733a', W: '#f0b070' },
  chatgpt: { M: '#24407a', W: '#f2c14e' },
  gemini: { M: '#f5c030', W: '#fff6c0' },
};

export function paletaGladiador(corIa: string, armadura: Armadura = 'padrao', ia?: string): Paleta {
  const metal: Paleta =
    armadura === 'ouro' ? ((ia && OURO_DA_IA[ia]) || { M: '#e8b84a', W: '#fff1b0' }) : armadura === 'cor' ? { M: rgb(corIa, 0.85), W: rgb(corIa, 1.25) } : {};
  return { ...BASE, C: rgb(corIa), D: rgb(corIa, 0.55), H: '#3a2414', ...metal };
}

export function paletaBusto(cores: { toga: string; cabelo: string; acessorio: string; objeto: string }): Paleta {
  return { ...BASE, T: cores.toga, t: escurecer(cores.toga), H: cores.cabelo, A: cores.acessorio, P: cores.objeto };
}

export const PALETA_OURO: Paleta = { G: '#f2c14e' };
export const PALETA_MARTELO: Paleta = { B: '#a06a3a' };
