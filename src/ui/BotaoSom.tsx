import { useEffect } from 'react';
import { alternarSom, tocar, useSomLigado, type NomeSom } from './som';

/** Botão fixo no canto para ligar e desligar todos os sons. */
export default function BotaoSom() {
  const ligado = useSomLigado();
  return (
    <button
      type="button"
      onClick={() => {
        alternarSom();
        tocar('clique');
      }}
      aria-label={ligado ? 'Desligar sons' : 'Ligar sons'}
      aria-pressed={ligado}
      className="fixed z-40 bg-black/70 px-2 py-1.5 font-pixel text-[10px] text-fg shadow-[0_0_0_2px_rgb(var(--line))] hover:text-accent"
      style={{ right: 'max(12px, env(safe-area-inset-right, 0px))', bottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' }}
    >
      {ligado ? '🔊 SOM' : '🔇 MUDO'}
    </button>
  );
}

/** Toca o som de cada fase de um "filminho" quando ela começa. */
export function useSonsDaFase(fase: number, sons: Partial<Record<number, NomeSom | (() => void)>>) {
  useEffect(() => {
    const s = sons[fase];
    if (typeof s === 'function') s();
    else if (s) tocar(s);
    // Só a mudança de fase dispara o som; o mapa é fixo por tela.
  }, [fase]);
}
