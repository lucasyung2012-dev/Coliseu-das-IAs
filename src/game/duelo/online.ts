/**
 * Duelo online (sala por código, combinado com o Lucas): o aparelho de quem cria a
 * sala é o JUIZ (roda a partida, lado "eu" do motor) e manda o estado ~10 vezes por
 * segundo; o convidado (lado "rival") só manda as jogadas. Partida amistosa: não
 * vale troféus. Cada um leva o seu "cartão de visita" (IA, liga, Maestria, prêmios
 * do mapa) e vê a SUA arena. A mesma conta dos dois lados não pode jogar.
 */
import type { IaId } from '../personagens';
import type { Visual } from '../maestria';
import type { VisualColiseu } from '../coliseu';
import type { LadoId } from '../tribunal/dilemas';
import type { EstadoDuelo, TipoCarta } from './motor';
import type { EstadoTribunal, Habilidade } from '../tribunal/motor';

/** Muda quando as mensagens mudarem: aparelhos com versões diferentes não se misturam. */
export const VERSAO_ONLINE = 3;

export interface CartaoCombatente {
  versao: number;
  ia: IaId;
  /** Liga (0 a 4) pelo recorde de troféus: equipamento e tamanho do gladiador. */
  liga: number;
  visual: Visual;
  imperador: boolean;
  coliseu: VisualColiseu;
  baralho: TipoCarta[];
  /** Confirmou o baralho na sala (o COMEÇAR só libera com os dois prontos). */
  pronto: boolean;
  /** Impressão digital da conta (sem nome nem e-mail); null = jogando sem conta. */
  conta: string | null;
}

export type AcaoOnline = { tipo: 'carta'; id: string; carga: number } | { tipo: 'golpe' };

/** Jogadas do convidado no Tribunal online. */
export type AcaoTribunal = { tipo: 'carta'; id: string } | { tipo: 'habilidade'; h: Habilidade };

export type ModoOnline = 'duelo' | 'tribunal';

export type MensagemOnline =
  | { t: 'ola'; cartao: CartaoCombatente }
  | { t: 'comecar'; config: { lado: LadoId; dilema: number }; inicial: EstadoDuelo }
  | { t: 'acao'; acao: AcaoOnline }
  | { t: 'estado'; e: EstadoDuelo }
  | { t: 'modo'; modo: ModoOnline }
  | { t: 'comecar-tribunal'; inicial: EstadoTribunal }
  | { t: 'estado-tribunal'; e: EstadoTribunal; restante: number }
  | { t: 'acao-tribunal'; acao: AcaoTribunal }
  | { t: 'revanche' }
  | { t: 'sair' }
  /** Só local: o outro aparelho está com outra versão do jogo (precisa recarregar). */
  | { t: 'versao-diferente' };

// Palavras do Coliseu para o código da sala (sem acento, fáceis de ditar).
const PALAVRAS = ['LEAO', 'AGUIA', 'LOBA', 'TOURO', 'CORUJA', 'URSO', 'FALCAO', 'JAVALI', 'ELMO', 'ESCUDO', 'LANCA', 'TOCHA'];

export function novoCodigo(aleatorio: () => number = Math.random): string {
  const palavra = PALAVRAS[Math.floor(aleatorio() * PALAVRAS.length)]!;
  const numero = 10 + Math.floor(aleatorio() * 90);
  return `${palavra}-${numero}`;
}

/** Aceita o que a pessoa digitar: "leão 42", "Leao-42", "LEAO42" → "LEAO-42". */
export function normalizarCodigo(texto: string): string | null {
  const limpo = texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
  const m = /^([A-Z]+)(\d{2})$/.exec(limpo);
  return m ? `${m[1]}-${m[2]}` : null;
}

/** A mesma conta dos dois lados não joga (seria jogar contra você mesmo). */
export function mesmaConta(a: CartaoCombatente, b: CartaoCombatente): boolean {
  return !!a.conta && a.conta === b.conta;
}

/** O resultado visto pelo convidado é o contrário do que o motor diz (o motor é do juiz). */
export function resultadoDe(papel: 'anfitriao' | 'convidado', r: 'vitoria' | 'derrota' | 'empate'): 'vitoria' | 'derrota' | 'empate' {
  if (papel === 'anfitriao' || r === 'empate') return r;
  return r === 'vitoria' ? 'derrota' : 'vitoria';
}

/** Confere uma mensagem que chegou (de outro aparelho, então não dá para confiar de olhos fechados). */
export function lerMensagem(bruto: unknown): MensagemOnline | null {
  if (!bruto || typeof bruto !== 'object') return null;
  const m = bruto as { t?: unknown };
  if (m.t === 'ola') {
    const c = (bruto as { cartao?: Partial<CartaoCombatente> }).cartao;
    if (c && typeof c.versao === 'number' && c.versao !== VERSAO_ONLINE) return { t: 'versao-diferente' };
    if (!c || c.versao !== VERSAO_ONLINE || !['claude', 'chatgpt', 'gemini'].includes(c.ia as string) || !Array.isArray(c.baralho)) return null;
    return bruto as MensagemOnline;
  }
  const conhecidas = ['comecar', 'acao', 'estado', 'modo', 'comecar-tribunal', 'estado-tribunal', 'acao-tribunal', 'revanche', 'sair'];
  if (typeof m.t === 'string' && conhecidas.includes(m.t)) return bruto as MensagemOnline;
  return null;
}
