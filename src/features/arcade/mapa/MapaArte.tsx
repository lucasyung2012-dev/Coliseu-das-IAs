// Desenhos do Mapa de troféus (viewBox 360 × 900): terreno, mar, enfeites animados e
// o marco de cada liga. Estilo mapa antigo pintado à mão: tinta marrom e aquarela.

const TINTA = '#5a3414';
const MAR = '#8fbfcf';
const MAR_ESCURO = '#5f97ab';
const MATA = '#6f8f4e';
const MATA_ESCURA = '#4d6b35';
const PEDRA = '#9a7a56';
const OURO = '#f2c14e';

/** Mar, ilhas de mata, montanhas e rio, desenhados atrás do caminho. */
export function Terreno() {
  return (
    <g>
      {/* mar à esquerda, embaixo, e à direita, em cima */}
      <path d="M0 360 Q 46 400 34 470 T 52 600 Q 26 680 0 720 Z" fill={MAR} opacity={0.75} />
      <path d="M360 90 Q 312 130 324 210 T 360 320 Z" fill={MAR} opacity={0.75} />
      <path d="M0 360 Q 46 400 34 470 T 52 600 Q 26 680 0 720" fill="none" stroke={TINTA} strokeWidth={2} opacity={0.6} />
      <path d="M360 90 Q 312 130 324 210 T 360 320" fill="none" stroke={TINTA} strokeWidth={2} opacity={0.6} />
      {[400, 450, 500, 560, 620, 680].map((y, i) => (
        <path key={y} className="onda-mar" style={{ animationDelay: `${i * 0.4}s` }} d={`M4 ${y} q 6 -6 12 0 t 12 0`} fill="none" stroke={MAR_ESCURO} strokeWidth={2} />
      ))}
      {[130, 180, 240, 290].map((y, i) => (
        <path key={y} className="onda-mar" style={{ animationDelay: `${i * 0.5}s` }} d={`M330 ${y} q 6 -6 12 0 t 12 0`} fill="none" stroke={MAR_ESCURO} strokeWidth={2} />
      ))}

      {/* rio descendo das montanhas até o mar */}
      <path d="M300 330 C 260 380, 330 420, 280 470 S 200 520, 230 560 S 120 600, 52 600" fill="none" stroke={MAR} strokeWidth={7} opacity={0.8} strokeLinecap="round" />

      {/* florestas */}
      <Floresta x={262} y={790} />
      <Floresta x={60} y={300} />
      <Floresta x={300} y={600} />
      <Floresta x={110} y={130} />

      {/* montanhas com neve */}
      <Montanha x={40} y={250} />
      <Montanha x={72} y={232} grande />
      <Montanha x={306} y={360} grande />
      <Montanha x={334} y={380} />
      <Montanha x={300} y={70} />

      {/* rosa dos ventos */}
      <g transform="translate(316 850)" stroke={TINTA} strokeWidth={1.5}>
        <circle r={24} fill="#f1dfb4" />
        <path d="M0 -34 L 7 0 L 0 34 L -7 0 Z" fill={TINTA} />
        <path d="M-34 0 L 0 -7 L 34 0 L 0 7 Z" fill="#c0283c" />
        <circle r={4} fill={OURO} />
        <text y={-38} textAnchor="middle" fontSize={12} fill={TINTA} stroke="none" fontWeight="bold">
          N
        </text>
      </g>
    </g>
  );
}

function Floresta({ x, y }: { x: number; y: number }) {
  return (
    <g>
      {[
        [0, 0, 11],
        [16, -6, 9],
        [-15, -4, 9],
        [8, 12, 8],
        [-8, 13, 7],
      ].map(([dx, dy, r]) => (
        <g key={`${dx}${dy}`}>
          <circle cx={x + dx!} cy={y + dy!} r={r} fill={MATA} stroke={MATA_ESCURA} strokeWidth={1.5} />
          <circle cx={x + dx! - r! / 3} cy={y + dy! - r! / 3} r={r! / 3} fill="#8fb06a" />
        </g>
      ))}
    </g>
  );
}

function Montanha({ x, y, grande }: { x: number; y: number; grande?: boolean }) {
  const a = grande ? 26 : 18;
  return (
    <g stroke={TINTA} strokeWidth={1.5}>
      <path d={`M${x - a} ${y + a * 0.7} L ${x} ${y - a * 0.7} L ${x + a} ${y + a * 0.7} Z`} fill={PEDRA} />
      <path d={`M${x} ${y - a * 0.7} L ${x + a} ${y + a * 0.7} L ${x + a * 0.2} ${y + a * 0.7} Z`} fill="#7a5c3c" stroke="none" />
      <path d={`M${x - a * 0.32} ${y - a * 0.25} L ${x} ${y - a * 0.7} L ${x + a * 0.32} ${y - a * 0.25} L ${x + a * 0.1} ${y - a * 0.35} L ${x - a * 0.1} ${y - a * 0.2} Z`} fill="#fff" />
    </g>
  );
}

/** Coisas que se mexem: nuvens passando, barco balançando, pássaros. */
export function Animados() {
  return (
    <g>
      <g className="nuvem" style={{ animationDuration: '38s' }}>
        <Nuvem x={60} y={190} />
      </g>
      <g className="nuvem" style={{ animationDuration: '52s', animationDelay: '-20s' }}>
        <Nuvem x={200} y={520} />
      </g>
      <g className="nuvem" style={{ animationDuration: '44s', animationDelay: '-30s' }}>
        <Nuvem x={140} y={770} />
      </g>
      <g className="barco">
        <path d="M14 530 l 28 0 l -6 10 l -16 0 z" fill="#8a5a2e" stroke={TINTA} strokeWidth={1.5} />
        <path d="M28 530 l 0 -22 l 13 17 z" fill="#f1dfb4" stroke={TINTA} strokeWidth={1.5} />
        <path d="M28 508 l 6 -3 l -6 -3 z" fill="#c0283c" />
      </g>
      {[
        [230, 300],
        [246, 292],
        [120, 420],
      ].map(([x, y]) => (
        <path key={`${x}${y}`} className="passaro" d={`M${x} ${y} q 4 -4 8 0 q 4 -4 8 0`} fill="none" stroke={TINTA} strokeWidth={1.5} />
      ))}
    </g>
  );
}

function Nuvem({ x, y }: { x: number; y: number }) {
  return (
    <g fill="#fffaf0" opacity={0.85} stroke="#d9c49a" strokeWidth={1}>
      <ellipse cx={x} cy={y} rx={22} ry={9} />
      <ellipse cx={x + 14} cy={y - 6} rx={13} ry={9} />
      <ellipse cx={x - 12} cy={y - 4} rx={11} ry={7} />
    </g>
  );
}

/** Desenho de cada liga, ao lado da parada: vila, Coliseu, acampamento, fortaleza e templo. */
export function Marco({ liga, x, y, alcancado }: { liga: string; x: number; y: number; alcancado: boolean }) {
  const cor = alcancado ? 1 : 0.55;
  return (
    <g transform={`translate(${x} ${y})`} opacity={cor} stroke={TINTA} strokeWidth={1.5}>
      {liga === 'Recrutas' && (
        <>
          <rect x={-22} y={-6} width={16} height={14} fill="#d9b27c" />
          <path d="M-25 -6 L -14 -18 L -3 -6 Z" fill="#a0522d" />
          <rect x={2} y={-2} width={18} height={12} fill="#d9b27c" />
          <path d="M-1 -2 L 11 -14 L 23 -2 Z" fill="#a0522d" />
          <rect x={8} y={3} width={5} height={7} fill={TINTA} />
        </>
      )}
      {liga === 'Gladiadores' && (
        <>
          <ellipse cx={0} cy={4} rx={26} ry={12} fill="#c9a26a" />
          <ellipse cx={0} cy={0} rx={26} ry={10} fill="#e0c08c" />
          <ellipse cx={0} cy={0} rx={15} ry={5} fill="#c79a5a" />
          {[-20, -12, -4, 4, 12, 20].map((ax) => (
            <rect key={ax} x={ax - 2} y={4} width={4} height={6} fill={TINTA} stroke="none" />
          ))}
        </>
      )}
      {liga === 'Centuriões' && (
        <>
          <path d="M-26 10 L -16 -6 L -6 10 Z" fill="#c0283c" />
          <path d="M-4 10 L 6 -8 L 16 10 Z" fill="#d94a4a" />
          <line x1={22} y1={10} x2={22} y2={-20} />
          <circle cx={22} cy={-22} r={4} fill={OURO} />
          <rect x={18} y={-14} width={8} height={7} fill="#c0283c" />
        </>
      )}
      {liga === 'Pretorianos' && (
        <>
          <rect x={-24} y={-4} width={48} height={16} fill="#b8a07c" />
          {[-24, -14, -4, 6, 16].map((ax) => (
            <rect key={ax} x={ax} y={-9} width={6} height={5} fill="#b8a07c" />
          ))}
          <rect x={-30} y={-14} width={10} height={26} fill="#a08860" />
          <rect x={20} y={-14} width={10} height={26} fill="#a08860" />
          <path d="M-5 12 L -5 2 Q 0 -4 5 2 L 5 12 Z" fill={TINTA} />
        </>
      )}
      {liga === 'Imperadores' && (
        <>
          <path d="M-26 -6 L 0 -22 L 26 -6 Z" fill={OURO} />
          {[-20, -10, 0, 10, 20].map((ax) => (
            <rect key={ax} x={ax - 2} y={-6} width={4} height={18} fill="#f5ead0" />
          ))}
          <rect x={-28} y={12} width={56} height={5} fill={OURO} />
          {/* baú do tesouro */}
          <g transform="translate(36 6)">
            <rect x={-9} y={-6} width={18} height={12} fill="#8a5a2e" />
            <rect x={-9} y={-10} width={18} height={5} rx={2} fill="#a06a3a" />
            <rect x={-2} y={-6} width={4} height={5} fill={OURO} />
            <circle className="brilho-x" cx={0} cy={-14} r={3} fill={OURO} stroke="none" />
          </g>
        </>
      )}
    </g>
  );
}

/** Bandeirinha que tremula nas paradas já alcançadas. */
export function Bandeira({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <line x1={0} y1={0} x2={0} y2={-22} stroke={TINTA} strokeWidth={2} />
      <path className="bandeira" d="M0 -22 L 14 -18 L 0 -13 Z" fill="#c0283c" stroke={TINTA} strokeWidth={1} />
    </g>
  );
}
