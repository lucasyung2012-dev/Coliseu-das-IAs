import { useSyncExternalStore } from 'react';

/** Preferências do jogador neste aparelho (aba Configurações). */
export interface Preferencias {
  /** Mostrar a sala de fliperama (moeda, liga, zoom) ao entrar no Arcade. */
  entradaFliperama: boolean;
  /** Reduzir animações (além do "reduzir movimento" do próprio aparelho). */
  menosMovimento: boolean;
}

const CHAVE = 'coliseu.preferencias';
const PADRAO: Preferencias = { entradaFliperama: true, menosMovimento: false };

function ler(): Preferencias {
  try {
    return { ...PADRAO, ...(JSON.parse(localStorage.getItem(CHAVE) ?? '{}') as Partial<Preferencias>) };
  } catch {
    return PADRAO;
  }
}

let atual = ler();
const ouvintes = new Set<() => void>();

/** A classe no <html> desliga as animações pelo CSS (styles/index.css). */
function aplicar() {
  if (typeof document !== 'undefined') document.documentElement.classList.toggle('menos-movimento', atual.menosMovimento);
}
aplicar();

export function obterPreferencias(): Preferencias {
  return atual;
}

export function mudarPreferencia<K extends keyof Preferencias>(k: K, v: Preferencias[K]) {
  atual = { ...atual, [k]: v };
  try {
    localStorage.setItem(CHAVE, JSON.stringify(atual));
  } catch {
    /* vale só nesta visita */
  }
  aplicar();
  ouvintes.forEach((f) => f());
}

export function usePreferencias(): Preferencias {
  return useSyncExternalStore(
    (f) => {
      ouvintes.add(f);
      return () => ouvintes.delete(f);
    },
    () => atual,
    () => atual,
  );
}
