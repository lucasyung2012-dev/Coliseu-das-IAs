/**
 * Duelo em tempo real, versão 3 (pedida pelo Lucas): "choque no ar".
 * Uma faixa só: cada golpe voa do seu gladiador até o rival. Quando dois golpes
 * se encontram no meio, o mais forte passa (com a força que sobrou); força igual,
 * os dois somem. A defesa é o próprio ataque. Uma plateia só (cabo de guerra),
 * golpe final com 5 aplausos, cartas raras e melhor de 3 rodadas.
 * Combos e eventos da arena saíram por enquanto (o Lucas vai reelaborar).
 * Funções puras: a tela chama `passo` a cada tick e `jogarCarta`/`golpeFinal` no toque.
 */
import type { IaId } from '../personagens';

export type Lado = 'eu' | 'rival';
export type TipoCarta = 'argumento' | 'forte' | 'capciosa' | 'dado' | 'apelo';

export const LIMITE = 10;
export const FOLEGO_MAX = 10;
export const FOLEGO_INICIAL = 5;
export const FOLEGO_POR_SEGUNDO = 1;
export const APLAUSOS_MAX = 5;
export const TAMANHO_MAO = 4;
export const RODADA_MS = 30_000;
export const INTERVALO_MS = 2_500;
export const TICK = 100;
/** Onde os golpes saem e chegam (em % da largura do palco). */
export const SAIDA = { eu: 20, rival: 80 } as const;

export interface InfoCarta {
  nome: string;
  icone: string;
  custo: number;
  /** Força no choque e na plateia (0 = carta de efeito). */
  forca: number;
  /** Tempo de voo em ms. */
  voo: number;
  dica: string;
  rara?: boolean;
}

export const CARTAS: Record<TipoCarta, InfoCarta> = {
  argumento: { nome: 'Argumento', icone: '⚔️', custo: 2, forca: 2, voo: 2600, dica: 'Rápido e barato.' },
  forte: { nome: 'Argumento forte', icone: '💥', custo: 4, forca: 4, voo: 3400, dica: 'Lento, mas vence os menores.' },
  dado: { nome: 'Dado irrefutável', icone: '📊', custo: 3, forca: 3, voo: 3000, dica: 'Atravessa os golpes do rival.', rara: true },
  capciosa: { nome: 'Pergunta capciosa', icone: '❓', custo: 1, forca: 0, voo: 0, dica: 'O rival fica 2 s sem jogar.', rara: true },
  apelo: { nome: 'Apelo à plateia', icone: '👏', custo: 2, forca: 0, voo: 0, dica: 'Plateia +1 na hora.', rara: true },
};

/** Golpe final de cada IA (com 5 aplausos). */
export const GOLPES_FINAIS: Record<IaId, { nome: string; efeito: string }> = {
  claude: { nome: 'Muralha', efeito: 'Apaga todos os golpes do rival no ar.' },
  chatgpt: { nome: 'Rede', efeito: 'O rival fica preso 3 s sem jogar.' },
  gemini: { nome: 'Raio solar', efeito: 'Golpe de força 5 que atravessa tudo.' },
};

export interface CartaDuelo {
  id: string;
  tipo: TipoCarta;
  /** Frase do dilema, mostrada num balão quando a carta é jogada. */
  frase: string;
}

export interface Projetil {
  id: number;
  de: Lado;
  tipo: 'argumento' | 'forte' | 'dado' | 'raio';
  forca: number;
  lancadoEm: number;
  duracao: number;
}

export interface Lutador {
  folego: number;
  aplausos: number;
  mao: CartaDuelo[];
  monte: CartaDuelo[];
  presoAte: number;
  /** Última frase dita (balão em cima do gladiador). */
  fala: { texto: string; ate: number } | null;
}

export interface EfeitoVisual {
  id: number;
  tipo: 'choque' | 'acerto' | 'final';
  lado: Lado;
  /** Posição do choque, em % da largura. */
  x?: number;
  ate: number;
}

export interface EstadoDuelo {
  tempo: number;
  rodada: number;
  rodadas: { eu: number; rival: number };
  plateia: number;
  eu: Lutador;
  rival: Lutador;
  projeteis: Projetil[];
  proximoRival: number;
  reagidos: number[];
  fase: 'luta' | 'intervalo' | 'fim';
  fimIntervalo: number;
  /** Um aviso por vez, grande, no meio da arena. */
  aviso: { texto: string; lado: Lado | null; ate: number } | null;
  efeitos: EfeitoVisual[];
  seq: number;
}

export type Aleatorio = () => number;

const outro = (l: Lado): Lado => (l === 'eu' ? 'rival' : 'eu');
const sinal = (l: Lado) => (l === 'eu' ? 1 : -1);
const limitar = (v: number) => Math.max(-LIMITE, Math.min(LIMITE, v));

function embaralhar<T>(lista: T[], aleatorio: Aleatorio): T[] {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/** Monte de 15 cartas: 8 argumentos, 4 fortes e 1 de cada rara. */
export function montarMonte(frases: string[], prefixo: string, aleatorio: Aleatorio): CartaDuelo[] {
  const tipos: TipoCarta[] = [...Array<TipoCarta>(8).fill('argumento'), ...Array<TipoCarta>(4).fill('forte'), 'dado', 'capciosa', 'apelo'];
  return embaralhar(
    tipos.map((tipo, i) => ({ id: `${prefixo}-${i}`, tipo, frase: frases[i % Math.max(1, frases.length)] ?? '' })),
    aleatorio,
  );
}

function lutador(monte: CartaDuelo[]): Lutador {
  return { folego: FOLEGO_INICIAL, aplausos: 0, mao: monte.slice(0, TAMANHO_MAO), monte: monte.slice(TAMANHO_MAO), presoAte: 0, fala: null };
}

export function novoDuelo(frasesEu: string[], frasesRival: string[], aleatorio: Aleatorio = Math.random): EstadoDuelo {
  return {
    tempo: 0,
    rodada: 1,
    rodadas: { eu: 0, rival: 0 },
    plateia: 0,
    eu: lutador(montarMonte(frasesEu, 'eu', aleatorio)),
    rival: lutador(montarMonte(frasesRival, 'rv', aleatorio)),
    projeteis: [],
    proximoRival: 3000,
    reagidos: [],
    fase: 'luta',
    fimIntervalo: 0,
    aviso: null,
    efeitos: [],
    seq: 0,
  };
}

const comLutador = (s: EstadoDuelo, lado: Lado, f: (l: Lutador) => Lutador): EstadoDuelo =>
  lado === 'eu' ? { ...s, eu: f(s.eu) } : { ...s, rival: f(s.rival) };

function avisar(s: EstadoDuelo, texto: string, lado: Lado | null, ms = 1600): EstadoDuelo {
  return { ...s, aviso: { texto, lado, ate: s.tempo + ms } };
}

function efeito(s: EstadoDuelo, tipo: EfeitoVisual['tipo'], lado: Lado, x?: number, ms = 900): EstadoDuelo {
  return { ...s, seq: s.seq + 1, efeitos: [...s.efeitos, { id: s.seq + 1, tipo, lado, x, ate: s.tempo + ms }] };
}

/** Tira a carta da mão e compra a próxima; a jogada volta para o fundo do monte. */
function gastar(l: Lutador, carta: CartaDuelo, agora: number): Lutador {
  const mao = l.mao.filter((c) => c.id !== carta.id);
  const [proxima, ...resto] = l.monte;
  if (proxima) mao.push(proxima);
  return { ...l, mao, monte: [...resto, carta], folego: l.folego - CARTAS[carta.tipo].custo, fala: { texto: carta.frase, ate: agora + 1800 } };
}

export const progresso = (p: Projetil, agora: number) => Math.min(1, Math.max(0, (agora - p.lancadoEm) / p.duracao));

/** Posição do golpe na faixa (em % da largura). */
export const posicao = (p: Projetil, agora: number) => SAIDA[p.de] + (SAIDA[outro(p.de)] - SAIDA[p.de]) * progresso(p, agora);

export function podeJogar(s: EstadoDuelo, lado: Lado, cartaId: string): boolean {
  const l = s[lado];
  const c = l.mao.find((x) => x.id === cartaId);
  return !!c && s.fase === 'luta' && l.folego >= CARTAS[c.tipo].custo && l.presoAte <= s.tempo;
}

export function jogarCarta(s0: EstadoDuelo, lado: Lado, cartaId: string): EstadoDuelo {
  if (!podeJogar(s0, lado, cartaId)) return s0;
  const carta = s0[lado].mao.find((c) => c.id === cartaId)!;
  const info = CARTAS[carta.tipo];
  const agora = s0.tempo;
  let s = comLutador(s0, lado, (l) => gastar(l, carta, agora));

  if (carta.tipo === 'capciosa') {
    s = avisar(s, '❓ PERGUNTA CAPCIOSA!', lado);
    return comLutador(s, outro(lado), (l) => ({ ...l, presoAte: agora + 2000 }));
  }
  if (carta.tipo === 'apelo') {
    s = efeito(s, 'acerto', lado);
    return { ...s, plateia: limitar(s.plateia + sinal(lado)) };
  }
  const tipo = carta.tipo;
  return {
    ...s,
    seq: s.seq + 1,
    projeteis: [...s.projeteis, { id: s.seq + 1, de: lado, tipo, forca: info.forca, lancadoEm: agora, duracao: info.voo }],
  };
}

/** Golpe final da IA (com 5 aplausos). */
export function golpeFinal(s0: EstadoDuelo, lado: Lado, ia: IaId): EstadoDuelo {
  if (s0[lado].aplausos < APLAUSOS_MAX || s0.fase !== 'luta') return s0;
  const agora = s0.tempo;
  let s = comLutador(s0, lado, (l) => ({ ...l, aplausos: 0 }));
  s = efeito(s, 'final', lado, undefined, 1200);
  s = avisar(s, `⭐ ${GOLPES_FINAIS[ia].nome.toUpperCase()}!`, lado, 2000);
  if (ia === 'claude') return { ...s, projeteis: s.projeteis.filter((p) => p.de === lado) };
  if (ia === 'chatgpt') return comLutador(s, outro(lado), (l) => ({ ...l, presoAte: agora + 3000 }));
  return {
    ...s,
    seq: s.seq + 1,
    projeteis: [...s.projeteis, { id: s.seq + 1, de: lado, tipo: 'raio', forca: 5, lancadoEm: agora, duracao: 1600 }],
  };
}

/** Dado irrefutável e raio solar atravessam os golpes do rival (não se chocam). */
const atravessa = (p: Projetil) => p.tipo === 'dado' || p.tipo === 'raio';

/** Choques no ar: o golpe mais à frente de cada lado se encontra; o mais forte passa. */
function choques(s0: EstadoDuelo): EstadoDuelo {
  let s = s0;
  for (;;) {
    const frente = (lado: Lado) =>
      s.projeteis.filter((p) => p.de === lado && !atravessa(p)).sort((a, b) => progresso(b, s.tempo) - progresso(a, s.tempo))[0];
    const meu = frente('eu');
    const dele = frente('rival');
    if (!meu || !dele || posicao(meu, s.tempo) < posicao(dele, s.tempo)) return s;
    const x = (posicao(meu, s.tempo) + posicao(dele, s.tempo)) / 2;
    const sobra = meu.forca - dele.forca;
    const venceu: Lado | null = sobra > 0 ? 'eu' : sobra < 0 ? 'rival' : null;
    s = {
      ...s,
      projeteis: s.projeteis
        .filter((p) => (p.id !== meu.id || venceu === 'eu') && (p.id !== dele.id || venceu === 'rival'))
        .map((p) => (p.id === meu.id || p.id === dele.id ? { ...p, forca: Math.abs(sobra) } : p)),
    };
    s = efeito(s, 'choque', venceu ?? 'eu', x);
  }
}

/** Golpe que chegou no gladiador: puxa a plateia e dá um aplauso. */
function chegada(s0: EstadoDuelo, p: Projetil): EstadoDuelo {
  let s = { ...s0, plateia: limitar(s0.plateia + sinal(p.de) * p.forca) };
  s = comLutador(s, p.de, (l) => ({ ...l, aplausos: Math.min(APLAUSOS_MAX, l.aplausos + 1) }));
  return efeito(s, 'acerto', p.de);
}

export interface Contexto {
  acerto: number;
  iaRival: IaId;
  aleatorio: Aleatorio;
}

/** O rival: responde aos seus golpes (com a chance da liga) e ataca no ritmo dele. */
function vezDoRival(s0: EstadoDuelo, ctx: Contexto): EstadoDuelo {
  const s = s0;
  const r = s.rival;
  const agora = s.tempo;
  if (r.presoAte > agora) return s;
  if (r.aplausos >= APLAUSOS_MAX) return golpeFinal(s, 'rival', ctx.iaRival);
  const jogaveis = r.mao.filter((c) => podeJogar(s, 'rival', c.id));
  const atacantes = jogaveis.filter((c) => CARTAS[c.tipo].forca > 0 && c.tipo !== 'dado');

  // Resposta: um golpe seu passou de 1/4 do caminho; o rival tenta lançar um que vença.
  const vindo = s.projeteis.find((p) => p.de === 'eu' && !atravessa(p) && !s.reagidos.includes(p.id) && progresso(p, agora) >= 0.25);
  if (vindo) {
    const marcado = { ...s, reagidos: [...s.reagidos, vindo.id] };
    if (ctx.aleatorio() >= ctx.acerto) return marcado;
    const melhor = atacantes.filter((c) => CARTAS[c.tipo].forca >= vindo.forca).sort((a, b) => CARTAS[a.tipo].custo - CARTAS[b.tipo].custo)[0];
    return melhor ? jogarCarta(marcado, 'rival', melhor.id) : marcado;
  }

  if (agora < s.proximoRival) return s;
  // Ritmo: de ~4,5 s (liga baixa) a ~3 s (liga alta) entre ataques.
  const proximo = { ...s, proximoRival: agora + 4500 - ctx.acerto * 1500 + ctx.aleatorio() * 1000 };
  const escolhida = jogaveis[Math.floor(ctx.aleatorio() * jogaveis.length)];
  return escolhida ? jogarCarta(proximo, 'rival', escolhida.id) : proximo;
}

export function passo(s0: EstadoDuelo, ctx: Contexto): EstadoDuelo {
  if (s0.fase === 'fim') return s0;
  const tempo = s0.tempo + TICK;
  if (s0.fase === 'intervalo') {
    if (tempo < s0.fimIntervalo) return { ...s0, tempo };
    const zerar = (l: Lutador): Lutador => ({ ...l, folego: FOLEGO_INICIAL, presoAte: 0, fala: null });
    return { ...s0, tempo: 0, rodada: s0.rodada + 1, plateia: 0, projeteis: [], eu: zerar(s0.eu), rival: zerar(s0.rival), proximoRival: 3000, reagidos: [], fase: 'luta', aviso: null, efeitos: [] };
  }

  const recupera = (l: Lutador): Lutador => ({
    ...l,
    folego: Math.min(FOLEGO_MAX, l.folego + (FOLEGO_POR_SEGUNDO * TICK) / 1000),
    fala: l.fala && l.fala.ate > tempo ? l.fala : null,
  });
  let s: EstadoDuelo = {
    ...s0,
    tempo,
    eu: recupera(s0.eu),
    rival: recupera(s0.rival),
    aviso: s0.aviso && s0.aviso.ate > tempo ? s0.aviso : null,
    efeitos: s0.efeitos.filter((e) => e.ate > tempo),
  };

  s = choques(s);
  const chegaram = s.projeteis.filter((p) => progresso(p, tempo) >= 1);
  s = { ...s, projeteis: s.projeteis.filter((p) => progresso(p, tempo) < 1) };
  for (const p of chegaram) s = chegada(s, p);
  s = vezDoRival(s, ctx);

  if (Math.abs(s.plateia) >= LIMITE || tempo >= RODADA_MS) {
    const venceu: Lado | null = s.plateia > 0 ? 'eu' : s.plateia < 0 ? 'rival' : null;
    const rodadas = { eu: s.rodadas.eu + (venceu === 'eu' ? 1 : 0), rival: s.rodadas.rival + (venceu === 'rival' ? 1 : 0) };
    const acabou = rodadas.eu >= 2 || rodadas.rival >= 2 || s.rodada >= 3;
    s = { ...s, rodadas, projeteis: [], fase: acabou ? 'fim' : 'intervalo', fimIntervalo: tempo + INTERVALO_MS };
    s = avisar(s, venceu === 'eu' ? `RODADA ${s.rodada}: SUA!` : venceu === 'rival' ? `RODADA ${s.rodada}: DO RIVAL` : `RODADA ${s.rodada}: EMPATE`, venceu, INTERVALO_MS);
  }
  return s;
}

export function resultadoFinal(s: EstadoDuelo): 'vitoria' | 'derrota' | 'empate' {
  return s.rodadas.eu > s.rodadas.rival ? 'vitoria' : s.rodadas.rival > s.rodadas.eu ? 'derrota' : 'empate';
}
