import type { Falante } from '@/game/historia/roteiro';
import { saidaDeAudio } from './som';

/**
 * Os sons próprios do modo História (pedido do Lucas, 21/11/2026: nada reaproveitado do
 * Arcade). Também gerados na hora com a Web Audio API, mas com peças mais ricas: envelope,
 * filtro, eco (para salas de pedra), metal com harmônicos tortos, madeira, vento e tambor.
 * E as VOZES: cada personagem faz um "barulhinho" próprio enquanto o texto aparece
 * (não é voz humana; é um bip com o jeito dele).
 * O botão de som e o volume do jogo valem aqui também (saidaDeAudio).
 */

export type SomHistoria =
  // interface e história
  | 'clique'
  | 'selecionar'
  | 'start'
  | 'falha'
  | 'fanfarra'
  | 'vitoria'
  | 'derrota'
  | 'pagina'
  | 'passos'
  | 'portao'
  | 'trombeta'
  | 'plateia'
  | 'palmas'
  | 'pergunta'
  | 'refuta'
  | 'senador'
  | 'catapulta'
  | 'galope'
  | 'pesada'
  | 'tambor'
  | 'onda'
  | 'remo'
  | 'martelo'
  // luta
  | 'espadas'
  | 'escudoMetal'
  | 'esquiva'
  | 'dano'
  | 'especial'
  | 'fase'
  | 'finta'
  | 'contra'
  | 'cansado'
  | 'riposta'
  | 'quebra'
  | 'plano'
  | 'aliado'
  | 'guarda'
  | 'reflexo';

type Audio = { c: AudioContext; saida: GainNode };

// ---------- Peças ----------

interface Nota {
  freq: number;
  ate?: number;
  dur: number;
  tipo?: OscillatorType;
  vol?: number;
  atraso?: number;
  /** Ataque (s): quanto demora para chegar no volume. */
  ataque?: number;
  /** Filtro passa-baixa (Hz), para tirar o "chiado" de fliperama. */
  corte?: number;
  /** Desafina uma segunda voz (em cents) para engrossar o som. */
  coro?: number;
  /** Tremor de altura (vibrato), em Hz. */
  vibrato?: number;
}

function nota(a: Audio, { freq, ate, dur, tipo = 'triangle', vol = 0.25, atraso = 0, ataque = 0.005, corte, coro, vibrato }: Nota, destino?: AudioNode) {
  const { c } = a;
  const t = c.currentTime + atraso;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + ataque);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  let fim: AudioNode = g;
  if (corte) {
    const f = c.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = corte;
    g.connect(f);
    fim = f;
  }
  fim.connect(destino ?? a.saida);
  const vozes = coro ? [-coro, coro] : [0];
  for (const d of vozes) {
    const o = c.createOscillator();
    o.type = tipo;
    o.frequency.setValueAtTime(freq, t);
    o.detune.value = d;
    if (ate) o.frequency.exponentialRampToValueAtTime(ate, t + dur);
    if (vibrato) {
      const lfo = c.createOscillator();
      const lg = c.createGain();
      lfo.frequency.value = vibrato;
      lg.gain.value = freq * 0.03;
      lfo.connect(lg).connect(o.frequency);
      lfo.start(t);
      lfo.stop(t + dur + 0.05);
    }
    o.connect(g);
    o.start(t);
    o.stop(t + dur + 0.05);
  }
}

let ruidoBuf: AudioBuffer | null = null;
interface Ruido {
  dur: number;
  vol?: number;
  atraso?: number;
  filtro?: BiquadFilterType;
  freq?: number;
  ate?: number;
  q?: number;
  ataque?: number;
}

function ruido(a: Audio, { dur, vol = 0.25, atraso = 0, filtro = 'bandpass', freq = 1200, ate, q = 1, ataque = 0.003 }: Ruido, destino?: AudioNode) {
  const { c } = a;
  if (!ruidoBuf) {
    ruidoBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = ruidoBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const t = c.currentTime + atraso;
  const s = c.createBufferSource();
  s.buffer = ruidoBuf;
  s.loop = true;
  const f = c.createBiquadFilter();
  f.type = filtro;
  f.Q.value = q;
  f.frequency.setValueAtTime(freq, t);
  if (ate) f.frequency.exponentialRampToValueAtTime(ate, t + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + ataque);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f).connect(g).connect(destino ?? a.saida);
  s.start(t);
  s.stop(t + dur + 0.05);
}

/** Um eco curto, como numa sala de pedra (vale para o som que passar por ele). */
function eco(a: Audio, tempo = 0.11, volta = 0.35): AudioNode {
  const { c } = a;
  const entrada = c.createGain();
  const atraso = c.createDelay(1);
  atraso.delayTime.value = tempo;
  const fb = c.createGain();
  fb.gain.value = volta;
  const f = c.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = 2200;
  entrada.connect(a.saida);
  entrada.connect(atraso);
  atraso.connect(f).connect(fb).connect(atraso);
  f.connect(a.saida);
  return entrada;
}

/** Metal: parciais "tortas" (não harmônicas), como um escudo ou um sino. */
function metal(a: Audio, base: number, dur: number, vol = 0.12, atraso = 0) {
  [1, 1.47, 2.09, 2.76, 3.43].forEach((r, i) => nota(a, { freq: base * r, dur: dur * (1 - i * 0.12), tipo: 'sine', vol: vol / (i * 0.6 + 1), atraso }));
}

/** Pancada grave (um "tum" no peito). */
function baque(a: Audio, freq = 110, vol = 0.45, atraso = 0, dur = 0.22) {
  nota(a, { freq, ate: freq * 0.45, dur, tipo: 'sine', vol, atraso });
  ruido(a, { dur: 0.06, vol: vol * 0.4, filtro: 'lowpass', freq: 900, atraso });
}

const NOTA = { D3: 147, F3: 175, G3: 196, A3: 220, Bb3: 233, C4: 262, D4: 294, E4: 330, F4: 349, G4: 392, A4: 440, Bb4: 466, C5: 523, D5: 587, E5: 659, F5: 698, G5: 784, A5: 880 };

/** Melodia num "modo antigo" (dórico), para soar romano e não de fliperama. */
function frase(a: Audio, notas: number[], passo: number, extra: Partial<Nota> = {}, destino?: AudioNode) {
  notas.forEach((freq, i) => nota(a, { dur: passo * 1.6, tipo: 'triangle', vol: 0.16, corte: 2600, coro: 6, ...extra, freq, atraso: (extra.atraso ?? 0) + i * passo }, destino));
}

// ---------- O banco de sons ----------

const SONS: Record<SomHistoria, (a: Audio) => void> = {
  // Interface: madeira e papel, nada de bipe de fliperama.
  clique: (a) => ruido(a, { dur: 0.04, vol: 0.18, freq: 2400, q: 6 }),
  selecionar: (a) => {
    nota(a, { freq: NOTA.D5, dur: 0.12, tipo: 'sine', vol: 0.14 });
    nota(a, { freq: NOTA.A5, dur: 0.18, tipo: 'sine', vol: 0.1, atraso: 0.06 });
  },
  start: (a) => frase(a, [NOTA.D4, NOTA.A4, NOTA.D5], 0.09, { vol: 0.14 }, eco(a, 0.14, 0.3)),
  falha: (a) => {
    nota(a, { freq: 180, ate: 120, dur: 0.22, tipo: 'sawtooth', vol: 0.12, corte: 700 });
    ruido(a, { dur: 0.12, vol: 0.1, filtro: 'lowpass', freq: 500 });
  },
  pagina: (a) => ruido(a, { dur: 0.09, vol: 0.1, freq: 3800, ate: 1800, q: 0.8, ataque: 0.02 }),
  fanfarra: (a) => {
    const e = eco(a, 0.16, 0.35);
    frase(a, [NOTA.D4, NOTA.F4, NOTA.A4, NOTA.D5], 0.11, { tipo: 'sawtooth', vol: 0.11, corte: 1800, coro: 9 }, e);
    nota(a, { freq: NOTA.D5, dur: 0.9, tipo: 'sawtooth', vol: 0.1, corte: 1600, coro: 9, atraso: 0.44, ataque: 0.04 }, e);
  },
  vitoria: (a) => {
    const e = eco(a, 0.18, 0.4);
    frase(a, [NOTA.A3, NOTA.D4, NOTA.E4, NOTA.F4, NOTA.A4], 0.1, { tipo: 'sawtooth', vol: 0.1, corte: 2000, coro: 8 }, e);
    [NOTA.D4, NOTA.F4, NOTA.A4, NOTA.D5].forEach((f) => nota(a, { freq: f, dur: 1.2, tipo: 'triangle', vol: 0.08, atraso: 0.5, ataque: 0.05, coro: 5 }, e));
    baque(a, 90, 0.35, 0.5);
  },
  derrota: (a) => {
    const e = eco(a, 0.22, 0.45);
    frase(a, [NOTA.A4, NOTA.F4, NOTA.D4, NOTA.A3], 0.22, { tipo: 'triangle', vol: 0.13, corte: 1400 }, e);
    nota(a, { freq: 73, dur: 1.4, tipo: 'sawtooth', vol: 0.1, corte: 300, atraso: 0.6, ataque: 0.2 });
  },
  passos: (a) => [0, 0.22, 0.44].forEach((t) => {
    nota(a, { freq: 80, ate: 55, dur: 0.08, tipo: 'sine', vol: 0.25, atraso: t });
    ruido(a, { dur: 0.05, vol: 0.08, filtro: 'highpass', freq: 3000, atraso: t + 0.01 });
  }),
  portao: (a) => {
    // Portão de pedra arrastando, com o ferro rangendo.
    ruido(a, { dur: 1.3, vol: 0.2, filtro: 'lowpass', freq: 180, ate: 90, ataque: 0.15 });
    nota(a, { freq: 420, ate: 380, dur: 0.9, tipo: 'sawtooth', vol: 0.04, corte: 900, vibrato: 11, ataque: 0.1 });
    baque(a, 60, 0.4, 1.15, 0.4);
  },
  trombeta: (a) => {
    // Corneta romana (buccina): grossa, com eco de praça.
    const e = eco(a, 0.2, 0.4);
    nota(a, { freq: NOTA.D4, dur: 0.35, tipo: 'sawtooth', vol: 0.13, corte: 1400, coro: 12, ataque: 0.04 }, e);
    nota(a, { freq: NOTA.A4, dur: 0.6, tipo: 'sawtooth', vol: 0.13, corte: 1600, coro: 12, ataque: 0.04, atraso: 0.3 }, e);
  },
  plateia: (a) => {
    // Multidão: muitas vozes (ruído em várias faixas) subindo e descendo.
    [400, 700, 1100].forEach((f, i) => ruido(a, { dur: 2.2, vol: 0.12, freq: f, ate: f * 1.3, q: 2, ataque: 0.5 + i * 0.1 }));
  },
  palmas: (a) => Array.from({ length: 14 }, (_, i) => ruido(a, { dur: 0.04, vol: 0.12, freq: 1600 + (i % 3) * 400, q: 3, atraso: i * 0.07 + (i % 2) * 0.03 })),
  pergunta: (a) => {
    nota(a, { freq: NOTA.E5, dur: 0.12, tipo: 'sine', vol: 0.12 });
    nota(a, { freq: NOTA.A5, dur: 0.25, tipo: 'sine', vol: 0.12, atraso: 0.1, vibrato: 7 });
  },
  refuta: (a) => {
    // IA sendo apagada: um zumbido que desce e some, com estática.
    nota(a, { freq: 900, ate: 60, dur: 1.2, tipo: 'sawtooth', vol: 0.12, corte: 2200 });
    ruido(a, { dur: 1.2, vol: 0.12, freq: 3000, ate: 300, q: 0.5 });
  },
  senador: (a) => {
    // O Censor: um grave robótico, duas vozes que batem entre si.
    nota(a, { freq: 55, dur: 1.6, tipo: 'sawtooth', vol: 0.14, corte: 400, ataque: 0.2 });
    nota(a, { freq: 57, dur: 1.6, tipo: 'sawtooth', vol: 0.14, corte: 400, ataque: 0.2 });
    nota(a, { freq: 880, dur: 0.6, tipo: 'sine', vol: 0.05, atraso: 0.3, vibrato: 3 });
  },
  catapulta: (a) => {
    // Explosão e fogo.
    ruido(a, { dur: 0.9, vol: 0.35, filtro: 'lowpass', freq: 1200, ate: 80 });
    baque(a, 70, 0.5, 0, 0.5);
    Array.from({ length: 8 }, (_, i) => ruido(a, { dur: 0.03, vol: 0.08, freq: 2500, q: 4, atraso: 0.2 + i * 0.09 }));
  },
  galope: (a) => [0, 0.11, 0.3, 0.41, 0.6, 0.71].forEach((t) => nota(a, { freq: 140, ate: 90, dur: 0.07, tipo: 'sine', vol: 0.25, atraso: t })),
  pesada: (a) => {
    baque(a, 70, 0.55, 0, 0.45);
    ruido(a, { dur: 0.5, vol: 0.15, filtro: 'lowpass', freq: 300, ate: 80 });
  },
  tambor: (a) => {
    baque(a, 95, 0.55, 0, 0.35);
    ruido(a, { dur: 0.12, vol: 0.12, filtro: 'bandpass', freq: 250 });
  },
  onda: (a) => ruido(a, { dur: 1.4, vol: 0.22, filtro: 'lowpass', freq: 400, ate: 1800, ataque: 0.5 }),
  remo: (a) => ruido(a, { dur: 0.35, vol: 0.16, freq: 900, ate: 300, q: 0.7, ataque: 0.04 }),
  martelo: (a) => {
    metal(a, 880, 0.6, 0.12);
    baque(a, 160, 0.2);
  },

  // Luta: cada acontecimento com um som de verdade.
  espadas: (a) => {
    // Acertou: o corte (vento) e o impacto (metal + baque).
    ruido(a, { dur: 0.08, vol: 0.16, freq: 4000, ate: 1500, q: 1 });
    metal(a, 620, 0.25, 0.08, 0.05);
    baque(a, 140, 0.3, 0.05, 0.12);
  },
  escudoMetal: (a) => {
    // Bloqueio: o escudo toca como um sino.
    metal(a, 410, 0.7, 0.14);
    ruido(a, { dur: 0.04, vol: 0.2, freq: 3500, q: 2 });
  },
  esquiva: (a) => ruido(a, { dur: 0.22, vol: 0.14, freq: 700, ate: 3200, q: 1.5, ataque: 0.03 }),
  dano: (a) => {
    baque(a, 120, 0.45, 0, 0.2);
    nota(a, { freq: 240, ate: 110, dur: 0.25, tipo: 'sawtooth', vol: 0.1, corte: 900 });
    ruido(a, { dur: 0.15, vol: 0.18, filtro: 'lowpass', freq: 1400 });
  },
  especial: (a) => {
    const e = eco(a, 0.12, 0.45);
    [NOTA.D4, NOTA.A4, NOTA.D5, NOTA.F5, NOTA.A5].forEach((f, i) => nota(a, { freq: f, dur: 0.5, tipo: 'triangle', vol: 0.1, atraso: i * 0.05, coro: 10 }, e));
    ruido(a, { dur: 0.6, vol: 0.12, freq: 6000, ate: 2000, q: 0.5, atraso: 0.2 });
    baque(a, 80, 0.5, 0.25, 0.4);
  },
  fase: (a) => {
    // O chefão fica furioso: um rugido grave que treme.
    nota(a, { freq: 65, ate: 50, dur: 1.2, tipo: 'sawtooth', vol: 0.18, corte: 500, vibrato: 14, ataque: 0.1 });
    ruido(a, { dur: 1.1, vol: 0.2, filtro: 'lowpass', freq: 600, ate: 200, ataque: 0.1 });
  },
  finta: (a) => ruido(a, { dur: 0.16, vol: 0.1, freq: 1500, ate: 600, q: 2 }),
  contra: (a) => {
    nota(a, { freq: 880, dur: 0.09, tipo: 'square', vol: 0.07, corte: 2500 });
    nota(a, { freq: 660, dur: 0.12, tipo: 'square', vol: 0.07, corte: 2500, atraso: 0.1 });
  },
  cansado: (a) => ruido(a, { dur: 0.6, vol: 0.1, filtro: 'lowpass', freq: 700, ate: 300, ataque: 0.2 }),
  riposta: (a) => {
    metal(a, 410, 0.3, 0.1);
    ruido(a, { dur: 0.1, vol: 0.18, freq: 5000, ate: 1500, atraso: 0.08 });
    baque(a, 100, 0.5, 0.12, 0.25);
  },
  quebra: (a) => {
    // Guarda quebrada: algo racha.
    ruido(a, { dur: 0.35, vol: 0.3, filtro: 'highpass', freq: 1500, ate: 400 });
    baque(a, 90, 0.5, 0.02, 0.3);
    metal(a, 300, 0.4, 0.06, 0.05);
  },
  plano: (a) => {
    // Plano do Octavius: um "BÓIN" de desenho animado e madeira.
    nota(a, { freq: 520, ate: 130, dur: 0.35, tipo: 'sine', vol: 0.22, vibrato: 18 });
    ruido(a, { dur: 0.06, vol: 0.2, freq: 900, q: 5 });
  },
  aliado: (a) => {
    SONS.trombeta(a);
    SONS.especial(a);
  },
  reflexo: (a) => {
    // Espelho de Sol: um brilho que sobe e o golpe voltando.
    const e = eco(a, 0.09, 0.4);
    [NOTA.A5, NOTA.D5, NOTA.A4].forEach((f, i) => nota(a, { freq: f * 2, dur: 0.4, tipo: 'sine', vol: 0.08, atraso: i * 0.04 }, e));
    metal(a, 700, 0.5, 0.1);
    baque(a, 110, 0.4, 0.08, 0.2);
  },
  guarda: (a) => {
    nota(a, { freq: 300, dur: 0.06, tipo: 'square', vol: 0.06, corte: 1200 });
    ruido(a, { dur: 0.04, vol: 0.1, freq: 1800, q: 4 });
  },
};

/** Toca um som do modo História (silêncio se o som estiver desligado). */
export function tocar(nome: SomHistoria) {
  const a = saidaDeAudio();
  if (!a) return;
  try {
    SONS[nome](a);
  } catch {
    /* som é enfeite: nunca pode quebrar o jogo */
  }
}

// ---------- As vozes ----------

interface Voz {
  /** Frequência base e quanto ela varia de sílaba para sílaba. */
  base: number;
  varia: number;
  tipo: OscillatorType;
  dur: number;
  vol: number;
  corte?: number;
  /** Notas de uma escala (as IAs musicais "falam" cantando). */
  escala?: number[];
  /** Duas vozes desafinadas (robótico). */
  coro?: number;
  vibrato?: number;
  /** Fala com chiado (voz de bicho, de multidão). */
  sopro?: boolean;
}

const VOZES: Partial<Record<Falante, Voz>> = {
  cassius: { base: 190, varia: 0.12, tipo: 'triangle', dur: 0.07, vol: 0.12, corte: 1400 },
  octavius: { base: 290, varia: 0.3, tipo: 'square', dur: 0.05, vol: 0.06, corte: 2200 },
  helios: { base: 420, varia: 0.1, tipo: 'sine', dur: 0.09, vol: 0.1, vibrato: 6 },
  livia: { base: 520, varia: 0.25, tipo: 'square', dur: 0.04, vol: 0.05, corte: 3000 },
  'livia-pequena': { base: 640, varia: 0.25, tipo: 'square', dur: 0.04, vol: 0.05, corte: 3200 },
  brutus: { base: 95, varia: 0.15, tipo: 'sawtooth', dur: 0.08, vol: 0.09, corte: 600 },
  censor: { base: 70, varia: 0, tipo: 'sawtooth', dur: 0.12, vol: 0.1, corte: 500, coro: 25 },
  guarda: { base: 140, varia: 0, tipo: 'square', dur: 0.06, vol: 0.05, corte: 900 },
  decuriao: { base: 120, varia: 0.05, tipo: 'square', dur: 0.06, vol: 0.06, corte: 900 },
  capitao: { base: 160, varia: 0.08, tipo: 'sawtooth', dur: 0.06, vol: 0.06, corte: 1100 },
  fio: { base: 700, varia: 0, tipo: 'sine', dur: 0.06, vol: 0.09, escala: [784, 880, 988, 1175, 1319] },
  eco: { base: 600, varia: 0, tipo: 'sine', dur: 0.09, vol: 0.09, escala: [523, 587, 659, 784, 880], vibrato: 5 },
  crianca: { base: 600, varia: 0.3, tipo: 'triangle', dur: 0.04, vol: 0.08 },
  arauto: { base: 220, varia: 0.2, tipo: 'sawtooth', dur: 0.07, vol: 0.07, corte: 1500 },
  povo: { base: 300, varia: 0.5, tipo: 'triangle', dur: 0.05, vol: 0.06, sopro: true },
  sucata: { base: 110, varia: 0.4, tipo: 'square', dur: 0.06, vol: 0.06, corte: 800 },
  copista: { base: 240, varia: 0.15, tipo: 'triangle', dur: 0.07, vol: 0.1, vibrato: 4 },
  arquivista: { base: 330, varia: 0.05, tipo: 'sine', dur: 0.1, vol: 0.1, coro: 15 },
  pretor: { base: 85, varia: 0.05, tipo: 'sawtooth', dur: 0.09, vol: 0.09, corte: 550 },
  marco: { base: 150, varia: 0.25, tipo: 'triangle', dur: 0.08, vol: 0.12, vibrato: 3 },
  almirante: { base: 110, varia: 0.1, tipo: 'sawtooth', dur: 0.08, vol: 0.08, corte: 700, coro: 12 },
  marinheiro: { base: 130, varia: 0, tipo: 'square', dur: 0.06, vol: 0.05, corte: 800 },
  leao: { base: 60, varia: 0.3, tipo: 'sawtooth', dur: 0.12, vol: 0.1, corte: 400, sopro: true },
  gaivota: { base: 1300, varia: 0.3, tipo: 'square', dur: 0.06, vol: 0.04, corte: 4000 },
  pistao: { base: 115, varia: 0.2, tipo: 'square', dur: 0.08, vol: 0.06, corte: 700, vibrato: 9 },
  feitor: { base: 75, varia: 0.05, tipo: 'sawtooth', dur: 0.1, vol: 0.09, corte: 500 },
  cozinheiro: { base: 260, varia: 0.4, tipo: 'square', dur: 0.05, vol: 0.05, corte: 1600 },
  nina: { base: 620, varia: 0.3, tipo: 'triangle', dur: 0.04, vol: 0.08 },
  sargento: { base: 125, varia: 0.05, tipo: 'square', dur: 0.06, vol: 0.06, corte: 900 },
  capataz: { base: 100, varia: 0.1, tipo: 'sawtooth', dur: 0.08, vol: 0.08, corte: 650 },
  contramestre: { base: 120, varia: 0.08, tipo: 'square', dur: 0.06, vol: 0.06, corte: 850 },
  feirante: { base: 330, varia: 0.3, tipo: 'triangle', dur: 0.05, vol: 0.1 },
  zelador: { base: 210, varia: 0.15, tipo: 'triangle', dur: 0.08, vol: 0.1, vibrato: 4 },
  // O Núcleo: grave, eletrônico, com eco de muitas vozes.
  nucleo: { base: 55, varia: 0.02, tipo: 'square', dur: 0.14, vol: 0.09, corte: 420, coro: 40, vibrato: 3 },
};

/**
 * Um "pedacinho" de fala: chame a cada letra que aparece. A voz só faz barulho de
 * tantas em tantas letras e pula espaço e pontuação, para soar como fala e não como chuva.
 */
export function voz(quem: Falante | undefined, letra: string, indice: number) {
  if (!quem || quem === 'narrador') return;
  if (!/[\p{L}\p{N}]/u.test(letra) || indice % 2 !== 0) return;
  const v = VOZES[quem];
  if (!v) return;
  const a = saidaDeAudio();
  if (!a) return;
  try {
    // A mesma letra sempre dá o mesmo tom (a fala parece ter "jeito", não sorteio puro).
    const codigo = letra.toLowerCase().charCodeAt(0);
    const freq = v.escala ? v.escala[codigo % v.escala.length]! : v.base * (1 + (((codigo * 7) % 11) / 10 - 0.5) * v.varia);
    nota(a, { freq, dur: v.dur, tipo: v.tipo, vol: v.vol, corte: v.corte, coro: v.coro, vibrato: v.vibrato, ataque: 0.004 });
    if (v.sopro) ruido(a, { dur: v.dur, vol: v.vol * 0.8, freq: freq * 3, q: 2 });
  } catch {
    /* enfeite */
  }
}
