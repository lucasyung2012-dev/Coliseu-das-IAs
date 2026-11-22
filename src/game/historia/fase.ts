import type { Falante, Lugar } from './roteiro';

/**
 * A FASE ABERTA (teste pedido pelo Lucas, 22/11/2026: "explorar tem que ser jogo mesmo").
 * Um lugar maior que a tela (cada tela = 100 de largura), onde o gladiador anda e pula
 * de lado, sobe em mesas e estantes, desvia do fogo, pega coisas e chega na saída.
 * Funções puras (a tela chama `passoFase` a cada quadro), para dar para testar.
 *
 * Medidas: x de 0 até `largura`; y é a altura acima do chão (o chão é 0). Uma tela tem
 * 100 de largura e ~56 de altura. O gladiador ocupa uns 7 de largura e 12 de altura.
 */
export interface Plataforma {
  /** Começo (esquerda), largura e a altura do tampo. Dá para subir por baixo (como mesa). */
  x: number;
  w: number;
  y: number;
  /** Como desenhar: mesa, estante, sacada ou viga. */
  tipo: 'mesa' | 'estante' | 'sacada' | 'viga';
}

export interface Perigo {
  x: number;
  w: number;
  tipo: 'fogo';
  /** O fogo acende e apaga: aceso por `acesoMs`, apagado por `apagadoMs` (0 = sempre aceso). */
  acesoMs: number;
  apagadoMs: number;
  /** Atraso no ciclo, para os fogos não piscarem juntos. */
  atrasoMs?: number;
}

export interface Coletavel {
  id: string;
  x: number;
  y: number;
  icone: string;
  nome: string;
}

/** Alguém ou alguma coisa que fala sozinho quando você passa perto (sem menu). */
export interface Comentario {
  id: string;
  x: number;
  quem: Falante;
  texto: string;
  /** Um personagem de pé ali (mostra o boneco). */
  personagem?: Falante;
  /** Ícone no cenário (janela, estátua...), quando não é um personagem. */
  icone?: string;
}

export interface Fase {
  id: string;
  /** Os cenários, um por tela, da esquerda para a direita. */
  telas: Lugar[];
  objetivo: string;
  plataformas: Plataforma[];
  perigos: Perigo[];
  coletaveis: Coletavel[];
  comentarios: Comentario[];
  /** Onde fica a saída (o fim da fase). */
  saida: { x: number; rotulo: string };
  /** Quantas coisas precisa pegar para a saída abrir (0 = nenhuma). */
  precisa: number;
}

export interface EstadoFase {
  tempo: number;
  x: number;
  y: number;
  /** Velocidade de lado: acelera e freia (o andar não fica duro). */
  vx: number;
  vy: number;
  noChao: boolean;
  /** Quando pisou no chão pela última vez (dá para pular logo depois de sair da beirada). */
  chaoEm: number;
  /** Para onde está virado. */
  dir: 1 | -1;
  andando: boolean;
  coletados: string[];
  /** Onde volta quando encosta no fogo: o último lugar seguro em que pisou (chão sem fogo ou plataforma). */
  volta: number;
  voltaY: number;
  /** Até quando pisca depois de se queimar (não se queima de novo nesse tempo). */
  feridoAte: number;
  queimadas: number;
  /** Comentários já ditos (cada um fala uma vez). */
  ditos: string[];
  /** O comentário na tela agora e até quando. */
  falando: { id: string; ate: number } | null;
  fim: boolean;
}

export interface Entrada {
  esq: boolean;
  dir: boolean;
  pular: boolean;
}

export const VELOCIDADE = 42;
const ACELERA = 260;
const FREIA = 340;
/** Folga para pular depois de sair da beirada (ms). */
const FOLGA_PULO = 110;
export const PULO = 64;
export const GRAVIDADE = 175;
const LARGURA_HEROI = 6;
const FALA_MS = 3200;
const FERIDO_MS = 1200;

export const larguraDa = (f: Fase) => f.telas.length * 100;

export function novaFase(): EstadoFase {
  return { tempo: 0, x: 8, y: 0, vx: 0, vy: 0, noChao: true, chaoEm: 0, dir: 1, andando: false, coletados: [], volta: 8, voltaY: 0, feridoAte: 0, queimadas: 0, ditos: [], falando: null, fim: false };
}

/** O fogo está aceso agora? */
export function fogoAceso(p: Perigo, tempo: number): boolean {
  if (p.apagadoMs <= 0) return true;
  const ciclo = p.acesoMs + p.apagadoMs;
  return (tempo + (p.atrasoMs ?? 0)) % ciclo < p.acesoMs;
}

/** A saída está aberta? */
export const saidaAberta = (f: Fase, s: EstadoFase) => s.coletados.length >= f.precisa;

/** Um passo da fase (dt em ms). */
export function passoFase(f: Fase, s0: EstadoFase, e: Entrada, dt: number): EstadoFase {
  if (s0.fim) return s0;
  const seg = dt / 1000;
  const tempo = s0.tempo + dt;
  let { x, y, vx, vy, noChao, dir } = s0;
  // Andar: acelera até a velocidade máxima e freia quando solta (no ar, controla um pouco menos).
  // Logo depois de queimar, fica meio segundo parado (antes, dava para sair andando e atravessar o fogo).
  const atordoado = tempo < s0.feridoAte - FERIDO_MS + 500;
  const mov = atordoado ? 0 : (e.dir ? 1 : 0) - (e.esq ? 1 : 0);
  if (mov !== 0) dir = mov as 1 | -1;
  const controle = noChao ? 1 : 0.7;
  if (mov !== 0) vx = Math.max(-VELOCIDADE, Math.min(VELOCIDADE, vx + mov * ACELERA * controle * seg));
  else vx = Math.sign(vx) * Math.max(0, Math.abs(vx) - FREIA * controle * seg);
  x = Math.max(3, Math.min(larguraDa(f) - 3, x + vx * seg));
  if (x <= 3 || x >= larguraDa(f) - 3) vx = 0;
  // Pular: do chão, de cima de uma plataforma, ou logo depois de sair da beirada.
  if (!atordoado && e.pular && vy <= 0 && (noChao || tempo - s0.chaoEm <= FOLGA_PULO)) {
    vy = PULO;
    noChao = false;
  }
  // Cair
  const yAntes = y;
  vy -= GRAVIDADE * seg;
  y += vy * seg;
  noChao = false;
  if (y <= 0) {
    y = 0;
    vy = 0;
    noChao = true;
  } else if (vy <= 0) {
    // Plataformas "de mesa": só seguram quem cai em cima (dá para subir por baixo).
    for (const p of f.plataformas) {
      const emCima = x + LARGURA_HEROI / 2 > p.x && x - LARGURA_HEROI / 2 < p.x + p.w;
      if (emCima && yAntes >= p.y - 0.01 && y <= p.y) {
        y = p.y;
        vy = 0;
        noChao = true;
        break;
      }
    }
  }
  let s: EstadoFase = { ...s0, tempo, x, y, vx, vy, noChao, dir, andando: Math.abs(vx) > 4 && noChao, chaoEm: noChao ? tempo : s0.chaoEm };
  // O ponto de volta: o último lugar seguro em que pisou (em cima de algo, ou no chão longe do fogo).
  if (tempo >= s0.feridoAte && noChao && (y > 0 || !f.perigos.some((p) => x > p.x - 4 && x < p.x + p.w + 4))) s = { ...s, volta: x, voltaY: y };
  // Fogo: encostou com os pés baixos, volta para o ponto seguro.
  if (tempo >= s.feridoAte) {
    for (const p of f.perigos) {
      if (y < 5 && x > p.x && x < p.x + p.w && fogoAceso(p, tempo)) {
        s = { ...s, x: s.volta, y: s.voltaY, vx: 0, vy: 0, noChao: true, feridoAte: tempo + FERIDO_MS, queimadas: s.queimadas + 1 };
        break;
      }
    }
  } else {
    // Piscando depois de queimar: o fogo vira parede (não dá para atravessar enquanto não pode se queimar).
    for (const p of f.perigos) {
      if (y < 5 && x > p.x && x < p.x + p.w && fogoAceso(p, tempo)) {
        s = { ...s, x: s0.x, vx: 0 };
        break;
      }
    }
  }
  // Pegar as coisas
  for (const c of f.coletaveis) {
    if (!s.coletados.includes(c.id) && Math.abs(s.x - c.x) < 5 && s.y + 12 > c.y && s.y < c.y + 5) s = { ...s, coletados: [...s.coletados, c.id] };
  }
  // Comentários: falam sozinhos quando passa perto (um de cada vez).
  if (s.falando && tempo >= s.falando.ate) s = { ...s, falando: null };
  if (!s.falando) {
    const perto = f.comentarios.find((c) => !s.ditos.includes(c.id) && Math.abs(s.x - c.x) < 9);
    if (perto) s = { ...s, ditos: [...s.ditos, perto.id], falando: { id: perto.id, ate: tempo + FALA_MS } };
  }
  // A saída
  if (Math.abs(s.x - f.saida.x) < 4 && s.y < 3 && saidaAberta(f, s)) s = { ...s, fim: true };
  return s;
}
