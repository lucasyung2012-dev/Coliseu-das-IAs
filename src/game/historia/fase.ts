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
  /** Como desenhar: mesa, estante, sacada, viga, caixote (do mercado) ou toldo de barraca. */
  tipo: 'mesa' | 'estante' | 'sacada' | 'viga' | 'caixote' | 'toldo' | 'pedra' | 'sarcofago' | 'barco' | 'cordame' | 'luz' | 'telhado' | 'arco' | 'altar';
  /** Passarela de luz (Helios): acesa por `acesoMs`, apagada por `apagadoMs`. Apagada, não segura ninguém. */
  pisca?: { acesoMs: number; apagadoMs: number; atrasoMs?: number };
  /** Anda de lado e volta (o barco no porto): até `dx` para a direita, ida e volta em `ms`. Leva quem está em cima. */
  move?: { dx: number; ms: number };
  /** Afunda (ou desmorona) depois de `afunda` ms com alguém em cima; volta 2,5 s depois. */
  afunda?: number;
}

export interface Perigo {
  x: number;
  w: number;
  /** Fogo (acende e apaga) ou água funda (sempre: cair nela te leva de volta). */
  tipo: 'fogo' | 'agua' | 'onda' | 'vao' | 'inimigo' | 'queda';
  /** Anda pelo chão: de `de` até `ate` em `ms` (vai e volta; com `ida`, só vai e recomeça). */
  move?: { de: number; ate: number; ms: number; ida?: boolean };
  /** O desenho: quem anda (guarda, rato, jacaré, gato, barril rolando) ou o que cai (viga, tomate). */
  figura?: 'guarda' | 'rato' | 'jacare' | 'gato' | 'barril' | 'viga' | 'tomate' | 'bala' | 'tentaculo' | 'meteoro';
  /** A ENCHENTE (aqueduto): de tempos em tempos a água sobe até `altura` (pega quem está nos arcos baixos). */
  sobe?: { altura: number; cicloMs: number; duraMs: number; atrasoMs?: number };
  /** Até que altura pega (o padrão é 5: os pés). O tentáculo do Leviatã pega bem mais alto. */
  altura?: number;
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
  /** A mensagem do fim: o que foi pego ("LIVROS SALVOS") e a frase quando pegou tudo ou só uma parte. */
  fim?: { coisa: string; todos: string; alguns: string };
  /** Vento de tempestade: de tempos em tempos empurra o gladiador para trás. */
  vento?: { forca: number; cicloMs: number; duraMs: number };
  /** No escuro (Helios): só se vê em volta do gladiador e das coisas já pegas (elas ficam acesas). */
  escuro?: { raio: number };
  /** As VISÕES do oráculo: de tempos em tempos, esquerda vira direita. */
  visao?: { cicloMs: number; duraMs: number };
}

/** A passarela de luz está acesa agora? */
export function plataformaAcesa(p: Plataforma, tempo: number): boolean {
  if (!p.pisca) return true;
  return (tempo + (p.pisca.atrasoMs ?? 0)) % (p.pisca.acesoMs + p.pisca.apagadoMs) < p.pisca.acesoMs;
}
/** A água está subindo (enchente) agora? */
export function enchendo(p: Perigo, tempo: number): boolean {
  if (!p.sobe) return false;
  return (tempo + (p.sobe.atrasoMs ?? 0)) % p.sobe.cicloMs > p.sobe.cicloMs - p.sobe.duraMs;
}
/** Quanto falta para a água subir (ms), para o aviso. */
export function faltaParaEncher(p: Perigo, tempo: number): number {
  if (!p.sobe) return Infinity;
  const k = (tempo + (p.sobe.atrasoMs ?? 0)) % p.sobe.cicloMs;
  const comeca = p.sobe.cicloMs - p.sobe.duraMs;
  return k > comeca ? 0 : comeca - k;
}
/** Até que altura o perigo pega agora. */
export const alturaDoPerigo = (p: Perigo, tempo: number) => (enchendo(p, tempo) ? p.sobe!.altura : (p.altura ?? 5));
/** A visão está trocando os lados agora? */
export function visaoAtiva(f: Fase, tempo: number): boolean {
  return !!f.visao && tempo % f.visao.cicloMs > f.visao.cicloMs - f.visao.duraMs;
}

/** Onde está a plataforma agora (a que anda vai e volta, suave). */
export function xDaPlataforma(p: Plataforma, tempo: number): number {
  if (!p.move) return p.x;
  return p.x + p.move.dx * (0.5 - 0.5 * Math.cos((2 * Math.PI * tempo) / p.move.ms));
}
/** Onde está o perigo agora (o que anda pelo chão). */
export function xDoPerigo(p: Perigo, tempo: number): number {
  if (!p.move) return p.x;
  const { de, ate, ms, ida } = p.move;
  const k = ((tempo + (p.atrasoMs ?? 0)) % ms) / ms;
  return ida ? de + (ate - de) * k : de + (ate - de) * (k < 0.5 ? k * 2 : 2 - k * 2);
}
/** Por onde o perigo passa (para o lugar seguro de voltar). */
export function faixaDoPerigo(p: Perigo): [number, number] {
  if (!p.move) return [p.x, p.x + p.w];
  return [Math.min(p.move.de, p.move.ate), Math.max(p.move.de, p.move.ate) + p.w];
}
/** O vento está soprando agora? */
export function ventoAtivo(f: Fase, tempo: number): boolean {
  return !!f.vento && tempo % f.vento.cicloMs > f.vento.cicloMs - f.vento.duraMs;
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
  /** Em cima de qual plataforma está e desde quando (para afundar e para ser levado pela que anda). */
  pisando?: { i: number; desde: number } | null;
  /** Plataformas afundadas e até quando. */
  afundadas?: Record<number, number>;
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
  // Na visão do oráculo, os lados trocam.
  const mov = atordoado ? 0 : ((e.dir ? 1 : 0) - (e.esq ? 1 : 0)) * (visaoAtiva(f, tempo) ? -1 : 1);
  if (mov !== 0) dir = mov as 1 | -1;
  const controle = noChao ? 1 : 0.7;
  if (mov !== 0) vx = Math.max(-VELOCIDADE, Math.min(VELOCIDADE, vx + mov * ACELERA * controle * seg));
  else vx = Math.sign(vx) * Math.max(0, Math.abs(vx) - FREIA * controle * seg);
  // O vento empurra para trás.
  if (ventoAtivo(f, tempo)) vx = Math.max(-VELOCIDADE, vx - f.vento!.forca * seg);
  // Em cima de uma plataforma que anda: vai junto.
  const pis = s0.pisando;
  if (pis && s0.noChao) {
    const pp = f.plataformas[pis.i];
    if (pp?.move) x += xDaPlataforma(pp, tempo) - xDaPlataforma(pp, s0.tempo);
  }
  x = Math.max(3, Math.min(larguraDa(f) - 3, x + vx * seg));
  if (x <= 3 || x >= larguraDa(f) - 3) vx = 0;
  // Pular: do chão, de cima de uma plataforma, ou logo depois de sair da beirada.
  if (!atordoado && e.pular && vy <= 0 && (noChao || tempo - s0.chaoEm <= FOLGA_PULO)) {
    vy = PULO;
    noChao = false;
  }
  // Cair
  let pisouEm = -1;
  const yAntes = y;
  vy -= GRAVIDADE * seg;
  y += vy * seg;
  noChao = false;
  if (y <= 0) {
    y = 0;
    vy = 0;
    noChao = true;
  } else if (vy <= 0) {
    // Plataformas "de mesa": só seguram quem cai em cima (dá para subir por baixo). A que afundou não segura.
    for (let i = 0; i < f.plataformas.length; i++) {
      const p = f.plataformas[i]!;
      if ((s0.afundadas?.[i] ?? 0) > tempo || !plataformaAcesa(p, tempo)) continue;
      const px = xDaPlataforma(p, tempo);
      const emCima = x + LARGURA_HEROI / 2 > px && x - LARGURA_HEROI / 2 < px + p.w;
      if (emCima && yAntes >= p.y - 0.01 && y <= p.y) {
        y = p.y;
        vy = 0;
        noChao = true;
        pisouEm = i;
        break;
      }
    }
  }
  let afundadas = s0.afundadas ?? {};
  let pisando: EstadoFase['pisando'] = pisouEm >= 0 ? { i: pisouEm, desde: s0.pisando?.i === pisouEm ? s0.pisando.desde : tempo } : null;
  // A que afunda: depois de um tempo com ele em cima, afunda (e ele cai).
  if (pisando) {
    const pa = f.plataformas[pisando.i]!;
    if (pa.afunda && tempo - pisando.desde >= pa.afunda) {
      afundadas = { ...afundadas, [pisando.i]: tempo + 2500 };
      pisando = null;
      noChao = false;
    }
  }
  let s: EstadoFase = { ...s0, tempo, x, y, vx, vy, noChao, dir, andando: Math.abs(vx) > 4 && noChao, chaoEm: noChao ? tempo : s0.chaoEm, pisando, afundadas };
  // O ponto de volta: o último lugar seguro em que pisou (em cima de algo, ou no chão longe do fogo).
  // (Não guarda em cima de plataforma que anda ou que afunda: ela pode não estar lá na volta.)
  const instavel =
    (pisando ? !!(f.plataformas[pisando.i]!.move || f.plataformas[pisando.i]!.afunda || f.plataformas[pisando.i]!.pisca) : false) ||
    // Onde a enchente chega não é lugar seguro.
    f.perigos.some((p) => p.sobe && x > p.x - 2 && x < p.x + p.w + 2 && y < p.sobe.altura);
  if (tempo >= s0.feridoAte && noChao && !instavel && (y > 0 || !f.perigos.some((p) => { const [a, b] = faixaDoPerigo(p); return x > a - 4 && x < b + 4; }))) s = { ...s, volta: x, voltaY: y };
  // Fogo: encostou com os pés baixos, volta para o ponto seguro.
  if (tempo >= s.feridoAte) {
    for (const p of f.perigos) {
      if (y < alturaDoPerigo(p, tempo) && x > xDoPerigo(p, tempo) && x < xDoPerigo(p, tempo) + p.w && fogoAceso(p, tempo)) {
        s = { ...s, x: s.volta, y: s.voltaY, vx: 0, vy: 0, noChao: true, feridoAte: tempo + FERIDO_MS, queimadas: s.queimadas + 1 };
        break;
      }
    }
  } else {
    // Piscando depois de queimar: o fogo vira parede (não dá para atravessar enquanto não pode se queimar).
    for (const p of f.perigos) {
      if (y < alturaDoPerigo(p, tempo) && x > xDoPerigo(p, tempo) && x < xDoPerigo(p, tempo) + p.w && fogoAceso(p, tempo)) {
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
