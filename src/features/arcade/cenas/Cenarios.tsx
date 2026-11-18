import type { CSSProperties } from 'react';

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

function Plateia({ y0, y1, viva = false }: { y0: number; y1: number; viva?: boolean }) {
  const r = aleatorioFixo(y0 * 31 + 7);
  const pontos: { x: number; y: number; c: string }[] = [];
  for (let y = y0; y < y1; y += 2) {
    for (let x = 1; x < 160; x += 2) {
      if (r() < 0.55) pontos.push({ x, y, c: CORES_PLATEIA[Math.floor(r() * CORES_PLATEIA.length)]! });
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

/** Coliseu à noite com neon: plateia, dois andares de arcos, estandartes e arena de areia. */
/**
 * `viva`: a plateia se mexe (no Duelo). `festa`: faz a ola (quando uma torre é atingida).
 */
export function CenaColiseu({ corA, corB, viva = false, festa = false }: { corA: string; corB: string; viva?: boolean; festa?: boolean }) {
  const arcos = Array.from({ length: 16 }, (_, i) => i * 10 + 2);
  return (
    <svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" shapeRendering="crispEdges" className="absolute inset-0 h-full w-full" aria-hidden>
      {/* céu em faixas */}
      <rect width={160} height={12} fill="#0b0620" />
      <rect y={12} width={160} height={8} fill="#160a35" />
      <rect y={20} width={160} height={6} fill="#2a0e4a" />
      {[12, 37, 64, 91, 118, 143].map((x, i) => (
        <rect key={x} x={x} y={3 + (i % 3) * 3} width={1} height={1} fill="#ffffff" />
      ))}
      {/* arquibancada com plateia */}
      <rect y={14} width={160} height={14} fill="#1c1030" />
      <g className={festa ? 'ola' : undefined}>
        <Plateia y0={15} y1={27} viva={viva} />
      </g>
      <rect y={27} width={160} height={1} fill="#4ef0dc" />
      {/* muralha com dois andares de arcos */}
      <rect y={28} width={160} height={34} fill="#5a4060" />
      <rect y={28} width={160} height={2} fill="#7a5a80" />
      <rect y={45} width={160} height={2} fill="#7a5a80" />
      {arcos.map((x) => (
        <g key={x}>
          <rect x={x + 1} y={32} width={4} height={1} fill="#140a22" />
          <rect x={x} y={33} width={6} height={10} fill="#140a22" />
          <rect x={x + 1} y={49} width={4} height={1} fill="#140a22" />
          <rect x={x} y={50} width={6} height={12} fill="#140a22" />
        </g>
      ))}
      {/* estandartes nas cores dos dois combatentes */}
      {[
        { x: 22, c: corA },
        { x: 78, c: '#f2c14e' },
        { x: 134, c: corB },
      ].map((b) => (
        <g key={b.x}>
          <rect x={b.x} y={30} width={5} height={12} fill={b.c} />
          <rect x={b.x + 1} y={42} width={1} height={2} fill={b.c} />
          <rect x={b.x + 3} y={42} width={1} height={2} fill={b.c} />
        </g>
      ))}
      {/* arena */}
      <rect y={62} width={160} height={1} fill="#ff40c8" />
      <rect y={63} width={160} height={27} fill="#c79a5a" />
      {[66, 71, 77, 84].map((y) => (
        <rect key={y} y={y} width={160} height={1} fill="#b5884b" />
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
