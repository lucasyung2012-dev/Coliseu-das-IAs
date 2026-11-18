import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { IAS, PERSONAGENS, type IaId } from '@/game/personagens';
import { useProgresso } from '@/game/progresso';
import { caminhoSvg, ligasCruzadas, PARADAS, posicaoNoMapa } from '@/game/mapa';
import GladiadorEnfeitado, { useAparencia } from '@/ui/pixel/GladiadorEnfeitado';
import { prefereMenosMovimento } from '@/ui/movimento';
import { tocar } from '@/ui/som';
import { Faiscas } from './cenas/Palco';
import { Animados, Bandeira, Marco, Terreno } from './mapa/MapaArte';

const L = 360;
const A = 900;
const DURACAO = 1800;
const chaveVisto = (ia: IaId) => `coliseu.mapa.visto.${ia}`;

function lerVisto(ia: IaId, atual: number): number {
  try {
    const v = localStorage.getItem(chaveVisto(ia));
    return v === null ? atual : Math.min(Number(v) || 0, atual);
  } catch {
    return atual;
  }
}

/**
 * Mapa de troféus: um mapa de tesouro com o caminho das 5 ligas. O gladiador
 * anda do ponto onde estava na última visita até os troféus de agora, e quando
 * cruza a entrada de uma liga tem festa.
 */
export default function MapaTrofeus() {
  const { ia } = useParams();
  const p = useProgresso();
  const valido = !!ia && IAS.includes(ia as IaId);
  const id = (valido ? ia : 'claude') as IaId;
  const trofeus = p.trofeus[id];
  const [mostrado, setMostrado] = useState(() => (prefereMenosMovimento() ? trofeus : lerVisto(id, trofeus)));
  const [festa, setFesta] = useState<string | null>(null);
  const avatar = useRef<HTMLDivElement>(null);
  const { visual } = useAparencia(id);

  // Caminhada: anima os troféus mostrados do valor visto até o atual.
  useEffect(() => {
    if (!valido) return;
    const de = mostrado;
    const ate = trofeus;
    const fim = () => {
      try {
        localStorage.setItem(chaveVisto(id), String(ate));
      } catch {
        /* sem armazenamento: anda de novo na próxima vez */
      }
      const novas = ligasCruzadas(de, ate);
      if (novas.length) {
        setFesta(novas[novas.length - 1]!);
        tocar('fanfarra');
      }
    };
    if (de >= ate) {
      fim();
      return;
    }
    tocar('passos');
    const inicio = performance.now();
    let quadro = 0;
    const passo = (agora: number) => {
      const t = Math.min(1, (agora - inicio) / DURACAO);
      setMostrado(Math.round(de + (ate - de) * (1 - (1 - t) ** 2)));
      if (t < 1) quadro = requestAnimationFrame(passo);
      else fim();
    };
    quadro = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(quadro);
    // Roda uma vez ao abrir o mapa.
  }, []);

  useEffect(() => {
    avatar.current?.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
  }, []);

  if (!valido) return <Navigate to="/arena" replace />;
  const pers = PERSONAGENS[id];
  const pos = posicaoNoMapa(mostrado);
  // Trecho já percorrido: as paradas alcançadas mais o ponto onde o gladiador está.
  const alcancadas = PARADAS.filter((pa) => mostrado >= pa.trofeus);
  const percorrido = alcancadas.length && mostrado > 0 ? caminhoSvg([...alcancadas, pos]) : null;

  return (
    <main data-area="arcade" className="fundo-arcade relative min-h-screen text-fg">
      <div className="relative mx-auto flex max-w-xl flex-col gap-4 px-4 pb-16 pt-6 sm:px-8">
        <Link to={`/arena/perfil/${id}`} onClick={() => tocar('clique')} className="self-start font-pixel text-[10px] text-muted hover:text-accent">
          ◀ PERFIL DE {pers.gladiador.toUpperCase()}
        </Link>

        <div className="pergaminho relative overflow-hidden px-3 pb-4 pt-5 sm:px-6">
          {/* Título numa faixa de pergaminho, como nos mapas antigos */}
          <div className="faixa-mapa relative mx-auto w-fit px-8 py-2 text-center">
            <h1 className="font-pixel text-base text-[#5a3414] sm:text-xl">🗺 MAPA DE TROFÉUS</h1>
            <p className="mt-1 font-pixel text-[8px] text-[#7a4a22] sm:text-[9px]">
              A JORNADA DE {pers.gladiador.toUpperCase()} · 🏆 {trofeus}
            </p>
          </div>

          <div className="relative mx-auto mt-3 w-full" style={{ aspectRatio: `${L} / ${A}` }}>
            <svg viewBox={`0 0 ${L} ${A}`} className="absolute inset-0 h-full w-full" aria-hidden>
              <defs>
                <filter id="brilho-ouro" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <Terreno />
              {/* o caminho inteiro tracejado; o já percorrido brilha em dourado por cima */}
              <path d={caminhoSvg()} fill="none" stroke="#7a4a22" strokeWidth={5} strokeDasharray="2 12" strokeLinecap="round" opacity={0.8} />
              {percorrido && (
                <path d={percorrido} fill="none" stroke="#f2c14e" strokeWidth={6} strokeLinecap="round" filter="url(#brilho-ouro)" />
              )}
              <Animados />
              {PARADAS.map((pa) => {
                const alcancada = mostrado >= pa.trofeus;
                if (!pa.liga) {
                  return (
                    <g key={pa.trofeus}>
                      <circle cx={pa.x} cy={pa.y} r={8} fill={alcancada ? '#f2c14e' : '#e8d3a8'} stroke="#5a3414" strokeWidth={2} />
                      {alcancada && <circle cx={pa.x - 2} cy={pa.y - 2} r={2.5} fill="#fff6d0" />}
                    </g>
                  );
                }
                // O desenho da liga fica do lado oposto ao nome.
                const ladoDoMarco = pa.x > L / 2 ? 1 : -1;
                return (
                  <g key={pa.trofeus}>
                    <Marco liga={pa.liga} x={pa.x + ladoDoMarco * 62} y={pa.y - 4} alcancado={alcancada} />
                    <circle cx={pa.x} cy={pa.y} r={19} fill={alcancada ? '#f2c14e' : '#d9c49a'} stroke="#5a3414" strokeWidth={3} filter={alcancada ? 'url(#brilho-ouro)' : undefined} />
                    <circle cx={pa.x} cy={pa.y} r={13} fill="none" stroke="#5a3414" strokeWidth={1.5} strokeDasharray="3 3" />
                    <text x={pa.x} y={pa.y + 6} textAnchor="middle" fontSize={16}>
                      {alcancada ? '🏆' : '🔒'}
                    </text>
                    {alcancada && <Bandeira x={pa.x + 14} y={pa.y - 14} />}
                  </g>
                );
              })}
              {/* o X do tesouro, no fim do caminho */}
              <g className="brilho-x" stroke="#c0283c" strokeWidth={6} strokeLinecap="round">
                <line x1={PARADAS[PARADAS.length - 1]!.x + 30} y1={12} x2={PARADAS[PARADAS.length - 1]!.x + 50} y2={32} />
                <line x1={PARADAS[PARADAS.length - 1]!.x + 50} y1={12} x2={PARADAS[PARADAS.length - 1]!.x + 30} y2={32} />
              </g>
            </svg>

            {/* Nomes das ligas e troféus de cada parada (em HTML, para o texto ficar nítido) */}
            {PARADAS.map((pa) => (
              <p
                key={pa.trofeus}
                className={`absolute -translate-y-1/2 whitespace-nowrap font-pixel ${pa.liga ? 'text-[9px] text-[#3a2010] sm:text-[11px]' : 'text-[7px] text-[#7a4a22] sm:text-[8px]'}`}
                style={{
                  top: `${(pa.y / A) * 100}%`,
                  ...(pa.x > L / 2 ? { right: `${((L - pa.x + (pa.liga ? 28 : 14)) / L) * 100}%` } : { left: `${((pa.x + (pa.liga ? 28 : 14)) / L) * 100}%` }),
                }}
              >
                {pa.liga ? `${pa.liga.toUpperCase()} · ${pa.trofeus}` : pa.trofeus}
              </p>
            ))}

            {/* O gladiador no ponto atual */}
            <div
              ref={avatar}
              className="absolute w-[13%] -translate-x-1/2 -translate-y-full"
              style={{ left: `${(pos.x / L) * 100}%`, top: `${(pos.y / A) * 100}%` }}
              aria-label={`${pers.gladiador} está com ${trofeus} troféus`}
              role="img"
            >
              <div className="drop-shadow-[0_4px_0_rgba(60,30,10,0.5)]">
                <GladiadorEnfeitado ia={id} />
              </div>
              {visual.coroa && (
                // Estandarte imperial (Maestria 100) ao lado do gladiador.
                <div className="bandeira absolute -right-[30%] top-0 h-[70%] w-[30%] border-l-2 border-[#5a3414]" aria-hidden>
                  <div className="h-1/2 w-full bg-[#6a2a8a] shadow-[inset_0_-3px_0_#f2c14e]" />
                </div>
              )}
              {festa && <Faiscas x={50} y={30} />}
            </div>
          </div>

          {festa && (
            <div className="pancada absolute inset-x-6 top-24 bg-[#5a3414] px-4 py-3 text-center shadow-[0_6px_0_rgba(0,0,0,0.3)]" role="status">
              <p className="font-pixel text-[10px] text-[#f2c14e]">NOVA LIGA ALCANÇADA!</p>
              <p className="mt-1 font-pixel text-base text-white">{festa.toUpperCase()}</p>
              <button type="button" onClick={() => setFesta(null)} className="mt-2 font-pixel text-[9px] text-[#e8d3a8] underline">
                CONTINUAR
              </button>
            </div>
          )}
        </div>
        <p className="text-center text-xs text-muted">As recompensas de cada parada do mapa ainda vão ser definidas.</p>
      </div>
    </main>
  );
}

