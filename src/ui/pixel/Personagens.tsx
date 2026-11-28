import Sprite from './Sprite';
import { gradeGladiador, JURADOS_PIXEL, PRETOR, paletaBusto, paletaGladiador, type Armadura } from './sprites';
import { PERSONAGENS, type IaId } from '@/game/personagens';
import { JURADOS, type JuradoId } from '@/game/jurados';

interface Base {
  className?: string;
  escala?: number;
  espelhar?: boolean;
}

// As grades mudam pouco (3 IAs × 5 ligas): guardadas depois de desenhadas.
const cache = new Map<string, string[]>();
function grade(ia: IaId, liga: number) {
  const k = `${ia}-${liga}`;
  if (!cache.has(k)) cache.set(k, gradeGladiador(ia, liga));
  return cache.get(k)!;
}

/** Gladiador em pixel. `liga` (0 a 4) muda o equipamento; `armadura` vem da Maestria. */
export function GladiadorPixel({ ia, armadura, liga = 0, className, escala, espelhar }: Base & { ia: IaId; armadura?: Armadura; liga?: number }) {
  const p = PERSONAGENS[ia];
  return (
    <span className={`relative block ${className ?? ''}`} style={escala ? { width: 23 * escala } : undefined}>
      <Sprite grade={grade(ia, liga)} paleta={paletaGladiador(p.cor, armadura, ia)} titulo={`${p.gladiador} (${p.ia})`} espelhar={espelhar} />
      <SinalDeIA ia={ia} espelhar={espelhar} />
    </span>
  );
}

/**
 * OS TRÊS SÃO IAs (27/11/2026, combinado com o Lucas: "deixar visível que eles são IAs"):
 * os olhos acendem na cor de cada um e piscam, e um circuito de luz corre pela armadura.
 * Desenhado por cima do gladiador, na mesma grade (23 × 26).
 */
const OLHOS: Record<IaId, [number, number][]> = { claude: [[11, 8], [13, 8]], chatgpt: [[10, 8], [13, 8]], gemini: [[10, 8], [13, 8]] };
const CIRCUITO: Record<IaId, string> = {
  claude: 'M 10.5 13.5 H 12.5 V 15.5 H 13.5',
  chatgpt: 'M 10.5 12.5 V 14.5 H 13.5 M 13.5 14.5 V 15.5',
  gemini: 'M 9.5 15.5 V 13.5 H 10.5 M 13.5 13.5 H 14.5 V 15.5',
};
const LUZ: Record<IaId, string> = { claude: '#ffd2a0', chatgpt: '#a0ffe0', gemini: '#bcd0ff' };
function SinalDeIA({ ia, espelhar }: { ia: IaId; espelhar?: boolean }) {
  const luz = LUZ[ia];
  return (
    <svg viewBox="0 0 23 26" className="pointer-events-none absolute inset-0 h-full w-full" style={espelhar ? { transform: 'scaleX(-1)' } : undefined} shapeRendering="crispEdges" aria-hidden>
      <path className="circuito-ia" d={CIRCUITO[ia]} stroke={luz} strokeWidth={0.45} fill="none" strokeDasharray="1 1" />
      <g className="olhos-ia">
        {OLHOS[ia].map(([x, y]) => (
          <g key={x}>
            <rect x={x - 0.4} y={y - 0.4} width={1.8} height={1.8} fill={luz} opacity={0.35} />
            <rect x={x} y={y} width={1} height={1} fill="#ffffff" />
          </g>
        ))}
      </g>
    </svg>
  );
}

export function JuradoPixel({ jurado, ...resto }: Base & { jurado: JuradoId }) {
  const j = JURADOS[jurado];
  const paleta = paletaBusto({ toga: j.toga, cabelo: j.cabelo, acessorio: j.corAcessorio, objeto: j.corObjeto });
  return <Sprite grade={JURADOS_PIXEL[jurado]} paleta={paleta} titulo={`Jurado ${j.nome}`} {...resto} />;
}

export function PretorPixel(props: Base) {
  return (
    <Sprite
      grade={PRETOR}
      paleta={paletaBusto({ toga: '#c0283c', cabelo: '#ececec', acessorio: '#f2c14e', objeto: '#f2c14e' })}
      titulo="Pretor Supremo"
      {...props}
    />
  );
}
