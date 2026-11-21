import { useSyncExternalStore } from 'react';

/**
 * Sons de fliperama gerados na hora com a Web Audio API: nenhum arquivo para
 * baixar e nada a pagar. O navegador só libera o áudio depois do primeiro toque
 * do usuário, então `desbloquear()` precisa ser chamado dentro de um clique.
 * Sem suporte a áudio (como nos testes), tudo vira silêncio sem erro.
 */

export type NomeSom =
  | 'clique'
  | 'passarMouse'
  | 'moeda'
  | 'ligar'
  | 'falha'
  | 'start'
  | 'selecionar'
  | 'portao'
  | 'roleta'
  | 'passos'
  | 'vs'
  | 'espadas'
  | 'plateia'
  | 'fanfarra'
  | 'pretor'
  | 'jurado'
  | 'martelo'
  | 'vitoria'
  | 'derrota'
  // Duelo: um som para cada tipo de carta
  | 'leve'
  | 'pesada'
  | 'galope'
  | 'trombeta'
  | 'arco'
  | 'catapulta'
  | 'pedra'
  | 'escudoMetal'
  | 'risada'
  | 'senador'
  | 'gelo'
  | 'palmas'
  | 'pergunta'
  | 'refuta';

const CHAVE = 'coliseu.som.desligado';
const CHAVE_VOLUME = 'coliseu.som.volume';
/** Volume máximo do jogo (0 a 1 do controle vira 0 a 0,35 na saída). */
const VOLUME_MAXIMO = 0.35;

let ctx: AudioContext | null = null;
let saida: GainNode | null = null;
let ruidoBuffer: AudioBuffer | null = null;

function lerDesligado(): boolean {
  try {
    return localStorage.getItem(CHAVE) === '1';
  } catch {
    return false;
  }
}

let desligado = lerDesligado();

function lerVolume(): number {
  try {
    const v = Number(localStorage.getItem(CHAVE_VOLUME));
    return localStorage.getItem(CHAVE_VOLUME) !== null && v >= 0 && v <= 1 ? v : 0.8;
  } catch {
    return 0.8;
  }
}

let volume = lerVolume();
const ouvintes = new Set<() => void>();

function contexto(): AudioContext | null {
  if (ctx) return ctx;
  const Ctor = typeof window !== 'undefined' ? (window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext) : undefined;
  if (!Ctor) return null;
  try {
    ctx = new Ctor();
    saida = ctx.createGain();
    saida.gain.value = VOLUME_MAXIMO * volume;
    saida.connect(ctx.destination);
  } catch {
    ctx = null;
  }
  return ctx;
}

let desbloqueado = false;

/** Chame dentro de um toque/clique: cria e acorda o áudio (exigência do iPad e dos navegadores). */
export function desbloquear() {
  const c = contexto();
  if (!c) return;
  desbloqueado = true;
  if (c.state === 'suspended') void c.resume();
}

export function somLigado(): boolean {
  return !desligado;
}

export function alternarSom() {
  desligado = !desligado;
  try {
    localStorage.setItem(CHAVE, desligado ? '1' : '0');
  } catch {
    /* sem armazenamento: vale só nesta visita */
  }
  if (!desligado) desbloquear();
  ouvintes.forEach((f) => f());
}

export function useSomLigado(): boolean {
  return useSyncExternalStore(
    (f) => {
      ouvintes.add(f);
      return () => ouvintes.delete(f);
    },
    somLigado,
    somLigado,
  );
}

// ---------- Peças do sintetizador ----------

interface Tom {
  freq: number;
  ate?: number;
  dur: number;
  tipo?: OscillatorType;
  vol?: number;
  atraso?: number;
}

function tom(c: AudioContext, { freq, ate, dur, tipo = 'square', vol = 0.3, atraso = 0 }: Tom) {
  const t = c.currentTime + atraso;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = tipo;
  osc.frequency.setValueAtTime(freq, t);
  if (ate) osc.frequency.exponentialRampToValueAtTime(ate, t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(saida!);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

interface Ruido {
  dur: number;
  vol?: number;
  atraso?: number;
  filtro?: BiquadFilterType;
  freq?: number;
  freqAte?: number;
  /** Sobe o volume aos poucos em vez de começar forte (multidão, vento). */
  crescer?: boolean;
}

function ruido(c: AudioContext, { dur, vol = 0.3, atraso = 0, filtro = 'lowpass', freq = 1200, freqAte, crescer }: Ruido) {
  if (!ruidoBuffer) {
    ruidoBuffer = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = ruidoBuffer.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const t = c.currentTime + atraso;
  const src = c.createBufferSource();
  src.buffer = ruidoBuffer;
  src.loop = true;
  const f = c.createBiquadFilter();
  f.type = filtro;
  f.frequency.setValueAtTime(freq, t);
  if (freqAte) f.frequency.exponentialRampToValueAtTime(freqAte, t + dur);
  const g = c.createGain();
  if (crescer) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.4);
  } else {
    g.gain.setValueAtTime(vol, t);
  }
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(saida!);
  src.start(t);
  src.stop(t + dur + 0.02);
}

/** Sequência de notas, uma depois da outra. */
function melodia(c: AudioContext, notas: number[], passo: number, extra: Partial<Tom> = {}) {
  notas.forEach((freq, i) => tom(c, { dur: passo * 1.1, ...extra, atraso: (extra.atraso ?? 0) + i * passo, freq }));
}

// Notas (Hz)
const N = { C4: 262, E4: 330, F4: 349, G4: 392, A4: 440, C5: 523, D5: 587, E5: 659, G5: 784, A5: 880, B5: 988, C6: 1047, E6: 1319, G3: 196, Fs4: 370 };

const SONS: Record<NomeSom, (c: AudioContext) => void> = {
  clique: (c) => tom(c, { freq: 660, dur: 0.05, vol: 0.18 }),
  passarMouse: (c) => tom(c, { freq: 990, dur: 0.03, vol: 0.06, tipo: 'triangle' }),
  // a moeda clássica de fliperama: duas notas agudas
  moeda: (c) => {
    tom(c, { freq: N.B5, dur: 0.08, vol: 0.22 });
    tom(c, { freq: N.E6, dur: 0.45, vol: 0.22, atraso: 0.08 });
    ruido(c, { dur: 0.12, vol: 0.12, filtro: 'highpass', freq: 3000, atraso: 0.35 });
  },
  // zumbido da máquina ligando + estalos + jingle subindo
  ligar: (c) => {
    tom(c, { freq: 40, ate: 120, dur: 0.9, tipo: 'sawtooth', vol: 0.18 });
    ruido(c, { dur: 0.08, vol: 0.25, filtro: 'bandpass', freq: 2500, atraso: 0.15 });
    ruido(c, { dur: 0.05, vol: 0.2, filtro: 'bandpass', freq: 3500, atraso: 0.4 });
    melodia(c, [N.C5, N.E5, N.G5, N.C6], 0.07, { atraso: 0.7, vol: 0.16 });
  },
  // a tela "bugando": chiado e bipes quebrados
  falha: (c) => {
    [0, 0.18, 0.32, 0.55, 0.7].forEach((a, i) => {
      ruido(c, { dur: 0.07, vol: 0.18, filtro: 'bandpass', freq: 1500 + i * 700, atraso: a });
      tom(c, { freq: 200 + Math.random() * 900, dur: 0.05, vol: 0.08, atraso: a + 0.04 });
    });
  },
  start: (c) => {
    melodia(c, [N.G4, N.C5, N.E5, N.G5], 0.06, { vol: 0.18 });
    tom(c, { freq: N.C6, dur: 0.5, vol: 0.18, atraso: 0.24 });
    tom(c, { freq: N.G5, dur: 0.5, vol: 0.1, atraso: 0.24 });
  },
  // troca de personagem: "vuuush" + bipe subindo
  selecionar: (c) => {
    ruido(c, { dur: 0.25, vol: 0.18, filtro: 'bandpass', freq: 400, freqAte: 3000 });
    tom(c, { freq: N.E5, ate: N.E6, dur: 0.15, vol: 0.14, atraso: 0.12, tipo: 'triangle' });
  },
  portao: (c) => {
    ruido(c, { dur: 0.8, vol: 0.35, filtro: 'lowpass', freq: 260 });
    tom(c, { freq: 55, ate: 40, dur: 0.8, tipo: 'sawtooth', vol: 0.12 });
    tom(c, { freq: 70, dur: 0.15, tipo: 'sine', vol: 0.35, atraso: 0.75 });
  },
  roleta: (c) => tom(c, { freq: 1200, dur: 0.025, vol: 0.08 }),
  // seis passos de marcha
  passos: (c) => {
    for (let i = 0; i < 6; i++) {
      tom(c, { freq: 95, ate: 50, dur: 0.09, tipo: 'sine', vol: 0.4, atraso: i * 0.2 });
      ruido(c, { dur: 0.04, vol: 0.08, filtro: 'lowpass', freq: 600, atraso: i * 0.2 });
    }
  },
  vs: (c) => {
    tom(c, { freq: 140, ate: 35, dur: 0.6, tipo: 'sine', vol: 0.6 });
    ruido(c, { dur: 0.4, vol: 0.3, filtro: 'lowpass', freq: 900 });
    tom(c, { freq: N.A4, dur: 0.3, tipo: 'sawtooth', vol: 0.08 });
  },
  // espadas: metal agudo que vibra
  espadas: (c) => {
    [1530, 2290, 3170].forEach((f, i) => tom(c, { freq: f, dur: 0.5 - i * 0.1, vol: 0.12, tipo: 'square' }));
    ruido(c, { dur: 0.2, vol: 0.25, filtro: 'highpass', freq: 4000 });
  },
  plateia: (c) => ruido(c, { dur: 1.8, vol: 0.22, filtro: 'bandpass', freq: 700, freqAte: 1100, crescer: true }),
  fanfarra: (c) => {
    melodia(c, [N.G4, N.C5, N.E5], 0.12, { tipo: 'sawtooth', vol: 0.12 });
    tom(c, { freq: N.G5, dur: 0.6, tipo: 'sawtooth', vol: 0.12, atraso: 0.36 });
    tom(c, { freq: N.E5, dur: 0.6, tipo: 'sawtooth', vol: 0.08, atraso: 0.36 });
  },
  // entrada solene do Pretor: acorde grave e lento
  pretor: (c) => {
    melodia(c, [N.C4, N.G4, N.C5], 0.22, { tipo: 'sawtooth', vol: 0.1 });
    tom(c, { freq: N.E5, dur: 0.9, tipo: 'triangle', vol: 0.14, atraso: 0.66 });
  },
  jurado: (c) => tom(c, { freq: 500, ate: 950, dur: 0.09, tipo: 'sine', vol: 0.22 }),
  // martelo na madeira: pancada grave + "toc"
  martelo: (c) => {
    [0, 0.32].forEach((a) => {
      tom(c, { freq: 90, ate: 40, dur: 0.25, tipo: 'sine', vol: 0.6, atraso: a });
      tom(c, { freq: 320, dur: 0.04, tipo: 'square', vol: 0.15, atraso: a });
      ruido(c, { dur: 0.1, vol: 0.2, filtro: 'lowpass', freq: 800, atraso: a });
    });
  },
  // ---------- Duelo: um som para cada tipo de carta ----------
  // tropa leve: passinhos rápidos
  leve: (c) => [0, 0.08, 0.16].forEach((a) => ruido(c, { dur: 0.05, vol: 0.18, filtro: 'bandpass', freq: 1800, atraso: a })),
  // tropa pesada: tambor grave
  pesada: (c) => {
    tom(c, { freq: 110, ate: 50, dur: 0.35, tipo: 'sine', vol: 0.55 });
    ruido(c, { dur: 0.15, vol: 0.2, filtro: 'lowpass', freq: 400 });
  },
  // cavalo: galope (ta-ca-tum)
  galope: (c) => [0, 0.1, 0.2, 0.36, 0.46, 0.56].forEach((a) => tom(c, { freq: 220, ate: 120, dur: 0.06, tipo: 'triangle', vol: 0.3, atraso: a })),
  // elefante: trombeta
  trombeta: (c) => {
    tom(c, { freq: 300, ate: 520, dur: 0.5, tipo: 'sawtooth', vol: 0.2 });
    tom(c, { freq: 520, ate: 380, dur: 0.4, tipo: 'sawtooth', vol: 0.15, atraso: 0.45 });
  },
  // arqueiro: a corda do arco
  arco: (c) => tom(c, { freq: 180, ate: 90, dur: 0.18, tipo: 'triangle', vol: 0.3 }),
  // catapulta e balista: rangido e estrondo
  catapulta: (c) => {
    tom(c, { freq: 80, ate: 160, dur: 0.25, tipo: 'sawtooth', vol: 0.15 });
    ruido(c, { dur: 0.35, vol: 0.35, filtro: 'lowpass', freq: 500, atraso: 0.2 });
  },
  // muralha: bloco de pedra caindo
  pedra: (c) => {
    tom(c, { freq: 70, ate: 40, dur: 0.3, tipo: 'sine', vol: 0.6 });
    ruido(c, { dur: 0.25, vol: 0.3, filtro: 'lowpass', freq: 300 });
  },
  // contra-argumento: escudo de metal
  escudoMetal: (c) => {
    tom(c, { freq: 900, ate: 700, dur: 0.25, tipo: 'square', vol: 0.12 });
    tom(c, { freq: 1350, dur: 0.2, tipo: 'triangle', vol: 0.1 });
  },
  // piada: risadinha (ha-ha-ha)
  risada: (c) => [0, 0.12, 0.24].forEach((a, i) => tom(c, { freq: 520 - i * 40, ate: 420 - i * 40, dur: 0.1, tipo: 'square', vol: 0.15, atraso: a })),
  // citação de autoridade: pequena fanfarra solene
  senador: (c) => melodia(c, [N.G4, N.C5, N.E5], 0.12, { vol: 0.15, tipo: 'triangle' }),
  // pausa dramática: gelo estalando e congelando
  gelo: (c) => {
    [0, 0.05, 0.11, 0.18].forEach((a, i) => tom(c, { freq: 2600 - i * 300, ate: 1800 - i * 200, dur: 0.12, tipo: 'sine', vol: 0.12, atraso: a }));
    ruido(c, { dur: 0.5, vol: 0.12, filtro: 'highpass', freq: 5000, freqAte: 2000 });
  },
  // aplauso: palmas batendo
  palmas: (c) =>
    [0, 0.11, 0.2, 0.32, 0.41, 0.53, 0.62].forEach((a) => ruido(c, { dur: 0.05, vol: 0.35, filtro: 'bandpass', freq: 1400 + Math.random() * 600, atraso: a })),
  // pergunta retórica: "hmm?" subindo
  pergunta: (c) => {
    tom(c, { freq: 300, dur: 0.18, tipo: 'triangle', vol: 0.2 });
    tom(c, { freq: 300, ate: 600, dur: 0.25, tipo: 'triangle', vol: 0.2, atraso: 0.2 });
  },
  // refutação: "BUM" seco de discordância
  refuta: (c) => {
    tom(c, { freq: 150, ate: 60, dur: 0.3, tipo: 'square', vol: 0.25 });
    ruido(c, { dur: 0.2, vol: 0.3, filtro: 'lowpass', freq: 600 });
  },
  vitoria: (c) => {
    melodia(c, [N.C5, N.E5, N.G5, N.C6], 0.1, { vol: 0.18 });
    melodia(c, [N.G5, N.A5, N.C6], 0.12, { atraso: 0.5, vol: 0.18 });
    tom(c, { freq: N.E6, dur: 0.8, vol: 0.16, atraso: 0.86 });
    tom(c, { freq: N.C6, dur: 0.8, vol: 0.1, atraso: 0.86 });
    ruido(c, { dur: 1.6, vol: 0.15, filtro: 'bandpass', freq: 900, crescer: true, atraso: 0.3 });
  },
  // derrota: "uó uó uó uóóó" descendo
  derrota: (c) => {
    [N.G4, N.Fs4, N.F4].forEach((f, i) => tom(c, { freq: f, ate: f * 0.97, dur: 0.32, tipo: 'triangle', vol: 0.25, atraso: i * 0.35 }));
    tom(c, { freq: N.E4, ate: N.E4 * 0.85, dur: 0.9, tipo: 'triangle', vol: 0.25, atraso: 1.05 });
  },
};

export function tocar(nome: NomeSom) {
  if (desligado) return;
  const c = contexto();
  // Antes do primeiro toque o navegador não deixa tocar: nada é agendado, para
  // não sair tudo de uma vez quando o áudio for liberado.
  if (!c || !saida || (!desbloqueado && c.state !== 'running')) return;
  try {
    SONS[nome](c);
  } catch {
    /* áudio é enfeite: nunca pode quebrar o jogo */
  }
}

// ---------- Volume (aba Configurações) ----------

export function mudarVolume(v: number) {
  volume = Math.max(0, Math.min(1, v));
  if (saida) saida.gain.value = VOLUME_MAXIMO * volume;
  try {
    localStorage.setItem(CHAVE_VOLUME, String(volume));
  } catch {
    /* vale só nesta visita */
  }
  ouvintes.forEach((f) => f());
}

export function useVolume(): number {
  return useSyncExternalStore(
    (f) => {
      ouvintes.add(f);
      return () => ouvintes.delete(f);
    },
    () => volume,
    () => volume,
  );
}

/**
 * Para outros bancos de som (os sons próprios do modo História, em somHistoria.ts):
 * devolve o áudio e a saída só se puder tocar agora (som ligado e áudio liberado),
 * para o botão de som e o volume valerem para tudo.
 */
export function saidaDeAudio(): { c: AudioContext; saida: GainNode } | null {
  if (desligado) return null;
  const c = contexto();
  if (!c || !saida || (!desbloqueado && c.state !== 'running')) return null;
  return { c, saida };
}
