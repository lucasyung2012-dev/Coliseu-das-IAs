import type { CSSProperties } from 'react';
import type { ArenaId } from '@/game/coliseu';

// Cenários em pixel art desenhados em 160 × 90 e ampliados sem suavizar (crispEdges),
// para ficarem com cara de fliperama em qualquer tamanho de tela.

/** Gerador pseudoaleatório fixo: a plateia sai igual em toda visita. */
function aleatorioFixo(semente: number) {
  let s = semente;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const CORES_PLATEIA = ['#ff5ab8', '#4ef0dc', '#f2c14e', '#9f7bff', '#ff8a4a', '#e8e8f0'];

function Plateia({ y0, y1, viva = false, lotacao = 0.55 }: { y0: number; y1: number; viva?: boolean; lotacao?: number }) {
  const r = aleatorioFixo(y0 * 31 + 7);
  const pontos: { x: number; y: number; c: string }[] = [];
  for (let y = y0; y < y1; y += 2) {
    for (let x = 1; x < 160; x += 2) {
      if (r() < lotacao) pontos.push({ x, y, c: CORES_PLATEIA[Math.floor(r() * CORES_PLATEIA.length)]! });
    }
  }
  return (
    <>
      {pontos.map((p) => (
        <rect
          key={`${p.x}-${p.y}`}
          x={p.x}
          y={p.y}
          width={1}
          height={1}
          fill={p.c}
          opacity={0.75}
          className={viva ? 'torcedor' : undefined}
          style={viva ? ({ animationDelay: `${(p.x * 37 + p.y * 11) % 1200}ms`, '--x': p.x } as CSSProperties) : undefined}
        />
      ))}
    </>
  );
}

/** Cores e detalhes de cada arena (prêmios das ligas no mapa de troféus). */
const ARENAS: Record<
  ArenaId,
  { ceu: [string, string, string]; arquibancada: string; muro: string; friso: string; arco: string; linha: string; areia: string; risco: string; lotacao: number; estrelas: boolean }
> = {
  madeira: { ceu: ['#5bb8f0', '#86cdf5', '#b8e4fa'], arquibancada: '#6b4426', muro: '#8a5a32', friso: '#a8743e', arco: '#3a2414', linha: '#f2c14e', areia: '#d8b070', risco: '#c49a58', lotacao: 0.3, estrelas: false },
  pedra: { ceu: ['#3a1650', '#c8506a', '#ff9a4a'], arquibancada: '#4a2e2a', muro: '#a8865e', friso: '#c8a478', arco: '#2a1810', linha: '#ffb04a', areia: '#d0a060', risco: '#b8884a', lotacao: 0.5, estrelas: false },
  estatuas: { ceu: ['#0b0620', '#160a35', '#2a0e4a'], arquibancada: '#1c1030', muro: '#5a4060', friso: '#7a5a80', arco: '#140a22', linha: '#4ef0dc', areia: '#c79a5a', risco: '#b5884b', lotacao: 0.65, estrelas: true },
  marmore: { ceu: ['#0a1030', '#16224a', '#24366a'], arquibancada: '#1a1c3a', muro: '#e4ddd0', friso: '#ffffff', arco: '#2a2848', linha: '#4ef0dc', areia: '#d4b07a', risco: '#c09a62', lotacao: 0.78, estrelas: true },
  imperial: { ceu: ['#14061e', '#2a0c40', '#4a1660'], arquibancada: '#2a0c30', muro: '#ece4d4', friso: '#f2c14e', arco: '#3a1048', linha: '#f2c14e', areia: '#dcb478', risco: '#c89c5c', lotacao: 0.9, estrelas: true },
};

/**
 * O Coliseu do Duelo. `arena` muda o cenário conforme a liga (madeira de dia, pedra
 * no pôr do sol, estátuas e tochas de noite, mármore com bandeiras da sua IA, e o
 * Coliseu do Imperador). `viva`: a plateia se mexe. `festa`: faz a ola.
 */
export function CenaColiseu({
  corA,
  corB,
  viva = false,
  festa = false,
  arena = 'estatuas',
}: {
  corA: string;
  corB: string;
  viva?: boolean;
  festa?: boolean;
  arena?: ArenaId;
}) {
  const a = ARENAS[arena];
  const arcos = Array.from({ length: 16 }, (_, i) => i * 10 + 2);
  const madeira = arena === 'madeira';
  const imperial = arena === 'imperial';
  const comEstatuas = arena === 'estatuas' || imperial;
  // Bandeiras: as cores dos dois combatentes e o ouro no meio; no mármore, várias na cor da sua IA.
  const bandeiras =
    arena === 'marmore'
      ? [8, 38, 68, 98, 128].map((x) => ({ x, c: x === 128 ? corB : corA }))
      : imperial
        ? [
            { x: 22, c: corA },
            { x: 134, c: corB },
          ]
        : [
            { x: 22, c: corA },
            { x: 78, c: '#f2c14e' },
            { x: 134, c: corB },
          ];
  return (
    <svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" shapeRendering="crispEdges" className="absolute inset-0 h-full w-full" aria-hidden>
      {/* céu em faixas */}
      <rect width={160} height={12} fill={a.ceu[0]} />
      <rect y={12} width={160} height={8} fill={a.ceu[1]} />
      <rect y={20} width={160} height={6} fill={a.ceu[2]} />
      {a.estrelas && [12, 37, 64, 91, 118, 143].map((x, i) => <rect key={x} x={x} y={3 + (i % 3) * 3} width={1} height={1} fill="#ffffff" />)}
      {madeira && (
        // nuvens de dia
        <g fill="#ffffff" opacity={0.9}>
          <rect x={18} y={4} width={12} height={2} />
          <rect x={21} y={2} width={6} height={2} />
          <rect x={104} y={6} width={14} height={2} />
          <rect x={108} y={4} width={7} height={2} />
        </g>
      )}
      {arena === 'pedra' && (
        // o sol se pondo atrás da arquibancada
        <g>
          <rect x={73} y={6} width={14} height={2} fill="#ffd04a" />
          <rect x={70} y={8} width={20} height={6} fill="#ffd04a" />
          <rect x={66} y={12} width={28} height={2} fill="#ffb03a" />
        </g>
      )}
      {/* arquibancada com plateia */}
      <rect y={14} width={160} height={14} fill={a.arquibancada} />
      {madeira && [16, 19, 22, 25].map((y) => <rect key={y} y={y} width={160} height={1} fill="#4a2e18" />)}
      <g className={festa ? 'ola' : undefined}>
        <Plateia y0={15} y1={27} viva={viva} lotacao={a.lotacao} />
      </g>
      {imperial && (
        // camarote do Imperador, no meio da arquibancada
        <g>
          <rect x={70} y={10} width={20} height={2} fill="#f2c14e" />
          <rect x={68} y={12} width={24} height={3} fill="#6a2a8a" />
          <rect x={70} y={15} width={20} height={12} fill="#3a1048" />
          <rect x={70} y={15} width={1} height={12} fill="#f2c14e" />
          <rect x={89} y={15} width={1} height={12} fill="#f2c14e" />
          <rect x={78} y={18} width={4} height={4} fill="#efc8a0" />
          <rect x={77} y={17} width={6} height={1} fill="#4a8a3a" />
          <rect x={77} y={22} width={6} height={5} fill="#8a2a9a" />
        </g>
      )}
      <rect y={27} width={160} height={1} fill={a.linha} />
      {/* muralha */}
      <rect y={28} width={160} height={34} fill={a.muro} />
      {madeira ? (
        // paliçada de troncos
        Array.from({ length: 40 }, (_, i) => (
          <g key={i}>
            <rect x={i * 4} y={28} width={3} height={34} fill={i % 2 ? '#7a4a26' : '#8a5a32'} />
            <rect x={i * 4} y={44} width={3} height={1} fill="#5a3418" />
          </g>
        ))
      ) : (
        <>
          <rect y={28} width={160} height={2} fill={a.friso} />
          <rect y={45} width={160} height={2} fill={a.friso} />
          {arcos.map((x) => (
            <g key={x}>
              <rect x={x + 1} y={32} width={4} height={1} fill={a.arco} />
              <rect x={x} y={33} width={6} height={10} fill={a.arco} />
              <rect x={x + 1} y={49} width={4} height={1} fill={a.arco} />
              <rect x={x} y={50} width={6} height={12} fill={a.arco} />
            </g>
          ))}
        </>
      )}
      {comEstatuas &&
        // estátuas brancas nos arcos de cima
        [12, 52, 102, 142].map((x) => (
          <g key={`est-${x}`}>
            <rect x={x + 2} y={34} width={2} height={2} fill="#efe6d2" />
            <rect x={x + 1} y={36} width={4} height={5} fill="#d8cfbb" />
            <rect x={x + 1} y={41} width={4} height={2} fill="#b8ae98" />
          </g>
        ))}
      {comEstatuas &&
        // tochas acesas nos arcos de baixo
        [32, 72, 92, 122].map((x, i) => (
          <g key={`tocha-${x}`}>
            <rect x={x + 2} y={47} width={2} height={5} fill="#5a3418" />
            <rect x={x + 1} y={44} width={4} height={3} fill="#ff8a3c" className="tocha" style={{ animationDelay: `${i * 170}ms` }} />
            <rect x={x + 2} y={43} width={2} height={2} fill="#ffe066" className="tocha" style={{ animationDelay: `${i * 170 + 80}ms` }} />
          </g>
        ))}
      {imperial &&
        // cortinas de púrpura com franja de ouro
        [0, 40, 110, 150].map((x) => (
          <g key={`cortina-${x}`}>
            <rect x={x} y={47} width={10} height={6} fill="#6a2a8a" />
            <rect x={x} y={53} width={10} height={1} fill="#f2c14e" />
          </g>
        ))}
      {/* estandartes */}
      {bandeiras.map((b) => (
        <g key={b.x}>
          <rect x={b.x} y={30} width={5} height={12} fill={b.c} />
          <rect x={b.x + 1} y={42} width={1} height={2} fill={b.c} />
          <rect x={b.x + 3} y={42} width={1} height={2} fill={b.c} />
          {imperial && <rect x={b.x} y={30} width={5} height={1} fill="#f2c14e" />}
        </g>
      ))}
      {/* arena */}
      <rect y={62} width={160} height={1} fill={imperial ? '#f2c14e' : madeira ? '#5a3418' : '#ff40c8'} />
      <rect y={63} width={160} height={27} fill={a.areia} />
      {[66, 71, 77, 84].map((y) => (
        <rect key={y} y={y} width={160} height={1} fill={a.risco} />
      ))}
    </svg>
  );
}

/** Tribunal romano: cortinas, colunas de mármore, bancada do Pretor e piso xadrez com neon. */
export function CenaTribunal() {
  const colunas = [6, 30, 122, 146];
  const piso: { x: number; y: number }[] = [];
  for (let linha = 0; 67 + linha * 4 < 90; linha++) {
    for (let x = linha % 2 === 0 ? 0 : 8; x < 160; x += 16) piso.push({ x, y: 67 + linha * 4 });
  }
  return (
    <svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" shapeRendering="crispEdges" className="absolute inset-0 h-full w-full" aria-hidden>
      <rect width={160} height={66} fill="#1a1430" />
      {/* friso de neon */}
      <rect y={9} width={160} height={1} fill="#4ef0dc" opacity={0.7} />
      {/* cortinas */}
      <rect width={160} height={8} fill="#8a1c2c" />
      {Array.from({ length: 20 }, (_, i) => (
        <rect key={i} x={i * 8 + 2} y={8} width={4} height={2} fill="#8a1c2c" />
      ))}
      {/* colunas */}
      {colunas.map((x) => (
        <g key={x}>
          <rect x={x - 2} y={12} width={12} height={3} fill="#efe6d2" />
          <rect x={x} y={15} width={8} height={47} fill="#d8cfbb" />
          <rect x={x + 2} y={15} width={1} height={47} fill="#b8ae98" />
          <rect x={x + 5} y={15} width={1} height={47} fill="#b8ae98" />
          <rect x={x - 2} y={62} width={12} height={4} fill="#efe6d2" />
        </g>
      ))}
      {/* brasão S.P.Q.R. */}
      <rect x={74} y={12} width={12} height={8} fill="#f2c14e" />
      <rect x={76} y={14} width={8} height={4} fill="#8a1c2c" />
      {/* bancada do Pretor */}
      <rect x={52} y={34} width={56} height={14} fill="#6b3f22" />
      <rect x={52} y={34} width={56} height={2} fill="#f2c14e" />
      <rect x={56} y={39} width={48} height={1} fill="#4a2a14" />
      {/* bancada dos jurados */}
      <rect x={14} y={58} width={132} height={6} fill="#4a2a14" />
      <rect x={14} y={58} width={132} height={1} fill="#f2c14e" />
      {/* piso */}
      <rect y={66} width={160} height={24} fill="#2a2240" />
      <rect y={66} width={160} height={1} fill="#ff40c8" />
      {piso.map((p) => (
        <rect key={`${p.x}-${p.y}`} x={p.x} y={p.y} width={8} height={4} fill="#3a3060" />
      ))}
    </svg>
  );
}
