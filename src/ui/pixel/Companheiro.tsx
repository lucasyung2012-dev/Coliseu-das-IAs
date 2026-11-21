import type { CompanheiroHistoria } from '@/game/premiosHistoria';
import Sprite from './Sprite';
import { GAIVOTA, PALETA_GAIVOTA } from './historia3';
import { LUMEN, PALETA_LUMEN } from './historia5';
import { PAGINAS, PALETA_PAGINAS } from './historia6';

/**
 * O companheiro da História (prêmio de quem termina um caminho), em volta do
 * gladiador no Arcade: as páginas do Cassius voando, a Gaivota Sete ou o Lumen no ombro.
 * Carregado à parte (lazy) para o Arcade não levar os desenhos da História inteiros.
 */
export default function Companheiro({ qual, espelhar = false }: { qual: CompanheiroHistoria; espelhar?: boolean }) {
  if (qual === 'paginas')
    return (
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {[0, 1, 2].map((k) => (
          <div key={k} className="pagina-voando absolute w-[26%]" style={{ left: `${[2, 70, 40][k]}%`, top: `${[30, 22, 4][k]}%`, animationDelay: `${k * 700}ms` }}>
            <Sprite grade={PAGINAS} paleta={PALETA_PAGINAS} />
          </div>
        ))}
      </div>
    );
  const lado = espelhar ? { left: '6%' } : { right: '6%' };
  return (
    <div className="companheiro-ombro pointer-events-none absolute top-[14%] w-[34%]" style={lado} aria-hidden>
      {qual === 'gaivota' ? <Sprite grade={GAIVOTA} paleta={PALETA_GAIVOTA} espelhar={espelhar} /> : <Sprite grade={LUMEN} paleta={PALETA_LUMEN} espelhar={espelhar} />}
    </div>
  );
}
