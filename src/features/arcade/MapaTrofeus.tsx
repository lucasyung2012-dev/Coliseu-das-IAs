import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { IAS, PERSONAGENS, type IaId } from '@/game/personagens';
import { useProgresso } from '@/game/progresso';
import { caminhoSvg, ligasCruzadas, PARADAS, posicaoNoMapa } from '@/game/mapa';
import { GladiadorPixel } from '@/ui/pixel/Personagens';
import { prefereMenosMovimento } from '@/ui/movimento';
import { tocar } from '@/ui/som';
import { Faiscas } from './cenas/Palco';

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

  return (
    <main data-area="arcade" className="fundo-arcade relative min-h-screen text-fg">
      <div className="relative mx-auto flex max-w-xl flex-col gap-4 px-4 pb-16 pt-6 sm:px-8">
        <Link to={`/arena/perfil/${id}`} onClick={() => tocar('clique')} className="self-start font-pixel text-[10px] text-muted hover:text-accent">
          ◀ PERFIL DE {pers.gladiador.toUpperCase()}
        </Link>

        <div className="pergaminho relative overflow-hidden px-3 pb-4 pt-5 sm:px-6">
          <h1 className="text-center font-pixel text-lg text-[#5a3414] sm:text-2xl">🗺 MAPA DE TROFÉUS</h1>
          <p className="mt-1 text-center font-pixel text-[9px] text-[#7a4a22]">
            A JORNADA DE {pers.gladiador.toUpperCase()} · 🏆 {trofeus}
          </p>

          <div className="relative mx-auto mt-3 w-full" style={{ aspectRatio: `${L} / ${A}` }}>
            <svg viewBox={`0 0 ${L} ${A}`} className="absolute inset-0 h-full w-full" aria-hidden>
              <Decoracao />
              {/* caminho percorrido (cheio) e o que falta (tracejado) */}
              <path d={caminhoSvg()} fill="none" stroke="#7a4a22" strokeWidth={5} strokeDasharray="2 12" strokeLinecap="round" opacity={0.75} />
              {PARADAS.map((pa) => {
                const alcancada = mostrado >= pa.trofeus;
                return pa.liga ? (
                  <g key={pa.trofeus}>
                    <circle cx={pa.x} cy={pa.y} r={20} fill={alcancada ? '#f2c14e' : '#e8d3a8'} stroke="#5a3414" strokeWidth={3} />
                    <text x={pa.x} y={pa.y + 7} textAnchor="middle" fontSize={20}>
                      {alcancada ? '🏛️' : '🔒'}
                    </text>
                  </g>
                ) : (
                  <circle key={pa.trofeus} cx={pa.x} cy={pa.y} r={7} fill={alcancada ? '#c0283c' : '#e8d3a8'} stroke="#5a3414" strokeWidth={2} />
                );
              })}
              {/* o X do tesouro, no fim do caminho */}
              <g stroke="#c0283c" strokeWidth={6} strokeLinecap="round">
                <line x1={PARADAS[PARADAS.length - 1]!.x - 34} y1={22} x2={PARADAS[PARADAS.length - 1]!.x - 14} y2={42} />
                <line x1={PARADAS[PARADAS.length - 1]!.x - 14} y1={22} x2={PARADAS[PARADAS.length - 1]!.x - 34} y2={42} />
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
              <div className="respirar drop-shadow-[0_4px_0_rgba(60,30,10,0.5)]">
                <GladiadorPixel ia={id} />
              </div>
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

/** Enfeites do mapa: montanhas, árvores, mar com ondas, rosa dos ventos. Tinta marrom, estilo mapa antigo. */
function Decoracao() {
  const tinta = '#7a4a22';
  return (
    <g opacity={0.55} stroke={tinta} fill="none" strokeWidth={2}>
      {/* montanhas */}
      {[
        [30, 620],
        [62, 600],
        [300, 380],
        [330, 400],
      ].map(([x, y]) => (
        <path key={`m${x}`} d={`M ${x! - 18} ${y! + 14} L ${x} ${y! - 14} L ${x! + 18} ${y! + 14}`} />
      ))}
      {/* árvores */}
      {[
        [250, 760],
        [270, 780],
        [40, 300],
        [60, 280],
        [320, 180],
      ].map(([x, y]) => (
        <g key={`a${x}${y}`}>
          <circle cx={x} cy={y} r={8} />
          <line x1={x} y1={y! + 8} x2={x} y2={y! + 18} />
        </g>
      ))}
      {/* mar com ondas */}
      {[490, 510, 530].map((y) => (
        <path key={`o${y}`} d={`M 20 ${y} q 8 -8 16 0 t 16 0 t 16 0`} />
      ))}
      {/* rosa dos ventos */}
      <g transform="translate(310 850)">
        <circle r={22} />
        <path d="M 0 -30 L 6 0 L 0 30 L -6 0 Z" fill={tinta} />
        <path d="M -30 0 L 0 -6 L 30 0 L 0 6 Z" />
        <text y={-34} textAnchor="middle" fontSize={12} fill={tinta} stroke="none">
          N
        </text>
      </g>
      {/* navio pequeno */}
      <path d="M 40 560 l 30 0 l -6 10 l -18 0 z M 55 560 l 0 -20 l 12 14 z" />
    </g>
  );
}
