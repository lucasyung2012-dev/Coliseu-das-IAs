import { livre, type Mundo } from './mundo';

/**
 * O CHEFÃO NO MAPA ABERTO (22/11/2026, teste combinado com o Lucas): o Rato-Rei corre pela
 * câmara das catacumbas. Ele MIRA (treme e marca a linha), dá a INVESTIDA reta e, se bater
 * numa coluna ou parede, fica TONTO: é a hora de bater. Cansado no meio do caminho, fica tonto
 * menos tempo. Na metade da vida ele fica FURIOSO: mira mais rápido e corre mais.
 * Funções puras (a tela chama `passoChefao` a cada quadro), para dar para testar.
 */
export const ARENA_RATO_REI: Mundo = {
  id: 'arena-rato-rei',
  tema: 'catacumbas',
  lugar: 'catacumbas',
  objetivo: 'Desvie das investidas do Rato-Rei. Faça ele bater nas colunas e, quando ficar tonto, BATA!',
  inicio: [2, 4],
  mapa: [
    '#############',
    '#ooooooooooo#',
    '#...........#',
    '#..p.....p..#',
    '#...........#',
    '#...........#',
    '#..p.....p..#',
    '#v.........v#',
    '#############',
  ],
  coisas: [],
  pessoas: [],
};

/** A arena do Coliseu para o Leão Mecânico: areia no meio, arquibancada em volta. */
export const ARENA_LEAO: Mundo = {
  id: 'arena-leao',
  tema: 'arena',
  lugar: 'coliseu-arena',
  objetivo: 'O Leão pula em cima de você: saia da SOMBRA antes dele cair. Quando ele aterrissar e ficar cansado, BATA!',
  inicio: [2, 4],
  mapa: [
    'BBBBBBXXXBBBBBB',
    'B.............B',
    'B..aaaaaaaaa..B',
    'B..aaaaaaaaa..B',
    'B..aaaaaaaaa..B',
    'B..aaaaaaaaa..B',
    'B.............B',
    'B.............B',
    'BBBBBBBBBBBBBBB',
  ],
  coisas: [],
  pessoas: [],
};

/**
 * Os chefões que lutam no mapa aberto. Cada um tem o seu jeito:
 * - Rato-Rei: CORRE reto e fica tonto se bater numa coluna;
 * - Leão Mecânico: PULA em cima de onde você estava (a sombra marca o lugar) e fica cansado
 *   depois de cair. Na metade da vida, pula duas vezes seguidas.
 */
export interface DefChefaoMapa {
  id: string;
  arena: Mundo;
  vida: number;
  jeito: 'carga' | 'salto';
  inicio: [number, number];
  dica: string;
}
export const CHEFOES_MAPA: Record<string, DefChefaoMapa> = {
  'rato-rei': {
    id: 'rato-rei',
    arena: ARENA_RATO_REI,
    vida: 8,
    jeito: 'carga',
    inicio: [9.5, 4.8],
    dica: 'Fique perto de uma coluna: quando ele mirar, saia do caminho no último segundo. Ele bate na coluna e fica tonto.',
  },
  'leao-mecanico': {
    id: 'leao-mecanico',
    arena: ARENA_LEAO,
    vida: 10,
    jeito: 'salto',
    inicio: [11.5, 4.8],
    dica: 'Olhe a SOMBRA no chão: é onde ele vai cair. Saia dela na última hora e bata nele enquanto estiver cansado.',
  },
};
export const VIDA_REI = 8;
const DANO_SALTO = 22;
const SALTO_MS = 850;
const TONTO_SALTO_MS = 1700;
const TONTO_SALTO_FURIA_MS = 1100;
const RAIO_SALTO = 1.3;
const DANO_CARGA = 18;
const MIRA_MS = 1300;
const MIRA_FURIA_MS = 800;
const CARGA_MS = 1500;
const TONTO_PAREDE_MS = 2600;
const TONTO_CANSADO_MS = 900;
const VEL_CARGA = 8;
const VEL_FURIA = 10.5;
// O Rato-Rei é grande (2 ladrilhos): o golpe conta do meio do corpo dele, não dos pés.
const ALCANCE_GOLPE = 2.1;

export interface Chefao {
  x: number;
  y: number;
  vida: number;
  estado: 'mira' | 'carga' | 'tonto';
  ate: number;
  vx: number;
  vy: number;
  dir: 'esq' | 'dir';
  /** Já acertou o gladiador nesta investida (só machuca uma vez por corrida). */
  acertou?: boolean;
  /** O salto do Leão: onde ele vai cair (a sombra) e quantos pulos ainda faltam nesta vez. */
  ax?: number;
  ay?: number;
  pulos?: number;
}

export type EventoChefao = { tipo: 'acerto' | 'dano' | 'parede' | 'carga' | 'bloqueou' | 'furia'; em: number };

export interface EstadoChefao {
  /** Qual chefão (CHEFOES_MAPA). */
  id: string;
  tempo: number;
  chefe: Chefao;
  vida: number;
  vidaMax: number;
  feridoAte: number;
  golpeAte: number;
  fim: null | 'vitoria' | 'derrota';
  eventos: EventoChefao[];
}

const defDe = (st: EstadoChefao) => CHEFOES_MAPA[st.id] ?? CHEFOES_MAPA['rato-rei']!;
export const furioso = (st: EstadoChefao) => st.chefe.vida <= defDe(st).vida / 2;

export function novoChefao(vidaHeroi = 100, id = 'rato-rei'): EstadoChefao {
  const def = CHEFOES_MAPA[id] ?? CHEFOES_MAPA['rato-rei']!;
  return {
    id: def.id,
    tempo: 0,
    chefe: { x: def.inicio[0], y: def.inicio[1], vida: def.vida, estado: 'mira', ate: 2800, vx: 0, vy: 0, dir: 'esq' },
    vida: vidaHeroi,
    vidaMax: vidaHeroi,
    feridoAte: 0,
    golpeAte: 0,
    fim: null,
    eventos: [],
  };
}

const ev = (st: EstadoChefao, tipo: EventoChefao['tipo'], em: number) => [...st.eventos.filter((e) => em - e.em < 1500), { tipo, em }];

export function passoChefao(m: Mundo, st0: EstadoChefao, heroi: { x: number; y: number }, dt: number): EstadoChefao {
  if (st0.fim) return st0;
  const tempo = st0.tempo + dt;
  let st: EstadoChefao = { ...st0, tempo };
  let c = { ...st.chefe };
  const raiva = furioso(st);
  if (defDe(st).jeito === 'salto') return passoSalto(m, st, c, raiva, heroi, tempo, dt);
  if (c.estado === 'mira') {
    c.dir = heroi.x < c.x ? 'esq' : 'dir';
    if (tempo >= c.ate) {
      // Trava a direção no gladiador e dispara.
      const dx = heroi.x - c.x;
      const dy = heroi.y - c.y;
      const d = Math.hypot(dx, dy) || 1;
      const v = raiva ? VEL_FURIA : VEL_CARGA;
      c = { ...c, estado: 'carga', ate: tempo + CARGA_MS, vx: (dx / d) * v, vy: (dy / d) * v, acertou: false };
      st = { ...st, eventos: ev(st, 'carga', tempo) };
    }
  } else if (c.estado === 'carga') {
    const nx = c.x + (c.vx * dt) / 1000;
    const ny = c.y + (c.vy * dt) / 1000;
    if (!livre(m, nx, ny)) {
      // Bateu na coluna ou na parede: tonto por um bom tempo.
      c = { ...c, estado: 'tonto', ate: tempo + TONTO_PAREDE_MS, vx: 0, vy: 0 };
      st = { ...st, eventos: ev(st, 'parede', tempo) };
    } else if (tempo >= c.ate) {
      c = { ...c, x: nx, y: ny, estado: 'tonto', ate: tempo + TONTO_CANSADO_MS, vx: 0, vy: 0 };
    } else c = { ...c, x: nx, y: ny };
  } else if (tempo >= c.ate) {
    c = { ...c, estado: 'mira', ate: tempo + (raiva ? MIRA_FURIA_MS : MIRA_MS) };
  }
  st = { ...st, chefe: c };
  // A investida pega o gladiador.
  if (c.estado === 'carga' && !c.acertou && tempo >= st.feridoAte && Math.hypot(heroi.x - c.x, heroi.y - c.y) < 0.95) {
    const vida = Math.max(0, st.vida - DANO_CARGA);
    st = { ...st, chefe: { ...c, acertou: true }, vida, feridoAte: tempo + 1100, eventos: ev(st, 'dano', tempo), fim: vida <= 0 ? 'derrota' : null };
  }
  return st;
}

/** O jeito do Leão: mira (a sombra segue você), pula, cai, fica cansado. */
function passoSalto(m: Mundo, st0: EstadoChefao, c0: Chefao, raiva: boolean, heroi: { x: number; y: number }, tempo: number, dt: number): EstadoChefao {
  let st = st0;
  let c = c0;
  if (c.estado === 'mira') {
    c.dir = heroi.x < c.x ? 'esq' : 'dir';
    // A sombra segue o gladiador até meio segundo antes do pulo; aí trava.
    if (c.ate - tempo > 500 || c.ax === undefined) c = { ...c, ax: heroi.x, ay: heroi.y };
    if (tempo >= c.ate) {
      const ax = c.ax ?? heroi.x;
      const ay = c.ay ?? heroi.y;
      c = { ...c, estado: 'carga', ate: tempo + SALTO_MS, vx: ((ax - c.x) * 1000) / SALTO_MS, vy: ((ay - c.y) * 1000) / SALTO_MS, acertou: false };
      st = { ...st, eventos: ev(st, 'carga', tempo) };
    }
  } else if (c.estado === 'carga') {
    if (tempo >= c.ate) {
      // Caiu: onde a sombra estava (se for parede, fica onde estava).
      const ax = c.ax ?? c.x;
      const ay = c.ay ?? c.y;
      const cai = livre(m, ax, ay) ? { x: ax, y: ay } : { x: c.x, y: c.y };
      const pulos = (c.pulos ?? (raiva ? 2 : 1)) - 1;
      st = { ...st, eventos: ev(st, 'parede', tempo) };
      if (Math.hypot(heroi.x - cai.x, heroi.y - cai.y) < RAIO_SALTO && tempo >= st.feridoAte) {
        const vida = Math.max(0, st.vida - DANO_SALTO);
        st = { ...st, vida, feridoAte: tempo + 1100, eventos: ev(st, 'dano', tempo), fim: vida <= 0 ? 'derrota' : null };
      }
      // Furioso, ele pula de novo logo em seguida; senão, fica cansado.
      c =
        pulos > 0
          ? { ...c, ...cai, estado: 'mira', ate: tempo + 600, vx: 0, vy: 0, pulos, ax: undefined, ay: undefined }
          : { ...c, ...cai, estado: 'tonto', ate: tempo + (raiva ? TONTO_SALTO_FURIA_MS : TONTO_SALTO_MS), vx: 0, vy: 0, pulos: undefined };
    } else c = { ...c, x: c.x + (c.vx * dt) / 1000, y: c.y + (c.vy * dt) / 1000 };
  } else if (tempo >= c.ate) {
    c = { ...c, estado: 'mira', ate: tempo + (raiva ? MIRA_FURIA_MS : MIRA_MS) + 300, ax: undefined, ay: undefined };
  }
  return { ...st, chefe: c };
}

/** O golpe do gladiador: só entra com o Rato-Rei TONTO e perto. */
export function golpearChefao(st: EstadoChefao, heroi: { x: number; y: number }): EstadoChefao {
  if (st.fim || st.tempo < st.golpeAte) return st;
  const perto = Math.hypot(heroi.x - st.chefe.x, heroi.y - 0.4 - (st.chefe.y - 0.6)) < ALCANCE_GOLPE;
  const base = { ...st, golpeAte: st.tempo + 350 };
  if (!perto) return base;
  if (st.chefe.estado !== 'tonto') return { ...base, eventos: ev(st, 'bloqueou', st.tempo) };
  const vida = st.chefe.vida - 1;
  const ficouFurioso = vida === Math.floor(defDe(st).vida / 2);
  return {
    ...base,
    chefe: { ...st.chefe, vida },
    eventos: ev({ ...st, eventos: ev(st, 'acerto', st.tempo) }, ficouFurioso ? 'furia' : 'acerto', st.tempo),
    fim: vida <= 0 ? 'vitoria' : null,
  };
}
