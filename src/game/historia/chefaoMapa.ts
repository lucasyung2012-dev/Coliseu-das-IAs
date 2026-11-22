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

export const VIDA_REI = 8;
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
}

export type EventoChefao = { tipo: 'acerto' | 'dano' | 'parede' | 'carga' | 'bloqueou' | 'furia'; em: number };

export interface EstadoChefao {
  tempo: number;
  chefe: Chefao;
  vida: number;
  vidaMax: number;
  feridoAte: number;
  golpeAte: number;
  fim: null | 'vitoria' | 'derrota';
  eventos: EventoChefao[];
}

export const furioso = (st: EstadoChefao) => st.chefe.vida <= VIDA_REI / 2;

export function novoChefao(vidaHeroi = 100): EstadoChefao {
  return {
    tempo: 0,
    chefe: { x: 9.5, y: 4.8, vida: VIDA_REI, estado: 'mira', ate: 2800, vx: 0, vy: 0, dir: 'esq' },
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

/** O golpe do gladiador: só entra com o Rato-Rei TONTO e perto. */
export function golpearChefao(st: EstadoChefao, heroi: { x: number; y: number }): EstadoChefao {
  if (st.fim || st.tempo < st.golpeAte) return st;
  const perto = Math.hypot(heroi.x - st.chefe.x, heroi.y - 0.4 - (st.chefe.y - 0.6)) < ALCANCE_GOLPE;
  const base = { ...st, golpeAte: st.tempo + 350 };
  if (!perto) return base;
  if (st.chefe.estado !== 'tonto') return { ...base, eventos: ev(st, 'bloqueou', st.tempo) };
  const vida = st.chefe.vida - 1;
  const ficouFurioso = vida === VIDA_REI / 2;
  return {
    ...base,
    chefe: { ...st.chefe, vida },
    eventos: ev({ ...st, eventos: ev(st, 'acerto', st.tempo) }, ficouFurioso ? 'furia' : 'acerto', st.tempo),
    fim: vida <= 0 ? 'vitoria' : null,
  };
}
