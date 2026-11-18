/**
 * Regras do Tribunal (docs/ESPEC-1B-TRIBUNAL.md), sem nada de tela: funções puras
 * que recebem o estado e devolvem o próximo. O sorteio entra como parâmetro
 * (`aleatorio`) para os testes poderem repetir uma partida exatamente.
 */
import type { IaId } from '../personagens';
import type { JuradoId } from '../jurados';
import { indiceLiga } from '../ligas';
import { GOSTOS, type Reacao } from './temas';
import { DILEMAS, type Carta, type Dilema, type LadoId } from './dilemas';

export type Aleatorio = () => number;

export const PONTEIRO_MIN = -3;
export const PONTEIRO_MAX = 3;
export const TAMANHO_MAO = 4;
export const TOTAL_TEMPOS = 3;
/** Chance de o rival jogar a melhor carta, por liga (Recrutas → Imperadores). */
export const ACERTO_RIVAL = [0.4, 0.55, 0.7, 0.8, 0.9];

/** Valendo troféus: a liga dá a base e cada nível de Maestria soma 0,3 ponto (até +10). */
export function acertoValendo(trofeus: number, maestria: number): number {
  return Math.min(0.95, ACERTO_RIVAL[indiceLiga(trofeus)]! + Math.min(0.1, (maestria - 1) * 0.003));
}

const limitar = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const limitarPonteiro = (v: number) => limitar(v, PONTEIRO_MIN, PONTEIRO_MAX);

export function embaralhar<T>(lista: T[], aleatorio: Aleatorio): T[] {
  const out = [...lista];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

// ---------- Efeito de uma carta num jurado ----------

export interface Efeito {
  valor: number;
  reacao: Reacao | null;
}

const VALOR: Record<Reacao, number> = { ama: 2, gosta: 1, naoGosta: -1 };

/**
 * Soma os temas da carta pela tabela de gostos e aplica o peso do 3º tempo
 * (1,5×), sempre com limite de −3 a +3 por jurado. `tempo` começa em 0.
 * A resistência por jurado (Cético mais difícil, Empático mais fácil) saiu em
 * 18/11/2026 para equilibrar: ela deixava as cartas de Pessoas fortes demais.
 */
export function efeitoNoJurado(carta: Carta, jurado: JuradoId, tempo: number): Efeito {
  const g = GOSTOS[jurado];
  const reacoes: Reacao[] = carta.temas.flatMap((t): Reacao[] => (t === g.ama ? ['ama'] : t === g.gosta ? ['gosta'] : t === g.naoGosta ? ['naoGosta'] : []));
  let valor = reacoes.reduce((s, r) => s + VALOR[r], 0);
  if (tempo === TOTAL_TEMPOS - 1) valor = Math.sign(valor) * Math.round(Math.abs(valor) * 1.5);
  valor = limitar(valor, PONTEIRO_MIN, PONTEIRO_MAX);
  // A frase do jurado acompanha o sinal do efeito: a reação mais forte daquele lado.
  const reacao = valor > 0 ? (reacoes.includes('ama') ? 'ama' : 'gosta') : valor < 0 ? 'naoGosta' : null;
  return { valor, reacao };
}

// ---------- Estado da partida ----------

export interface EfeitoRodada {
  jogador: Efeito;
  rival: Efeito;
  antes: number;
  depois: number;
}

export interface Rodada {
  tempo: number;
  cartaJogador: Carta;
  cartaRival: Carta;
  efeitos: Partial<Record<JuradoId, EfeitoRodada>>;
  automatica: boolean;
}

export interface EstadoTribunal {
  dilema: Dilema;
  ladoJogador: LadoId;
  ia: IaId;
  rival: IaId;
  jurados: JuradoId[];
  acertoRival: number;
  tempo: number;
  /** De −3 (rival) a +3 (você). Só os jurados da sessão. */
  ponteiros: Partial<Record<JuradoId, number>>;
  mao: Carta[];
  reserva: Carta[];
  maoRival: Carta[];
  reservaRival: Carta[];
  /** Carta que o rival já escolheu neste tempo (escondida), ou null se ele vai responder depois. */
  cartaRival: Carta | null;
  rivalRespondeDepois: boolean;
  habilidadeUsada: boolean;
  habilidadeRivalUsada: boolean;
  /** Visão do Gemini ativa neste tempo: a carta do rival aparece. */
  visao: boolean;
  /** O que aconteceu antes da escolha deste tempo (ex.: habilidade do rival). */
  avisos: string[];
  rodadas: Rodada[];
  fase: 'escolha' | 'revelacao' | 'fim';
}

export const ladoRival = (l: LadoId): LadoId => (l === 'favor' ? 'contra' : 'favor');
export const ponteiro = (e: EstadoTribunal, j: JuradoId) => e.ponteiros[j] ?? 0;

export interface Inicio {
  ia: IaId;
  rival: IaId;
  jurados: JuradoId[];
  trofeus: number;
  /** Modo Treino: chance de o rival acertar, pela dificuldade escolhida (no lugar da liga). */
  acerto?: number;
  /** Nível de Maestria da IA do jogador: quanto maior, mais esperto o rival (só valendo troféus). */
  maestria?: number;
  dilema?: Dilema;
  lado?: LadoId;
}

export function novaPartida(ini: Inicio, aleatorio: Aleatorio = Math.random): EstadoTribunal {
  const dilema = ini.dilema ?? DILEMAS[Math.floor(aleatorio() * DILEMAS.length)]!;
  const ladoJogador = ini.lado ?? (aleatorio() < 0.5 ? 'favor' : 'contra');
  const base: EstadoTribunal = {
    dilema,
    ladoJogador,
    ia: ini.ia,
    rival: ini.rival,
    jurados: ini.jurados,
    acertoRival: ini.acerto ?? acertoValendo(ini.trofeus, ini.maestria ?? 1),
    tempo: 0,
    ponteiros: Object.fromEntries(ini.jurados.map((j) => [j, 0])),
    mao: [],
    reserva: [],
    maoRival: [],
    reservaRival: [],
    cartaRival: null,
    rivalRespondeDepois: false,
    habilidadeUsada: false,
    habilidadeRivalUsada: false,
    visao: false,
    avisos: [],
    rodadas: [],
    fase: 'escolha',
  };
  return iniciarTempo(base, 0, aleatorio);
}

function iniciarTempo(e: EstadoTribunal, tempo: number, aleatorio: Aleatorio): EstadoTribunal {
  const minhas = embaralhar(e.dilema.lados[e.ladoJogador].tempos[tempo]!, aleatorio);
  const dele = embaralhar(e.dilema.lados[ladoRival(e.ladoJogador)].tempos[tempo]!, aleatorio);
  let s: EstadoTribunal = {
    ...e,
    tempo,
    mao: minhas.slice(0, TAMANHO_MAO),
    reserva: minhas.slice(TAMANHO_MAO),
    maoRival: dele.slice(0, TAMANHO_MAO),
    reservaRival: dele.slice(TAMANHO_MAO),
    cartaRival: null,
    rivalRespondeDepois: false,
    visao: false,
    avisos: [],
    fase: 'escolha',
  };
  s = habilidadeDoRival(s);
  if (!s.rivalRespondeDepois) s = { ...s, cartaRival: escolherCartaRival(s, aleatorio) };
  return s;
}

// ---------- O rival ----------

/** Quanto uma carta do rival ajuda o lado dele, já considerando a carta do jogador quando ele a conhece. */
function valorParaRival(e: EstadoTribunal, carta: Carta, cartaJogador?: Carta): number {
  return e.jurados.reduce((soma, j) => {
    const p = ponteiro(e, j) + (cartaJogador ? efeitoNoJurado(cartaJogador, j, e.tempo).valor : 0);
    const antes = limitarPonteiro(p);
    const depois = limitarPonteiro(p - efeitoNoJurado(carta, j, e.tempo).valor);
    let v = antes - depois;
    if (antes >= 0 && depois < 0) v += 1.5; // virou um jurado para o lado dele
    else if (antes > 0 && depois === 0) v += 0.5;
    return soma + v;
  }, 0);
}

export function escolherCartaRival(e: EstadoTribunal, aleatorio: Aleatorio, cartaJogador?: Carta): Carta {
  const ordenadas = [...e.maoRival].sort((a, b) => valorParaRival(e, b, cartaJogador) - valorParaRival(e, a, cartaJogador));
  if (aleatorio() < e.acertoRival) return ordenadas[0]!;
  return e.maoRival[Math.floor(aleatorio() * e.maoRival.length)]!;
}

/** O rival usa a habilidade dele uma vez, no começo do tempo em que ela rende mais. */
function habilidadeDoRival(e: EstadoTribunal): EstadoTribunal {
  if (e.habilidadeRivalUsada) return e;
  if (e.rival === 'claude' && e.tempo >= 1) {
    const alvo = [...e.jurados].sort((a, b) => ponteiro(e, b) - ponteiro(e, a))[0];
    if (alvo && ponteiro(e, alvo) >= 2) {
      return { ...e, habilidadeRivalUsada: true, ponteiros: { ...e.ponteiros, [alvo]: 0 }, avisos: [`diplomacia:${alvo}`] };
    }
  }
  if (e.rival === 'chatgpt' && e.tempo === 1 && e.reservaRival.length > 0) {
    const pior = [...e.maoRival].sort((a, b) => valorParaRival(e, a) - valorParaRival(e, b))[0]!;
    const nova = e.reservaRival[0]!;
    return {
      ...e,
      habilidadeRivalUsada: true,
      maoRival: e.maoRival.map((c) => (c.id === pior.id ? nova : c)),
      reservaRival: e.reservaRival.slice(1),
      avisos: ['improviso'],
    };
  }
  if (e.rival === 'gemini' && e.tempo === TOTAL_TEMPOS - 1) {
    return { ...e, habilidadeRivalUsada: true, rivalRespondeDepois: true, avisos: ['visao'] };
  }
  return e;
}

// ---------- Ações do jogador ----------

export type Habilidade = { tipo: 'diplomacia'; jurado: JuradoId } | { tipo: 'improviso'; cartaId: string } | { tipo: 'visao' };

/** O que a habilidade da IA do jogador permite agora (para a tela habilitar o botão). */
export function podeUsarHabilidade(e: EstadoTribunal): boolean {
  if (e.habilidadeUsada || e.fase !== 'escolha') return false;
  if (e.ia === 'claude') return e.jurados.some((j) => ponteiro(e, j) < 0);
  if (e.ia === 'chatgpt') return e.reserva.length > 0;
  return true;
}

export function usarHabilidade(e: EstadoTribunal, h: Habilidade, aleatorio: Aleatorio = Math.random): EstadoTribunal {
  if (!podeUsarHabilidade(e)) return e;
  if (h.tipo === 'diplomacia' && e.ia === 'claude' && ponteiro(e, h.jurado) < 0) {
    return { ...e, habilidadeUsada: true, ponteiros: { ...e.ponteiros, [h.jurado]: 0 } };
  }
  if (h.tipo === 'improviso' && e.ia === 'chatgpt' && e.mao.some((c) => c.id === h.cartaId)) {
    const nova = e.reserva[0]!;
    return { ...e, habilidadeUsada: true, mao: e.mao.map((c) => (c.id === h.cartaId ? nova : c)), reserva: e.reserva.slice(1) };
  }
  if (h.tipo === 'visao' && e.ia === 'gemini') {
    // Se o rival ia responder depois, a Visão obriga ele a escolher agora.
    const cartaRival = e.cartaRival ?? escolherCartaRival(e, aleatorio);
    return { ...e, habilidadeUsada: true, visao: true, cartaRival, rivalRespondeDepois: false };
  }
  return e;
}

export function jogarCarta(e: EstadoTribunal, cartaId: string, aleatorio: Aleatorio = Math.random, automatica = false): EstadoTribunal {
  const carta = e.mao.find((c) => c.id === cartaId);
  if (!carta || e.fase !== 'escolha') return e;
  const cartaRival = e.rivalRespondeDepois || !e.cartaRival ? escolherCartaRival(e, aleatorio, carta) : e.cartaRival;
  const efeitos: Rodada['efeitos'] = {};
  const ponteiros = { ...e.ponteiros };
  for (const j of e.jurados) {
    const jogador = efeitoNoJurado(carta, j, e.tempo);
    const rival = efeitoNoJurado(cartaRival, j, e.tempo);
    const antes = ponteiro(e, j);
    const depois = limitarPonteiro(antes + jogador.valor - rival.valor);
    ponteiros[j] = depois;
    efeitos[j] = { jogador, rival, antes, depois };
  }
  return {
    ...e,
    ponteiros,
    cartaRival,
    rodadas: [...e.rodadas, { tempo: e.tempo, cartaJogador: carta, cartaRival, efeitos, automatica }],
    fase: 'revelacao',
  };
}

/** Tempo esgotado: o tribunal joga uma carta qualquer da mão do jogador. */
export function jogarAleatoria(e: EstadoTribunal, aleatorio: Aleatorio = Math.random): EstadoTribunal {
  const carta = e.mao[Math.floor(aleatorio() * e.mao.length)];
  return carta ? jogarCarta(e, carta.id, aleatorio, true) : e;
}

export function avancar(e: EstadoTribunal, aleatorio: Aleatorio = Math.random): EstadoTribunal {
  if (e.fase !== 'revelacao') return e;
  if (e.tempo + 1 < TOTAL_TEMPOS) return iniciarTempo(e, e.tempo + 1, aleatorio);
  return { ...e, fase: 'fim' };
}

// ---------- Veredito ----------

export type Voto = 'jogador' | 'rival' | 'abstencao';
export type Resultado = 'vitoria' | 'derrota' | 'empate';

export interface Veredito {
  votos: Partial<Record<JuradoId, Voto>>;
  jogador: number;
  rival: number;
  resultado: Resultado;
}

export function veredito(e: EstadoTribunal): Veredito {
  const votos: Veredito['votos'] = {};
  let jogador = 0;
  let rival = 0;
  for (const j of e.jurados) {
    const p = ponteiro(e, j);
    const v: Voto = p > 0 ? 'jogador' : p < 0 ? 'rival' : 'abstencao';
    votos[j] = v;
    if (v === 'jogador') jogador++;
    if (v === 'rival') rival++;
  }
  const resultado: Resultado = jogador > rival ? 'vitoria' : rival > jogador ? 'derrota' : 'empate';
  return { votos, jogador, rival, resultado };
}

/** A carta que mais pesou no voto de um jurado, para a frase do veredito. */
export function cartaDecisiva(e: EstadoTribunal, jurado: JuradoId, voto: Voto): Carta | null {
  if (voto === 'abstencao') return null;
  let melhor: { carta: Carta; valor: number } | null = null;
  for (const r of e.rodadas) {
    const ef = r.efeitos[jurado];
    if (!ef) continue;
    const valor = voto === 'jogador' ? ef.jogador.valor : ef.rival.valor;
    const carta = voto === 'jogador' ? r.cartaJogador : r.cartaRival;
    if (valor > 0 && (!melhor || valor >= melhor.valor)) melhor = { carta, valor };
  }
  return melhor?.carta ?? null;
}
