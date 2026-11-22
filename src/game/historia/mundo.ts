import type { Fala, Falante, Lugar } from './roteiro';

/**
 * O MUNDO VISTO DE CIMA (22/11/2026, o Lucas quis "Undertale + Stardew Valley + Hollow
 * Knight"): um mapa de ladrilhos para andar livre, para todos os lados, com um botão
 * só para interagir (ler, examinar, falar). As pessoas andam sozinhas. Funções puras.
 *
 * Medidas em ladrilhos: x para a direita, y para baixo. O gladiador ocupa a parte de
 * baixo do ladrilho (os pés): uma caixa de 0,6 × 0,35.
 */

/** Os ladrilhos do mapa (um caractere cada). */
export type Ladrilho =
  | '#' // parede
  | 'J' // parede com janela
  | 'E' // estante de livros
  | '.' // chão de pedra
  | 'c' // tapete
  | 'T' // mesa
  | 'S' // estátua
  | 'p' // coluna
  | 'v' // castiçal (ou tocha)
  | 'P' // a saída (escada, porta)
  | 'o' // nicho de ossos (catacumbas)
  | 'm' // chão de mármore
  | 'f' // fonte
  | 't' // barraca de feira
  | 'g' // grade de ferro
  | 'x' // monte de sucata (ou caixotes)
  | 'M' // a máquina violeta do Arquivo
  | 'N' // parede com nomes gravados
  | 'a' // areia (o pátio do Ludus)
  | 'D' // boneco de treino
  | 'F'; // a forja do ferreiro

// Novos (22/11/2026, mapas do Octavius e do Helios): água, barril, caixote, amarra, farol, casco de navio,
// banco de remo, tambor, cartaz, telescópio, planetário, mapa do céu, janela acesa, chaminé, parapeito,
// tripé do oráculo, espelho, arquibancada, camarote e mural.
const SOLIDOS = new Set<string>(['#', 'J', 'E', 'T', 'S', 'p', 'v', 'o', 'f', 't', 'g', 'x', 'M', 'N', 'D', 'F', 'w', 'b', 'k', 'r', 'H', 'n', 'q', 'A', 'C', 'U', 'O', 'K', 'W', 'h', 'V', 'Q', 'Y', 'B', 'X', 'I', 'G', 'L', 'z', 'l', 'R', 'j', 'i', '1', '2', '3']);

export interface Coisa {
  id: string;
  /** Onde fica (ladrilho). */
  x: number;
  y: number;
  falas: Fala[];
  /** Precisa examinar para a saída abrir. */
  obrigatorio?: boolean;
  /** Pedaço da chave do capítulo secreto. */
  segredo?: string;
}

export interface Pessoa {
  id: string;
  quem: Falante;
  /** Onde começa e para onde anda (vai e volta entre os pontos). */
  rota: [number, number][];
  falas: Fala[];
  obrigatorio?: boolean;
  /** Inimigo de ronda (22/11/2026): anda e olha para a frente; se vê o gladiador, começa o duelo. */
  inimigo?: string;
}

export interface Mundo {
  id: string;
  /** O mapa: uma linha por string. */
  mapa: string[];
  objetivo: string;
  /** Onde o gladiador começa. */
  inicio: [number, number];
  coisas: Coisa[];
  pessoas: Pessoa[];
  /** O tema das cores (biblioteca, porto, observatório...). */
  tema: TemaMundo;
  /** O lugar para a música e para o cartão do save. */
  lugar: Lugar;
  /**
   * Como se sai daqui (22/11/2026, pedido do Lucas: cada mapa com a sua saída, ou nenhuma).
   * Com `estilo`, o mapa tem o ladrilho P desenhado do jeito do lugar e com o nome dele.
   * Sem `estilo`, não há lugar de saída: depois de ver o que precisa, aparece um botão.
   */
  saida?: SaidaMundo;
}

export type EstiloSaida = 'escada' | 'arco' | 'portao' | 'prancha' | 'escadaMao' | 'grade' | 'porta';
export interface SaidaMundo {
  rotulo: string;
  estilo?: EstiloSaida;
}

/** As cores do mapa: biblioteca, catacumbas (escuro, com tochas), Fórum (claro, ao ar livre) e o túnel. */
export type TemaMundo = 'biblioteca' | 'catacumbas' | 'forum' | 'tunel' | 'ludus' | 'porto' | 'navio' | 'mercado' | 'observatorio' | 'telhados' | 'aqueduto' | 'templo' | 'arena';

export type Direcao = 'cima' | 'baixo' | 'esq' | 'dir';

export interface EstadoMundo {
  tempo: number;
  x: number;
  y: number;
  dir: Direcao;
  andando: boolean;
  /** Quem e o que já viu ou falou. */
  vistos: string[];
  /** Onde cada pessoa está (vai e volta na rota). */
  pessoas: Record<string, { x: number; y: number; alvo: number; esperaAte: number; dir: Direcao }>;
  fim: boolean;
}

export interface EntradaMundo {
  cima: boolean;
  baixo: boolean;
  esq: boolean;
  dir: boolean;
}

export const VELOCIDADE_MUNDO = 3.4; // ladrilhos por segundo
const VELOCIDADE_PESSOA = 1.2;
const PERTO = 1.25;

export function ladrilhoEm(m: Mundo, x: number, y: number): string {
  return m.mapa[Math.floor(y)]?.[Math.floor(x)] ?? '#';
}

/** Dá para estar com os pés em (x, y)? (Paredes, móveis e pessoas seguram.) */
export function livre(m: Mundo, x: number, y: number, pessoas: EstadoMundo['pessoas'] = {}): boolean {
  const meio = 0.3;
  const fundo = 0.32;
  for (const [cx, cy] of [
    [x - meio, y - fundo],
    [x + meio, y - fundo],
    [x - meio, y - 0.02],
    [x + meio, y - 0.02],
  ] as const) {
    if (SOLIDOS.has(ladrilhoEm(m, cx, cy))) return false;
  }
  for (const p of Object.values(pessoas)) if (Math.abs(p.x - x) < 0.55 && Math.abs(p.y - y) < 0.35) return false;
  return true;
}

export function novoMundo(m: Mundo): EstadoMundo {
  return {
    tempo: 0,
    x: m.inicio[0] + 0.5,
    y: m.inicio[1] + 0.8,
    dir: 'baixo',
    andando: false,
    vistos: [],
    pessoas: Object.fromEntries(m.pessoas.map((p) => [p.id, { x: p.rota[0]![0] + 0.5, y: p.rota[0]![1] + 0.8, alvo: 0, esperaAte: 0, dir: 'baixo' as Direcao }])),
    fim: false,
  };
}

/** Um passo do mundo (dt em ms). `parado`: durante uma conversa ninguém anda. */
export function passoMundo(m: Mundo, s: EstadoMundo, e: EntradaMundo, dt: number, parado = false): EstadoMundo {
  if (s.fim) return s;
  const seg = dt / 1000;
  const tempo = s.tempo + dt;
  let { x, y, dir } = s;
  let andando = false;
  if (!parado) {
    const dx = (e.dir ? 1 : 0) - (e.esq ? 1 : 0);
    const dy = (e.baixo ? 1 : 0) - (e.cima ? 1 : 0);
    if (dx || dy) {
      andando = true;
      const n = dx && dy ? Math.SQRT1_2 : 1;
      const passo = VELOCIDADE_MUNDO * seg * n;
      // Anda em x e em y separados: encostando numa parede, desliza ao longo dela.
      if (dx && livre(m, x + dx * passo, y, s.pessoas)) x += dx * passo;
      if (dy && livre(m, x, y + dy * passo, s.pessoas)) y += dy * passo;
      dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'dir' : 'esq') : dy > 0 ? 'baixo' : 'cima';
      if (dx && dy) dir = dx > 0 ? 'dir' : 'esq';
    }
  }
  // As pessoas vão e voltam na rota, com uma pausa em cada ponto.
  const pessoas = { ...s.pessoas };
  if (!parado) {
    for (const p of m.pessoas) {
      const at = pessoas[p.id]!;
      if (p.rota.length < 2 || tempo < at.esperaAte || s.vistos.includes(p.id)) continue;
      // Perto do gladiador, a pessoa para e olha para ele (o inimigo de ronda não: segue a ronda).
      if (!p.inimigo && Math.hypot(at.x - x, at.y - y) < PERTO + 0.4) continue;
      const [ax, ay] = p.rota[at.alvo]!;
      const tx = ax + 0.5;
      const ty = ay + 0.8;
      const ddx = tx - at.x;
      const ddy = ty - at.y;
      const d = Math.hypot(ddx, ddy);
      if (d < 0.05) {
        pessoas[p.id] = { ...at, alvo: (at.alvo + 1) % p.rota.length, esperaAte: tempo + 1400 };
        continue;
      }
      const passo = Math.min(d, VELOCIDADE_PESSOA * seg);
      pessoas[p.id] = { ...at, x: at.x + (ddx / d) * passo, y: at.y + (ddy / d) * passo, dir: Math.abs(ddx) > Math.abs(ddy) ? (ddx > 0 ? 'dir' : 'esq') : ddy > 0 ? 'baixo' : 'cima' };
    }
  }
  let r: EstadoMundo = { ...s, tempo, x, y, dir, andando, pessoas };
  // A saída: pisou nela com tudo o que precisava visto.
  if (ladrilhoEm(m, x, y - 0.1) === 'P' && saidaAbertaMundo(m, r)) r = { ...r, fim: true };
  return r;
}

/** O que dá para interagir agora: a pessoa ou coisa mais perto, na frente do gladiador. */
export function pertoDe(m: Mundo, s: EstadoMundo): { tipo: 'coisa'; c: Coisa } | { tipo: 'pessoa'; p: Pessoa } | null {
  const frente = { cima: [0, -0.6], baixo: [0, 0.4], esq: [-0.6, 0], dir: [0.6, 0] }[s.dir];
  const fx = s.x + frente[0]!;
  const fy = s.y - 0.3 + frente[1]!;
  let melhor: { d: number; r: { tipo: 'coisa'; c: Coisa } | { tipo: 'pessoa'; p: Pessoa } } | null = null;
  for (const p of m.pessoas) {
    if (p.inimigo) continue;
    const at = s.pessoas[p.id]!;
    const d = Math.hypot(at.x - fx, at.y - 0.3 - fy);
    if (d < PERTO && (!melhor || d < melhor.d)) melhor = { d, r: { tipo: 'pessoa', p } };
  }
  for (const c of m.coisas) {
    const d = Math.hypot(c.x + 0.5 - fx, c.y + 0.5 - fy);
    if (d < PERTO && (!melhor || d < melhor.d)) melhor = { d, r: { tipo: 'coisa', c } };
  }
  return melhor?.r ?? null;
}

/**
 * Algum inimigo de ronda pegou o gladiador? Encostou (de frente ou de lado: ele te viu; por
 * trás: ATAQUE SURPRESA, você começa com vantagem) ou te viu na frente dele, até 3 ladrilhos.
 */
export function inimigoQueViu(m: Mundo, s: EstadoMundo): { id: string; inimigo: string; pelasCostas: boolean } | null {
  const frente = { cima: [0, -1], baixo: [0, 1], esq: [-1, 0], dir: [1, 0] } as const;
  for (const p of m.pessoas) {
    if (!p.inimigo || s.vistos.includes(p.id)) continue;
    const at = s.pessoas[p.id]!;
    const dx = s.x - at.x;
    const dy = s.y - at.y;
    const d = Math.hypot(dx, dy);
    const [fx, fy] = frente[at.dir];
    const olhando = d > 0 ? (dx * fx + dy * fy) / d : 1;
    if (d < 0.85) return { id: p.id, inimigo: p.inimigo, pelasCostas: olhando < -0.3 };
    if (d < 3 && olhando > 0.9) return { id: p.id, inimigo: p.inimigo, pelasCostas: false };
  }
  return null;
}

/** Venceu o inimigo de ronda: ele some do mapa. */
export function vencerInimigo(s: EstadoMundo, id: string): EstadoMundo {
  const at = s.pessoas[id];
  return { ...marcarVisto(s, id), pessoas: at ? { ...s.pessoas, [id]: { ...at, x: -99, y: -99 } } : s.pessoas };
}

/** Marcou como visto (depois de ler ou conversar). */
export function marcarVisto(s: EstadoMundo, id: string): EstadoMundo {
  return s.vistos.includes(id) ? s : { ...s, vistos: [...s.vistos, id] };
}

export function saidaAbertaMundo(m: Mundo, s: EstadoMundo): boolean {
  return [...m.coisas.filter((c) => c.obrigatorio).map((c) => c.id), ...m.pessoas.filter((p) => p.obrigatorio).map((p) => p.id)].every((id) => s.vistos.includes(id));
}
