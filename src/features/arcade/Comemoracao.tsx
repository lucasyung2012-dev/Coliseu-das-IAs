import { useEffect, type CSSProperties, type ReactNode } from 'react';
import type { ComemoracaoId } from '@/game/coliseu';
import type { IaId } from '@/game/personagens';
import Sprite from '@/ui/pixel/Sprite';
import { tocar } from '@/ui/som';

/**
 * Comemoração de vitória (prêmios do mapa de troféus), 4 de cada combatente,
 * por trás do texto da tela de fim. Só visual.
 * Cassius: folhas de oliveira, pergaminho, sinos, lanternas.
 * Octavius: moedas, bandeiras dos planos A/B/C, tambores, canhões de confete.
 * Helios: estrelas cadentes, chuva de luz, aurora, eclipse.
 */
const FOLHA = ['..GG', '.GGG', 'GGG.', 'GG..'];
const SINO = ['..YY..', '.YYYY.', '.YYYY.', 'YYYYYY', 'YYYYYY', '..YY..'];
const LANTERNA = ['.KK.', 'RRRR', 'RYYR', 'RYYR', 'RRRR', '.KK.'];
const MOEDA = ['.YY.', 'YWYY', 'YYYY', '.YY.'];
const TAMBOR = ['WWWWWW', 'RYRYRY', 'RRRRRR', 'RYRYRY', 'WWWWWW'];
const CORES_CONFETE = ['#ff5ab8', '#4ef0dc', '#f2c14e', '#9f7bff', '#ff8a4a', '#ffffff'];

// Posições fixas (o mesmo desenho toda vez), espalhadas pela largura.
const pedacos = (n: number) => Array.from({ length: n }, (_, i) => ({ x: (i * 37 + 7) % 100, atraso: (i * 173) % 1400, giro: (i * 47) % 360 }));

function Caindo({ n, children, classe = 'comemora-cair', largura = 'w-3 sm:w-4' }: { n: number; children: (i: number) => ReactNode; classe?: string; largura?: string }) {
  return (
    <>
      {pedacos(n).map((p, i) => (
        <span
          key={i}
          className={`${classe} absolute ${classe === 'comemora-subir' ? 'bottom-0' : 'top-0'} ${largura}`}
          style={{ left: `${p.x}%`, animationDelay: `${p.atraso}ms`, '--giro': `${p.giro}deg` } as CSSProperties}
        >
          {children(i)}
        </span>
      ))}
    </>
  );
}

function Explosao({ x, y, cor, atraso }: { x: number; y: number; cor: string; atraso: number }) {
  return (
    <div className="absolute" style={{ left: `${x}%`, top: `${y}%` }}>
      {Array.from({ length: 10 }, (_, k) => (
        <span
          key={k}
          className="comemora-fogo absolute h-1.5 w-1.5 sm:h-2 sm:w-2"
          style={{ background: cor, boxShadow: `0 0 6px ${cor}`, animationDelay: `${atraso}ms`, '--ang': `${k * 36}deg` } as CSSProperties}
        />
      ))}
    </div>
  );
}

export default function Comemoracao({ tipo }: { tipo: ComemoracaoId; ia?: IaId }) {
  useEffect(() => {
    if (tipo === 'nenhuma') return;
    if (tipo === 'tambores' || tipo === 'sinos') [0, 300, 600].forEach((ms) => window.setTimeout(() => tocar('martelo'), ms));
    else if (tipo === 'folhas' || tipo === 'moedas' || tipo === 'luz') tocar('plateia');
    else tocar('fanfarra');
  }, [tipo]);

  if (tipo === 'nenhuma') return null;
  return (
    <div className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${tipo === 'tambores' ? 'tremer' : ''}`} aria-hidden>
      {/* ---- Cassius ---- */}
      {tipo === 'folhas' && <Caindo n={18}>{() => <Sprite grade={FOLHA} paleta={{ G: '#7aa040' }} />}</Caindo>}
      {tipo === 'pergaminho' && (
        <div className="comemora-desenrolar absolute left-1/2 top-3 w-[60%] -translate-x-1/2 border-y-4 border-[#7a4a22] bg-[#f0dcae] py-2 text-center font-pixel text-[10px] text-[#5a3414] sm:text-sm">
          ✦ VICTORIA ✦
        </div>
      )}
      {tipo === 'sinos' &&
        ['left-3', 'right-3'].map((lado) => (
          <div key={lado} className={`comemora-balancar absolute top-2 w-8 sm:w-12 ${lado}`}>
            <Sprite grade={SINO} paleta={{ Y: '#f2c14e' }} />
          </div>
        ))}
      {tipo === 'lanternas' && (
        <Caindo n={12} classe="comemora-subir">
          {() => <Sprite grade={LANTERNA} paleta={{ K: '#3a2414', R: '#e0602c', Y: '#ffd04a' }} />}
        </Caindo>
      )}

      {/* ---- Octavius ---- */}
      {tipo === 'moedas' && <Caindo n={20}>{() => <Sprite grade={MOEDA} paleta={{ Y: '#f2c14e', W: '#fff2b0' }} />}</Caindo>}
      {tipo === 'bandeiras' && (
        <div className="absolute inset-x-0 bottom-0 flex justify-center gap-[10%]">
          {['A', 'B', 'C'].map((letra, i) => (
            <div key={letra} className="comemora-hastear flex flex-col items-start" style={{ animationDelay: `${i * 250}ms` }}>
              <span className="grid h-7 w-9 place-items-center font-pixel text-xs text-black sm:h-9 sm:w-12" style={{ background: ['#40dcaa', '#f2c14e', '#ff8a4a'][i] }}>
                {letra}
              </span>
              <span className="ml-0 block h-16 w-1 bg-[#5a3418] sm:h-24" />
            </div>
          ))}
        </div>
      )}
      {tipo === 'tambores' &&
        ['left-2', 'right-2'].map((lado) => (
          <div key={lado} className={`comemora-soprar absolute bottom-2 w-10 sm:w-14 ${lado}`}>
            <Sprite grade={TAMBOR} paleta={{ W: '#f0e0c0', R: '#c0283c', Y: '#f2c14e' }} />
          </div>
        ))}
      {tipo === 'canhoes' && (
        <>
          <Explosao x={8} y={70} cor="#40dcaa" atraso={0} />
          <Explosao x={92} y={70} cor="#f2c14e" atraso={400} />
          <Caindo n={24} largura="h-1.5 w-1.5 sm:h-2 sm:w-2">
            {(i) => <span className="block h-full w-full" style={{ background: CORES_CONFETE[i % CORES_CONFETE.length] }} />}
          </Caindo>
        </>
      )}

      {/* ---- Helios ---- */}
      {tipo === 'cadentes' &&
        pedacos(6).map((p, i) => (
          <span
            key={i}
            className="comemora-cadente absolute h-0.5 w-10 sm:w-16"
            style={{ left: `${p.x}%`, top: `${(i * 13) % 40}%`, animationDelay: `${p.atraso}ms`, background: 'linear-gradient(90deg, transparent, #ffffff)' }}
          />
        ))}
      {tipo === 'luz' && (
        <Caindo n={26} largura="h-1.5 w-1.5 sm:h-2 sm:w-2">
          {() => <span className="block h-full w-full bg-[#fff2b0] shadow-[0_0_6px_#ffd04a]" />}
        </Caindo>
      )}
      {tipo === 'aurora' && <div className="comemora-aurora absolute inset-x-0 top-0 h-1/3" />}
      {tipo === 'eclipse' && (
        <div className="absolute left-1/2 top-3 h-14 w-14 -translate-x-1/2 rounded-full bg-[#ffd04a] shadow-[0_0_24px_8px_#ffb03a] sm:h-20 sm:w-20">
          <div className="comemora-eclipse absolute inset-0 rounded-full bg-[#14061e]" />
        </div>
      )}
    </div>
  );
}
