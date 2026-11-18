/**
 * Duelo em tempo real, versão 7 (combinada com o Lucas): 16 cartas com
 * personalidade, baralho de 8 e a Tribuna de cada lado.
 * Cada gladiador fica em cima da sua Tribuna (a tribuna dos oradores do Fórum
 * romano). Cada carta vira uma tropa (ou um feitiço) do debate; tropas inimigas
 * que se encontram lutam e a que sobra segue; a que chega à Tribuna inimiga tira
 * dela a força que tem. Tribuna no chão = derrota na hora. Rodadas: 1 min 30 s,
 * 1 min 30 s e a final de 30 s; empate na vida = prorrogação (20 s, fôlego em
 * dobro). Funções puras: a tela chama `passo` a cada tick e as ações no toque.
 * Especificação: docs/ESPEC-BARALHO-DUELO.md.
 */
import type { IaId } from '../personagens';

export type Lado = 'eu' | 'rival';
export type TipoCarta =
  | 'frase'
  | 'exemplos'
  | 'analogia'
  | 'piada'
  | 'tese'
  | 'discurso'
  | 'citacao'
  | 'fato'
  | 'estatistica'
  | 'prova'
  | 'muralha'
  | 'contra'
  | 'refutacao'
  | 'pergunta'
  | 'pausa'
  | 'aplauso';
export type TipoTropa =
  | 'legionario'
  | 'exemplo'
  | 'cavaleiro'
  | 'bobo'
  | 'centuriao'
  | 'elefante'
  | 'senador'
  | 'arqueiro'
  | 'balista'
  | 'catapulta'
  | 'barricada'
  | 'escudeiro';

export const TRIBUNA_VIDA = 40;
export const FOLEGO_MAX = 10;
export const FOLEGO_INICIAL = 5;
export const FOLEGO_POR_SEGUNDO = 0.7;
/** Rodada final: quem tem menos vida recupera fôlego 25% mais rápido. */
export const VIRADA_BONUS = 1.25;
/** Discurso épico vivo: o fôlego de quem jogou volta 30% mais rápido. */
const EMPOLGA_BONUS = 1.3;
/** Duração de cada rodada (decisão do Lucas): 1 min 30 s, 1 min 30 s e a final de 30 s. */
export const DURACOES_MS = [90_000, 90_000, 30_000] as const;
export const RODADAS = DURACOES_MS.length;
/** Prorrogação (só se empatar a vida): 20 s com fôlego em dobro. */
export const PRORROGACAO_MS = 20_000;
export const INTERVALO_MS = 2_500;
export const TAMANHO_MAO = 4;
export const TAMANHO_BARALHO = 8;
export const TICK = 100;

/** Onde as tropas nascem e onde fica a Tribuna de cada lado (em % da largura). */
export const PONTA = { eu: 20, rival: 80 } as const;
const ENCOSTO = 4;
const GOLPE_LUTA_MS = 500;

/** Segurar e soltar: carga cheia dá +1 de força e custa +1 de fôlego. */
export const CARGA_MS = 1200;
export const CUSTO_CARGA = 1;
export function bonusDaCarga(carga: number): number {
  return carga >= 1 ? 1 : 0;
}

export type Papel = 'leve' | 'pesada' | 'longe' | 'defesa' | 'feitico';
export const PAPEIS: Record<Papel, string> = { leve: 'Leves', pesada: 'Pesadas', longe: 'De longe', defesa: 'Defesa', feitico: 'Feitiços' };

export interface InfoCarta {
  nome: string;
  icone: string;
  custo: number;
  papel: Papel;
  /** Força da tropa (vida e dano na Tribuna); 0 nos feitiços. */
  forca: number;
  tropa?: TipoTropa;
  /** Personalidade em uma palavra, como combinado com o Lucas. */
  jeito: string;
  dica: string;
  /** Pode segurar para carregar (+1). */
  carrega?: boolean;
}

export const CARTAS: Record<TipoCarta, InfoCarta> = {
  frase: { nome: 'Frase rápida', icone: '⚔️', custo: 2, papel: 'leve', forca: 2, tropa: 'legionario', jeito: 'Pressiona', dica: 'Rápida e barata: chega primeiro e obriga o rival a responder.', carrega: true },
  exemplos: { nome: 'Exemplos', icone: '👥', custo: 2, papel: 'leve', forca: 1, tropa: 'exemplo', jeito: 'Distrai', dica: 'Dois pequenos de uma vez: o rival perde tempo batendo um de cada vez.' },
  analogia: { nome: 'Analogia', icone: '🐎', custo: 3, papel: 'leve', forca: 2, tropa: 'cavaleiro', jeito: 'Pula', dica: 'Cavaleiro: o mais rápido. Salta por cima da primeira tropa inimiga.', carrega: true },
  piada: { nome: 'Piada', icone: '🃏', custo: 1, papel: 'leve', forca: 1, tropa: 'bobo', jeito: 'Faz rir', dica: 'Baratíssima. Quem luta com ela fica 1 s parado de tanto rir.' },
  tese: { nome: 'Tese', icone: '🛡️', custo: 4, papel: 'pesada', forca: 4, tropa: 'centuriao', jeito: 'Firme', dica: 'Centurião lento e resistente. Flechas tiram metade da força dele.', carrega: true },
  discurso: { nome: 'Discurso épico', icone: '🐘', custo: 7, papel: 'pesada', forca: 8, tropa: 'elefante', jeito: 'Empolga', dica: 'Elefante muito lento e muito forte. Enquanto vive, seu fôlego volta mais rápido.', carrega: true },
  citacao: { nome: 'Citação de autoridade', icone: '🏛️', custo: 5, papel: 'pesada', forca: 3, tropa: 'senador', jeito: 'Lidera', dica: 'Senador: suas tropas perto dele batem mais forte (+1).', carrega: true },
  fato: { nome: 'Fato', icone: '🏹', custo: 4, papel: 'longe', forca: 1, tropa: 'arqueiro', jeito: 'De longe', dica: 'Arqueiro: atira por cima da luta, mas cai com um golpe. Máx. 2 em campo.' },
  estatistica: { nome: 'Estatística', icone: '📊', custo: 5, papel: 'longe', forca: 2, tropa: 'balista', jeito: 'Posto fixo', dica: 'Balista parada no seu lado: atira longe 4 vezes (ou 10 s) e some. Máx. 1.' },
  prova: { nome: 'Prova', icone: '🎯', custo: 6, papel: 'longe', forca: 2, tropa: 'catapulta', jeito: 'Cerco', dica: 'Catapulta: ignora as tropas e só ataca a Tribuna, de longe.' },
  muralha: { nome: 'Muralha de lógica', icone: '🧱', custo: 3, papel: 'defesa', forca: 5, tropa: 'barricada', jeito: 'Segura', dica: 'Barricada na frente da sua Tribuna: não ataca, só segura. Some em 12 s.' },
  contra: { nome: 'Contra-argumento', icone: '🔄', custo: 3, papel: 'defesa', forca: 3, tropa: 'escudeiro', jeito: 'Devolve', dica: 'Escudeiro parado na frente da Tribuna: cada golpe que leva, devolve 1.' },
  refutacao: { nome: 'Refutação', icone: '❗', custo: 3, papel: 'feitico', forca: 0, jeito: 'Precisa', dica: 'Tira 2 de força da tropa inimiga mais perto da sua Tribuna.' },
  pergunta: { nome: 'Pergunta retórica', icone: '❓', custo: 4, papel: 'feitico', forca: 0, jeito: 'Em área', dica: 'Tira 1 de força de todas as tropas inimigas no grupo mais perto.' },
  pausa: { nome: 'Pausa dramática', icone: '⏸️', custo: 2, papel: 'feitico', forca: 0, jeito: 'Congela', dica: 'As tropas inimigas ficam paradas por 2 s.' },
  aplauso: { nome: 'Aplauso', icone: '📣', custo: 3, papel: 'feitico', forca: 0, jeito: 'Empurra', dica: 'Suas tropas em campo andam mais rápido por 4 s.' },
};
export const TODAS_AS_CARTAS = Object.keys(CARTAS) as TipoCarta[];

/** Como cada tropa se comporta. */
interface InfoTropa {
  /** % da largura por segundo (0 = parada). */
  velocidade: number;
  /** Alcance de tiro (0 = só corpo a corpo). */
  alcance?: number;
  tiroMs?: number;
  /** Some depois deste tempo (ms). */
  duracao?: number;
  /** Número de tiros antes de sumir. */
  tiros?: number;
  /** Onde nasce, à frente da Tribuna (em %). */
  nasce?: number;
  /** Não bate em ninguém (só segura). */
  pacifica?: boolean;
}
const TROPA: Record<TipoTropa, InfoTropa> = {
  legionario: { velocidade: 14 },
  exemplo: { velocidade: 13 },
  cavaleiro: { velocidade: 20 },
  bobo: { velocidade: 15 },
  centuriao: { velocidade: 6 },
  elefante: { velocidade: 4 },
  senador: { velocidade: 7 },
  arqueiro: { velocidade: 9, alcance: 25, tiroMs: 2000 },
  balista: { velocidade: 0, alcance: 38, tiroMs: 2500, duracao: 10_000, tiros: 4, nasce: 3 },
  catapulta: { velocidade: 5, alcance: 40, tiroMs: 3000 },
  barricada: { velocidade: 0, duracao: 12_000, nasce: 10, pacifica: true },
  escudeiro: { velocidade: 0, nasce: 5 },
};
const MAXIMO_EM_CAMPO: Partial<Record<TipoTropa, number>> = { arqueiro: 2, balista: 1 };

/** Gladiador: 1 golpe automático a cada 3 s em quem chega perto; toque = golpe na hora (recarga 8 s). */
const GLADIADOR_AUTO_MS = 3000;
export const GLADIADOR_ALCANCE = 8;
export const GLADIADOR_RECARGA_MS = 8000;
const GLADIADOR_ALCANCE_TOQUE = 25;

/** Habilidade da IA: enche com 4 tropas que chegam à Tribuna. */
export const SUPER_MAX = 4;
export const HABILIDADES: Record<IaId, { nome: string; icone: string; efeito: string }> = {
  claude: { nome: 'Escudo', icone: '🛡️', efeito: 'Bloqueia os próximos 2 golpes na sua Tribuna.' },
  chatgpt: { nome: 'Carta grátis', icone: '🃏', efeito: 'A próxima carta não custa fôlego.' },
  gemini: { nome: 'Raio', icone: '⚡', efeito: 'Tira 3 de força da tropa inimiga mais perto.' },
};

// ---------- Baralhos ----------

/** Baralho de quem ainda não montou o seu. */
export const BARALHO_PADRAO: TipoCarta[] = ['frase', 'exemplos', 'analogia', 'tese', 'fato', 'muralha', 'refutacao', 'aplauso'];

/** Confere um baralho salvo: 8 cartas que existem, sem repetir. Senão, o padrão. */
export function validarBaralho(bruto: unknown): TipoCarta[] {
  if (!Array.isArray(bruto)) return [...BARALHO_PADRAO];
  const ok = bruto.filter((c): c is TipoCarta => typeof c === 'string' && c in CARTAS);
  const unicas = [...new Set(ok)];
  return unicas.length === TAMANHO_BARALHO ? unicas : [...BARALHO_PADRAO];
}

export type EstiloIa = 'pressa' | 'muralha' | 'artilharia' | 'equilibrado';
export const ESTILOS: Record<EstiloIa, { nome: string; cartas: TipoCarta[] }> = {
  pressa: { nome: 'Pressa', cartas: ['frase', 'exemplos', 'analogia', 'piada', 'aplauso', 'refutacao', 'tese', 'pausa'] },
  muralha: { nome: 'Muralha', cartas: ['tese', 'muralha', 'contra', 'refutacao', 'citacao', 'frase', 'fato', 'pergunta'] },
  artilharia: { nome: 'Artilharia', cartas: ['fato', 'estatistica', 'prova', 'pausa', 'muralha', 'frase', 'exemplos', 'pergunta'] },
  equilibrado: { nome: 'Equilibrado', cartas: ['frase', 'tese', 'fato', 'analogia', 'muralha', 'refutacao', 'pergunta', 'discurso'] },
};
/** Cada IA tem um estilo preferido (personalidade). */
export const ESTILO_PREFERIDO: Record<IaId, EstiloIa> = { chatgpt: 'pressa', claude: 'muralha', gemini: 'artilharia' };

/** Baralho da IA: 60% o estilo preferido dela, senão outro; troca 1 ou 2 cartas por sorte. */
export function baralhoDaIa(ia: IaId, aleatorio: Aleatorio = Math.random): { estilo: EstiloIa; cartas: TipoCarta[] } {
  const outros = (Object.keys(ESTILOS) as EstiloIa[]).filter((e) => e !== ESTILO_PREFERIDO[ia]);
  const estilo = aleatorio() < 0.6 ? ESTILO_PREFERIDO[ia] : outros[Math.floor(aleatorio() * outros.length)]!;
  const cartas = [...ESTILOS[estilo].cartas];
  const trocas = aleatorio() < 0.5 ? 1 : 2;
  for (let i = 0; i < trocas; i++) {
    const fora = TODAS_AS_CARTAS.filter((c) => !cartas.includes(c));
    const entra = fora[Math.floor(aleatorio() * fora.length)];
    if (entra) cartas[Math.floor(aleatorio() * cartas.length)] = entra;
  }
  return { estilo, cartas };
}

// ---------- Estado ----------

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
  carregada: boolean;
  proximoGolpe: number;
  /** Parada (rindo da Piada ou na Pausa dramática) até este momento. */
  paradaAte?: number;
  /** Correndo (Aplauso) até este momento. */
  rapidaAte?: number;
  /** Analogia: já pulou a primeira tropa inimiga. */
  pulou?: boolean;
  /** Some neste momento (Muralha, Estatística). */
  someEm?: number;
  /** Tiros que ainda faltam (Estatística). */
  tiros?: number;
  /** Quando deu o último golpe (a tela anima a estocada). */
  golpeouEm?: number;
  /** Quando pulou (a tela anima o salto em arco). */
  puloEm?: number;
}

export interface Lutador {
  folego: number;
  mao: CartaDuelo[];
  monte: CartaDuelo[];
  carga: number;
  escudo: number;
  gratis: boolean;
  gladiadorAutoEm: number;
  gladiadorProntoEm: number;
  fala: { texto: string; ate: number } | null;
}

export interface EfeitoVisual {
  id: number;
  tipo: 'choque' | 'tribuna' | 'flecha' | 'dardo' | 'pedra' | 'golpe' | 'raio' | 'escudo' | 'super' | 'feitico' | 'pulo' | 'riso';
  lado: Lado;
  /** De onde sai o tiro (para a tela animar a flecha voando). */
  x0?: number;
  x?: number;
  icone?: string;
  ate: number;
}

export interface EstadoDuelo {
  tempo: number;
  /** 1 a 3; a 4 é a prorrogação. */
  rodada: number;
  tribunas: { eu: number; rival: number };
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
const direcao = (l: Lado) => (l === 'eu' ? 1 : -1);

export const prorrogacao = (s: EstadoDuelo) => s.rodada > RODADAS;
export const duracaoDaRodada = (s: EstadoDuelo) => (prorrogacao(s) ? PRORROGACAO_MS : DURACOES_MS[s.rodada - 1]!);

function embaralhar<T>(lista: T[], aleatorio: Aleatorio): T[] {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/** Monte: as 8 cartas do baralho, embaralhadas, cada uma com uma frase do dilema. */
export function montarMonte(frases: string[], prefixo: string, baralho: TipoCarta[], aleatorio: Aleatorio): CartaDuelo[] {
  return embaralhar(
    baralho.map((tipo, i) => ({ id: `${prefixo}-${i}`, tipo, frase: frases[i % Math.max(1, frases.length)] ?? '' })),
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

export interface Preparo {
  frasesEu: string[];
  frasesRival: string[];
  baralhoEu?: TipoCarta[];
  baralhoRival?: TipoCarta[];
}

export function novoDuelo(p: Preparo, aleatorio: Aleatorio = Math.random): EstadoDuelo {
  return {
    tempo: 0,
    rodada: 1,
    tribunas: { eu: TRIBUNA_VIDA, rival: TRIBUNA_VIDA },
    eu: lutador(montarMonte(p.frasesEu, 'eu', p.baralhoEu ?? BARALHO_PADRAO, aleatorio)),
    rival: lutador(montarMonte(p.frasesRival, 'rv', p.baralhoRival ?? BARALHO_PADRAO, aleatorio)),
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

function efeito(s: EstadoDuelo, tipo: EfeitoVisual['tipo'], lado: Lado, x?: number, ms = 800, icone?: string, x0?: number): EstadoDuelo {
  return { ...s, seq: s.seq + 1, efeitos: [...s.efeitos, { id: s.seq + 1, tipo, lado, x, x0, icone, ate: s.tempo + ms }] };
}

export function custoAgora(l: Lutador, tipo: TipoCarta): number {
  return l.gratis ? 0 : CARTAS[tipo].custo;
}

export function podeJogar(s: EstadoDuelo, lado: Lado, cartaId: string): boolean {
  const l = s[lado];
  const c = l.mao.find((x) => x.id === cartaId);
  if (!c || s.fase !== 'luta' || l.folego < custoAgora(l, c.tipo)) return false;
  const tropa = CARTAS[c.tipo].tropa;
  const max = tropa ? MAXIMO_EM_CAMPO[tropa] : undefined;
  if (tropa && max !== undefined && s.tropas.filter((t) => t.de === lado && t.tipo === tropa).length >= max) return false;
  return true;
}

function novaTropa(s: EstadoDuelo, lado: Lado, tipo: TipoTropa, forca: number, carregada: boolean, recuo = 0): EstadoDuelo {
  const info = TROPA[tipo];
  const x = PONTA[lado] + direcao(lado) * ((info.nasce ?? 0) - recuo);
  const t: Tropa = {
    id: s.seq + 1,
    de: lado,
    tipo,
    forca,
    forcaInicial: forca,
    x,
    carregada,
    proximoGolpe: s.tempo,
    someEm: info.duracao ? s.tempo + info.duracao : undefined,
    tiros: info.tiros,
  };
  return { ...s, seq: s.seq + 1, tropas: [...s.tropas, t] };
}

/** Joga uma carta. `carga` (0 a 1) vem de quanto tempo a carta foi segurada. */
export function jogarCarta(s0: EstadoDuelo, lado: Lado, cartaId: string, carga = 0): EstadoDuelo {
  if (!podeJogar(s0, lado, cartaId)) return s0;
  const carta = s0[lado].mao.find((c) => c.id === cartaId)!;
  const info = CARTAS[carta.tipo];
  const agora = s0.tempo;
  const custo = custoAgora(s0[lado], carta.tipo);
  const bonus = info.carrega && s0[lado].folego - custo >= CUSTO_CARGA ? bonusDaCarga(carga) : 0;
  let s = comLutador(s0, lado, (l) => {
    const mao = l.mao.filter((c) => c.id !== carta.id);
    const [proxima, ...resto] = l.monte;
    if (proxima) mao.push(proxima);
    return { ...l, mao, monte: [...resto, carta], folego: l.folego - custo - (bonus > 0 ? CUSTO_CARGA : 0), gratis: false, fala: { texto: carta.frase, ate: agora + 1800 } };
  });
  if (bonus > 0) s = avisar(s, '💪 CARREGADO! +1', lado, 900);

  if (info.tropa) {
    s = novaTropa(s, lado, info.tropa, info.forca + bonus, bonus > 0);
    // Exemplos: são dois.
    if (carta.tipo === 'exemplos') s = novaTropa(s, lado, 'exemplo', info.forca, false, 4);
    return s;
  }
  return feitico(s, lado, carta.tipo);
}

/** Os 4 feitiços: alvo escolhido sozinho, no lugar que mais importa. */
function feitico(s0: EstadoDuelo, lado: Lado, tipo: TipoCarta): EstadoDuelo {
  let s = s0;
  const agora = s.tempo;
  const inimigas = s.tropas.filter((t) => t.de !== lado);
  const perto = maisPerto(s, outro(lado), PONTA[lado]);
  // A tela desenha o efeito de cada feitiço a partir do nome da carta.
  const icone = tipo;
  if (tipo === 'refutacao') {
    if (!perto) return avisar(s, '❗ Ninguém para refutar…', lado, 1000);
    s = efeito(s, 'feitico', lado, perto.x, 900, icone);
    return ferir(s, perto.id, 2);
  }
  if (tipo === 'pergunta') {
    if (!perto) return avisar(s, '❓ Ninguém para perguntar…', lado, 1000);
    s = efeito(s, 'feitico', lado, perto.x, 900, icone);
    for (const t of inimigas.filter((t) => Math.abs(t.x - perto.x) <= 8)) s = ferir(s, t.id, 1);
    return s;
  }
  if (tipo === 'pausa') {
    s = efeito(s, 'feitico', lado, 50, 1200, icone);
    s = avisar(s, '⏸️ PAUSA DRAMÁTICA!', lado, 1200);
    return { ...s, tropas: s.tropas.map((t) => (t.de !== lado ? { ...t, paradaAte: agora + 2000 } : t)) };
  }
  // aplauso
  s = efeito(s, 'feitico', lado, 50, 1200, icone);
  s = avisar(s, '📣 APLAUSO! Suas tropas aceleram', lado, 1200);
  return { ...s, tropas: s.tropas.map((t) => (t.de === lado ? { ...t, rapidaAte: agora + 4000 } : t)) };
}

export function usarHabilidade(s0: EstadoDuelo, lado: Lado, ia: IaId): EstadoDuelo {
  if (s0[lado].carga < SUPER_MAX || s0.fase !== 'luta') return s0;
  let s = comLutador(s0, lado, (l) => ({ ...l, carga: 0 }));
  s = efeito(s, 'super', lado, undefined, 1000);
  s = avisar(s, `${HABILIDADES[ia].icone} ${HABILIDADES[ia].nome.toUpperCase()}!`, lado, 1800);
  if (ia === 'claude') return comLutador(s, lado, (l) => ({ ...l, escudo: 2 }));
  if (ia === 'chatgpt') return comLutador(s, lado, (l) => ({ ...l, gratis: true }));
  const alvo = maisPerto(s, outro(lado), PONTA[lado]);
  if (!alvo) return s;
  s = efeito(s, 'raio', lado, alvo.x);
  return ferir(s, alvo.id, 3);
}

export function golpeDoGladiador(s0: EstadoDuelo, lado: Lado): EstadoDuelo {
  const l = s0[lado];
  if (s0.fase !== 'luta' || l.gladiadorProntoEm > s0.tempo) return s0;
  const alvo = maisPerto(s0, outro(lado), PONTA[lado]);
  let s = comLutador(s0, lado, (x) => ({ ...x, gladiadorProntoEm: s0.tempo + GLADIADOR_RECARGA_MS }));
  if (!alvo || Math.abs(alvo.x - PONTA[lado]) > GLADIADOR_ALCANCE_TOQUE) return s;
  s = efeito(s, 'golpe', lado, alvo.x);
  return ferir(s, alvo.id, 1);
}

function maisPerto(s: EstadoDuelo, de: Lado, x: number): Tropa | undefined {
  return s.tropas.filter((t) => t.de === de).sort((a, b) => Math.abs(a.x - x) - Math.abs(b.x - x))[0];
}

/** Tira força de uma tropa (some quando chega a zero). */
function ferir(s: EstadoDuelo, id: number, dano: number): EstadoDuelo {
  return { ...s, tropas: s.tropas.map((t) => (t.id === id ? { ...t, forca: t.forca - dano } : t)).filter((t) => t.forca > 0.01) };
}

function inimigaAFrente(tropas: Tropa[], t: Tropa): Tropa | undefined {
  const d = direcao(t.de);
  return tropas.filter((o) => o.de !== t.de && (o.x - t.x) * d >= -1).sort((a, b) => (a.x - t.x) * d - (b.x - t.x) * d)[0];
}

/** Tropa que está perto de um Senador do mesmo lado bate mais forte. */
const liderada = (tropas: Tropa[], t: Tropa) => t.tipo !== 'senador' && tropas.some((o) => o.de === t.de && o.tipo === 'senador' && Math.abs(o.x - t.x) <= 12);

/** Lutas, tiros, passos, gladiadores e chegadas às Tribunas. */
function moverTropas(s0: EstadoDuelo): EstadoDuelo {
  let s = s0;
  const agora = s.tempo;
  // 0) O que já passou do tempo some (Muralha, Estatística).
  s = { ...s, tropas: s.tropas.filter((t) => t.someEm === undefined || t.someEm > agora) };

  // 1) Golpes e tiros, todos "ao mesmo tempo".
  const dano = new Map<number, number>();
  const somar = (id: number, v: number) => dano.set(id, (dano.get(id) ?? 0) + v);
  const parar = new Map<number, number>();
  const golpearam = new Set<number>();
  const pulos = new Set<number>();
  const tiroNaTribuna: Lado[] = [];
  for (const t of s.tropas) {
    const info = TROPA[t.tipo];
    if (info.pacifica || (t.paradaAte ?? 0) > agora || agora < t.proximoGolpe) continue;
    const alvo = inimigaAFrente(s.tropas, t);
    const dist = alvo ? Math.abs(alvo.x - t.x) : Infinity;
    // Analogia: pula a primeira tropa inimiga que encontra.
    if (t.tipo === 'cavaleiro' && !t.pulou && alvo && dist <= ENCOSTO) {
      pulos.add(t.id);
      continue;
    }
    // Prova (catapulta): só ataca a Tribuna, de longe.
    if (t.tipo === 'catapulta') {
      const tribuna = PONTA[outro(t.de)];
      if (Math.abs(tribuna - t.x) <= info.alcance!) {
        tiroNaTribuna.push(outro(t.de));
        golpearam.add(t.id);
        s = efeito(s, 'pedra', t.de, tribuna, 700, undefined, t.x);
      }
      continue;
    }
    if (!alvo) continue;
    const corpo = dist <= ENCOSTO;
    const tiro = !!info.alcance && !corpo && dist <= info.alcance;
    if (!corpo && !tiro) continue;
    // Tese é firme: flecha tira só metade.
    const forcaDoGolpe = tiro ? (alvo.tipo === 'centuriao' ? 0.5 : 1) : 1 + (liderada(s.tropas, t) ? 1 : 0);
    somar(alvo.id, forcaDoGolpe);
    // Contra-argumento devolve 1 a quem bate nele de perto.
    if (corpo && alvo.tipo === 'escudeiro') somar(t.id, 1);
    // Piada: quem apanha dela fica 1 s parado de tanto rir.
    if (corpo && t.tipo === 'bobo') {
      parar.set(alvo.id, agora + 1000);
      s = efeito(s, 'riso', t.de, alvo.x, 900);
    }
    golpearam.add(t.id);
    s = tiro
      ? efeito(s, t.tipo === 'balista' ? 'dardo' : 'flecha', t.de, alvo.x, 450, undefined, t.x)
      : efeito(s, 'choque', t.de, (alvo.x + t.x) / 2, 350);
  }
  s = {
    ...s,
    tropas: s.tropas
      .map((t) => {
        const info = TROPA[t.tipo];
        const pulo = pulos.has(t.id);
        return {
          ...t,
          forca: t.forca - (dano.get(t.id) ?? 0),
          paradaAte: parar.get(t.id) ?? t.paradaAte,
          pulou: t.pulou || pulo,
          puloEm: pulo ? agora : t.puloEm,
          golpeouEm: golpearam.has(t.id) ? agora : t.golpeouEm,
          x: pulo ? t.x + direcao(t.de) * (ENCOSTO + 4) : t.x,
          tiros: golpearam.has(t.id) && t.tiros !== undefined ? t.tiros - 1 : t.tiros,
          proximoGolpe: golpearam.has(t.id) ? agora + (info.tiroMs ?? GOLPE_LUTA_MS) : t.proximoGolpe,
        };
      })
      .filter((t) => t.forca > 0.01 && (t.tiros === undefined || t.tiros > 0)),
  };
  for (const id of pulos) {
    const t = s.tropas.find((x) => x.id === id);
    if (t) s = efeito(s, 'pulo', t.de, t.x, 600);
  }
  for (const alvo of tiroNaTribuna) s = baterNaTribuna(s, alvo, 1);

  // 2) Andar.
  s = {
    ...s,
    tropas: s.tropas.map((t) => {
      const info = TROPA[t.tipo];
      if (info.velocidade === 0 || (t.paradaAte ?? 0) > agora) return t;
      const alvo = inimigaAFrente(s.tropas, t);
      const dist = alvo ? Math.abs(alvo.x - t.x) : Infinity;
      const naTribuna = t.tipo === 'catapulta' && Math.abs(PONTA[outro(t.de)] - t.x) <= info.alcance!;
      const parado = naTribuna || (t.tipo !== 'catapulta' && (dist <= ENCOSTO || (!!info.alcance && dist <= info.alcance)));
      if (parado) return t;
      const rapida = (t.rapidaAte ?? 0) > agora ? 1.6 : 1;
      return { ...t, x: t.x + direcao(t.de) * info.velocidade * rapida * (TICK / 1000) };
    }),
  };

  // 3) Gladiadores: golpe automático em quem chega perto da Tribuna.
  for (const lado of ['eu', 'rival'] as Lado[]) {
    if (s[lado].gladiadorAutoEm > agora) continue;
    const alvo = s.tropas.find((t) => t.de !== lado && Math.abs(t.x - PONTA[lado]) <= GLADIADOR_ALCANCE);
    if (!alvo) continue;
    s = comLutador(s, lado, (l) => ({ ...l, gladiadorAutoEm: agora + GLADIADOR_AUTO_MS }));
    s = efeito(s, 'golpe', lado, alvo.x);
    s = ferir(s, alvo.id, 1);
  }

  // 4) Chegadas: a tropa que alcança a Tribuna inimiga tira dela a força que tem.
  const chegaram = s.tropas.filter((t) => TROPA[t.tipo].velocidade > 0 && (t.x - PONTA[outro(t.de)]) * direcao(t.de) >= 0);
  s = { ...s, tropas: s.tropas.filter((t) => !chegaram.includes(t)) };
  for (const t of chegaram) s = baterNaTribuna(s, outro(t.de), Math.ceil(t.forca));
  return s;
}

/** Golpe numa Tribuna (o Escudo do Claude segura). Conta para a habilidade de quem bateu. */
function baterNaTribuna(s0: EstadoDuelo, alvo: Lado, dano: number): EstadoDuelo {
  let s = s0;
  if (s[alvo].escudo > 0) {
    s = comLutador(s, alvo, (l) => ({ ...l, escudo: l.escudo - 1 }));
    return efeito(s, 'escudo', alvo, PONTA[alvo]);
  }
  s = { ...s, tribunas: alvo === 'eu' ? { ...s.tribunas, eu: Math.max(0, s.tribunas.eu - dano) } : { ...s.tribunas, rival: Math.max(0, s.tribunas.rival - dano) } };
  s = comLutador(s, outro(alvo), (l) => ({ ...l, carga: Math.min(SUPER_MAX, l.carga + 1) }));
  return efeito(s, 'tribuna', alvo, PONTA[alvo], 1800);
}

export interface Contexto {
  acerto: number;
  iaRival: IaId;
  aleatorio: Aleatorio;
}

/** Vale a pena jogar esta carta agora? (o rival não joga feitiço no vazio) */
function fazSentido(s: EstadoDuelo, lado: Lado, tipo: TipoCarta): boolean {
  const minhas = s.tropas.filter((t) => t.de === lado).length;
  const delas = s.tropas.filter((t) => t.de !== lado);
  const vindo = delas.some((t) => Math.abs(t.x - PONTA[lado]) <= 35);
  if (tipo === 'refutacao' || tipo === 'pergunta') return delas.length > 0;
  if (tipo === 'pausa') return delas.length >= 2;
  if (tipo === 'aplauso') return minhas >= 2;
  if (tipo === 'muralha' || tipo === 'contra') return vindo;
  return true;
}

/** O rival: joga no ritmo da liga, com o baralho do estilo dele, e escolhe cartas que fazem sentido. */
function vezDoRival(s0: EstadoDuelo, ctx: Contexto): EstadoDuelo {
  let s = s0;
  const r = s.rival;
  const agora = s.tempo;
  if (r.carga >= SUPER_MAX) {
    const util = ctx.iaRival !== 'gemini' || s.tropas.some((t) => t.de === 'eu');
    if (util) return usarHabilidade(s, 'rival', ctx.iaRival);
  }
  const perigo = s.tropas.some((t) => t.de === 'eu' && Math.abs(t.x - PONTA.rival) <= 18);
  if (perigo && r.gladiadorProntoEm <= agora && ctx.aleatorio() < ctx.acerto * 0.2) s = golpeDoGladiador(s, 'rival');

  if (agora < s.proximoRival) return s;
  const jogaveis = s.rival.mao.filter((c) => podeJogar(s, 'rival', c.id));
  // Quanto melhor a liga, mais ele escolhe cartas que fazem sentido agora.
  const boas = jogaveis.filter((c) => fazSentido(s, 'rival', c.tipo));
  const lista = boas.length && ctx.aleatorio() < 0.5 + ctx.acerto * 0.5 ? boas : jogaveis;
  const escolhida = lista[Math.floor(ctx.aleatorio() * lista.length)];
  const ritmo = (3600 - ctx.acerto * 1600 + ctx.aleatorio() * 800) * (prorrogacao(s) ? 0.6 : 1);
  s = { ...s, proximoRival: agora + ritmo };
  if (!escolhida) return s;
  const carga = ctx.aleatorio() < 0.2 + ctx.acerto * 0.5 ? 1 : 0;
  return jogarCarta(s, 'rival', escolhida.id, carga);
}

/** Quanto fôlego volta por segundo para este lado agora. */
export function ritmoDoFolego(s: EstadoDuelo, lado: Lado): number {
  if (prorrogacao(s)) return FOLEGO_POR_SEGUNDO * 2;
  const menos = lado === 'eu' ? s.tribunas.eu < s.tribunas.rival : s.tribunas.rival < s.tribunas.eu;
  const virada = s.rodada === RODADAS && menos ? VIRADA_BONUS : 1;
  const empolga = s.tropas.some((t) => t.de === lado && t.tipo === 'elefante') ? EMPOLGA_BONUS : 1;
  return FOLEGO_POR_SEGUNDO * virada * empolga;
}

export function passo(s0: EstadoDuelo, ctx: Contexto): EstadoDuelo {
  if (s0.fase === 'fim') return s0;
  const tempo = s0.tempo + TICK;
  if (s0.fase === 'intervalo') {
    if (tempo < s0.fimIntervalo) return { ...s0, tempo };
    const zerar = (l: Lutador): Lutador => ({ ...l, folego: FOLEGO_INICIAL, escudo: 0, gratis: false, gladiadorAutoEm: 0, gladiadorProntoEm: 0, fala: null });
    let s: EstadoDuelo = { ...s0, tempo: 0, rodada: s0.rodada + 1, tropas: [], eu: zerar(s0.eu), rival: zerar(s0.rival), proximoRival: 3000, fase: 'luta', aviso: null, efeitos: [] };
    if (prorrogacao(s)) s = avisar(s, '⚡ PRORROGAÇÃO! FÔLEGO EM DOBRO', null, 2200);
    else if (s.rodada === RODADAS) s = avisar(s, '⏳ RODADA FINAL: 30 s!', null, 2200);
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

  if (s.tribunas.eu <= 0 || s.tribunas.rival <= 0) {
    const caiu: Lado = s.tribunas.eu <= 0 ? 'eu' : 'rival';
    s = { ...s, tropas: [], fase: 'fim' };
    return avisar(s, caiu === 'eu' ? 'SUA TRIBUNA CAIU!' : 'A TRIBUNA DO RIVAL CAIU!', outro(caiu), 3000);
  }
  if (tempo >= duracaoDaRodada(s)) {
    const empate = s.tribunas.eu === s.tribunas.rival;
    const acabou = prorrogacao(s) || (s.rodada >= RODADAS && !empate);
    s = { ...s, tropas: [], fase: acabou ? 'fim' : 'intervalo', fimIntervalo: tempo + INTERVALO_MS };
    s = avisar(s, acabou ? 'FIM DO DUELO!' : s.rodada >= RODADAS ? 'EMPATE NA VIDA! VAI PARA A PRORROGAÇÃO' : `FIM DA RODADA ${s.rodada}`, null, INTERVALO_MS);
  }
  return s;
}

export function resultadoFinal(s: EstadoDuelo): 'vitoria' | 'derrota' | 'empate' {
  return s.tribunas.eu > s.tribunas.rival ? 'vitoria' : s.tribunas.rival > s.tribunas.eu ? 'derrota' : 'empate';
}
