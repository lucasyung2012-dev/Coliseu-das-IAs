import type { ReactNode } from 'react';
import { PERSONAGENS, type IaId } from '@/game/personagens';
import { JURADOS, type JuradoId } from '@/game/jurados';
import { GladiadorPixel, JuradoPixel, PretorPixel } from '@/ui/pixel/Personagens';
import Sprite from '@/ui/pixel/Sprite';
import { MARTELO, PALETA_MARTELO } from '@/ui/pixel/sprites';
import { useSequencia } from '@/ui/movimento';
import { tocar } from '@/ui/som';
import { useSonsDaFase } from '@/ui/BotaoSom';
import { CenaTribunal } from './Cenarios';
import { Clarao, Palco, Portoes } from './Palco';

// Fases: 0 portões fechados · 1 abrindo · 2 Pretor sobe · 3 jurados chegam · 4 combatentes nas tribunas
// · 5 martelada · 6 pronto.
const MARCOS = [700, 1400, 2100, 3700, 4500, 5500];
const PRONTO = MARCOS.length;

// Centro (em % da largura) de cada uma das 5 cadeiras do júri.
const CADEIRAS = [18, 34, 50, 66, 82];

const cor = (id: IaId) => `rgb(${PERSONAGENS[id].cor})`;

export default function IntroTribunal({ ia, rival, jurados, fim }: { ia: IaId; rival: IaId; jurados: JuradoId[]; fim: ReactNode }) {
  const [fase, pular] = useSequencia(MARCOS);
  useSonsDaFase(fase, {
    1: 'portao',
    2: 'pretor',
    // um "pop" para cada jurado, no mesmo ritmo em que eles aparecem
    3: () => jurados.forEach((_, i) => window.setTimeout(() => tocar('jurado'), i * 260)),
    4: 'passos',
    5: 'martelo',
  });

  return (
    <div className="flex flex-col gap-5">
      <Palco rodando={fase < PRONTO} onPular={pular} className={fase === 5 ? 'tremer' : ''}>
        <CenaTribunal />

        {fase >= 2 && (
          <div className="subir absolute left-[44.5%] top-[18%] w-[11%]">
            <PretorPixel />
          </div>
        )}
        {fase >= 2 && (
          <div className="absolute left-[56%] top-[25%] w-[6%]">
            <div className={fase >= 5 ? 'martelada' : ''}>
              <Sprite grade={MARTELO} paleta={PALETA_MARTELO} />
            </div>
          </div>
        )}

        {fase >= 3 &&
          jurados.map((j, i) => (
            <div
              key={j}
              className="surgir absolute top-[50%] w-[8%]"
              style={{ left: `${CADEIRAS[i]! - 4}%`, animationDelay: `${i * 260}ms` }}
            >
              <JuradoPixel jurado={j} />
            </div>
          ))}

        {fase >= 4 && (
          <>
            <Tribuna lado="esq" id={ia} />
            <Tribuna lado="dir" id={rival} />
          </>
        )}

        {fase === 5 && <Clarao />}
        {fase >= 5 && (
          <div className="absolute left-1/2 top-[4%] -translate-x-1/2">
            <p className="pancada neon whitespace-nowrap font-pixel text-[10px] text-accent sm:text-lg">A SESSÃO ESTÁ ABERTA</p>
          </div>
        )}

        <Portoes abrindo={fase >= 1}>
          <p className="font-pixel text-[9px] text-[rgb(242_193_78)] sm:text-sm">⚖ TRIBUNAL ⚖</p>
          <p className="font-pixel text-[8px] text-muted sm:text-[10px]">O PRETOR SUPREMO VAI ABRIR A SESSÃO</p>
        </Portoes>
      </Palco>

      {fase >= 3 && (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-5" aria-label="Jurados desta sessão">
          {jurados.map((j, i) => (
            <li key={j} className="surgir pixel-box flex flex-col items-center p-2 text-center" style={{ animationDelay: `${i * 260}ms` }}>
              <div className="w-10">
                <JuradoPixel jurado={j} />
              </div>
              <p className="mt-1 max-w-full font-pixel text-[7px] [overflow-wrap:anywhere] sm:text-[8px]" style={{ color: JURADOS[j].toga }}>
                {JURADOS[j].nome.toUpperCase()}
              </p>
              <p className="mt-1 text-[11px] text-muted">{JURADOS[j].jeito}</p>
            </li>
          ))}
        </ul>
      )}

      {fase >= PRONTO && <div className="animate-fade-up">{fim}</div>}
    </div>
  );
}

/** Combatente atrás da sua tribuna, num canto da frente do tribunal. */
function Tribuna({ lado, id }: { lado: 'esq' | 'dir'; id: IaId }) {
  const pos = lado === 'esq' ? 'left-[1%]' : 'right-[1%]';
  return (
    <div className={`subir absolute bottom-0 ${pos} w-[16%]`}>
      <div className="mx-auto w-[80%] translate-y-[18%]">
        <GladiadorPixel ia={id} espelhar={lado === 'dir'} />
      </div>
      <div className="relative flex h-[5vw] max-h-14 items-center justify-center bg-[#6b3f22]" style={{ borderTop: `4px solid ${cor(id)}` }}>
        <p className="font-pixel text-[8px] sm:text-sm" style={{ color: cor(id), textShadow: '2px 2px 0 #000' }}>
          {PERSONAGENS[id].gladiador.toUpperCase()}
        </p>
      </div>
    </div>
  );
}
