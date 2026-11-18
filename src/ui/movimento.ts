import { useEffect, useState } from 'react';
import { obterPreferencias } from './preferencias';

/**
 * Respeita o "reduzir movimento" do aparelho e a opção "Reduzir animações" das
 * Configurações. O jsdom dos testes não tem matchMedia.
 */
export function prefereMenosMovimento(): boolean {
  if (obterPreferencias().menosMovimento) return true;
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Linha do tempo de uma animação em fases. `marcos[i]` é o momento (ms) em que a
 * fase vira i + 1. Devolve a fase atual e uma função para pular direto ao fim.
 * Mudar `rodada` recomeça do zero (botão "ver de novo").
 */
export function useSequencia(marcos: number[], rodada = 0): [number, () => void] {
  const total = marcos.length;
  const [fase, setFase] = useState(() => (prefereMenosMovimento() ? total : 0));

  useEffect(() => {
    if (prefereMenosMovimento()) {
      setFase(total);
      return;
    }
    setFase(0);
    const ids = marcos.map((ms, i) => window.setTimeout(() => setFase((f) => Math.max(f, i + 1)), ms));
    return () => ids.forEach((id) => window.clearTimeout(id));
    // Só a rodada reinicia a linha do tempo; os marcos são fixos por tela.
  }, [rodada]);

  return [fase, () => setFase(total)];
}
