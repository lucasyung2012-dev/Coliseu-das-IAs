import { useEffect } from 'react';
import Sprite from '@/ui/pixel/Sprite';
import { LOUROS, PALETA_OURO } from '@/ui/pixel/sprites';
import { useSequencia } from '@/ui/movimento';

// Fases: 0 linha acendendo · 1 tela falhando ("travando") · 2 liga total · 3 some · 4 fim.
const MARCOS = [520, 1620, 2950, 3370];

export default function BootArcade({ onFim }: { onFim: () => void }) {
  const [fase, pular] = useSequencia(MARCOS);

  useEffect(() => {
    if (fase >= MARCOS.length) onFim();
  }, [fase, onFim]);

  return (
    <div
      data-area="arcade"
      role="button"
      tabIndex={0}
      aria-label="Fliperama ligando. Toque para pular."
      onClick={pular}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') && pular()}
      className={`fixed inset-0 z-50 flex cursor-pointer items-center justify-center overflow-hidden bg-black ${fase === 3 ? 'sumir' : ''}`}
    >
      {fase === 0 && <div className="crt-linha absolute inset-0 bg-[rgb(220_255_250)]" />}

      {fase >= 1 && (
        <div className={`flex w-full flex-col items-center gap-6 px-4 text-center ${fase === 1 ? 'crt-falha' : 'crt-acender'}`}>
          <div className="flex items-center gap-3 sm:gap-6">
            <Sprite grade={LOUROS} paleta={PALETA_OURO} escala={5} />
            <div>
              <p className="font-pixel text-[10px] tracking-[0.3em] text-accent-2 sm:text-xs">S.P.Q.R. · MMXXVI</p>
              <h1 className="neon mt-3 font-pixel text-2xl leading-tight text-accent sm:text-5xl">
                IMPERIUM
                <br />
                ARCADE
              </h1>
            </div>
            <Sprite grade={LOUROS} paleta={PALETA_OURO} escala={5} espelhar />
          </div>
          {fase >= 2 && <p className="piscar font-pixel text-xs text-[rgb(242_193_78)] sm:text-sm">INSERT COIN</p>}
        </div>
      )}

      <div className="crt-overlay" />
      <span className="absolute bottom-4 right-4 font-pixel text-[9px] text-muted">TOQUE PARA PULAR</span>
    </div>
  );
}
