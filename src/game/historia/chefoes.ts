import { livre, VELOCIDADE_MUNDO, type Mundo, type TemaMundo } from './mundo';
import type { Lugar } from './roteiro';

/**
 * OS CHEFÕES EM DUAS ETAPAS (22/11/2026, combinado com o Lucas). Primeira etapa: no mapa
 * aberto, o chefão ataca com os padrões dele e fica CANSADO depois de cada um; cada golpe no
 * cansado arranca uma placa da ARMADURA. Sem armadura, vira o duelo (a segunda etapa, com os
 * botões e o especial de cada gladiador), com o chefão já enfraquecido.
 *
 * Cada chefão é único: uma arena e uma combinação própria de padrões:
 * - investida: corre reto (bate na parede e fica tonto);
 * - salto: pula em cima de onde você está (a sombra avisa);
 * - tiros: dispara projéteis na sua direção;
 * - onda: uma onda de choque sai dele e cresce (fique longe);
 * - zonas: o chão marca círculos perto de você e eles explodem;
 * - feixe: um raio gira em volta dele;
 * - copias: aparecem cópias falsas (só a verdadeira apanha).
 * Funções puras (a tela chama `passoChefe` a cada quadro), para dar para testar.
 */
export type Padrao =
  | { tipo: 'investida'; vel: number }
  | { tipo: 'salto' }
  | { tipo: 'tiros'; n: number; intervalo: number; vel: number; leque?: number }
  | { tipo: 'onda'; raio: number; vel: number; vezes?: number }
  | { tipo: 'zonas'; n: number; raio: number; espalha: number }
  | { tipo: 'feixe'; dur: number; giros: number; comprimento: number }
  | { tipo: 'copias'; n: number; dur: number };

export interface DefChefe {
  /** O inimigo (o desenho e o duelo da segunda etapa). */
  inimigo: string;
  arena: Mundo;
  inicio: [number, number];
  armadura: number;
  padroes: Padrao[];
  /** Quanto tempo fica cansado depois de cada padrão. */
  cansaMs: number;
  /** Mira antes de cada padrão (o aviso). */
  miraMs: number;
  dano: number;
  /** Luta no escuro: só se vê perto do gladiador. */
  escuro?: boolean;
  /** A cor das coisas que ele joga (fogo, água, sombra, ouro...). */
  cor: string;
  dica: string;
  /** Quanta vida o chefão tem no duelo depois (0 a 1). */
  vidaNoDuelo: number;
}

export interface Projetil {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface EstadoChefe {
  tempo: number;
  x: number;
  y: number;
  dir: 'esq' | 'dir';
  armadura: number;
  i: number;
  etapa: 'mira' | 'ataque' | 'cansado';
  ate: number;
  /** Coisas do padrão atual: alvo (investida/salto), zonas, projéteis, raio da onda, ângulo do feixe, cópias. */
  alvo?: { x: number; y: number };
  vx?: number;
  vy?: number;
  zonas?: { x: number; y: number }[];
  projeteis?: Projetil[];
  disparos?: number;
  proximoTiro?: number;
  onda?: number;
  ondas?: number;
  angulo?: number;
  copias?: { x: number; y: number; viva: boolean }[];
  acertou?: boolean;
  vida: number;
  vidaMax: number;
  feridoAte: number;
  golpeAte: number;
  /** A habilidade de cada gladiador no mapa: escudo levantado, invisível no passo de sombra, quando dá de novo. */
  escudoAte: number;
  invulAte: number;
  habPronta: number;
  fim: null | 'quebrou' | 'derrota';
  eventos: { tipo: 'placa' | 'dano' | 'falsa' | 'bloqueou' | 'explode' | 'parede' | 'furia' | 'defendeu' | 'rede' | 'errou' | 'passo'; em: number }[];
}

const RAIO_HEROI = 0.55;
const ALCANCE = 2.1;
export const furiosoChefe = (d: DefChefe, st: EstadoChefe) => st.armadura <= Math.floor(d.armadura / 2);

export function novoEstadoChefe(d: DefChefe, vidaHeroi = 100): EstadoChefe {
  const base: EstadoChefe = {
    tempo: 0,
    x: d.inicio[0] + 0.5,
    y: d.inicio[1] + 0.8,
    dir: 'esq',
    armadura: d.armadura,
    i: 0,
    etapa: 'mira',
    ate: 2200,
    vida: vidaHeroi,
    vidaMax: vidaHeroi,
    feridoAte: 0,
    golpeAte: 0,
    escudoAte: 0,
    invulAte: 0,
    habPronta: 0,
    fim: null,
    eventos: [],
  };
  // A primeira mira já começa (com as zonas no chão, se for o caso) e dura um pouco mais.
  const heroi = { x: d.arena.inicio[0] + 0.5, y: d.arena.inicio[1] + 0.8 };
  return { ...comecarMira(d, base, heroi), ate: 2200 };
}

const ev = (st: EstadoChefe, tipo: EstadoChefe['eventos'][number]['tipo']) => [...st.eventos.filter((e) => st.tempo - e.em < 1500), { tipo, em: st.tempo }];

function machucar(d: DefChefe, st: EstadoChefe, fator = 1): EstadoChefe {
  if (st.tempo < st.feridoAte || st.tempo < st.invulAte) return st;
  // O escudo do Cassius segura quase tudo.
  if (st.tempo < st.escudoAte) {
    const vida = Math.max(0, st.vida - Math.round(d.dano * fator * 0.15));
    return { ...st, vida, feridoAte: st.tempo + 600, eventos: ev(st, 'defendeu'), fim: vida <= 0 ? 'derrota' : st.fim };
  }
  const vida = Math.max(0, st.vida - Math.round(d.dano * fator));
  return { ...st, vida, feridoAte: st.tempo + 1000, eventos: ev(st, 'dano'), fim: vida <= 0 ? 'derrota' : st.fim };
}

/** Começa o ataque do padrão (o que foi mirado vira ataque de verdade). */
function comecarAtaque(d: DefChefe, st: EstadoChefe, p: Padrao, heroi: { x: number; y: number }): EstadoChefe {
  const raiva = furiosoChefe(d, st);
  const base = { ...st, etapa: 'ataque' as const, acertou: false };
  switch (p.tipo) {
    case 'investida': {
      const dx = heroi.x - st.x;
      const dy = heroi.y - st.y;
      const n = Math.hypot(dx, dy) || 1;
      const v = p.vel * (raiva ? 1.3 : 1);
      return { ...base, vx: (dx / n) * v, vy: (dy / n) * v, ate: st.tempo + 1600 };
    }
    case 'salto':
      return { ...base, alvo: st.alvo ?? { ...heroi }, ate: st.tempo + 850 };
    case 'tiros':
      return { ...base, projeteis: [], disparos: 0, proximoTiro: st.tempo, ate: st.tempo + p.n * p.intervalo + 1800 };
    case 'onda':
      return { ...base, onda: 0, ondas: 0, ate: st.tempo + 6000 };
    case 'zonas':
      return { ...base, ate: st.tempo + 500 };
    case 'feixe':
      return { ...base, angulo: Math.atan2(heroi.y - st.y, heroi.x - st.x) + Math.PI, ate: st.tempo + p.dur };
    case 'copias': {
      const em = [0, 1, 2, 3, 4].slice(0, p.n).map((k) => {
        const a = (k / p.n) * Math.PI * 2;
        return { x: st.x + Math.cos(a) * 3.2, y: st.y + Math.sin(a) * 2.2, viva: true };
      });
      return { ...base, copias: em, ate: st.tempo + p.dur };
    }
  }
}

/** Mira: escolhe o que vai acontecer (as zonas no chão, o lugar do salto) e avisa. */
function comecarMira(d: DefChefe, st: EstadoChefe, heroi: { x: number; y: number }): EstadoChefe {
  const raiva = furiosoChefe(d, st);
  const p = d.padroes[st.i % d.padroes.length]!;
  const mira = d.miraMs * (raiva ? 0.7 : 1);
  let zonas: EstadoChefe['zonas'];
  if (p.tipo === 'zonas') {
    zonas = [{ x: heroi.x, y: heroi.y }];
    for (let k = 1; k < p.n + (raiva ? 1 : 0); k++) {
      const a = (k * 2.39996) % (Math.PI * 2);
      zonas.push({ x: heroi.x + Math.cos(a) * p.espalha * (0.5 + (k % 3) * 0.4), y: heroi.y + Math.sin(a) * p.espalha * 0.7 });
    }
  }
  return { ...st, etapa: 'mira', ate: st.tempo + mira, zonas, alvo: p.tipo === 'salto' ? { ...heroi } : undefined, projeteis: [], onda: undefined, angulo: undefined, copias: undefined };
}

export function passoChefe(d: DefChefe, st0: EstadoChefe, heroi: { x: number; y: number }, dt: number): EstadoChefe {
  if (st0.fim) return st0;
  const m = d.arena;
  let st: EstadoChefe = { ...st0, tempo: st0.tempo + dt };
  const t = st.tempo;
  const p = d.padroes[st.i % d.padroes.length]!;
  const raiva = furiosoChefe(d, st);
  if (st.etapa === 'mira') {
    st.dir = heroi.x < st.x ? 'esq' : 'dir';
    // O salto segue você até meio segundo antes de pular.
    if (p.tipo === 'salto' && st.ate - t > 500) st = { ...st, alvo: { ...heroi } };
    if (t >= st.ate) st = comecarAtaque(d, st, p, heroi);
  } else if (st.etapa === 'ataque') {
    switch (p.tipo) {
      case 'investida': {
        const nx = st.x + ((st.vx ?? 0) * dt) / 1000;
        const ny = st.y + ((st.vy ?? 0) * dt) / 1000;
        if (!livre(m, nx, ny)) {
          st = { ...st, etapa: 'cansado', ate: t + d.cansaMs * 1.4, eventos: ev(st, 'parede') };
          break;
        }
        st = { ...st, x: nx, y: ny };
        if (!st.acertou && Math.hypot(heroi.x - st.x, heroi.y - st.y) < 0.95) st = { ...machucar(d, st), acertou: true };
        if (t >= st.ate) st = { ...st, etapa: 'cansado', ate: t + d.cansaMs };
        break;
      }
      case 'salto': {
        const a = st.alvo ?? heroi;
        const falta = Math.max(0, st.ate - t);
        const k = Math.min(1, dt / Math.max(dt, falta + dt));
        st = { ...st, x: st.x + (a.x - st.x) * k, y: st.y + (a.y - st.y) * k };
        if (t >= st.ate) {
          const cai = livre(m, a.x, a.y) ? a : { x: st.x, y: st.y };
          st = { ...st, x: cai.x, y: cai.y, eventos: ev(st, 'explode') };
          if (Math.hypot(heroi.x - cai.x, heroi.y - cai.y) < 1.4) st = machucar(d, st);
          st = { ...st, etapa: 'cansado', ate: t + d.cansaMs };
        }
        break;
      }
      case 'tiros': {
        let proj = (st.projeteis ?? []).map((q) => ({ ...q, x: q.x + (q.vx * dt) / 1000, y: q.y + (q.vy * dt) / 1000 })).filter((q) => livre(m, q.x, q.y + 0.3));
        let disparos = st.disparos ?? 0;
        if (disparos < p.n && t >= (st.proximoTiro ?? 0)) {
          const base = Math.atan2(heroi.y - 0.4 - st.y, heroi.x - st.x);
          const leque = p.leque ?? 0;
          for (const da of leque ? [-leque, 0, leque] : [0]) {
            const v = p.vel * (raiva ? 1.25 : 1);
            proj.push({ x: st.x, y: st.y - 0.5, vx: Math.cos(base + da) * v, vy: Math.sin(base + da) * v });
          }
          disparos += 1;
          st = { ...st, proximoTiro: t + p.intervalo * (raiva ? 0.75 : 1) };
        }
        const acerto = proj.find((q) => Math.hypot(q.x - heroi.x, q.y - (heroi.y - 0.4)) < RAIO_HEROI);
        if (acerto) {
          proj = proj.filter((q) => q !== acerto);
          st = machucar(d, st, 0.6);
        }
        st = { ...st, projeteis: proj, disparos };
        if (disparos >= p.n && proj.length === 0) st = { ...st, etapa: 'cansado', ate: t + d.cansaMs };
        else if (t >= st.ate) st = { ...st, projeteis: [], etapa: 'cansado', ate: t + d.cansaMs };
        break;
      }
      case 'onda': {
        const r = (st.onda ?? 0) + (p.vel * dt) / 1000;
        const d0 = Math.hypot(heroi.x - st.x, heroi.y - st.y);
        if (!st.acertou && Math.abs(d0 - r) < 0.45) st = { ...machucar(d, st, 0.8), acertou: true };
        if (r >= p.raio) {
          const ondas = (st.ondas ?? 0) + 1;
          if (ondas < (p.vezes ?? 1) + (raiva ? 1 : 0)) st = { ...st, onda: 0, ondas, acertou: false, eventos: ev(st, 'explode') };
          else st = { ...st, onda: undefined, etapa: 'cansado', ate: t + d.cansaMs };
        } else st = { ...st, onda: r };
        break;
      }
      case 'zonas': {
        if (t >= st.ate) {
          const pegou = (st.zonas ?? []).some((z) => Math.hypot(heroi.x - z.x, heroi.y - z.y) < p.raio);
          st = { ...st, eventos: ev(st, 'explode') };
          if (pegou) st = machucar(d, st);
          st = { ...st, etapa: 'cansado', ate: t + d.cansaMs };
        }
        break;
      }
      case 'feixe': {
        const giro = (p.giros * Math.PI * 2 * (raiva ? 1.25 : 1)) / p.dur;
        const ang = (st.angulo ?? 0) + giro * dt;
        st = { ...st, angulo: ang };
        // O gladiador está em cima do raio?
        const dx = heroi.x - st.x;
        const dy = heroi.y - 0.4 - st.y;
        const ao = dx * Math.cos(ang) + dy * Math.sin(ang);
        const lado = Math.abs(-dx * Math.sin(ang) + dy * Math.cos(ang));
        if (ao > 0 && ao < p.comprimento && lado < 0.5) st = machucar(d, st, 0.7);
        if (t >= st.ate) st = { ...st, angulo: undefined, etapa: 'cansado', ate: t + d.cansaMs };
        break;
      }
      case 'copias': {
        // As cópias andam em volta; o tempo acabou, somem.
        if (t >= st.ate) st = comecarMira(d, { ...st, copias: undefined, i: st.i + 1 }, heroi);
        break;
      }
    }
  } else if (t >= st.ate) {
    st = comecarMira(d, { ...st, i: st.i + 1 }, heroi);
  }
  // Ficou cansado longe de você: o cansaço dura também o tempo de você chegar até ele.
  if (st.etapa === 'cansado' && st0.etapa !== 'cansado') {
    const longe = Math.max(0, Math.hypot(heroi.x - st.x, heroi.y - st.y) - ALCANCE);
    st = { ...st, ate: st.ate + Math.min(3000, (longe / VELOCIDADE_MUNDO) * 1000) };
  }
  return st;
}

/** O golpe do gladiador no mapa: arranca uma placa da armadura se o chefão estiver cansado (ou nas cópias, se for o verdadeiro). */
export function golpearChefe(d: DefChefe, st: EstadoChefe, heroi: { x: number; y: number }): EstadoChefe {
  if (st.fim || st.tempo < st.golpeAte) return st;
  const base = { ...st, golpeAte: st.tempo + 350 };
  const perto = (x: number, y: number) => Math.hypot(heroi.x - x, heroi.y - 0.4 - (y - 0.6)) < ALCANCE;
  // As cópias: bater numa falsa faz ela sumir.
  const falsa = st.copias?.findIndex((c) => c.viva && perto(c.x, c.y)) ?? -1;
  if (falsa >= 0) return { ...base, copias: st.copias!.map((c, k) => (k === falsa ? { ...c, viva: false } : c)), eventos: ev(st, 'falsa') };
  if (!perto(st.x, st.y)) return base;
  const vulneravel = st.etapa === 'cansado' || (st.etapa === 'ataque' && d.padroes[st.i % d.padroes.length]!.tipo === 'copias');
  if (!vulneravel) return { ...base, eventos: ev(st, 'bloqueou') };
  const armadura = st.armadura - 1;
  const virouFuria = armadura === Math.floor(d.armadura / 2);
  return {
    ...base,
    armadura,
    copias: undefined,
    eventos: ev({ ...st, eventos: ev(st, 'placa') }, virouFuria ? 'furia' : 'placa'),
    fim: armadura <= 0 ? 'quebrou' : null,
    // Bater no verdadeiro durante as cópias acaba com elas.
    ...(st.copias ? { etapa: 'cansado' as const, ate: st.tempo + d.cansaMs } : {}),
  };
}

/** Uma arena simples: borda de parede, chão e as peças que o tema pede (o mapa usa os ladrilhos do mundo). */
export function arena(id: string, tema: TemaMundo, lugar: Lugar, mapa: string[], objetivo: string): Mundo {
  return { id, tema, lugar, mapa, objetivo, inicio: [2, 4], coisas: [], pessoas: [] };
}

/**
 * A HABILIDADE DE CADA GLADIADOR NO MAPA (22/11/2026), para a primeira etapa não ser igual
 * para os três:
 * - Cassius, ESCUDO: levanta o escudo por 1,2 s (quase nada passa), mas anda devagar;
 * - Octavius, REDE: joga a rede até 4,5 de distância: o chefão fica preso (CANSADO na hora)
 *   e as cópias somem; errou, perdeu a rede por um tempinho;
 * - Helios, PASSO DE SOMBRA: some e reaparece 2,5 à frente, sem levar dano no caminho.
 */
export type Habilidade = 'escudo' | 'rede' | 'passo';
export const HABILIDADE: Record<string, Habilidade> = { cassius: 'escudo', octavius: 'rede', helios: 'passo' };
export const RECARGA: Record<Habilidade, number> = { escudo: 2200, rede: 7000, passo: 2400 };

export function usarHabilidade(
  d: DefChefe,
  st: EstadoChefe,
  heroi: { x: number; y: number },
  hab: Habilidade,
  dir: { x: number; y: number } = { x: 1, y: 0 },
): { st: EstadoChefe; heroi?: { x: number; y: number } } {
  if (st.fim || st.tempo < st.habPronta) return { st };
  const t = st.tempo;
  if (hab === 'escudo') return { st: { ...st, escudoAte: t + 1200, habPronta: t + RECARGA.escudo } };
  if (hab === 'rede') {
    const longe = Math.hypot(heroi.x - st.x, heroi.y - st.y) > 4.5;
    if (longe || st.etapa === 'cansado') return { st: { ...st, habPronta: t + 1500, eventos: ev(st, 'errou') } };
    return {
      st: { ...st, etapa: 'cansado', ate: t + d.cansaMs * 0.9, copias: undefined, projeteis: [], onda: undefined, angulo: undefined, vx: 0, vy: 0, habPronta: t + RECARGA.rede, eventos: ev(st, 'rede') },
    };
  }
  // O passo de sombra: vai até 2,5 na direção em que está olhando, parando antes da parede.
  const n = Math.hypot(dir.x, dir.y) || 1;
  let fim = { ...heroi };
  for (let k = 0.25; k <= 2.5; k += 0.25) {
    const p = { x: heroi.x + (dir.x / n) * k, y: heroi.y + (dir.y / n) * k };
    if (!livre(d.arena, p.x, p.y)) break;
    fim = p;
  }
  return { st: { ...st, invulAte: t + 550, habPronta: t + RECARGA.passo, eventos: ev(st, 'passo') }, heroi: fim };
}
