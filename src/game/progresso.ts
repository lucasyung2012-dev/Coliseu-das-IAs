import { useSyncExternalStore } from 'react';
import { IAS, type IaId } from './personagens';
import { variacaoTrofeus, type Modo } from './ligas';

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

export function nivelMaestria(xp: number): number {
  return Math.min(NIVEL_MAXIMO, Math.floor(xp / XP_POR_NIVEL) + 1);
}

/** Registra o resultado e devolve a partida com a variação de troféus e XP aplicada. */
export function registrarPartida(dados: Pick<Partida, 'modo' | 'ia' | 'rival' | 'venceu' | 'empate' | 'treino' | 'dilema'>): Partida {
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
  salvar({
    ...p,
    trofeus: { ...p.trofeus, [dados.ia]: p.trofeus[dados.ia] + trofeus },
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
    // Estatísticas: fica a cópia com mais partidas jogadas de cada IA.
    estatisticas: Object.fromEntries(
      IAS.map((ia) => [ia, totalPartidas(nuvem.estatisticas[ia]) > totalPartidas(local.estatisticas[ia]) ? nuvem.estatisticas[ia] : local.estatisticas[ia]]),
    ) as Record<IaId, Estatisticas>,
    partidas,
    atualizadoEm: new Date().toISOString(),
  };
}
