import { desenhar, type Passo } from './desenho';
import type { Paleta } from './Sprite';
import type { TipoTropa } from '@/game/duelo/motor';

/**
 * As tropas do Duelo (cada uma é um tipo de argumento), olhando para a direita,
 * e a Tribuna de cada lado. C = cor da IA do lado; D = a mesma cor mais escura.
 */
const LEGIONARIO: Passo[] = [
  ['C', 4, 0, 3, 1], // penacho
  ['M', 3, 1, 5, 3], // capacete
  ['W', 4, 1],
  ['S', 4, 3, 4, 2], // rosto
  ['K', 6, 3],
  ['C', 3, 5, 5, 4], // túnica
  ['G', 3, 8, 5, 1], // cinto
  ['S', 8, 6, 1, 2], // braço
  ['B', 9, 3, 2, 1], // pergaminho (o argumento)
  ['N', 9, 4, 2, 4],
  ['B', 9, 8, 2, 1],
  ['S', 4, 9, 1, 3], // pernas
  ['S', 6, 9, 1, 3],
  ['B', 3, 12, 2, 1],
  ['B', 6, 12, 2, 1],
];

const CENTURIAO: Passo[] = [
  ['C', 1, 0, 9, 1], // crista atravessada, de centurião
  ['M', 3, 1, 6, 3],
  ['W', 4, 1],
  ['S', 4, 3, 4, 2],
  ['K', 7, 3],
  ['M', 2, 5, 7, 5], // couraça
  ['W', 3, 5, 1, 2],
  ['C', 2, 10, 7, 2], // saiote
  ['D', 3, 10, 1, 2],
  ['D', 5, 10, 1, 2],
  ['D', 7, 10, 1, 2],
  ['S', 3, 12, 1, 2],
  ['S', 6, 12, 1, 2],
  ['B', 2, 14, 2, 1],
  ['B', 6, 14, 2, 1],
  ['D', 9, 3, 4, 10], // escudo grande na frente
  ['C', 10, 4, 2, 8],
  ['G', 10, 7, 2, 2],
];

const ARQUEIRO: Passo[] = [
  ['B', 3, 0, 4, 2], // capuz
  ['S', 4, 2, 3, 2],
  ['K', 6, 2],
  ['B', 1, 3, 1, 5], // aljava nas costas
  ['W', 1, 2],
  ['C', 3, 4, 4, 5],
  ['G', 3, 8, 4, 1],
  ['S', 7, 5, 2, 1], // braço puxando a corda
  ['W', 9, 2, 1, 7], // corda
  ['B', 9, 1], // arco
  ['B', 10, 2],
  ['B', 11, 3, 1, 5],
  ['B', 10, 8],
  ['B', 9, 9],
  ['S', 4, 9, 1, 3],
  ['S', 6, 9, 1, 3],
  ['B', 3, 12, 2, 1],
  ['B', 6, 12, 2, 1],
];

/** Analogia: cavaleiro com lança. */
const CAVALEIRO: Passo[] = [
  ['M', 5, 0, 3, 1], // capacete
  ['C', 6, 0],
  ['S', 5, 1, 3, 2],
  ['K', 7, 1],
  ['C', 5, 3, 3, 4], // corpo
  ['M', 8, 4, 6, 1], // lança
  ['W', 14, 4],
  ['B', 2, 7, 10, 4], // cavalo
  ['G', 5, 7, 3, 1], // sela
  ['B', 11, 4, 2, 3], // pescoço
  ['B', 12, 3, 3, 2], // cabeça
  ['K', 13, 3],
  ['D', 10, 4, 1, 3], // crina
  ['B', 1, 7, 1, 3], // rabo
  ['B', 3, 11, 1, 3], // patas
  ['B', 5, 11, 1, 3],
  ['B', 9, 11, 1, 3],
  ['B', 11, 11, 1, 3],
];

/** Exemplos: aprendiz sem capacete, com uma tabuleta de cera (o exemplo escrito). */
const APRENDIZ: Passo[] = [
  ['B', 3, 0, 4, 2], // cabelo
  ['B', 2, 1],
  ['S', 3, 2, 4, 3], // rosto
  ['K', 6, 3],
  ['N', 2, 5, 5, 1], // gola
  ['C', 2, 6, 5, 3], // túnica curta
  ['B', 2, 8, 5, 1], // cinto de corda
  ['S', 6, 6, 1, 2], // braço
  ['B', 7, 3, 3, 6], // tabuleta (moldura de madeira)
  ['E', 8, 4, 1, 4], // cera
  ['K', 8, 5],
  ['K', 8, 7],
  ['S', 3, 9, 1, 3],
  ['S', 5, 9, 1, 3],
  ['B', 2, 12, 2, 1],
  ['B', 5, 12, 2, 1],
];

/** Piada: bobo da corte caprichado, chapéu de 3 pontas com guizos, roupa xadrez, gola e bastão. */
const BOBO: Passo[] = [
  ['G', 1, 0], // guizos
  ['G', 6, 0],
  ['G', 11, 0],
  ['C', 1, 1, 2, 1], // pontas do chapéu
  ['D', 5, 1, 3, 1],
  ['C', 10, 1, 2, 1],
  ['C', 2, 2, 3, 1],
  ['D', 5, 2, 3, 1],
  ['C', 8, 2, 3, 1],
  ['G', 3, 3, 7, 1], // faixa do chapéu
  ['S', 4, 4, 5, 3], // rosto
  ['K', 5, 5],
  ['K', 7, 5],
  ['D', 5, 6, 3, 1], // sorriso
  ['W', 3, 7, 7, 1], // gola de babados
  ['C', 4, 8, 5, 4], // roupa xadrez
  ['D', 5, 8],
  ['D', 7, 8],
  ['D', 4, 9],
  ['D', 6, 9],
  ['D', 8, 9],
  ['D', 5, 10],
  ['D', 7, 10],
  ['D', 4, 11],
  ['D', 6, 11],
  ['D', 8, 11],
  ['S', 9, 9], // mão
  ['B', 10, 6, 1, 6], // bastão
  ['G', 10, 4, 1, 2], // cabecinha do bastão
  ['C', 9, 5],
  ['C', 11, 5],
  ['D', 4, 12, 2, 3], // pernas de cores diferentes
  ['C', 7, 12, 2, 3],
  ['C', 3, 15, 3, 1], // sapatos de bico
  ['D', 7, 15, 3, 1],
];

/** Contra-argumento: hoplita com elmo de crista, grande escudo redondo de bronze e lança. */
const HOPLITA: Passo[] = [
  ['B', 13, 0, 1, 13], // lança
  ['M', 13, 0],
  ['C', 2, 0, 6, 1], // crista
  ['C', 3, 1, 4, 1],
  ['G', 3, 2, 4, 3], // elmo
  ['K', 5, 3, 2, 1], // fresta dos olhos
  ['S', 4, 4, 2, 1],
  ['D', 3, 5, 4, 5], // couraça
  ['C', 3, 10, 4, 2], // saiote
  ['S', 3, 12, 1, 3],
  ['S', 6, 12, 1, 3],
  ['G', 3, 13, 1, 2], // caneleiras
  ['G', 6, 13, 1, 2],
  ['G', 8, 3, 4, 1], // escudo redondo
  ['G', 7, 4, 6, 7],
  ['G', 8, 11, 4, 1],
  ['B', 7, 4, 1, 7], // sombra da borda
  ['C', 9, 6, 2, 3], // emblema do lado
  ['W', 9, 4],
];

/** Discurso épico: elefante de guerra com manta. */
const ELEFANTE: Passo[] = [
  ['E', 2, 5, 15, 8], // corpo
  ['C', 5, 4, 8, 4], // manta
  ['G', 5, 7, 8, 1],
  ['E', 15, 3, 6, 7], // cabeça
  ['e', 14, 4, 3, 5], // orelha
  ['K', 18, 5],
  ['W', 19, 9, 2, 1], // presa
  ['E', 20, 8, 2, 5], // tromba
  ['E', 21, 12, 2, 1],
  ['e', 1, 6, 1, 4], // rabo
  ['E', 3, 13, 3, 3], // patas
  ['E', 8, 13, 3, 3],
  ['E', 12, 13, 3, 3],
  ['e', 3, 15, 3, 1],
  ['e', 8, 15, 3, 1],
  ['e', 12, 15, 3, 1],
];

/** Citação de autoridade: senador de toga com faixa da cor do lado. */
const SENADOR: Passo[] = [
  ['G', 3, 0, 4, 1], // louros
  ['S', 3, 1, 4, 3],
  ['K', 6, 2],
  ['T', 2, 4, 6, 9], // toga
  ['C', 3, 5],
  ['C', 4, 6],
  ['C', 5, 7],
  ['C', 6, 8],
  ['C', 7, 9],
  ['S', 8, 3, 1, 3], // braço erguido, discursando
  ['N', 8, 1, 2, 2], // pergaminho
  ['B', 3, 13, 2, 1],
  ['B', 6, 13, 2, 1],
];

/** Estatística: balista. */
const BALISTA: Passo[] = [
  ['B', 2, 6, 12, 2], // base
  ['C', 4, 6, 4, 1],
  ['B', 4, 8, 1, 2],
  ['B', 11, 8, 1, 2],
  ['B', 7, 3, 2, 3], // poste
  ['M', 10, 0, 1, 8], // arco
  ['W', 3, 3, 11, 1], // dardo
  ['M', 14, 3],
];

/** Prova: catapulta com pedra. */
const CATAPULTA: Passo[] = [
  ['B', 1, 9, 14, 2],
  ['C', 2, 9, 4, 1],
  ['K', 2, 11, 3, 2], // rodas
  ['K', 10, 11, 3, 2],
  ['B', 8, 4, 2, 5], // apoio
  ['B', 5, 7], // braço
  ['B', 6, 6],
  ['B', 7, 5],
  ['B', 8, 4],
  ['B', 9, 3],
  ['B', 10, 2],
  ['B', 11, 1],
  ['B', 12, 0, 2, 2], // concha
  ['p', 12, 0, 2, 1], // pedra
];

/** Muralha de lógica: barricada de pedra com estandarte. */
const BARRICADA: Passo[] = [
  ['P', 0, 1, 2, 2],
  ['P', 4, 1, 2, 2],
  ['P', 8, 1, 2, 2],
  ['P', 0, 3, 10, 10],
  ['p', 0, 6, 10, 1],
  ['p', 0, 9, 10, 1],
  ['p', 3, 3, 1, 3],
  ['p', 6, 6, 1, 3],
  ['p', 2, 9, 1, 4],
  ['C', 4, 7, 2, 2],
];


/**
 * A Tribuna (a tribuna dos oradores do Fórum romano), mais detalhada: balaustrada
 * no alto, friso dourado, três colunas de mármore com capitel e base, as pontas
 * de bronze dos navios (os "rostros") saindo entre as colunas, o estandarte do
 * lado e os degraus.
 */
const COLUNAS = [2, 9, 16];
const TRIBUNA_PASSOS: Passo[] = [
  // balaustrada
  ['P', 0, 0, 24, 1],
  ...[0, 4, 8, 12, 16, 20, 23].map((x): Passo => ['P', x, 1, 1, 2]),
  ['P', 0, 3, 24, 1],
  // cornija e friso dourado
  ['T', 0, 4, 24, 1],
  ['p', 0, 5, 24, 1],
  ['G', 1, 6, 22, 1],
  // corpo
  ['P', 1, 7, 22, 19],
  ['p', 1, 25, 22, 1],
  // colunas de mármore
  ...COLUNAS.flatMap((x): Passo[] => [
    ['T', x - 1, 7, 5, 1],
    ['T', x, 8, 3, 16],
    ['W', x, 8, 1, 16],
    ['p', x + 2, 8, 1, 16],
    ['T', x - 1, 24, 5, 1],
  ]),
  // estandarte
  ['C', 12, 8, 4, 6],
  ['D', 12, 14],
  ['D', 15, 14],
  ['G', 13, 10, 2, 1],
  // pontas de bronze dos navios
  ['G', 5, 11, 3, 2],
  ['G', 8, 12],
  ['B', 5, 13, 3, 1],
  ['G', 19, 11, 3, 2],
  ['G', 22, 12],
  ['B', 19, 13, 3, 1],
  ['G', 5, 19, 3, 2],
  ['G', 8, 20],
  ['B', 5, 21, 3, 1],
  ['G', 12, 17, 3, 2],
  ['G', 15, 18],
  ['B', 12, 19, 3, 1],
  ['G', 19, 19, 3, 2],
  ['G', 22, 20],
  ['B', 19, 21, 3, 1],
  // degraus
  ['P', 0, 26, 24, 1],
  ['p', 1, 27, 22, 1],
  ['P', 0, 28, 24, 1],
  ['p', 0, 29, 24, 1],
];
export const TRIBUNA = desenhar(26, 32, TRIBUNA_PASSOS);

/** Efeitos em pixel (sem contorno): flecha, dardo, pedra, corte de espada, raio e os feitiços. */
export const EFEITOS: Record<'flecha' | 'dardo' | 'pedra' | 'corte' | 'raio' | 'refutacao' | 'pergunta' | 'pausa' | 'aplauso', string[]> = {
  flecha: ['C........', 'BBBBBBBMM', 'C........'],
  dardo: ['C..........', 'BBBBBBBBBMMM', 'C..........'],
  pedra: ['.pp.', 'pPPp', 'pPPp', '.pp.'],
  corte: ['..WW....', '....WW..', '.....GW.', '......GW', '.....GW.', '....WW..', '..WW....'],
  raio: ['...YYY', '..YYY.', '.YYY..', 'YYYYYY', '..YYY.', '.YYY..', 'YYY...', 'YY....'],
  refutacao: ['.RRR.', '.RRR.', '.RRR.', '.RRR.', '..R..', '.....', '.RRR.', '.RRR.'],
  pergunta: ['.GGGG.', 'GG..GG', '....GG', '...GG.', '..GG..', '......', '..GG..', '..GG..'],
  pausa: ['.I...I.', '..I.I..', 'IIIIIII', '..I.I..', '.I...I.', '...I...', '..III..'],
  aplauso: ['G.G.G', '.GGG.', 'GGGGG', '.GGG.', 'G.G.G'],
};
export const PALETA_EFEITOS = { W: '#ffffff', G: '#f2c14e', Y: '#ffe066', R: '#ff3b4a', I: '#9fe8ff', B: '#7a4a2a', M: '#b9c2dc', P: '#9a8a78', p: '#6a5c50' };

export const TROPAS: Record<TipoTropa, string[]> = {
  legionario: desenhar(14, 15, LEGIONARIO),
  exemplo: desenhar(13, 15, APRENDIZ),
  cavaleiro: desenhar(17, 16, CAVALEIRO),
  bobo: desenhar(14, 18, BOBO),
  centuriao: desenhar(15, 17, CENTURIAO),
  elefante: desenhar(25, 18, ELEFANTE),
  senador: desenhar(12, 16, SENADOR),
  arqueiro: desenhar(14, 15, ARQUEIRO),
  balista: desenhar(17, 12, BALISTA),
  catapulta: desenhar(16, 15, CATAPULTA),
  barricada: desenhar(12, 15, BARRICADA),
  escudeiro: desenhar(16, 17, HOPLITA),
};

/** Largura de cada tropa na arena (% da largura): o elefante é o maior. */
export const LARGURA_TROPA: Record<TipoTropa, number> = {
  legionario: 7,
  exemplo: 5.5,
  cavaleiro: 9.5,
  bobo: 6,
  centuriao: 9,
  elefante: 14,
  senador: 7,
  arqueiro: 7,
  balista: 9.5,
  catapulta: 9.5,
  barricada: 7,
  escudeiro: 7.5,
};

export function paletaTropa(cor: string, escura: string): Paleta {
  return {
    K: '#140c22',
    M: '#b9c2dc',
    W: '#ffffff',
    S: '#e9b48a',
    G: '#f2c14e',
    B: '#7a4a2a',
    N: '#efe2bd',
    T: '#efe9dc',
    E: '#8d8a99',
    e: '#6a6878',
    C: cor,
    D: escura,
    P: '#9a8a78',
    p: '#6a5c50',
  };
}

/**
 * A manga da toga para a "carta na manga": o braço sai do canto de baixo à direita,
 * com dobras no tecido, a barra na cor do lado e a mão segurando a carta pela ponta.
 */
export const MANGA = desenhar(20, 16, [
  // tecido da toga (mais claro em cima, dobras em cinza)
  ['T', 11, 8, 7, 6],
  ['T', 9, 6, 6, 5],
  ['T', 8, 5, 4, 3],
  ['E', 13, 9, 5, 1],
  ['E', 15, 11, 3, 1],
  ['E', 11, 7, 3, 1],
  ['E', 16, 13, 2, 1],
  ['W', 10, 6, 2, 1],
  ['W', 12, 8, 2, 1],
  // barra da manga (punho), na cor do lado
  ['C', 7, 4, 4, 1],
  ['C', 6, 5, 2, 2],
  ['D', 8, 5, 1, 1],
  // mão segurando a carta
  ['S', 4, 2, 3, 3],
  ['S', 3, 1, 2, 1],
  ['S', 6, 1, 1, 1],
  ['S', 2, 2, 1, 1],
  ['K', 4, 3],
]);
