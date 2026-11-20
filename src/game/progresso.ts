import { useSyncExternalStore } from 'react';
import { IAS, type IaId } from './personagens';
import { variacaoTrofeus, type Modo } from './ligas';
import { coliseuEmUso, premiosNovos, type EscolhaColiseu, type TipoPremio, type VisualColiseu } from './coliseu';

export interface Partida {
  id: string;
  quando: string;
  modo: Modo;
  ia: IaId;
  rival: IaId;
  venceu: boolean;
  /** Empate no Tribunal: sem troféus e metade do XP da vitória. */
  empate?: boolean;
  /** Partida de treino (jogador sem conta): não vale troféus nem XP. */
  treino?: boolean;
  trofeus: number;
  xp: number;
  dilema: string;
  /** Saiu no meio da partida: conta como derrota (para ninguém fugir quando está perdendo). */
  abandono?: boolean;
}

export interface PlacarModo {
  vitorias: number;
  derrotas: number;
  empates: number;
}

/** Números de cada IA para o perfil (só partidas que valem; treino não conta). */
export interface Estatisticas {
  duelo: PlacarModo;
  tribunal: PlacarModo;
  /** Vitórias seguidas agora e o recorde. */
  sequencia: number;
  melhorSequencia: number;
}

export interface Progresso {
  versao: 1;
  iaAtual: IaId;
  trofeus: Record<IaId, number>;
  xp: Record<IaId, number>;
  estatisticas: Record<IaId, Estatisticas>;
  partidas: Partida[];
  /** Meu baralho do Duelo: as 8 cartas escolhidas (ids). Conferido pelo motor do Duelo. */
  baralhoDuelo?: string[];
  /** Maior número de troféus que cada IA já teve: libera os prêmios do mapa (cair não tira). */
  recorde?: Partial<Record<IaId, number>>;
  /** Prêmios do mapa escolhidos por IA (arena, estandarte, comemoração). */
  coliseu?: Partial<Record<IaId, EscolhaColiseu>>;
  /** Quando o progresso mudou pela última vez (ISO). Decide qual cópia vale ao sincronizar. */
  atualizadoEm?: string;
}

const CHAVE = 'coliseu.progresso.v1';
const MAX_HISTORICO = 30;
export const XP_POR_NIVEL = 100;
export const NIVEL_MAXIMO = 100;
// XP de Maestria vem de todas as partidas que valem (decisão D4).
const XP_VITORIA = 40;
const XP_DERROTA = 20;
const XP_EMPATE = 20;

const zerado = (): Record<IaId, number> => ({ claude: 0, chatgpt: 0, gemini: 0 });
const placarZerado = (): PlacarModo => ({ vitorias: 0, derrotas: 0, empates: 0 });
export const estatisticasZeradas = (): Estatisticas => ({ duelo: placarZerado(), tribunal: placarZerado(), sequencia: 0, melhorSequencia: 0 });
const estatisticasDeTodas = (): Record<IaId, Estatisticas> => ({ claude: estatisticasZeradas(), chatgpt: estatisticasZeradas(), gemini: estatisticasZeradas() });

export function progressoInicial(): Progresso {
  return { versao: 1, iaAtual: 'claude', trofeus: zerado(), xp: zerado(), estatisticas: estatisticasDeTodas(), partidas: [] };
}

/** Confere e completa um progresso vindo do aparelho ou da nuvem; null se não for válido. */
export function validarProgresso(bruto: unknown): Progresso | null {
  const p = bruto as Partial<Progresso> | null;
  if (!p || p.versao !== 1 || !p.iaAtual || !IAS.includes(p.iaAtual)) return null;
  return {
    ...progressoInicial(),
    ...p,
    trofeus: { ...zerado(), ...p.trofeus },
    xp: { ...zerado(), ...p.xp },
    estatisticas: Object.fromEntries(IAS.map((ia) => [ia, { ...estatisticasZeradas(), ...p.estatisticas?.[ia] }])) as Record<IaId, Estatisticas>,
    partidas: Array.isArray(p.partidas) ? p.partidas : [],
  } as Progresso;
}

// O progresso fica salvo neste aparelho e, com a conta do Dropbox, também na nuvem.
// Se o navegador bloquear o armazenamento, o jogo segue funcionando e só não guarda.
function ler(): Progresso {
  try {
    const bruto = localStorage.getItem(CHAVE);
    return (bruto && validarProgresso(JSON.parse(bruto))) || progressoInicial();
  } catch {
    return progressoInicial();
  }
}

let atual: Progresso | null = null;
const ouvintes = new Set<() => void>();
const aoMudarOuvintes = new Set<() => void>();

export function obterProgresso(): Progresso {
  if (!atual) atual = ler();
  return atual;
}

function gravar(novo: Progresso) {
  atual = novo;
  try {
    localStorage.setItem(CHAVE, JSON.stringify(novo));
  } catch {
    /* sem armazenamento: fica só na memória */
  }
  ouvintes.forEach((f) => f());
}

/** Toda mudança feita pelo jogador: grava com a hora e avisa a sincronização. */
function salvar(novo: Progresso) {
  gravar({ ...novo, atualizadoEm: new Date().toISOString() });
  aoMudarOuvintes.forEach((f) => f());
}

/** Troca o progresso inteiro pela cópia da nuvem (sem avisar a sincronização de volta). */
export function substituirProgresso(p: Progresso) {
  gravar(p);
}

/** A sincronização se inscreve aqui para enviar à nuvem depois de cada mudança. */
export function aoMudarProgresso(f: () => void): () => void {
  aoMudarOuvintes.add(f);
  return () => aoMudarOuvintes.delete(f);
}

export function useProgresso(): Progresso {
  return useSyncExternalStore(
    (f) => {
      ouvintes.add(f);
      return () => ouvintes.delete(f);
    },
    obterProgresso,
    obterProgresso,
  );
}

export function escolherIa(ia: IaId) {
  salvar({ ...obterProgresso(), iaAtual: ia });
}

/** Salva o meu baralho do Duelo (fica para os próximos combates e vai para a nuvem). */
export function escolherBaralho(cartas: string[]) {
  salvar({ ...obterProgresso(), baralhoDuelo: [...cartas] });
}

/** Recorde de troféus da IA (nunca menor que os troféus de agora). */
export function recordeDe(p: Progresso, ia: IaId): number {
  return Math.max(p.recorde?.[ia] ?? 0, p.trofeus[ia]);
}

/** O visual do Coliseu em uso por esta IA. */
export function coliseuDe(p: Progresso, ia: IaId): VisualColiseu {
  return coliseuEmUso(recordeDe(p, ia), p.coliseu?.[ia]);
}

export function useColiseu(ia: IaId): VisualColiseu {
  return coliseuDe(useProgresso(), ia);
}

/** Escolhe no mapa um prêmio já ganho para usar (vale só para esta IA). */
export function escolherPremio(ia: IaId, tipo: TipoPremio, id: string) {
  const p = obterProgresso();
  salvar({ ...p, coliseu: { ...p.coliseu, [ia]: { ...p.coliseu?.[ia], [tipo]: id } } });
}

export function nivelMaestria(xp: number): number {
  return Math.min(NIVEL_MAXIMO, Math.floor(xp / XP_POR_NIVEL) + 1);
}

/** Registra o resultado e devolve a partida com a variação de troféus e XP aplicada. */
export function registrarPartida(dados: Pick<Partida, 'modo' | 'ia' | 'rival' | 'venceu' | 'empate' | 'treino' | 'dilema' | 'abandono'>): Partida {
  // A partida acabou de verdade: não está mais "em andamento".
  fecharPartidaAberta();
  const p = obterProgresso();
  const trofeus = dados.treino || dados.empate ? 0 : variacaoTrofeus(dados.modo, p.trofeus[dados.ia], dados.venceu);
  const xp = dados.treino ? 0 : dados.empate ? XP_EMPATE : dados.venceu ? XP_VITORIA : XP_DERROTA;
  const partida: Partida = {
    ...dados,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    quando: new Date().toISOString(),
    trofeus,
    xp,
  };
  // Recorde novo: os prêmios novos entram sozinhos (tira a escolha antiga daquele tipo).
  const recordeAntes = recordeDe(p, dados.ia);
  const recordeDepois = Math.max(recordeAntes, p.trofeus[dados.ia] + trofeus);
  const escolha: EscolhaColiseu = { ...p.coliseu?.[dados.ia] };
  for (const premio of premiosNovos(recordeAntes, recordeDepois)) delete escolha[premio.tipo];
  salvar({
    ...p,
    trofeus: { ...p.trofeus, [dados.ia]: p.trofeus[dados.ia] + trofeus },
    recorde: { ...p.recorde, [dados.ia]: recordeDepois },
    coliseu: { ...p.coliseu, [dados.ia]: escolha },
    xp: { ...p.xp, [dados.ia]: p.xp[dados.ia] + xp },
    estatisticas: dados.treino ? p.estatisticas : { ...p.estatisticas, [dados.ia]: somarResultado(p.estatisticas[dados.ia], dados) },
    partidas: [partida, ...p.partidas].slice(0, MAX_HISTORICO),
  });
  return partida;
}

function somarResultado(e: Estatisticas, d: Pick<Partida, 'modo' | 'venceu' | 'empate'>): Estatisticas {
  const placar = { ...e[d.modo] };
  if (d.empate) placar.empates++;
  else if (d.venceu) placar.vitorias++;
  else placar.derrotas++;
  // Empate não quebra nem aumenta a sequência de vitórias.
  const sequencia = d.empate ? e.sequencia : d.venceu ? e.sequencia + 1 : 0;
  return { ...e, [d.modo]: placar, sequencia, melhorSequencia: Math.max(e.melhorSequencia, sequencia) };
}

/** Total de partidas que valem, somando os dois modos. */
export function totalPartidas(e: Estatisticas): number {
  return [e.duelo, e.tribunal].reduce((s, m) => s + m.vitorias + m.derrotas + m.empates, 0);
}

/** Apaga tudo (com conta, a cópia zerada também vai para a nuvem, por ser a mais nova). */
export function redefinirProgresso() {
  salvar(progressoInicial());
}

/**
 * Junta duas cópias do progresso. Na primeira sincronização de um aparelho, soma
 * o melhor dos dois (maior troféu e XP de cada IA, histórico unido), para nada se
 * perder. Depois disso vale a cópia alterada por último.
 */
export function juntarProgresso(local: Progresso, nuvem: Progresso, primeiraVez: boolean): Progresso {
  if (!primeiraVez) return (nuvem.atualizadoEm ?? '') > (local.atualizadoEm ?? '') ? nuvem : local;
  const maior = (a: Record<IaId, number>, b: Record<IaId, number>) =>
    Object.fromEntries(IAS.map((ia) => [ia, Math.max(a[ia], b[ia])])) as Record<IaId, number>;
  const vistas = new Set<string>();
  const partidas = [...local.partidas, ...nuvem.partidas]
    .filter((pt) => (vistas.has(pt.id) ? false : (vistas.add(pt.id), true)))
    .sort((a, b) => b.quando.localeCompare(a.quando))
    .slice(0, MAX_HISTORICO);
  const maisNovo = (nuvem.atualizadoEm ?? '') > (local.atualizadoEm ?? '') ? nuvem : local;
  return {
    ...maisNovo,
    trofeus: maior(local.trofeus, nuvem.trofeus),
    xp: maior(local.xp, nuvem.xp),
    recorde: Object.fromEntries(IAS.map((ia) => [ia, Math.max(recordeDe(local, ia), recordeDe(nuvem, ia))])) as Record<IaId, number>,
    // Estatísticas: fica a cópia com mais partidas jogadas de cada IA.
    estatisticas: Object.fromEntries(
      IAS.map((ia) => [ia, totalPartidas(nuvem.estatisticas[ia]) > totalPartidas(local.estatisticas[ia]) ? nuvem.estatisticas[ia] : local.estatisticas[ia]]),
    ) as Record<IaId, Estatisticas>,
    partidas,
    atualizadoEm: new Date().toISOString(),
  };
}

// ---------- Sair no meio = derrota ----------
// Ao começar uma partida, ela fica marcada como "em andamento" neste aparelho.
// Se o jogador sair (voltar ao Arcade, fechar o app ou recarregar) antes do fim,
// a partida vale como derrota: assim ninguém foge quando está perdendo.

const CHAVE_ABERTA = 'coliseu.partida.aberta';
type PartidaAberta = Pick<Partida, 'modo' | 'ia' | 'rival' | 'treino' | 'dilema'>;

export function marcarPartidaAberta(dados: PartidaAberta) {
  try {
    localStorage.setItem(CHAVE_ABERTA, JSON.stringify(dados));
  } catch {
    /* sem armazenamento: não dá para marcar */
  }
}

export function fecharPartidaAberta() {
  try {
    localStorage.removeItem(CHAVE_ABERTA);
  } catch {
    /* nada a fazer */
  }
}

export function temPartidaAberta(): boolean {
  try {
    return localStorage.getItem(CHAVE_ABERTA) !== null;
  } catch {
    return false;
  }
}

/** Se ficou uma partida em andamento, registra como derrota (abandono). */
export function registrarAbandono(): Partida | null {
  let dados: PartidaAberta | null = null;
  try {
    const bruto = localStorage.getItem(CHAVE_ABERTA);
    dados = bruto ? (JSON.parse(bruto) as PartidaAberta) : null;
  } catch {
    dados = null;
  }
  if (!dados || !IAS.includes(dados.ia) || !IAS.includes(dados.rival)) {
    fecharPartidaAberta();
    return null;
  }
  return registrarPartida({ ...dados, venceu: false, empate: false, abandono: true });
}
