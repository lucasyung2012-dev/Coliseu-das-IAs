import { useSyncExternalStore } from 'react';
import type { IaId } from '@/game/personagens';
import { JURADOS, type JuradoId } from '@/game/jurados';
import { carregarAudio, somLigado, tocarAudio, volumeAtual } from './som';

/**
 * A voz do Pretor Supremo (ideia do Lucas). As falas são gravadas antes, no
 * GitHub Actions, com vozes neurais do Piper (gratuitas) — `scripts/vozes/gerar.py`
 * — e ficam em `public/vozes/<voz>/<id>.mp3`. Se uma fala não existir (ou não
 * houver áudio), cai na voz do navegador. Respeita o botão de som e o volume.
 */

export type VozId = 'faber' | 'cadu' | 'jeff';
export const VOZES: { id: VozId; nome: string }[] = [
  { id: 'faber', nome: 'Voz 1' },
  { id: 'cadu', nome: 'Voz 2' },
  { id: 'jeff', nome: 'Voz 3' },
];

/** Nomes do jeito que se fala (as IAs, não os gladiadores). */
export const NOME_FALADO: Record<IaId, string> = { claude: 'Clôd', chatgpt: 'Chat GPT', gemini: 'Jêmini' };
const NUMEROS = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco'];

export interface Fala {
  id: string;
  /** Texto para a voz do navegador, se a fala gravada faltar. */
  texto: string;
}

// ---------- Falas do Pretor (os ids batem com scripts/vozes/gerar.py) ----------

export const FALA_AMOSTRA: Fala = { id: 'amostra', texto: 'Eu sou o Pretor Supremo. Que vença o melhor argumento!' };
export const FALA_ABERTURA: Fala = { id: 'abertura', texto: 'A sessão está aberta!' };
export const FALA_SILENCIO: Fala = { id: 'silencio', texto: 'Silêncio no tribunal! O júri vai votar.' };

export function falaDoVoto(jurado: JuradoId, ia: IaId | null): Fala {
  const nome = JURADOS[jurado].nome;
  return ia
    ? { id: `voto-${jurado}-${ia}`, texto: `O ${nome} vota em ${NOME_FALADO[ia]}.` }
    : { id: `voto-${jurado}-ninguem`, texto: `O ${nome} não escolhe ninguém.` };
}

/** "Por três votos a dois, o tribunal declara a vitória de Claude!" (em duas falas). */
export function falasDoResultado(votosVencedor: number, votosPerdedor: number, vencedor: IaId | null): Fala[] {
  const a = Math.max(votosVencedor, votosPerdedor);
  const b = Math.min(votosVencedor, votosPerdedor);
  return [
    { id: `placar-${a}-${b}`, texto: `Por ${NUMEROS[a]} ${a === 1 ? 'voto' : 'votos'} a ${NUMEROS[b]},` },
    vencedor
      ? { id: `declara-${vencedor}`, texto: `o tribunal declara a vitória de ${NOME_FALADO[vencedor]}!` }
      : { id: 'declara-empate', texto: 'o tribunal declara: empate!' },
  ];
}

// ---------- Qual voz ----------

const CHAVE = 'coliseu.voz.pretor';
const ouvintes = new Set<() => void>();

function lerVoz(): VozId {
  try {
    const v = localStorage.getItem(CHAVE);
    return VOZES.some((x) => x.id === v) ? (v as VozId) : 'faber';
  } catch {
    return 'faber';
  }
}
let vozAtual = lerVoz();

export function escolherVoz(v: VozId) {
  vozAtual = v;
  try {
    localStorage.setItem(CHAVE, v);
  } catch {
    /* vale só nesta visita */
  }
  ouvintes.forEach((f) => f());
}

export function useVozPretor(): VozId {
  return useSyncExternalStore(
    (f) => {
      ouvintes.add(f);
      return () => ouvintes.delete(f);
    },
    () => vozAtual,
    () => vozAtual,
  );
}

// ---------- Falar ----------

const cache = new Map<string, Promise<AudioBuffer | null>>();
const url = (id: string) => `${import.meta.env.BASE_URL}vozes/${vozAtual}/${id}.mp3`;

function carregar(id: string): Promise<AudioBuffer | null> {
  const u = url(id);
  let p = cache.get(u);
  if (!p) {
    p = carregarAudio(u);
    cache.set(u, p);
  }
  return p;
}

/** Baixa as falas antes, para não ter pausa entre elas. */
export function precarregar(falas: Fala[]) {
  if (somLigado()) falas.forEach((f) => void carregar(f.id));
}

let geracao = 0;
let fila: Promise<void> = Promise.resolve();
let pararAtual: (() => void) | null = null;

/** O Pretor fala uma sequência. `fila` espera a fala anterior; senão, corta e fala já. */
export function anunciar(falas: Fala[], { fila: esperar = false }: { fila?: boolean } = {}) {
  if (!somLigado()) return;
  if (!esperar) calar();
  const g = geracao;
  fila = fila.then(async () => {
    for (const f of falas) {
      if (g !== geracao) return;
      await falarUma(f, g);
    }
  });
}

async function falarUma(f: Fala, g: number) {
  const buf = await carregar(f.id);
  if (g !== geracao) return;
  const tocando = buf ? tocarAudio(buf) : null;
  if (tocando) {
    pararAtual = tocando.parar;
    await tocando.fim;
    pararAtual = null;
    return;
  }
  await falarNoNavegador(f.texto);
}

export function calar() {
  geracao++;
  fila = Promise.resolve();
  pararAtual?.();
  pararAtual = null;
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
}

/** Reserva: a voz do navegador (mais robótica), em pt-BR e grave. */
function falarNoNavegador(texto: string): Promise<void> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return Promise.resolve();
  return new Promise((ok) => {
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = 'pt-BR';
    const pt = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('pt'));
    const v = pt.find((x) => /br/i.test(x.lang)) ?? pt[0];
    if (v) u.voice = v;
    u.pitch = 0.7;
    u.rate = 0.92;
    u.volume = volumeAtual();
    u.onend = () => ok();
    u.onerror = () => ok();
    // Alguns navegadores não avisam o fim da fala: segue em frente depois de um tempo.
    window.setTimeout(ok, 1500 + texto.length * 90);
    window.speechSynthesis.speak(u);
  });
}

/** Dá para o Pretor falar aqui? (som ligado e algum jeito de tocar áudio ou falar) */
export function vozPossivel(): boolean {
  if (typeof window === 'undefined' || !somLigado()) return false;
  const temAudio = 'AudioContext' in window || 'webkitAudioContext' in window;
  return temAudio || 'speechSynthesis' in window;
}
