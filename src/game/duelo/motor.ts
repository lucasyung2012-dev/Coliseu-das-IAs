/**
 * Duelo em tempo real, versão 5 (combinada com o Lucas): tropas de argumentos
 * contra a torre do rival.
 * Cada gladiador fica em cima da sua torre. Cada carta vira uma tropa que anda
 * pela faixa; quando duas tropas inimigas se encontram, elas lutam (1 de dano
 * por vez) e a que sobra segue. A tropa que chega à torre inimiga tira dela a
 * força que tem. Torre no chão = derrota na hora. Se ninguém derrubar, ganha
 * quem tiver mais vida no fim da 3ª rodada; empate leva à prorrogação (4ª
 * rodada, 20 s, fôlego em dobro). "Segurar e soltar": carga cheia dá +1 de
 * força e custa +1 de fôlego. O gladiador defende a torre, a habilidade da IA
 * enche com acertos e, na 3ª rodada, quem tem menos vida recupera fôlego mais
 * rápido (virada). Números pequenos, para ajustar jogando.
 * Funções puras: a tela chama `passo` a cada tick e as ações no toque.
 */
import type { IaId } from '../personagens';

export type Lado = 'eu' | 'rival';
export type TipoCarta = 'argumento' | 'forte' | 'dado';
export type TipoTropa = 'legionario' | 'centuriao' | 'arqueiro';

export const TORRE_VIDA = 30;
export const FOLEGO_MAX = 10;
export const FOLEGO_INICIAL = 5;
/** O Lucas achou rápido demais a 1/s. */
export const FOLEGO_POR_SEGUNDO = 0.7;
/** 3ª rodada: quem tem menos vida na torre recupera fôlego 25% mais rápido. */
export const VIRADA_BONUS = 1.25;
export const RODADAS = 3;
export const RODADA_MS = 45_000;
/** Prorrogação (4ª rodada, só se empatar a vida): 20 s com fôlego em dobro. */
export const PRORROGACAO_MS = 20_000;
export const INTERVALO_MS = 2_500;
export const TAMANHO_MAO = 4;
export const TICK = 100;

/** Onde as tropas nascem e onde fica a torre de cada lado (em % da largura). */
export const PONTA = { eu: 20, rival: 80 } as const;
/** Distância em que duas tropas inimigas se encostam e lutam. */
const ENCOSTO = 4;
const GOLPE_LUTA_MS = 500;

/** Segurar e soltar: tempo para carregar a carta até o máximo. */
export const CARGA_MS = 1200;
/**
 * Carga cheia: +1 de força, pagando +1 de fôlego (sem fôlego sobrando, sai normal).
 * Antes era +2 de graça e ficou forte demais (teste do Lucas, 20/11/2026).
 */
export const CUSTO_CARGA = 1;
export function bonusDaCarga(carga: number): number {
  return carga >= 1 ? 1 : 0;
}

export interface InfoCarta {
  nome: string;
  icone: string;
  custo: number;
  forca: number;
  tropa: TipoTropa;
  dica: string;
  rara?: boolean;
}

/** Pergunta capciosa e Apelo à plateia saíram: o Lucas achou que eram "roubadas". */
export const CARTAS: Record<TipoCarta, InfoCarta> = {
  argumento: { nome: 'Frase rápida', icone: '⚔️', custo: 2, forca: 2, tropa: 'legionario', dica: 'Legionário: barato e o mais rápido, mas fraco.' },
  forte: { nome: 'Tese', icone: '🛡️', custo: 4, forca: 4, tropa: 'centuriao', dica: 'Centurião: caro e lento, mas aguenta muito.' },
  dado: { nome: 'Fato', icone: '🏹', custo: 4, forca: 1, tropa: 'arqueiro', dica: 'Arqueiro: atira de longe, mas cai com um golpe.', rara: true },
};

/** Velocidade de cada tropa (% da largura por segundo). */
const VELOCIDADE: Record<TipoTropa, number> = { legionario: 14, centuriao: 6, arqueiro: 9 };
/** Arqueiro: atira a cada 2 s em quem estiver até 25% à frente; no máximo 2 em campo. */
const TIRO_MS = 2000;
const ALCANCE_TIRO = 25;
export const MAX_ARQUEIROS = 2;

/** Gladiador: 1 golpe automático a cada 3 s em quem chega perto; toque = golpe na hora (recarga 8 s). */
const GLADIADOR_AUTO_MS = 3000;
export const GLADIADOR_ALCANCE = 8;
export const GLADIADOR_RECARGA_MS = 8000;
const GLADIADOR_ALCANCE_TOQUE = 25;

/** Habilidade da IA: enche com 4 tropas que chegam à torre. */
export const SUPER_MAX = 4;
export const HABILIDADES: Record<IaId, { nome: string; icone: string; efeito: string }> = {
  claude: { nome: 'Escudo', icone: '🛡️', efeito: 'Bloqueia os próximos 2 golpes na sua torre.' },
  chatgpt: { nome: 'Carta grátis', icone: '🃏', efeito: 'A próxima carta não custa fôlego.' },
  gemini: { nome: 'Raio', icone: '⚡', efeito: 'Tira 3 de força da tropa inimiga mais perto.' },
};

export interface CartaDuelo {
  id: string;
  tipo: TipoCarta;
  /** Frase do dilema, mostrada num balão quando a carta é jogada. */
  frase: string;
}

export interface Tropa {
  id: number;
  de: Lado;
  tipo: TipoTropa;
  forca: number;
  forcaInicial: number;
  x: number;
  /** Saiu carregada: brilha. */
  carregada: boolean;
  proximoGolpe: number;
}

export interface Lutador {
  folego: number;
  mao: CartaDuelo[];
  monte: CartaDuelo[];
  /** Carga da habilidade (0 a SUPER_MAX). */
  carga: number;
  /** Claude: golpes que o escudo ainda segura. */
  escudo: number;
  /** ChatGPT: a próxima carta sai de graça. */
  gratis: boolean;
  gladiadorAutoEm: number;
  gladiadorProntoEm: number;
  fala: { texto: string; ate: number } | null;
}

export interface EfeitoVisual {
  id: number;
  tipo: 'choque' | 'torre' | 'flecha' | 'golpe' | 'raio' | 'escudo' | 'super';
  lado: Lado;
  x?: number;
  ate: number;
}

export interface EstadoDuelo {
  tempo: number;
  /** 1 a 3; a 4 é a prorrogação. */
  rodada: number;
  torres: { eu: number; rival: number };
  eu: Lutador;
  rival: Lutador;
  tropas: Tropa[];
  proximoRival: number;
  fase: 'luta' | 'intervalo' | 'fim';
  fimIntervalo: number;
  aviso: { texto: string; lado: Lado | null; ate: number } | null;
  efeitos: EfeitoVisual[];
  seq: number;
}

export type Aleatorio = () => number;

const outro = (l: Lado): Lado => (l === 'eu' ? 'rival' : 'eu');
/** Direção em que as tropas de cada lado andam. */
const direcao = (l: Lado) => (l === 'eu' ? 1 : -1);

export const prorrogacao = (s: EstadoDuelo) => s.rodada > RODADAS;
export const duracaoDaRodada = (s: EstadoDuelo) => (prorrogacao(s) ? PRORROGACAO_MS : RODADA_MS);

function embaralhar<T>(lista: T[], aleatorio: Aleatorio): T[] {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/** Monte de 15 cartas: 9 argumentos, 5 fortes e só 1 arqueiro. */
export function montarMonte(frases: string[], prefixo: string, aleatorio: Aleatorio): CartaDuelo[] {
  const tipos: TipoCarta[] = [...Array<TipoCarta>(9).fill('argumento'), ...Array<TipoCarta>(5).fill('forte'), 'dado'];
  return embaralhar(
    tipos.map((tipo, i) => ({ id: `${prefixo}-${i}`, tipo, frase: frases[i % Math.max(1, frases.length)] ?? '' })),
    aleatorio,
  );
}

function lutador(monte: CartaDuelo[]): Lutador {
  return {
    folego: FOLEGO_INICIAL,
    mao: monte.slice(0, TAMANHO_MAO),
    monte: monte.slice(TAMANHO_MAO),
    carga: 0,
    escudo: 0,
    gratis: false,
    gladiadorAutoEm: 0,
    gladiadorProntoEm: 0,
    fala: null,
  };
}

export function novoDuelo(frasesEu: string[], frasesRival: string[], aleatorio: Aleatorio = Math.random): EstadoDuelo {
  return {
    tempo: 0,
    rodada: 1,
    torres: { eu: TORRE_VIDA, rival: TORRE_VIDA },
    eu: lutador(montarMonte(frasesEu, 'eu', aleatorio)),
    rival: lutador(montarMonte(frasesRival, 'rv', aleatorio)),
    tropas: [],
    proximoRival: 3000,
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

function efeito(s: EstadoDuelo, tipo: EfeitoVisual['tipo'], lado: Lado, x?: number, ms = 800): EstadoDuelo {
  return { ...s, seq: s.seq + 1, efeitos: [...s.efeitos, { id: s.seq + 1, tipo, lado, x, ate: s.tempo + ms }] };
}

/** Quanto custa esta carta agora (com a Carta grátis, sai de graça). */
export function custoAgora(l: Lutador, tipo: TipoCarta): number {
  return l.gratis ? 0 : CARTAS[tipo].custo;
}

export function podeJogar(s: EstadoDuelo, lado: Lado, cartaId: string): boolean {
  const l = s[lado];
  const c = l.mao.find((x) => x.id === cartaId);
  if (!c || s.fase !== 'luta' || l.folego < custoAgora(l, c.tipo)) return false;
  if (c.tipo === 'dado' && s.tropas.filter((t) => t.de === lado && t.tipo === 'arqueiro').length >= MAX_ARQUEIROS) return false;
  return true;
}

/** Joga uma carta. `carga` (0 a 1) vem de quanto tempo a carta foi segurada. */
export function jogarCarta(s0: EstadoDuelo, lado: Lado, cartaId: string, carga = 0): EstadoDuelo {
  if (!podeJogar(s0, lado, cartaId)) return s0;
  const carta = s0[lado].mao.find((c) => c.id === cartaId)!;
  const info = CARTAS[carta.tipo];
  const agora = s0.tempo;
  const custo = custoAgora(s0[lado], carta.tipo);
  // O arqueiro é frágil de propósito: não carrega. A carga custa +1 de fôlego.
  const bonus = info.tropa !== 'arqueiro' && s0[lado].folego - custo >= CUSTO_CARGA ? bonusDaCarga(carga) : 0;
  let s = comLutador(s0, lado, (l) => {
    const mao = l.mao.filter((c) => c.id !== carta.id);
    const [proxima, ...resto] = l.monte;
    if (proxima) mao.push(proxima);
    return {
      ...l,
      mao,
      monte: [...resto, carta],
      folego: l.folego - custo - (bonus > 0 ? CUSTO_CARGA : 0),
      gratis: false,
      fala: { texto: carta.frase, ate: agora + 1800 },
    };
  });
  const forca = info.forca + bonus;
  if (bonus > 0) s = avisar(s, '💪 CARREGADO! +1', lado, 900);
  return {
    ...s,
    seq: s.seq + 1,
    tropas: [...s.tropas, { id: s.seq + 1, de: lado, tipo: info.tropa, forca, forcaInicial: forca, x: PONTA[lado], carregada: bonus > 0, proximoGolpe: agora }],
  };
}

/** Habilidade da IA (com a carga cheia). */
export function usarHabilidade(s0: EstadoDuelo, lado: Lado, ia: IaId): EstadoDuelo {
  if (s0[lado].carga < SUPER_MAX || s0.fase !== 'luta') return s0;
  let s = comLutador(s0, lado, (l) => ({ ...l, carga: 0 }));
  s = efeito(s, 'super', lado, undefined, 1000);
  s = avisar(s, `${HABILIDADES[ia].icone} ${HABILIDADES[ia].nome.toUpperCase()}!`, lado, 1800);
  if (ia === 'claude') return comLutador(s, lado, (l) => ({ ...l, escudo: 2 }));
  if (ia === 'chatgpt') return comLutador(s, lado, (l) => ({ ...l, gratis: true }));
  // Gemini: raio na tropa inimiga mais perto da sua torre
  const alvo = maisPerto(s, outro(lado), PONTA[lado]);
  if (!alvo) return s;
  s = efeito(s, 'raio', lado, alvo.x);
  return ferir(s, alvo.id, 3);
}

/** Toque no gladiador: golpe na hora na tropa inimiga mais perto (recarga de 8 s). */
export function golpeDoGladiador(s0: EstadoDuelo, lado: Lado): EstadoDuelo {
  const l = s0[lado];
  if (s0.fase !== 'luta' || l.gladiadorProntoEm > s0.tempo) return s0;
  const alvo = maisPerto(s0, outro(lado), PONTA[lado]);
  let s = comLutador(s0, lado, (x) => ({ ...x, gladiadorProntoEm: s0.tempo + GLADIADOR_RECARGA_MS }));
  if (!alvo || Math.abs(alvo.x - PONTA[lado]) > GLADIADOR_ALCANCE_TOQUE) return s;
  s = efeito(s, 'golpe', lado, alvo.x);
  return ferir(s, alvo.id, 1);
}

/** A tropa de `de` mais perto do ponto x. */
function maisPerto(s: EstadoDuelo, de: Lado, x: number): Tropa | undefined {
  return s.tropas.filter((t) => t.de === de).sort((a, b) => Math.abs(a.x - x) - Math.abs(b.x - x))[0];
}

function ferir(s: EstadoDuelo, id: number, dano: number): EstadoDuelo {
  return { ...s, tropas: s.tropas.map((t) => (t.id === id ? { ...t, forca: t.forca - dano } : t)).filter((t) => t.forca > 0) };
}

/** A tropa inimiga logo à frente (mais perto na direção em que esta anda). */
function inimigaAFrente(s: EstadoDuelo, t: Tropa): Tropa | undefined {
  const d = direcao(t.de);
  return s.tropas
    .filter((o) => o.de !== t.de && (o.x - t.x) * d >= -1)
    .sort((a, b) => (a.x - t.x) * d - (b.x - t.x) * d)[0];
}

/** Lutas, tiros, passos, gladiadores e chegadas às torres. */
function moverTropas(s0: EstadoDuelo): EstadoDuelo {
  let s = s0;
  const agora = s.tempo;
  // 1) Lutas corpo a corpo e tiros (todos golpeiam "ao mesmo tempo")
  const dano = new Map<number, number>();
  const golpearam = new Set<number>();
  for (const t of s.tropas) {
    const alvo = inimigaAFrente(s, t);
    if (!alvo) continue;
    const dist = Math.abs(alvo.x - t.x);
    const corpo = dist <= ENCOSTO;
    const tiro = t.tipo === 'arqueiro' && !corpo && dist <= ALCANCE_TIRO;
    if ((corpo || tiro) && agora >= t.proximoGolpe) {
      dano.set(alvo.id, (dano.get(alvo.id) ?? 0) + 1);
      golpearam.add(t.id);
      s = efeito(s, tiro ? 'flecha' : 'choque', t.de, tiro ? alvo.x : (alvo.x + t.x) / 2, tiro ? 500 : 400);
    }
  }
  s = {
    ...s,
    tropas: s.tropas
      .map((t) => ({
        ...t,
        forca: t.forca - (dano.get(t.id) ?? 0),
        proximoGolpe: golpearam.has(t.id) ? agora + (t.tipo === 'arqueiro' ? TIRO_MS : GOLPE_LUTA_MS) : t.proximoGolpe,
      }))
      .filter((t) => t.forca > 0),
  };

  // 2) Andar: quem não está encostado numa inimiga anda (o arqueiro para quando tem alvo no alcance)
  s = {
    ...s,
    tropas: s.tropas.map((t) => {
      const alvo = inimigaAFrente(s, t);
      const dist = alvo ? Math.abs(alvo.x - t.x) : Infinity;
      const parado = dist <= ENCOSTO || (t.tipo === 'arqueiro' && dist <= ALCANCE_TIRO);
      return parado ? t : { ...t, x: t.x + direcao(t.de) * VELOCIDADE[t.tipo] * (TICK / 1000) };
    }),
  };

  // 3) Gladiadores: golpe automático em quem chega perto da torre
  for (const lado of ['eu', 'rival'] as Lado[]) {
    if (s[lado].gladiadorAutoEm > agora) continue;
    const alvo = s.tropas.find((t) => t.de !== lado && Math.abs(t.x - PONTA[lado]) <= GLADIADOR_ALCANCE);
    if (!alvo) continue;
    s = comLutador(s, lado, (l) => ({ ...l, gladiadorAutoEm: agora + GLADIADOR_AUTO_MS }));
    s = efeito(s, 'golpe', lado, alvo.x);
    s = ferir(s, alvo.id, 1);
  }

  // 4) Chegadas: a tropa que alcança a torre inimiga tira dela a força que tem
  const chegaram = s.tropas.filter((t) => (t.x - PONTA[outro(t.de)]) * direcao(t.de) >= 0);
  s = { ...s, tropas: s.tropas.filter((t) => !chegaram.includes(t)) };
  for (const t of chegaram) {
    const alvo = outro(t.de);
    if (s[alvo].escudo > 0) {
      s = comLutador(s, alvo, (l) => ({ ...l, escudo: l.escudo - 1 }));
      s = efeito(s, 'escudo', alvo, PONTA[alvo]);
      continue;
    }
    s = { ...s, torres: { ...s.torres, [alvo]: Math.max(0, s.torres[alvo] - t.forca) } as EstadoDuelo['torres'] };
    s = comLutador(s, t.de, (l) => ({ ...l, carga: Math.min(SUPER_MAX, l.carga + 1) }));
    s = efeito(s, 'torre', alvo, PONTA[alvo], 1800);
  }
  return s;
}

export interface Contexto {
  acerto: number;
  iaRival: IaId;
  aleatorio: Aleatorio;
}

/** O rival: joga no ritmo da liga, às vezes carregando a carta, usa o gladiador e a habilidade. */
function vezDoRival(s0: EstadoDuelo, ctx: Contexto): EstadoDuelo {
  let s = s0;
  const r = s.rival;
  const agora = s.tempo;
  if (r.carga >= SUPER_MAX) {
    const util = ctx.iaRival !== 'gemini' || s.tropas.some((t) => t.de === 'eu');
    if (util) return usarHabilidade(s, 'rival', ctx.iaRival);
  }
  // Gladiador: toca quando uma tropa sua se aproxima (com a chance da liga)
  const perigo = s.tropas.some((t) => t.de === 'eu' && Math.abs(t.x - PONTA.rival) <= 18);
  if (perigo && r.gladiadorProntoEm <= agora && ctx.aleatorio() < ctx.acerto * 0.2) s = golpeDoGladiador(s, 'rival');

  if (agora < s.proximoRival) return s;
  const jogaveis = s.rival.mao.filter((c) => podeJogar(s, 'rival', c.id));
  // Responde a um centurião seu com um centurião, se puder
  const temCenturiao = s.tropas.some((t) => t.de === 'eu' && t.tipo === 'centuriao');
  const forte = jogaveis.find((c) => c.tipo === 'forte');
  const escolhida = temCenturiao && forte ? forte : jogaveis[Math.floor(ctx.aleatorio() * jogaveis.length)];
  // Ritmo: de ~3,4 s (liga baixa) a ~2,5 s (liga alta) entre jogadas (na prorrogação, mais rápido)
  const ritmo = (3600 - ctx.acerto * 1600 + ctx.aleatorio() * 800) * (prorrogacao(s) ? 0.6 : 1);
  s = { ...s, proximoRival: agora + ritmo };
  if (!escolhida) return s;
  // Carga: quanto melhor a liga, mais vezes carrega (pagando +1 de fôlego)
  const carga = ctx.aleatorio() < 0.2 + ctx.acerto * 0.5 ? 1 : 0;
  return jogarCarta(s, 'rival', escolhida.id, carga);
}

/** Quanto fôlego volta por segundo para este lado agora. */
export function ritmoDoFolego(s: EstadoDuelo, lado: Lado): number {
  if (prorrogacao(s)) return FOLEGO_POR_SEGUNDO * 2;
  const menos = lado === 'eu' ? s.torres.eu < s.torres.rival : s.torres.rival < s.torres.eu;
  return FOLEGO_POR_SEGUNDO * (s.rodada === RODADAS && menos ? VIRADA_BONUS : 1);
}

export function passo(s0: EstadoDuelo, ctx: Contexto): EstadoDuelo {
  if (s0.fase === 'fim') return s0;
  const tempo = s0.tempo + TICK;
  if (s0.fase === 'intervalo') {
    if (tempo < s0.fimIntervalo) return { ...s0, tempo };
    // Nova rodada: as torres guardam a vida; tropas e fôlego recomeçam.
    const zerar = (l: Lutador): Lutador => ({ ...l, folego: FOLEGO_INICIAL, escudo: 0, gratis: false, gladiadorAutoEm: 0, gladiadorProntoEm: 0, fala: null });
    let s: EstadoDuelo = { ...s0, tempo: 0, rodada: s0.rodada + 1, tropas: [], eu: zerar(s0.eu), rival: zerar(s0.rival), proximoRival: 3000, fase: 'luta', aviso: null, efeitos: [] };
    if (prorrogacao(s)) s = avisar(s, '⚡ PRORROGAÇÃO! FÔLEGO EM DOBRO', null, 2200);
    else if (s.rodada === RODADAS) s = avisar(s, '⏳ ÚLTIMA RODADA: HORA DA VIRADA!', null, 2200);
    return s;
  }

  const recupera = (lado: Lado) => (l: Lutador): Lutador => ({
    ...l,
    folego: Math.min(FOLEGO_MAX, l.folego + (ritmoDoFolego(s0, lado) * TICK) / 1000),
    fala: l.fala && l.fala.ate > tempo ? l.fala : null,
  });
  let s: EstadoDuelo = {
    ...s0,
    tempo,
    eu: recupera('eu')(s0.eu),
    rival: recupera('rival')(s0.rival),
    aviso: s0.aviso && s0.aviso.ate > tempo ? s0.aviso : null,
    efeitos: s0.efeitos.filter((e) => e.ate > tempo),
  };

  s = moverTropas(s);
  s = vezDoRival(s, ctx);

  // Torre no chão: fim na hora.
  if (s.torres.eu <= 0 || s.torres.rival <= 0) {
    const caiu: Lado = s.torres.eu <= 0 ? 'eu' : 'rival';
    s = { ...s, tropas: [], fase: 'fim' };
    return avisar(s, caiu === 'eu' ? 'SUA TORRE CAIU!' : 'A TORRE DO RIVAL CAIU!', outro(caiu), 3000);
  }
  // Fim do tempo da rodada
  if (tempo >= duracaoDaRodada(s)) {
    const empate = s.torres.eu === s.torres.rival;
    const acabou = prorrogacao(s) || (s.rodada >= RODADAS && !empate);
    s = { ...s, tropas: [], fase: acabou ? 'fim' : 'intervalo', fimIntervalo: tempo + INTERVALO_MS };
    s = avisar(
      s,
      acabou ? 'FIM DO DUELO!' : s.rodada >= RODADAS ? 'EMPATE NA VIDA! VAI PARA A PRORROGAÇÃO' : `FIM DA RODADA ${s.rodada}`,
      null,
      INTERVALO_MS,
    );
  }
  return s;
}

export function resultadoFinal(s: EstadoDuelo): 'vitoria' | 'derrota' | 'empate' {
  return s.torres.eu > s.torres.rival ? 'vitoria' : s.torres.rival > s.torres.eu ? 'derrota' : 'empate';
}
