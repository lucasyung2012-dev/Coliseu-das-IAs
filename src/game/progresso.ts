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
  trofeus: number;
  xp: number;
  dilema: string;
}

export interface Progresso {
  versao: 1;
  iaAtual: IaId;
  trofeus: Record<IaId, number>;
  xp: Record<IaId, number>;
  partidas: Partida[];
}

const CHAVE = 'coliseu.progresso.v1';
const MAX_HISTORICO = 30;
export const XP_POR_NIVEL = 100;
export const NIVEL_MAXIMO = 100;
// XP de Maestria vem de todas as partidas (decisão D4).
const XP_VITORIA = 40;
const XP_DERROTA = 20;
const XP_EMPATE = 20;

const zerado = (): Record<IaId, number> => ({ claude: 0, chatgpt: 0, gemini: 0 });

export function progressoInicial(): Progresso {
  return { versao: 1, iaAtual: 'claude', trofeus: zerado(), xp: zerado(), partidas: [] };
}

// O progresso fica só neste aparelho (decisão D3). Se o navegador bloquear o
// armazenamento, o jogo segue funcionando e só não guarda entre visitas.
function ler(): Progresso {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (!bruto) return progressoInicial();
    const p = JSON.parse(bruto) as Progresso;
    if (p.versao !== 1 || !IAS.includes(p.iaAtual)) return progressoInicial();
    return { ...progressoInicial(), ...p, trofeus: { ...zerado(), ...p.trofeus }, xp: { ...zerado(), ...p.xp } };
  } catch {
    return progressoInicial();
  }
}

let atual: Progresso | null = null;
const ouvintes = new Set<() => void>();

function obter(): Progresso {
  if (!atual) atual = ler();
  return atual;
}

function salvar(novo: Progresso) {
  atual = novo;
  try {
    localStorage.setItem(CHAVE, JSON.stringify(novo));
  } catch {
    /* sem armazenamento: fica só na memória */
  }
  ouvintes.forEach((f) => f());
}

export function useProgresso(): Progresso {
  return useSyncExternalStore(
    (f) => {
      ouvintes.add(f);
      return () => ouvintes.delete(f);
    },
    obter,
    obter,
  );
}

export function escolherIa(ia: IaId) {
  salvar({ ...obter(), iaAtual: ia });
}

export function nivelMaestria(xp: number): number {
  return Math.min(NIVEL_MAXIMO, Math.floor(xp / XP_POR_NIVEL) + 1);
}

/** Registra o resultado e devolve a partida com a variação de troféus e XP aplicada. */
export function registrarPartida(dados: Pick<Partida, 'modo' | 'ia' | 'rival' | 'venceu' | 'empate' | 'dilema'>): Partida {
  const p = obter();
  const trofeus = dados.empate ? 0 : variacaoTrofeus(dados.modo, p.trofeus[dados.ia], dados.venceu);
  const xp = dados.empate ? XP_EMPATE : dados.venceu ? XP_VITORIA : XP_DERROTA;
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
    partidas: [partida, ...p.partidas].slice(0, MAX_HISTORICO),
  });
  return partida;
}

/** Só para testes e para o "redefinir progresso". */
export function redefinirProgresso() {
  salvar(progressoInicial());
}
