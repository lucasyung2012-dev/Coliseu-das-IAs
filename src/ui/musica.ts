import { useEffect, useSyncExternalStore } from 'react';
import type { Lugar } from '@/game/historia/roteiro';
import { saidaDeAudio } from './som';

/**
 * A MÚSICA DE FUNDO do modo História (pedido do Lucas, 22/11/2026). Feita pelo próprio
 * jogo (sintetizador, sem arquivo de áudio), um tema para cada tipo de lugar, em escalas
 * "antigas" para soar romano. Na luta, o tema do lugar acelera e ganha tambores; contra
 * chefão, tem um tema próprio. Respeita o botão de som e o volume do jogo, e tem a sua
 * própria opção (ligar/desligar) no menu de pausa.
 */
export type TemaMusica =
  | 'biblioteca'
  | 'chamas'
  | 'rua'
  | 'arena'
  | 'ludus'
  | 'mar'
  | 'ceu'
  | 'catacumbas'
  | 'nucleo'
  | 'livre'
  | 'chefao';

interface Tema {
  bpm: number;
  /** Nota base (Hz) e a escala (semitons a partir dela). */
  raiz: number;
  escala: number[];
  /** Baixo: um grau da escala por compasso (o ciclo repete). */
  baixo: number[];
  /** Melodia: 16 passos por compasso (grau da escala, ou null = pausa); vários compassos. */
  melodia: (number | null)[];
  timbre: OscillatorType;
  /** Tambor: 16 passos ('x' = forte, 'o' = fraco, '.' = nada). */
  tambor?: string;
  /** Ruído de fundo: ondas do mar, vento, fogo. */
  ambiente?: 'ondas' | 'vento' | 'fogo';
  /** Notinhas brilhando no agudo (o céu). */
  brilho?: boolean;
  /** Batida de coração grave (o Núcleo). */
  coracao?: boolean;
}

// Escalas: dórico, frígio (mais sombrio) e mixolídio (alegre).
const DORICO = [0, 2, 3, 5, 7, 9, 10, 12, 14, 15];
const FRIGIO = [0, 1, 3, 5, 7, 8, 10, 12, 13, 15];
const MIXO = [0, 2, 4, 5, 7, 9, 10, 12, 14, 16];
const _ = null;

const TEMAS: Record<TemaMusica, Tema> = {
  biblioteca: {
    bpm: 72,
    raiz: 146.8,
    escala: DORICO,
    baixo: [0, 3, 4, 0],
    melodia: [4, _, 2, _, 4, 5, 4, _, 2, _, 1, _, 0, _, _, _, 2, _, 4, _, 5, _, 7, _, 5, 4, 2, _, 4, _, _, _],
    timbre: 'triangle',
  },
  chamas: {
    bpm: 112,
    raiz: 146.8,
    escala: FRIGIO,
    baixo: [0, 0, 1, 0],
    melodia: [0, _, 1, _, 0, _, _, 3, _, 1, _, 0, _, _, 4, _, 3, _, 1, _, 0, _, _, 1, _, 3, _, 4, 5, 4, 3, 1],
    timbre: 'sawtooth',
    tambor: 'x..ox..ox..ox.o.',
    ambiente: 'fogo',
  },
  rua: {
    bpm: 88,
    raiz: 130.8,
    escala: DORICO,
    baixo: [0, 3, 0, 4],
    melodia: [_, _, 4, _, _, 3, _, 2, _, _, 0, _, _, _, _, _, _, _, 2, _, 3, _, 4, _, _, 5, _, 4, _, _, _, _],
    timbre: 'sine',
    tambor: 'o.......o...o...',
    ambiente: 'vento',
  },
  arena: {
    bpm: 100,
    raiz: 146.8,
    escala: DORICO,
    baixo: [0, 4, 3, 4],
    melodia: [0, _, 4, _, 7, _, _, 4, 5, _, 4, _, 2, _, _, _, 0, _, 4, _, 7, _, 8, 7, 5, _, 4, _, 7, _, _, _],
    timbre: 'sawtooth',
    tambor: 'x...o.x.x...o...',
  },
  ludus: {
    bpm: 108,
    raiz: 164.8,
    escala: MIXO,
    baixo: [0, 3, 4, 0],
    melodia: [0, _, 2, 4, _, 4, 5, 4, 2, _, 0, _, 2, _, _, _, 4, _, 5, 7, _, 7, 5, 4, 2, _, 4, _, 0, _, _, _],
    timbre: 'square',
    tambor: 'x.o.x.o.x.o.xoo.',
  },
  mar: {
    bpm: 84,
    raiz: 130.8,
    escala: DORICO,
    baixo: [0, 4, 3, 0],
    melodia: [0, _, _, 2, _, _, 4, _, _, 5, _, 4, 2, _, _, _, 4, _, _, 5, _, _, 7, _, _, 5, _, 4, 2, _, _, _],
    timbre: 'square',
    tambor: 'o.....o.....o...',
    ambiente: 'ondas',
  },
  ceu: {
    bpm: 76,
    raiz: 174.6,
    escala: DORICO,
    baixo: [0, 5, 3, 4],
    melodia: [7, _, _, 4, _, _, 5, _, _, _, 2, _, _, _, _, _, 7, _, _, 8, _, _, 9, _, _, 7, _, _, 4, _, _, _],
    timbre: 'sine',
    brilho: true,
    ambiente: 'vento',
  },
  catacumbas: {
    bpm: 60,
    raiz: 110,
    escala: FRIGIO,
    baixo: [0, 1, 0, 3],
    melodia: [_, _, _, _, 4, _, _, _, _, _, 3, _, _, 1, _, _, _, _, _, _, _, _, 5, _, _, 4, _, _, _, _, _, _],
    timbre: 'triangle',
    ambiente: 'vento',
  },
  nucleo: {
    bpm: 66,
    raiz: 98,
    escala: FRIGIO,
    baixo: [0, 0, 1, 0],
    melodia: [_, _, _, _, _, _, _, _, 7, _, 8, _, 7, _, _, _, _, _, _, _, _, _, _, _, 5, _, 4, _, 1, _, _, _],
    timbre: 'sawtooth',
    coracao: true,
  },
  livre: {
    bpm: 104,
    raiz: 196,
    escala: MIXO,
    baixo: [0, 3, 4, 0],
    melodia: [4, _, 5, _, 7, _, 4, _, 5, 4, 2, _, 4, _, _, _, 7, _, 8, _, 9, _, 7, _, 5, _, 4, _, 7, _, _, _],
    timbre: 'triangle',
    tambor: 'x...o...x.x.o...',
    brilho: true,
  },
  chefao: {
    bpm: 132,
    raiz: 110,
    escala: FRIGIO,
    baixo: [0, 1, 0, 5],
    melodia: [0, _, 0, 1, _, 0, 3, _, 1, _, 0, _, 5, 4, 3, 1, 0, _, 0, 1, _, 3, 4, _, 5, _, 7, _, 8, 7, 5, 4],
    timbre: 'sawtooth',
    tambor: 'x.oxx.o.x.oxx.oo',
    ambiente: 'fogo',
  },
};

/** O tema de cada lugar. */
export function temaDoLugar(lugar: Lugar): TemaMusica {
  if (lugar === 'biblioteca-chamas' || lugar === 'roma-chamas') return 'chamas';
  if (lugar.startsWith('biblioteca') || lugar === 'catacumbas-arquivo') return 'biblioteca';
  if (lugar === 'catacumbas' || lugar === 'subura-esgoto' || lugar === 'hipogeu' || lugar === 'galera-porao' || lugar === 'ludus-celas' || lugar === 'jaula-carroca' || lugar === 'coliseu-tunel') return 'catacumbas';
  if (lugar === 'nucleo-camara') return 'nucleo';
  if (lugar === 'coliseu-livre') return 'livre';
  if (lugar.startsWith('ludus')) return 'ludus';
  if (lugar === 'porto' || lugar.startsWith('porto') || lugar.startsWith('navio') || lugar.startsWith('galera') || lugar === 'praia-naufragio' || lugar === 'frota-noite' || lugar === 'mar-batalha' || lugar === 'coliseu-inundado') return 'mar';
  if (lugar.startsWith('observatorio') || lugar === 'telhados-noite' || lugar === 'aqueduto' || lugar.startsWith('templo') || lugar === 'olho') return 'ceu';
  if (lugar.startsWith('coliseu') || lugar === 'camarote' || lugar === 'titulo') return 'arena';
  return 'rua';
}

// ---------- O tocador (um só, para o jogo inteiro) ----------

const CHAVE = 'coliseu.musica.desligada';
let desligada = (() => {
  try {
    return localStorage.getItem(CHAVE) === '1';
  } catch {
    return false;
  }
})();
const ouvintes = new Set<() => void>();

export const musicaLigada = () => !desligada;
export function alternarMusica() {
  desligada = !desligada;
  try {
    localStorage.setItem(CHAVE, desligada ? '1' : '0');
  } catch {
    /* sem armazenamento: vale só agora */
  }
  if (desligada) pararAtual();
  else if (pedido) comecar(pedido.tema, pedido.luta);
  ouvintes.forEach((f) => f());
}
export function useMusicaLigada(): boolean {
  return useSyncExternalStore(
    (f) => {
      ouvintes.add(f);
      return () => ouvintes.delete(f);
    },
    musicaLigada,
    musicaLigada,
  );
}

interface Tocando {
  tema: TemaMusica;
  luta: boolean;
  ganho: GainNode;
  relogio: number;
  passo: number;
  proximo: number;
}
let atual: Tocando | null = null;
let pedido: { tema: TemaMusica; luta: boolean } | null = null;
let abafada = false;
/** Volume da música em relação aos efeitos (fica por baixo). */
const VOLUME_MUSICA = 0.32;

function pararAtual() {
  if (!atual) return;
  const t = atual;
  atual = null;
  window.clearInterval(t.relogio);
  const a = saidaDeAudio();
  if (a) {
    t.ganho.gain.cancelScheduledValues(a.c.currentTime);
    t.ganho.gain.setValueAtTime(t.ganho.gain.value, a.c.currentTime);
    t.ganho.gain.linearRampToValueAtTime(0, a.c.currentTime + 0.8);
  }
  window.setTimeout(() => t.ganho.disconnect(), 1000);
}

function comecar(tema: TemaMusica, luta: boolean) {
  pararAtual();
  if (desligada) return;
  const a = saidaDeAudio();
  // O áudio ainda não acordou (precisa de um toque): tenta de novo daqui a pouco.
  if (!a) {
    window.setTimeout(() => {
      if (pedido && pedido.tema === tema && pedido.luta === luta && !atual) comecar(tema, luta);
    }, 700);
    return;
  }
  const ganho = a.c.createGain();
  ganho.gain.setValueAtTime(0, a.c.currentTime);
  ganho.gain.linearRampToValueAtTime(abafada ? VOLUME_MUSICA * 0.3 : VOLUME_MUSICA, a.c.currentTime + 1.2);
  ganho.connect(a.saida);
  const t: Tocando = { tema, luta, ganho, relogio: 0, passo: 0, proximo: a.c.currentTime + 0.1 };
  t.relogio = window.setInterval(() => agendar(t), 60);
  atual = t;
}

/** Toca (ou troca) a música. `null` para parar. */
export function tocarMusica(tema: TemaMusica | null, luta = false) {
  pedido = tema ? { tema, luta } : null;
  if (!tema) return pararAtual();
  if (atual && atual.tema === tema && atual.luta === luta) return;
  comecar(tema, luta);
}

/** No menu de pausa a música fica baixinha. */
export function abafarMusica(sim: boolean) {
  abafada = sim;
  const a = saidaDeAudio();
  if (!atual || !a) return;
  atual.ganho.gain.cancelScheduledValues(a.c.currentTime);
  atual.ganho.gain.linearRampToValueAtTime(sim ? VOLUME_MUSICA * 0.3 : VOLUME_MUSICA, a.c.currentTime + 0.3);
}

/** Usar numa tela: toca o tema enquanto a tela estiver aberta. */
export function useMusica(tema: TemaMusica | null, luta = false) {
  useEffect(() => {
    tocarMusica(tema, luta);
  }, [tema, luta]);
  useEffect(() => () => tocarMusica(null), []);
}

// ---------- O agendador: escreve as notas um pouquinho antes da hora ----------

const freqDo = (tm: Tema, grau: number, oitava = 0) => tm.raiz * 2 ** ((tm.escala[((grau % tm.escala.length) + tm.escala.length) % tm.escala.length]! + oitava * 12) / 12);

function agendar(t: Tocando) {
  const a = saidaDeAudio();
  if (!a || atual !== t) return;
  const tm = TEMAS[t.tema];
  const bpm = t.luta && t.tema !== 'chefao' ? tm.bpm * 1.25 : tm.bpm;
  const passoS = 60 / bpm / 4;
  // Se ficou para trás (aba escondida), pula para agora.
  if (t.proximo < a.c.currentTime - 0.2) t.proximo = a.c.currentTime + 0.05;
  while (t.proximo < a.c.currentTime + 0.25) {
    tocarPasso(a.c, t, tm, t.passo, t.proximo, passoS);
    t.passo++;
    t.proximo += passoS;
  }
}

function tocarPasso(c: AudioContext, t: Tocando, tm: Tema, passo: number, quando: number, passoS: number) {
  const s = passo % 16;
  const compasso = Math.floor(passo / 16);
  // Baixo: uma nota longa no começo do compasso.
  if (s === 0) {
    const grau = tm.baixo[compasso % tm.baixo.length]!;
    som(c, t.ganho, { freq: freqDo(tm, grau, -1), quando, dur: passoS * 15, tipo: 'triangle', vol: 0.22, corte: 500 });
    if (tm.ambiente) ruido(c, t.ganho, quando, passoS * 16, tm.ambiente);
  }
  // Melodia
  const m = tm.melodia[(compasso % (tm.melodia.length / 16)) * 16 + s];
  if (m !== null && m !== undefined) som(c, t.ganho, { freq: freqDo(tm, m), quando, dur: passoS * 2.4, tipo: tm.timbre, vol: tm.timbre === 'sawtooth' || tm.timbre === 'square' ? 0.07 : 0.12, corte: 1800 });
  // Brilho: notinhas agudas de vez em quando (o céu).
  if (tm.brilho && s % 4 === 2 && (passo * 7) % 5 === 0) som(c, t.ganho, { freq: freqDo(tm, (passo * 3) % 7, 2), quando, dur: 0.5, tipo: 'sine', vol: 0.05 });
  // Coração do Núcleo: TUM... TUM.
  if (tm.coracao && (s === 0 || s === 3)) som(c, t.ganho, { freq: 55, ate: 38, quando, dur: 0.3, tipo: 'sine', vol: 0.5 });
  // Tambor (na luta, sempre tem; sem tambor no tema, entra um padrão de batalha).
  const padrao = tm.tambor ?? (t.luta ? 'x...o...x.x.o...' : '');
  const batida = padrao[s];
  if (batida === 'x') som(c, t.ganho, { freq: 90, ate: 45, quando, dur: 0.18, tipo: 'sine', vol: t.luta ? 0.5 : 0.35 });
  else if (batida === 'o') ruido(c, t.ganho, quando, 0.06, 'caixa');
  if (t.luta && s % 2 === 1) ruido(c, t.ganho, quando, 0.03, 'chimbal');
}

function som(c: AudioContext, destino: AudioNode, n: { freq: number; ate?: number; quando: number; dur: number; tipo: OscillatorType; vol: number; corte?: number }) {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = n.tipo;
  o.frequency.setValueAtTime(n.freq, n.quando);
  if (n.ate) o.frequency.exponentialRampToValueAtTime(n.ate, n.quando + n.dur);
  g.gain.setValueAtTime(0.0001, n.quando);
  g.gain.exponentialRampToValueAtTime(n.vol, n.quando + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, n.quando + n.dur);
  let fim: AudioNode = g;
  if (n.corte) {
    const f = c.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = n.corte;
    g.connect(f);
    fim = f;
  }
  fim.connect(destino);
  o.connect(g);
  o.start(n.quando);
  o.stop(n.quando + n.dur + 0.05);
}

let buf: AudioBuffer | null = null;
function ruido(c: AudioContext, destino: AudioNode, quando: number, dur: number, tipo: 'ondas' | 'vento' | 'fogo' | 'caixa' | 'chimbal') {
  if (!buf) {
    buf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = c.createBufferSource();
  s.buffer = buf;
  s.loop = true;
  const f = c.createBiquadFilter();
  const g = c.createGain();
  const cfg = {
    ondas: { filtro: 'lowpass' as BiquadFilterType, freq: 500, vol: 0.09, ataque: dur * 0.4 },
    vento: { filtro: 'bandpass' as BiquadFilterType, freq: 700, vol: 0.035, ataque: dur * 0.5 },
    fogo: { filtro: 'highpass' as BiquadFilterType, freq: 2500, vol: 0.025, ataque: 0.3 },
    caixa: { filtro: 'bandpass' as BiquadFilterType, freq: 1800, vol: 0.12, ataque: 0.004 },
    chimbal: { filtro: 'highpass' as BiquadFilterType, freq: 7000, vol: 0.04, ataque: 0.002 },
  }[tipo];
  f.type = cfg.filtro;
  f.frequency.value = cfg.freq;
  g.gain.setValueAtTime(0.0001, quando);
  g.gain.exponentialRampToValueAtTime(cfg.vol, quando + cfg.ataque);
  g.gain.exponentialRampToValueAtTime(0.0001, quando + dur);
  s.connect(f).connect(g).connect(destino);
  s.start(quando);
  s.stop(quando + dur + 0.05);
}
