import { useEffect, useState, type ReactNode } from 'react';
import { IAS, PERSONAGENS, type IaId } from '@/game/personagens';
import { GladiadorPixel } from '@/ui/pixel/Personagens';
import { useSequencia } from '@/ui/movimento';
import { CenaColiseu } from './Cenarios';
import { Clarao, Faiscas, Palco, Portoes } from './Palco';

// Fases: 0 sorteio do rival · 1 portões abrindo · 2 gladiadores entrando · 3 VS · 4 choque · 5 pronto.
const MARCOS = [1400, 2000, 3300, 4300, 5300];
const PRONTO = MARCOS.length;

const cor = (id: IaId) => `rgb(${PERSONAGENS[id].cor})`;

export default function IntroDuelo({ ia, rival, fim }: { ia: IaId; rival: IaId; fim: ReactNode }) {
  const [fase, pular] = useSequencia(MARCOS);
  const roleta = useRoleta(ia, rival, fase === 0);

  return (
    <div className="flex flex-col gap-5">
      <Palco rodando={fase < PRONTO} onPular={pular} className={fase === 4 ? 'tremer' : ''}>
        <CenaColiseu corA={cor(ia)} corB={cor(rival)} />

        {fase >= 2 && (
          <>
            <div className="entrar-esq absolute bottom-[6%] left-[12%] w-[19%]">
              <div className={fase >= 4 ? 'investida-esq' : ''}>
                <div className="respirar">
                  <GladiadorPixel ia={ia} />
                </div>
              </div>
            </div>
            <div className="entrar-dir absolute bottom-[6%] right-[12%] w-[19%]">
              <div className={fase >= 4 ? 'investida-dir' : ''}>
                <div className="respirar">
                  <GladiadorPixel ia={rival} espelhar />
                </div>
              </div>
            </div>
          </>
        )}

        {fase >= 3 && (
          <>
            {/* O deslocamento fica no pai: a animação "pancada" usa transform e apagaria o translate. */}
            <div className="absolute left-1/2 top-[22%] -translate-x-1/2">
              <p className="pancada neon font-pixel text-3xl text-accent sm:text-6xl">VS</p>
            </div>
            <NomePlaca lado="esq" id={ia} />
            <NomePlaca lado="dir" id={rival} />
          </>
        )}

        {fase === 4 && (
          <>
            <Faiscas x={50} y={58} />
            <Clarao />
          </>
        )}

        {fase >= PRONTO && (
          <div className="absolute left-1/2 top-[6%] -translate-x-1/2">
            <p className="pancada whitespace-nowrap font-pixel text-[10px] text-[rgb(242_193_78)] sm:text-base">QUE COMECE O DUELO!</p>
          </div>
        )}

        <Portoes abrindo={fase >= 1}>
          <p className="font-pixel text-[9px] text-muted sm:text-xs">SORTEANDO O RIVAL…</p>
          <div className="flex items-center gap-4 sm:gap-8">
            <div className="w-12 sm:w-24">
              <GladiadorPixel ia={ia} />
            </div>
            <span className="font-pixel text-sm text-accent sm:text-2xl">VS</span>
            <div className="w-12 sm:w-24">
              <GladiadorPixel ia={roleta} espelhar />
            </div>
          </div>
        </Portoes>
      </Palco>

      {fase >= PRONTO && <div className="animate-fade-up">{fim}</div>}
    </div>
  );
}

function NomePlaca({ lado, id }: { lado: 'esq' | 'dir'; id: IaId }) {
  const p = PERSONAGENS[id];
  return (
    <div
      className={`pancada absolute top-[40%] ${lado === 'esq' ? 'left-[2%]' : 'right-[2%] text-right'} bg-black/75 px-2 py-1.5 sm:px-3 sm:py-2`}
      style={{ borderBottom: `4px solid ${cor(id)}` }}
    >
      <p className="font-pixel text-[11px] sm:text-xl" style={{ color: cor(id), textShadow: `2px 2px 0 #000` }}>
        {p.gladiador.toUpperCase()}
      </p>
      <p className="mt-1 font-pixel text-[7px] text-fg sm:text-[10px]">
        {p.emblema} {p.ia.toUpperCase()}
      </p>
    </div>
  );
}

/** Enquanto sorteia, o rival fica trocando entre as duas outras IAs; no fim para no sorteado. */
function useRoleta(ia: IaId, rival: IaId, ativa: boolean): IaId {
  const [atual, setAtual] = useState<IaId>(rival);
  useEffect(() => {
    if (!ativa) {
      setAtual(rival);
      return;
    }
    const outras = IAS.filter((id) => id !== ia);
    let i = 0;
    const id = window.setInterval(() => {
      i++;
      setAtual(outras[i % outras.length]!);
    }, 110);
    return () => window.clearInterval(id);
  }, [ativa, ia, rival]);
  return ativa ? atual : rival;
}
