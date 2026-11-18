/**
 * Duelo em tempo real (versão 2, 19/11/2026, pedida pelo Lucas): uma plateia só
 * (cabo de guerra), cartas que são golpes, argumentos lançados ALTO ou BAIXO,
 * defesa com escudo, esquiva (pular/abaixar) e réplica no tempo certo, combos,
 * cartas raras, golpe final de cada IA, eventos da arena e melhor de 3 rodadas.
 * Funções puras: a tela chama `passo` a cada tick e as ações quando o jogador toca.
 */
import type { IaId } from '../personagens';

export type Lado = 'eu' | 'rival';
export type Altura = 'alto' | 'baixo';
export type TipoCarta = 'argumento' | 'forte' | 'escudo' | 'replica' | 'capciosa' | 'dado' | 'apelo';

export const LIMITE = 10;
export const FOLEGO_MAX = 10;
export const FOLEGO_INICIAL = 6;
export const FOLEGO_POR_SEGUNDO = 1;
export const APLAUSOS_MAX = 5;
export const TAMANHO_MAO = 4;
export const RODADA_MS = 25_000;
export const INTERVALO_MS = 2_500;
export const ESCUDO_MS = 1_500;
export const ESQUIVA_MS = 650;
export const ESQUIVA_RECARGA_MS = 1_500;
/** A réplica só funciona nos últimos instantes antes do argumento bater. */
export const REPLICA_A_PARTIR = 0.6;
export const TICK = 100;

export interface InfoCarta {
  nome: string;
  icone: string;
  custo: number;
  efeito: string;
  rara?: boolean;
  /** Precisa escolher alto ou baixo ao jogar. */
  comAltura?: boolean;
}

export const CARTAS: Record<TipoCarta, InfoCarta> = {
  argumento: { nome: 'Argumento', icone: '⚔️', custo: 2, efeito: 'Lança rápido. Acertou: plateia +2.', comAltura: true },
  forte: { nome: 'Argumento forte', icone: '💥', custo: 4, efeito: 'Lento, mas puxa +4.', comAltura: true },
  escudo: { nome: 'Escudo', icone: '🛡️', custo: 1, efeito: 'Bloqueia na altura escolhida por 1,5 s.', comAltura: true },
  replica: { nome: 'Réplica', icone: '🔁', custo: 2, efeito: 'Bem na hora: devolve o argumento, +1 mais forte.' },
  capciosa: { nome: 'Pergunta capciosa', icone: '❓', custo: 1, efeito: 'O rival fica tonto por 2 s.', rara: true },
  dado: { nome: 'Dado irrefutável', icone: '📊', custo: 3, efeito: 'Atravessa o escudo. Plateia +3.', rara: true, comAltura: true },
  apelo: { nome: 'Apelo à plateia', icone: '👏', custo: 2, efeito: 'Plateia +1 na hora.', rara: true },
};

/** Golpe final (Discurso Épico) de cada IA. */
export const GOLPES_FINAIS: Record<IaId, { nome: string; efeito: string }> = {
  claude: { nome: 'Muralha de escudos', efeito: 'Nada te atinge por 5 s.' },
  chatgpt: { nome: 'Rede', efeito: 'O rival fica preso por 3 s.' },
  gemini: { nome: 'Raio solar', efeito: 'Um argumento que nada bloqueia: +4.' },
};

export interface CartaDuelo {
  id: string;
  tipo: TipoCarta;
  /** Frase do dilema sorteado, para a luta "contar" o debate. */
  frase: string;
}

export interface Projetil {
  id: number;
  de: Lado;
  altura: Altura;
  valor: number;
  lancadoEm: number;
  duracao: number;
  tipo: 'argumento' | 'forte' | 'dado' | 'raio' | 'replica';
  /** Frase da carta, para a luta contar o debate. */
  frase?: string;
}

export interface Lutador {
  folego: number;
  aplausos: number;
  mao: CartaDuelo[];
  monte: CartaDuelo[];
  escudo: { altura: Altura; ate: number } | null;
  /** Altura que a esquiva evita (pular evita BAIXO; abaixar evita ALTO). */
  esquiva: { evita: Altura; ate: number } | null;
  esquivaProntaEm: number;
  atordoadoAte: number;
  imuneAte: number;
  /** Ataques recentes, para o combo "Retórica em cadeia". */
  ataques: { tipo: TipoCarta; em: number }[];
  /** Depois de bloquear, o próximo ataque vale o dobro até este momento. */
  contraAtaqueAte: number;
}

export type TipoEvento = 'leao' | 'silencio' | 'petalas';
export const EVENTOS: Record<TipoEvento, { titulo: string; dica: string; icone: string }> = {
  leao: { titulo: 'SOLTEM O LEÃO!', dica: 'PULE para o leão não te pegar!', icone: '🦁' },
  silencio: { titulo: 'SILÊNCIO NA ARENA!', dica: 'Ninguém recupera fôlego por 5 s.', icone: '🤫' },
  petalas: { titulo: 'CHUVA DE PÉTALAS!', dica: 'Aplausos em dobro por 5 s.', icone: '🌸' },
};

export interface Aviso {
  id: number;
  texto: string;
  lado: Lado | null;
  ate: number;
}

export interface EfeitoVisual {
  id: number;
  tipo: 'rosas' | 'tomates' | 'bloqueio' | 'esquiva' | 'replica' | 'final';
  lado: Lado;
  ate: number;
}

export interface EstadoDuelo {
  /** Tempo dentro da rodada (ms). */
  tempo: number;
  rodada: number;
  rodadas: { eu: number; rival: number };
  plateia: number;
  eu: Lutador;
  rival: Lutador;
  projeteis: Projetil[];
  evento: { tipo: TipoEvento; ate: number; impactoEm?: number; resolvido?: boolean } | null;
  proximoEvento: number;
  proximoRival: number;
  /** Argumentos do jogador a que o rival já decidiu reagir (ou não). */
  reagidos: number[];
  fase: 'luta' | 'intervalo' | 'fim';
  fimIntervalo: number;
  avisos: Aviso[];
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

/** Monte de 19 cartas: 6 argumentos, 3 fortes, 4 escudos, 3 réplicas e 1 de cada rara. */
export function montarMonte(frases: string[], prefixo: string, aleatorio: Aleatorio): CartaDuelo[] {
  const tipos: TipoCarta[] = [
    ...Array<TipoCarta>(6).fill('argumento'),
    ...Array<TipoCarta>(3).fill('forte'),
    ...Array<TipoCarta>(4).fill('escudo'),
    ...Array<TipoCarta>(3).fill('replica'),
    'capciosa',
    'dado',
    'apelo',
  ];
  return embaralhar(
    tipos.map((tipo, i) => ({ id: `${prefixo}-${i}`, tipo, frase: frases[i % Math.max(1, frases.length)] ?? '' })),
    aleatorio,
  );
}

const ehAtaque = (c: CartaDuelo) => c.tipo === 'argumento' || c.tipo === 'forte' || c.tipo === 'dado';

/** Mão inicial com pelo menos 2 cartas de ataque (nada de começar só com defesas). */
export function maoInicial(monte: CartaDuelo[]): { mao: CartaDuelo[]; monte: CartaDuelo[] } {
  const mao = monte.slice(0, TAMANHO_MAO);
  let resto = monte.slice(TAMANHO_MAO);
  while (mao.filter(ehAtaque).length < 2) {
    const i = resto.findIndex(ehAtaque);
    const j = mao.findIndex((c) => !ehAtaque(c));
    if (i < 0 || j < 0) break;
    const sai = mao[j]!;
    mao[j] = resto[i]!;
    resto = [...resto.slice(0, i), ...resto.slice(i + 1), sai];
  }
  return { mao, monte: resto };
}

function lutador(monteCompleto: CartaDuelo[]): Lutador {
  const { mao, monte } = maoInicial(monteCompleto);
  return {
    folego: FOLEGO_INICIAL,
    aplausos: 0,
    mao,
    monte,
    escudo: null,
    esquiva: null,
    esquivaProntaEm: 0,
    atordoadoAte: 0,
    imuneAte: 0,
    ataques: [],
    contraAtaqueAte: 0,
  };
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
    evento: null,
    proximoEvento: 8000 + aleatorio() * 6000,
    proximoRival: 2500,
    reagidos: [],
    fase: 'luta',
    fimIntervalo: 0,
    avisos: [],
    efeitos: [],
    seq: 0,
  };
}

function aviso(s: EstadoDuelo, texto: string, lado: Lado | null, ms = 1500): EstadoDuelo {
  return { ...s, seq: s.seq + 1, avisos: [...s.avisos, { id: s.seq + 1, texto, lado, ate: s.tempo + ms }] };
}

function efeito(s: EstadoDuelo, tipo: EfeitoVisual['tipo'], lado: Lado, ms = 1100): EstadoDuelo {
  return { ...s, seq: s.seq + 1, efeitos: [...s.efeitos, { id: s.seq + 1, tipo, lado, ate: s.tempo + ms }] };
}

const comLutador = (s: EstadoDuelo, lado: Lado, f: (l: Lutador) => Lutador): EstadoDuelo =>
  lado === 'eu' ? { ...s, eu: f(s.eu) } : { ...s, rival: f(s.rival) };

/**
 * Tira a carta da mão e compra a próxima; a jogada volta para o fundo do monte.
 * Se a mão ficaria sem nenhum ataque, compra o próximo ataque do monte.
 */
function gastar(l: Lutador, carta: CartaDuelo): Lutador {
  const mao = l.mao.filter((c) => c.id !== carta.id);
  const i = mao.some(ehAtaque) ? 0 : Math.max(0, l.monte.findIndex(ehAtaque));
  const proxima = l.monte[i];
  if (proxima) mao.push(proxima);
  const resto = l.monte.filter((_, n) => n !== i);
  return { ...l, mao, monte: [...resto, carta], folego: l.folego - CARTAS[carta.tipo].custo };
}

const progresso = (p: Projetil, agora: number) => (agora - p.lancadoEm) / p.duracao;

/** Pode jogar esta carta agora? */
export function podeJogar(s: EstadoDuelo, lado: Lado, cartaId: string): boolean {
  const l = s[lado];
  const c = l.mao.find((x) => x.id === cartaId);
  return !!c && s.fase === 'luta' && l.folego >= CARTAS[c.tipo].custo && l.atordoadoAte <= s.tempo;
}

/** Joga uma carta (com a altura, quando a carta pede). */
export function jogarCarta(s0: EstadoDuelo, lado: Lado, cartaId: string, altura: Altura = 'alto'): EstadoDuelo {
  if (!podeJogar(s0, lado, cartaId)) return s0;
  const carta = s0[lado].mao.find((c) => c.id === cartaId)!;
  const agora = s0.tempo;
  let s = comLutador(s0, lado, (l) => gastar(l, carta));
  const eu = s[lado];

  if (carta.tipo === 'argumento' || carta.tipo === 'forte' || carta.tipo === 'dado') {
    let valor = carta.tipo === 'forte' ? 4 : carta.tipo === 'dado' ? 3 : 2;
    let duracao = carta.tipo === 'forte' ? 2200 : carta.tipo === 'dado' ? 1500 : 1300;
    // Combo "Retórica em cadeia": dois argumentos seguidos e depois um forte (em até 4 s).
    const recentes = eu.ataques.filter((a) => agora - a.em <= 4000).slice(-2);
    if (carta.tipo === 'forte' && recentes.length === 2 && recentes.every((a) => a.tipo === 'argumento')) {
      duracao /= 2;
      s = aviso(s, '🔗 RETÓRICA EM CADEIA! Forte duas vezes mais rápido', lado);
    }
    // Combo "Contra-ataque perfeito": atacar logo depois de bloquear vale o dobro.
    if (eu.contraAtaqueAte > agora) {
      valor *= 2;
      s = aviso(s, '🔗 CONTRA-ATAQUE PERFEITO! Golpe em dobro', lado);
    }
    s = comLutador(s, lado, (l) => ({ ...l, contraAtaqueAte: 0, ataques: [...l.ataques.slice(-4), { tipo: carta.tipo, em: agora }] }));
    return {
      ...s,
      seq: s.seq + 1,
      projeteis: [...s.projeteis, { id: s.seq + 1, de: lado, altura, valor, lancadoEm: agora, duracao, tipo: carta.tipo, frase: carta.frase }],
    };
  }

  if (carta.tipo === 'escudo') return comLutador(s, lado, (l) => ({ ...l, escudo: { altura, ate: agora + ESCUDO_MS } }));

  if (carta.tipo === 'replica') {
    // Devolve o argumento do rival que está quase chegando (o mais adiantado).
    const alvo = s.projeteis
      .filter((p) => p.de === outro(lado) && p.tipo !== 'raio' && progresso(p, agora) >= REPLICA_A_PARTIR)
      .sort((a, b) => progresso(b, agora) - progresso(a, agora))[0];
    if (!alvo) return aviso(s, 'Réplica fora de hora…', lado, 1000);
    s = efeito(s, 'replica', lado);
    s = aviso(s, '🔁 RÉPLICA! Devolvido com força', lado);
    return {
      ...s,
      seq: s.seq + 1,
      projeteis: [
        ...s.projeteis.filter((p) => p.id !== alvo.id),
        { id: s.seq + 1, de: lado, altura: alvo.altura, valor: alvo.valor + 1, lancadoEm: agora, duracao: 1000, tipo: 'replica' },
      ],
    };
  }

  if (carta.tipo === 'capciosa') {
    s = aviso(s, '❓ PERGUNTA CAPCIOSA! Rival tonto', lado);
    return comLutador(s, outro(lado), (l) => ({ ...l, atordoadoAte: agora + 2000 }));
  }

  // apelo à plateia
  s = efeito(s, 'rosas', lado);
  return { ...s, plateia: limitar(s.plateia + sinal(lado)) };
}

/** Pular (evita argumentos BAIXOS) ou abaixar (evita os ALTOS). De graça, com recarga. */
export function esquivar(s: EstadoDuelo, lado: Lado, movimento: 'pular' | 'abaixar'): EstadoDuelo {
  const l = s[lado];
  if (s.fase !== 'luta' || l.esquivaProntaEm > s.tempo || l.atordoadoAte > s.tempo) return s;
  return comLutador(s, lado, (x) => ({
    ...x,
    esquiva: { evita: movimento === 'pular' ? 'baixo' : 'alto', ate: s.tempo + ESQUIVA_MS },
    esquivaProntaEm: s.tempo + ESQUIVA_RECARGA_MS,
  }));
}

/** Golpe final da IA (com 5 aplausos). */
export function golpeFinal(s0: EstadoDuelo, lado: Lado, ia: IaId): EstadoDuelo {
  if (s0[lado].aplausos < APLAUSOS_MAX || s0.fase !== 'luta') return s0;
  const agora = s0.tempo;
  let s = comLutador(s0, lado, (l) => ({ ...l, aplausos: 0 }));
  s = efeito(s, 'final', lado, 1500);
  s = aviso(s, `⭐ ${GOLPES_FINAIS[ia].nome.toUpperCase()}!`, lado, 2000);
  if (ia === 'claude') return comLutador(s, lado, (l) => ({ ...l, imuneAte: agora + 5000 }));
  if (ia === 'chatgpt') return comLutador(s, outro(lado), (l) => ({ ...l, atordoadoAte: agora + 3000 }));
  return {
    ...s,
    seq: s.seq + 1,
    projeteis: [...s.projeteis, { id: s.seq + 1, de: lado, altura: 'alto', valor: 4, lancadoEm: agora, duracao: 1000, tipo: 'raio' }],
  };
}

/** O que acontece quando um argumento chega: imune, esquiva, escudo ou acerto. */
function chegada(s0: EstadoDuelo, p: Projetil): EstadoDuelo {
  const alvo = outro(p.de);
  const t = s0[alvo];
  const agora = s0.tempo;
  let s = s0;
  const imbloqueavel = p.tipo === 'raio';
  if (!imbloqueavel && t.imuneAte > agora) return efeito(s, 'bloqueio', alvo);
  if (!imbloqueavel && t.esquiva && t.esquiva.ate >= agora && t.esquiva.evita === p.altura) {
    s = efeito(s, 'esquiva', alvo);
    return aviso(s, p.altura === 'baixo' ? 'Pulou! Errou o golpe.' : 'Abaixou! Passou por cima.', alvo, 900);
  }
  if (!imbloqueavel && p.tipo !== 'dado' && t.escudo && t.escudo.ate >= agora && t.escudo.altura === p.altura) {
    s = efeito(s, 'bloqueio', alvo);
    // Bloqueou: abre a janela do contra-ataque perfeito.
    return comLutador(s, alvo, (l) => ({ ...l, contraAtaqueAte: agora + 2000 }));
  }
  const petalas = s.evento?.tipo === 'petalas' && s.evento.ate > agora;
  s = { ...s, plateia: limitar(s.plateia + sinal(p.de) * p.valor) };
  s = comLutador(s, p.de, (l) => ({ ...l, aplausos: Math.min(APLAUSOS_MAX, l.aplausos + (petalas ? 2 : 1)) }));
  s = efeito(s, 'tomates', alvo);
  return efeito(s, 'rosas', p.de);
}

export interface Contexto {
  acerto: number;
  iaRival: IaId;
  aleatorio: Aleatorio;
}

/** Decisão do rival a cada tick: reagir a um argumento que vem chegando, ou atacar. */
function vezDoRival(s0: EstadoDuelo, ctx: Contexto): EstadoDuelo {
  let s = s0;
  const r = s.rival;
  const agora = s.tempo;
  if (r.atordoadoAte > agora) return s;
  if (r.aplausos >= APLAUSOS_MAX) return golpeFinal(s, 'rival', ctx.iaRival);

  // Reação: uma decisão por argumento que vem, quando ele já passou da metade.
  const vindo = s.projeteis.find((p) => p.de === 'eu' && !s.reagidos.includes(p.id) && progresso(p, agora) >= 0.5);
  if (vindo) {
    s = { ...s, reagidos: [...s.reagidos, vindo.id] };
    if (ctx.aleatorio() >= ctx.acerto) return s; // não reagiu a tempo
    const replica = r.mao.find((c) => c.tipo === 'replica');
    const escudo = r.mao.find((c) => c.tipo === 'escudo');
    if (replica && r.folego >= 2 && progresso(vindo, agora) >= REPLICA_A_PARTIR && ctx.aleatorio() < 0.3) return jogarCarta(s, 'rival', replica.id);
    if (r.esquivaProntaEm <= agora && ctx.aleatorio() < 0.6) return esquivar(s, 'rival', vindo.altura === 'baixo' ? 'pular' : 'abaixar');
    if (escudo && r.folego >= 1) return jogarCarta(s, 'rival', escudo.id, vindo.altura);
    return s;
  }

  if (agora < s.proximoRival) return s;
  const altura: Altura = ctx.aleatorio() < 0.5 ? 'alto' : 'baixo';
  const jogavel = r.mao.filter((c) => r.folego >= CARTAS[c.tipo].custo && c.tipo !== 'escudo' && c.tipo !== 'replica');
  const forte = jogavel.find((c) => c.tipo === 'forte');
  const escolhida = forte && ctx.aleatorio() < 0.35 ? forte : jogavel[Math.floor(ctx.aleatorio() * jogavel.length)];
  // Ritmo do rival: de ~3,8 s (liga baixa) a ~2,5 s (liga alta) entre ataques.
  s = { ...s, proximoRival: agora + 3800 - ctx.acerto * 1400 + ctx.aleatorio() * 900 };
  return escolhida ? jogarCarta(s, 'rival', escolhida.id, altura) : s;
}

/** Eventos da arena: um por rodada, num momento sorteado. */
function eventos(s0: EstadoDuelo, ctx: Contexto): EstadoDuelo {
  let s = s0;
  const agora = s.tempo;
  if (!s.evento && agora >= s.proximoEvento) {
    const tipos: TipoEvento[] = ['leao', 'silencio', 'petalas'];
    const tipo = tipos[Math.floor(ctx.aleatorio() * tipos.length)]!;
    s = { ...s, evento: { tipo, ate: agora + 5000, impactoEm: tipo === 'leao' ? agora + 2200 : undefined }, proximoEvento: Number.POSITIVE_INFINITY };
    s = aviso(s, `${EVENTOS[tipo].icone} ${EVENTOS[tipo].titulo}`, null, 2500);
  }
  // O leão corre pelo chão: quem não estiver pulando perde 1 de plateia para o outro.
  if (s.evento?.tipo === 'leao' && !s.evento.resolvido && s.evento.impactoEm !== undefined && agora >= s.evento.impactoEm) {
    const pulou = (l: Lutador) => !!l.esquiva && l.esquiva.evita === 'baixo' && l.esquiva.ate >= agora - 400;
    const euPulei = pulou(s.eu);
    const elePulou = pulou(s.rival);
    let delta = 0;
    if (!euPulei) delta -= 1;
    if (!elePulou) delta += 1;
    s = { ...s, plateia: limitar(s.plateia + delta), evento: { ...s.evento, resolvido: true } };
    if (!euPulei) s = efeito(s, 'tomates', 'eu');
    if (!elePulou) s = efeito(s, 'tomates', 'rival');
  }
  if (s.evento && s.evento.ate <= agora) s = { ...s, evento: null };
  return s;
}

/** Um passo do relógio. */
export function passo(s0: EstadoDuelo, ctx: Contexto): EstadoDuelo {
  if (s0.fase === 'fim') return s0;
  const tempo = s0.tempo + TICK;
  if (s0.fase === 'intervalo') {
    if (tempo < s0.fimIntervalo) return { ...s0, tempo };
    // Nova rodada: plateia no meio, fôlego e mão renovados.
    const zerar = (l: Lutador): Lutador => ({ ...l, folego: FOLEGO_INICIAL, escudo: null, esquiva: null, atordoadoAte: 0, imuneAte: 0, contraAtaqueAte: 0, ataques: [], esquivaProntaEm: 0 });
    return {
      ...s0,
      tempo: 0,
      rodada: s0.rodada + 1,
      plateia: 0,
      projeteis: [],
      eu: zerar(s0.eu),
      rival: zerar(s0.rival),
      evento: null,
      proximoEvento: 8000 + ctx.aleatorio() * 6000,
      proximoRival: 2500,
      reagidos: [],
      fase: 'luta',
      avisos: [],
      efeitos: [],
    };
  }

  const silencio = s0.evento?.tipo === 'silencio' && s0.evento.ate > tempo;
  const recupera = (l: Lutador): Lutador => ({
    ...l,
    folego: silencio ? l.folego : Math.min(FOLEGO_MAX, l.folego + (FOLEGO_POR_SEGUNDO * TICK) / 1000),
    escudo: l.escudo && l.escudo.ate >= tempo ? l.escudo : null,
    esquiva: l.esquiva && l.esquiva.ate >= tempo ? l.esquiva : null,
  });
  let s: EstadoDuelo = {
    ...s0,
    tempo,
    eu: recupera(s0.eu),
    rival: recupera(s0.rival),
    avisos: s0.avisos.filter((a) => a.ate > tempo),
    efeitos: s0.efeitos.filter((e) => e.ate > tempo),
  };

  // Chegadas
  const voando: Projetil[] = [];
  const chegaram: Projetil[] = [];
  for (const p of s.projeteis) (progresso(p, tempo) >= 1 ? chegaram : voando).push(p);
  s = { ...s, projeteis: voando };
  for (const p of chegaram) s = chegada(s, p);

  s = eventos(s, ctx);
  s = vezDoRival(s, ctx);

  // Fim da rodada: alguém puxou a plateia toda, ou acabou o tempo.
  if (Math.abs(s.plateia) >= LIMITE || tempo >= RODADA_MS) {
    const venceu: Lado | null = s.plateia > 0 ? 'eu' : s.plateia < 0 ? 'rival' : null;
    const rodadas = { eu: s.rodadas.eu + (venceu === 'eu' ? 1 : 0), rival: s.rodadas.rival + (venceu === 'rival' ? 1 : 0) };
    const acabou = rodadas.eu >= 2 || rodadas.rival >= 2 || s.rodada >= 3;
    s = { ...s, rodadas, projeteis: [], evento: null, fase: acabou ? 'fim' : 'intervalo', fimIntervalo: tempo + INTERVALO_MS };
    s = aviso(s, venceu ? (venceu === 'eu' ? `RODADA ${s.rodada}: SUA!` : `RODADA ${s.rodada}: DO RIVAL`) : `RODADA ${s.rodada}: EMPATE`, venceu, INTERVALO_MS);
  }
  return s;
}

export function resultadoFinal(s: EstadoDuelo): 'vitoria' | 'derrota' | 'empate' {
  return s.rodadas.eu > s.rodadas.rival ? 'vitoria' : s.rodadas.rival > s.rodadas.eu ? 'derrota' : 'empate';
}

export { progresso };
