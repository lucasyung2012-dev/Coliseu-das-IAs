/**
 * A luta do modo História (docs/HISTORIA.md, seção 3): um contra um, de lado,
 * com 3 botões (golpe, escudo, esquiva). Cada inimigo dá um SINAL antes de atacar;
 * o jogo é ler o sinal e reagir na hora certa:
 * - sinal AMARELO (golpe de corpo): dá para defender com o ESCUDO (ou esquivar);
 * - sinal VERMELHO (fogo, investida): o escudo não segura direito, tem que ESQUIVAR.
 * Depois de atacar, o inimigo fica ABERTO um tempo: é a hora de bater forte.
 * Cada boa jogada enche o ÂNIMO; cheio, libera o golpe especial.
 * Funções puras: a tela chama `passoLuta` a cada tick e `agir` nos botões.
 */
export const TICK_LUTA = 50;
export const ANIMO_MAX = 100;
const GOLPE_MS = 250;
const RECARGA_GOLPE_MS = 320;
const ESCUDO_MS = 550;
const ESQUIVA_MS = 420;
const RECARGA_ESQUIVA_MS = 800;
const FERIDO_MS = 350;
const ATORDOADO_MS = 1200;

export type TipoAtaque = 'corpo' | 'fogo' | 'investida';

export interface AtaqueInimigo {
  nome: string;
  tipo: TipoAtaque;
  /** Quanto tempo o sinal aparece antes do golpe. */
  sinalMs: number;
  dano: number;
  /** Quanto tempo o inimigo fica aberto (vulnerável) depois de atacar. */
  abertoMs: number;
}

export interface FaseInimigo {
  ataques: AtaqueInimigo[];
  /** Espera entre um ataque e outro (o jogo sorteia dentro do intervalo). */
  pausaMs: [number, number];
}

export interface DefInimigo {
  id: string;
  nome: string;
  vida: number;
  fases: FaseInimigo[];
  /** A partir de que fração da vida entra a fase seguinte (ex.: [0.5] = metade). */
  trocaDeFase?: number[];
  chefao?: boolean;
}

export type AcaoJogador = 'parado' | 'golpe' | 'escudo' | 'esquiva' | 'especial' | 'ferido';
export type EstadoInimigo = 'espera' | 'sinal' | 'aberto' | 'atordoado' | 'ferido';

export interface EventoLuta {
  id: number;
  tipo: 'acerto' | 'bloqueio' | 'esquiva' | 'dano' | 'especial' | 'guarda' | 'fase';
  valor?: number;
  lado: 'jogador' | 'inimigo';
  ate: number;
}

export interface EstadoLuta {
  tempo: number;
  def: DefInimigo;
  jogador: { vida: number; vidaMax: number; acao: AcaoJogador; acaoDesde: number; acaoAte: number; golpePronto: number; esquivaPronta: number };
  inimigo: { vida: number; estado: EstadoInimigo; estadoAte: number; fase: number; ataque: number; proximoEm: number };
  animo: number;
  fim: null | 'vitoria' | 'derrota';
  eventos: EventoLuta[];
  seq: number;
}

/** Atributos do gladiador (sobem no Ludus, a partir do capítulo 3). */
export interface AtributosLuta {
  vida: number;
  forca: number;
  defesa: number;
  carisma: number;
}
export const ATRIBUTOS_INICIAIS: AtributosLuta = { vida: 100, forca: 1, defesa: 1, carisma: 1 };

export type Aleatorio = () => number;

export function novaLuta(def: DefInimigo, atributos: AtributosLuta = ATRIBUTOS_INICIAIS): EstadoLuta {
  return {
    tempo: 0,
    def,
    jogador: { vida: atributos.vida, vidaMax: atributos.vida, acao: 'parado', acaoDesde: 0, acaoAte: 0, golpePronto: 0, esquivaPronta: 0 },
    inimigo: { vida: def.vida, estado: 'espera', estadoAte: 0, fase: 0, ataque: 0, proximoEm: 1500 },
    animo: 0,
    fim: null,
    eventos: [],
    seq: 0,
  };
}

const evento = (s: EstadoLuta, tipo: EventoLuta['tipo'], lado: EventoLuta['lado'], valor?: number): EstadoLuta => ({
  ...s,
  seq: s.seq + 1,
  eventos: [...s.eventos, { id: s.seq + 1, tipo, lado, valor, ate: s.tempo + 700 }],
});

const ganharAnimo = (s: EstadoLuta, n: number, a: AtributosLuta): EstadoLuta => ({ ...s, animo: Math.min(ANIMO_MAX, s.animo + n * (1 + (a.carisma - 1) * 0.25)) });

/** O ataque que o inimigo está preparando (ou o próximo). */
export function ataqueAtual(s: EstadoLuta): AtaqueInimigo {
  const fase = s.def.fases[s.inimigo.fase]!;
  return fase.ataques[s.inimigo.ataque % fase.ataques.length]!;
}

/** O jogador apertou um botão. */
export function agir(s: EstadoLuta, acao: 'golpe' | 'escudo' | 'esquiva' | 'especial', a: AtributosLuta = ATRIBUTOS_INICIAIS): EstadoLuta {
  if (s.fim) return s;
  const j = s.jogador;
  const ocupado = s.tempo < j.acaoAte && j.acao !== 'escudo';
  if (j.acao === 'ferido' && s.tempo < j.acaoAte) return s;
  if (acao === 'especial') {
    if (s.animo < ANIMO_MAX) return s;
    let r: EstadoLuta = { ...s, animo: 0, jogador: { ...j, acao: 'especial', acaoDesde: s.tempo, acaoAte: s.tempo + 700 } };
    r = bater(r, 30 * (1 + (a.forca - 1) * 0.2), true);
    return evento({ ...r, inimigo: { ...r.inimigo, estado: 'atordoado', estadoAte: s.tempo + ATORDOADO_MS } }, 'especial', 'jogador');
  }
  if (acao === 'golpe') {
    if (ocupado || s.tempo < j.golpePronto) return s;
    const r: EstadoLuta = { ...s, jogador: { ...j, acao: 'golpe', acaoDesde: s.tempo, acaoAte: s.tempo + GOLPE_MS, golpePronto: s.tempo + RECARGA_GOLPE_MS } };
    const i = r.inimigo;
    const base = 8 * (1 + (a.forca - 1) * 0.2);
    // Aberto ou atordoado: golpe cheio (e mais Ânimo). Em guarda: ele defende quase tudo.
    if (i.estado === 'aberto' || i.estado === 'atordoado') return ganharAnimo(bater(r, i.estado === 'atordoado' ? base * 1.5 : base), 6, a);
    if (i.estado === 'sinal') return ganharAnimo(bater(r, base * 0.6), 3, a);
    return evento(bater(r, 1), 'guarda', 'inimigo');
  }
  if (acao === 'escudo') {
    if (ocupado) return s;
    return { ...s, jogador: { ...j, acao: 'escudo', acaoDesde: s.tempo, acaoAte: s.tempo + ESCUDO_MS } };
  }
  // esquiva
  if (ocupado || s.tempo < j.esquivaPronta) return s;
  return { ...s, jogador: { ...j, acao: 'esquiva', acaoDesde: s.tempo, acaoAte: s.tempo + ESQUIVA_MS, esquivaPronta: s.tempo + RECARGA_ESQUIVA_MS } };
}

function bater(s: EstadoLuta, dano: number, especial = false): EstadoLuta {
  const vida = Math.max(0, s.inimigo.vida - dano);
  let r: EstadoLuta = { ...s, inimigo: { ...s.inimigo, vida } };
  if (!especial) r = evento(r, 'acerto', 'inimigo', Math.round(dano));
  if (vida <= 0) return { ...r, fim: 'vitoria' };
  // Troca de fase do chefão (fica mais rápido e muda os golpes).
  const limite = s.def.trocaDeFase?.[r.inimigo.fase];
  if (limite !== undefined && vida / s.def.vida <= limite && r.inimigo.fase + 1 < s.def.fases.length) {
    r = evento({ ...r, inimigo: { ...r.inimigo, fase: r.inimigo.fase + 1, ataque: 0 } }, 'fase', 'inimigo');
  }
  return r;
}

/** O golpe do inimigo chegou: o que o jogador estava fazendo decide o resultado. */
function impacto(s: EstadoLuta, at: AtaqueInimigo, a: AtributosLuta): EstadoLuta {
  const j = s.jogador;
  const fazendo = s.tempo < j.acaoAte ? j.acao : 'parado';
  const aberto = (r: EstadoLuta, ms: number): EstadoLuta => ({ ...r, inimigo: { ...r.inimigo, estado: 'aberto', estadoAte: r.tempo + ms, ataque: r.inimigo.ataque + 1 } });
  if (fazendo === 'esquiva' || fazendo === 'especial') {
    // Esquivou: escapa de tudo e o inimigo fica mais tempo aberto.
    return aberto(ganharAnimo(evento(s, 'esquiva', 'jogador'), 15, a), at.abertoMs + 300);
  }
  if (fazendo === 'escudo' && at.tipo === 'corpo') {
    return aberto(ganharAnimo(evento(s, 'bloqueio', 'jogador'), 10, a), at.abertoMs);
  }
  // Escudo contra fogo ou investida segura só metade.
  const fator = fazendo === 'escudo' ? 0.5 : 1;
  const dano = Math.round((at.dano * fator) / (1 + (a.defesa - 1) * 0.15));
  const vida = Math.max(0, j.vida - dano);
  let r: EstadoLuta = evento({ ...s, jogador: { ...j, vida, acao: 'ferido', acaoDesde: s.tempo, acaoAte: s.tempo + FERIDO_MS } }, 'dano', 'jogador', dano);
  r = aberto(r, Math.round(at.abertoMs * 0.6));
  return vida <= 0 ? { ...r, fim: 'derrota' } : r;
}

export function passoLuta(s0: EstadoLuta, a: AtributosLuta = ATRIBUTOS_INICIAIS, aleatorio: Aleatorio = Math.random): EstadoLuta {
  if (s0.fim) return s0;
  const tempo = s0.tempo + TICK_LUTA;
  let s: EstadoLuta = { ...s0, tempo, eventos: s0.eventos.filter((e) => e.ate > tempo) };
  if (s.jogador.acaoAte <= tempo && s.jogador.acao !== 'parado') s = { ...s, jogador: { ...s.jogador, acao: 'parado' } };
  const i = s.inimigo;
  const fase = s.def.fases[i.fase]!;
  if (i.estado === 'sinal' && tempo >= i.estadoAte) return impacto(s, ataqueAtual(s), a);
  if ((i.estado === 'aberto' || i.estado === 'atordoado' || i.estado === 'ferido') && tempo >= i.estadoAte) {
    const [min, max] = fase.pausaMs;
    return { ...s, inimigo: { ...i, estado: 'espera', proximoEm: tempo + min + aleatorio() * (max - min) } };
  }
  if (i.estado === 'espera' && tempo >= i.proximoEm) {
    return { ...s, inimigo: { ...i, estado: 'sinal', estadoAte: tempo + ataqueAtual(s).sinalMs } };
  }
  return s;
}
