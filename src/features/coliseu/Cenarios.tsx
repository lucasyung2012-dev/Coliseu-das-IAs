import type { Falante, Lugar } from '@/game/historia/roteiro';
import { CenaColiseu } from '../arcade/cenas/Cenarios';
import { GladiadorPixel } from '@/ui/pixel/Personagens';
import Sprite from '@/ui/pixel/Sprite';
import { CENSOR, LIVIA, PALETA_CENSOR, PALETA_LIVIA, PALETA_PRETORIANO, PRETORIANO } from '@/ui/pixel/historia';

/**
 * Os cenários do modo História, em pixel (160 × 90, ampliados sem suavizar).
 * Cada lugar do roteiro tem o seu desenho.
 */
export function CenarioHistoria({ lugar }: { lugar: Lugar }) {
  if (lugar === 'coliseu-calado') return <CenaColiseu corA="#8a5a3a" corB="#8a5a3a" arena="estatuas" />;
  return (
    <svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" shapeRendering="crispEdges" className="absolute inset-0 h-full w-full" aria-hidden>
      {desenho(lugar)}
    </svg>
  );
}

function Estantes({ y0, cores }: { y0: number; cores: string[] }) {
  // Estantes altas com lombadas coloridas.
  const livros: JSX.Element[] = [];
  [8, 52, 96, 128].forEach((x0, e) => {
    livros.push(<rect key={`e${x0}`} x={x0} y={y0} width={28} height={58} fill="#4a2a16" />);
    for (let prat = 0; prat < 4; prat++) {
      const y = y0 + 3 + prat * 14;
      livros.push(<rect key={`p${x0}-${prat}`} x={x0} y={y + 11} width={28} height={2} fill="#2a160a" />);
      for (let i = 0; i < 9; i++) {
        const alt = 8 + ((i * 7 + prat * 3 + e) % 4);
        livros.push(<rect key={`l${x0}-${prat}-${i}`} x={x0 + 1 + i * 3} y={y + 11 - alt} width={2} height={alt} fill={cores[(i + prat + e) % cores.length]} />);
      }
    }
  });
  return <>{livros}</>;
}

const LOMBADAS = ['#a83a2a', '#3a6a9a', '#c8962a', '#4a8a3a', '#7a3a8a', '#d8c8a0'];

function desenho(lugar: Lugar) {
  switch (lugar) {
    case 'biblioteca-estantes':
      return (
        <>
          <rect width={160} height={90} fill="#2a1810" />
          <Estantes y0={10} cores={LOMBADAS} />
          {[40, 84, 118].map((x) => (
            <g key={x}>
              <rect x={x} y={0} width={1} height={8} fill="#5a3a2a" />
              <rect x={x - 2} y={8} width={5} height={3} fill="#ffd04a" className="tocha" />
            </g>
          ))}
          <rect y={68} width={160} height={22} fill="#6a4426" />
          {[72, 78, 85].map((y) => (
            <rect key={y} y={y} width={160} height={1} fill="#5a3418" />
          ))}
        </>
      );
    case 'biblioteca-salao':
    case 'biblioteca-chamas': {
      const fogo = lugar === 'biblioteca-chamas';
      return (
        <>
          <rect width={160} height={90} fill={fogo ? '#3a1410' : '#241a2a'} />
          {/* janelas em arco com o brilho do fogo lá fora */}
          {[14, 62, 110].map((x) => (
            <g key={x}>
              <rect x={x} y={10} width={30} height={34} fill="#140c18" />
              <rect x={x + 3} y={14} width={24} height={30} fill={fogo ? '#ff6a2a' : '#c8501a'} opacity={fogo ? 0.9 : 0.5} />
              <rect x={x + 14} y={14} width={2} height={30} fill="#140c18" />
            </g>
          ))}
          {/* colunas */}
          {[6, 52, 100, 148].map((x) => (
            <g key={x}>
              <rect x={x} y={4} width={7} height={64} fill="#b8ae98" />
              <rect x={x + 2} y={4} width={1} height={64} fill="#8a826e" />
              <rect x={x - 1} y={2} width={9} height={3} fill="#d8cfbb" />
            </g>
          ))}
          {/* estátua do Guardião Zero */}
          <rect x={76} y={40} width={8} height={28} fill="#8a6a3a" />
          <rect x={77} y={34} width={6} height={6} fill="#9a7a4a" />
          <rect x={79} y={36} width={2} height={1} fill="#3a1a10" />
          <rect y={68} width={160} height={22} fill={fogo ? '#4a2010' : '#3a2a2a'} />
          {fogo &&
            [10, 30, 60, 100, 130, 150].map((x, i) => (
              <g key={x} className="tocha" style={{ animationDelay: `${i * 120}ms` }}>
                <rect x={x} y={58} width={6} height={10} fill="#ff6a2a" />
                <rect x={x + 1} y={54} width={4} height={6} fill="#ffd04a" />
              </g>
            ))}
        </>
      );
    }
    case 'biblioteca-escada':
      return (
        <>
          <rect width={160} height={90} fill="#1a1418" />
          {Array.from({ length: 9 }, (_, i) => (
            <rect key={i} x={20 + i * 14} y={30 + i * 5} width={140 - i * 14} height={5} fill={i % 2 ? '#4a3a40' : '#5a4a50'} />
          ))}
          {[30, 90].map((x) => (
            <g key={x}>
              <rect x={x} y={14} width={2} height={8} fill="#5a3418" />
              <rect x={x - 1} y={10} width={4} height={4} fill="#ff8a3c" className="tocha" />
            </g>
          ))}
          <rect x={4} y={60} width={24} height={8} fill="#2a1a10" />
          <rect x={6} y={62} width={20} height={4} fill="#140c08" />
          <rect y={68} width={160} height={22} fill="#2a2228" />
        </>
      );
    case 'rua-noite':
      return (
        <>
          <rect width={160} height={90} fill="#0e0c24" />
          <rect x={128} y={8} width={10} height={10} fill="#e8e0c0" />
          {[0, 34, 70, 104, 138].map((x, i) => (
            <g key={x}>
              <rect x={x} y={30 - (i % 2) * 8} width={30} height={40 + (i % 2) * 8} fill="#3a2a3a" />
              <rect x={x + 6} y={40} width={5} height={6} fill={i % 2 ? '#ffb04a' : '#2a1a2a'} />
              <rect x={x + 18} y={40} width={5} height={6} fill="#2a1a2a" />
            </g>
          ))}
          <rect y={68} width={160} height={22} fill="#4a4048" />
          {[0, 20, 40, 60, 80, 100, 120, 140].map((x) => (
            <rect key={x} x={x} y={72} width={18} height={1} fill="#3a3038" />
          ))}
        </>
      );
    case 'roma-noite':
      return (
        <>
          <rect width={160} height={90} fill="#0a0620" />
          {[10, 30, 55, 80, 120, 145].map((x, i) => (
            <rect key={x} x={x} y={4 + (i % 3) * 4} width={1} height={1} fill="#fff" />
          ))}
          <rect x={20} y={6} width={12} height={12} fill="#e8e0c0" />
          {/* engrenagens gigantes atrás da cidade */}
          {(
            [
              [40, 34, 22],
              [118, 30, 28],
            ] as [number, number, number][]
          ).map(([cx, cy, r]) => (
            <g key={cx} className="girar-devagar" style={{ transformOrigin: `${cx}px ${cy}px` }}>
              <circle cx={cx} cy={cy} r={r} fill="#2a1e30" />
              <circle cx={cx} cy={cy} r={r * 0.45} fill="#0a0620" />
              {Array.from({ length: 8 }, (_, k) => (
                <rect key={k} x={cx - 3} y={cy - r - 4} width={6} height={6} fill="#2a1e30" transform={`rotate(${k * 45} ${cx} ${cy})`} />
              ))}
            </g>
          ))}
          {/* silhueta do Coliseu */}
          <rect x={40} y={44} width={80} height={26} fill="#3a2a2a" />
          {Array.from({ length: 8 }, (_, k) => (
            <rect key={k} x={44 + k * 9} y={50} width={5} height={8} fill="#ffb04a" opacity={0.6} />
          ))}
          <rect y={70} width={160} height={20} fill="#1a1420" />
        </>
      );
    case 'camarote':
      return (
        <>
          <rect width={160} height={90} fill="#1a0610" />
          <rect x={30} y={10} width={100} height={6} fill="#6a2a8a" />
          <rect x={30} y={16} width={100} height={2} fill="#c8962a" />
          {[34, 120].map((x) => (
            <rect key={x} x={x} y={18} width={6} height={60} fill="#5a4a40" />
          ))}
          <rect x={0} y={70} width={160} height={20} fill="#2a1418" />
          <rect x={50} y={30} width={60} height={40} fill="#ff2a2a" opacity={0.08} />
        </>
      );
    case 'biblioteca-porta':
      return (
        <>
          <rect width={160} height={90} fill="#1e140e" />
          <Estantes y0={10} cores={LOMBADAS} />
          <rect x={60} y={10} width={40} height={58} fill="#5a3418" />
          <rect x={62} y={12} width={36} height={56} fill="#7a4a22" />
          <rect x={79} y={12} width={2} height={56} fill="#4a2a10" />
          <rect x={86} y={38} width={4} height={4} fill="#c8962a" />
          <rect y={68} width={160} height={22} fill="#4a3018" />
        </>
      );
    case 'porto':
      return (
        <>
          <rect width={160} height={50} fill="#0a1030" />
          <rect x={130} y={8} width={10} height={10} fill="#e8e0c0" />
          <rect y={50} width={160} height={40} fill="#102a50" />
          {[56, 62, 70].map((y) => (
            <rect key={y} y={y} width={160} height={1} fill="#2a4a80" />
          ))}
          {/* o Esperança: navio de refugiados */}
          <rect x={30} y={42} width={40} height={8} fill="#5a3418" />
          <rect x={48} y={18} width={2} height={24} fill="#3a2010" />
          <rect x={36} y={20} width={12} height={16} fill="#e8dcc0" />
          <rect x={50} y={22} width={10} height={14} fill="#e8dcc0" />
          {/* o navio de guerra do Censor */}
          <rect x={100} y={40} width={50} height={10} fill="#3a3a48" />
          <rect x={124} y={14} width={2} height={26} fill="#2a2a30" />
          <rect x={112} y={16} width={12} height={18} fill="#8a2a2a" />
        </>
      );
    case 'observatorio':
      return (
        <>
          <rect width={160} height={90} fill="#060418" />
          {[12, 26, 44, 66, 90, 104, 140, 150].map((x, i) => (
            <rect key={x} x={x} y={6 + (i % 4) * 5} width={1} height={1} fill="#fff" />
          ))}
          {/* as três estrelas alinhadas sobre o Coliseu */}
          {[70, 80, 90].map((x, i) => (
            <rect key={x} x={x} y={10 + i * 4} width={3} height={3} fill="#ffd04a" className="tocha" />
          ))}
          <rect x={40} y={40} width={40} height={30} fill="#5a5070" />
          <rect x={44} y={30} width={32} height={12} fill="#7a7090" />
          <rect x={70} y={26} width={18} height={4} fill="#3a3448" transform="rotate(-25 70 28)" />
          <rect y={70} width={160} height={20} fill="#1a1428" />
        </>
      );
    case 'olho':
      return (
        <>
          <rect width={160} height={90} fill="#050205" />
          <rect x={60} y={30} width={40} height={30} fill="#5a1010" />
          <rect x={66} y={34} width={28} height={22} fill="#ff2a2a" className="tocha" />
          <rect x={76} y={40} width={8} height={10} fill="#ffd0d0" />
        </>
      );
    default:
      return <rect width={160} height={90} fill="#140c18" />;
  }
}

/** O boneco de quem fala (Cassius, Octavius e Helios são os gladiadores do Arcade). */
export function Retrato({ quem, espelhar = false }: { quem: Falante; espelhar?: boolean }) {
  if (quem === 'cassius') return <GladiadorPixel ia="claude" espelhar={espelhar} />;
  if (quem === 'octavius') return <GladiadorPixel ia="chatgpt" espelhar={espelhar} />;
  if (quem === 'helios') return <GladiadorPixel ia="gemini" espelhar={espelhar} />;
  if (quem === 'livia') return <Sprite grade={LIVIA} paleta={PALETA_LIVIA} espelhar={espelhar} />;
  if (quem === 'censor') return <Sprite grade={CENSOR} paleta={PALETA_CENSOR} espelhar={espelhar} />;
  if (quem === 'guarda') return <Sprite grade={PRETORIANO} paleta={PALETA_PRETORIANO} espelhar={espelhar} />;
  return null;
}
