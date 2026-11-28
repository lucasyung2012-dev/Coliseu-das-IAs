import type { ReactNode } from 'react';

/**
 * O PRIMEIRO PLANO DO DUELO (27/11/2026, pedido do Lucas: "as lutas com os chefões, mais
 * detalhe, tá muito básico"). Silhuetas escuras NA FRENTE da luta, nos cantos e em cima, que
 * balançam devagar: correntes nas catacumbas, cordas e barris no porto, a plateia na beira da
 * arena, livros e velas na biblioteca... Dá profundidade ao cenário sem tampar os lutadores.
 */
type Tipo = 'biblioteca' | 'subterraneo' | 'mar' | 'arena' | 'alto' | 'templo' | 'agua' | 'forum' | 'cofre';

function tipoDoLugar(lugar: string): Tipo | null {
  if (lugar.includes('biblioteca')) return 'biblioteca';
  if (lugar.includes('catacumba') || lugar.includes('hipogeu') || lugar.includes('arquivo') || lugar.includes('tunel')) return 'subterraneo';
  if (lugar.includes('porto') || lugar.includes('navio') || lugar.includes('galera') || lugar.includes('frota') || lugar.includes('mar')) return 'mar';
  if (lugar.includes('coliseu') || lugar.includes('arena')) return 'arena';
  if (lugar.includes('observatorio') || lugar.includes('telhado')) return 'alto';
  if (lugar.includes('templo')) return 'templo';
  if (lugar.includes('aqueduto')) return 'agua';
  if (lugar.includes('forum')) return 'forum';
  if (lugar.includes('cofre')) return 'cofre';
  return null;
}

const SOMBRA = '#08050a';

export function PrimeiroPlano({ lugar }: { lugar: string }) {
  const tipo = tipoDoLugar(lugar);
  if (!tipo) return null;
  let desenho: ReactNode = null;
  switch (tipo) {
    case 'biblioteca':
      desenho = (
        <>
          {/* pilhas de livros nos cantos e uma vela acesa */}
          {[0, 1, 2, 3, 4].map((k) => (
            <rect key={`l${k}`} x={-2 + (k % 2) * 3} y={150 - k * 7} width={34 - k * 3} height={7} fill={SOMBRA} />
          ))}
          {[0, 1, 2, 3].map((k) => (
            <rect key={`r${k}`} x={294 - (k % 2) * 4} y={156 - k * 7} width={30} height={7} fill={SOMBRA} />
          ))}
          <rect x={20} y={110} width={3} height={8} fill={SOMBRA} />
          <circle className="pp-chama" cx={21.5} cy={107} r={2.4} fill="#ffb03a" />
          <circle cx={21.5} cy={107} r={9} fill="#ffb03a" opacity={0.12} />
          {/* fagulhas subindo */}
          {[40, 90, 150, 230, 280].map((x, k) => (
            <rect key={`f${k}`} className="pp-fagulha" style={{ animationDelay: `${k * 700}ms` }} x={x} y={170} width={1.5} height={1.5} fill="#ff8a3a" />
          ))}
        </>
      );
      break;
    case 'subterraneo':
      desenho = (
        <>
          {/* correntes penduradas balançando */}
          {[24, 70, 252, 300].map((x, k) => (
            <g key={x} className="pp-balanca" style={{ transformOrigin: `${x}px 0px`, animationDelay: `${k * 400}ms` }}>
              {Array.from({ length: 6 + (k % 2) * 3 }, (_, j) => (
                <rect key={j} x={x - 1.5} y={j * 5} width={3} height={4} fill={SOMBRA} stroke="#2a2420" strokeWidth={0.5} />
              ))}
            </g>
          ))}
          {/* pilha de crânios e pedras nos cantos */}
          <path d="M -4 180 L -4 150 Q 10 140 26 152 Q 34 160 40 180 Z" fill={SOMBRA} />
          <path d="M 324 180 L 324 146 Q 306 138 292 154 Q 286 164 282 180 Z" fill={SOMBRA} />
          {[6, 16, 300, 310].map((x) => (
            <g key={`c${x}`}>
              <circle cx={x} cy={154} r={4} fill="#1a1612" />
              <rect x={x - 2} y={153} width={1.4} height={1.4} fill="#000" />
              <rect x={x + 0.6} y={153} width={1.4} height={1.4} fill="#000" />
            </g>
          ))}
        </>
      );
      break;
    case 'mar':
      desenho = (
        <>
          {/* cordas do mastro saindo dos cantos de cima */}
          <path className="pp-balanca-lenta" d="M -4 -4 Q 40 30 90 -4" stroke={SOMBRA} strokeWidth={2.5} fill="none" />
          <path className="pp-balanca-lenta" style={{ animationDelay: '600ms' }} d="M 324 -4 Q 280 36 236 -4" stroke={SOMBRA} strokeWidth={2.5} fill="none" />
          <line x1={-4} y1={20} x2={60} y2={-4} stroke={SOMBRA} strokeWidth={1.6} />
          {/* barris e um rolo de corda na frente */}
          <rect x={-6} y={140} width={24} height={40} rx={6} fill={SOMBRA} />
          {[148, 160, 172].map((y) => (
            <rect key={y} x={-6} y={y} width={24} height={2} fill="#2a1a10" />
          ))}
          <ellipse cx={304} cy={170} rx={22} ry={10} fill={SOMBRA} />
          <ellipse cx={304} cy={168} rx={12} ry={5} fill="none" stroke="#2a1a10" strokeWidth={1.2} />
          {/* respingos de água */}
          {[60, 140, 220].map((x, k) => (
            <rect key={x} className="pp-respingo" style={{ animationDelay: `${k * 500}ms` }} x={x} y={176} width={2} height={2} fill="#9ac4f0" />
          ))}
        </>
      );
      break;
    case 'arena':
      desenho = (
        <>
          {/* a plateia na beira da arena: cabeças balançando bem na frente */}
          {Array.from({ length: 34 }, (_, k) => (
            <g key={k} className="pp-cabeca" style={{ animationDelay: `${(k * 137) % 900}ms` }}>
              <circle cx={k * 10 - 4} cy={176 - (k % 3)} r={6} fill={SOMBRA} />
              <rect x={k * 10 - 9} y={178 - (k % 3)} width={10} height={6} fill={SOMBRA} />
              {k % 7 === 2 && <rect x={k * 10 - 2} y={160 - (k % 3)} width={2} height={10} fill={SOMBRA} />}
              {k % 7 === 2 && <rect x={k * 10} y={160 - (k % 3)} width={8} height={5} fill="#c0283c" opacity={0.9} />}
            </g>
          ))}
          {/* estandartes pendurados em cima */}
          {[30, 290].map((x, k) => (
            <g key={x} className="pp-balanca-lenta" style={{ transformOrigin: `${x}px 0px`, animationDelay: `${k * 500}ms` }}>
              <rect x={x - 8} y={0} width={16} height={34} fill="#5a1018" />
              <polygon points={`${x - 8},34 ${x},28 ${x + 8},34 ${x + 8},40 ${x - 8},40`} fill="#5a1018" />
              <circle cx={x} cy={16} r={4} fill="#c8962a" opacity={0.8} />
            </g>
          ))}
        </>
      );
      break;
    case 'alto':
      desenho = (
        <>
          {/* beirada de telhado e uma chaminé na frente */}
          <path d="M -4 180 L -4 152 L 46 164 L 52 180 Z" fill={SOMBRA} />
          {[0, 1, 2, 3, 4].map((k) => (
            <rect key={k} x={-4 + k * 10} y={153 + k * 2.4} width={9} height={2} fill="#1a1016" />
          ))}
          <rect x={290} y={130} width={18} height={50} fill={SOMBRA} />
          <rect x={287} y={126} width={24} height={6} fill={SOMBRA} />
          <circle className="pp-fumaca" cx={299} cy={120} r={6} fill="#5a5060" opacity={0.5} />
          <circle className="pp-fumaca" style={{ animationDelay: '1200ms' }} cx={299} cy={120} r={6} fill="#5a5060" opacity={0.5} />
        </>
      );
      break;
    case 'templo':
      desenho = (
        <>
          {/* colunas cortadas nas beiradas e a fumaça do incenso */}
          <rect x={-6} y={0} width={22} height={180} fill={SOMBRA} />
          {[2, 8].map((x) => (
            <rect key={x} x={x} y={0} width={1.4} height={180} fill="#1a1420" />
          ))}
          <rect x={304} y={0} width={22} height={180} fill={SOMBRA} />
          <rect x={300} y={160} width={30} height={20} fill={SOMBRA} />
          {[0, 1, 2].map((k) => (
            <circle key={k} className="pp-fumaca" style={{ animationDelay: `${k * 900}ms` }} cx={30} cy={170} r={5} fill="#b8a8e0" opacity={0.35} />
          ))}
        </>
      );
      break;
    case 'agua':
      desenho = (
        <>
          {/* a pedra do aqueduto na frente e gotas caindo */}
          <path d="M -4 180 L -4 140 Q 20 130 34 150 L 34 180 Z" fill={SOMBRA} />
          <path d="M 324 180 L 324 136 Q 300 128 288 148 L 288 180 Z" fill={SOMBRA} />
          {[20, 60, 260, 300].map((x, k) => (
            <rect key={x} className="pp-gota" style={{ animationDelay: `${k * 450}ms` }} x={x} y={0} width={1.5} height={4} fill="#9ac4f0" />
          ))}
        </>
      );
      break;
    case 'forum':
      desenho = (
        <>
          {/* estandartes do Censor e uma estátua cortada na beirada */}
          {[40, 280].map((x, k) => (
            <g key={x} className="pp-balanca-lenta" style={{ transformOrigin: `${x}px 0px`, animationDelay: `${k * 700}ms` }}>
              <rect x={x - 9} y={0} width={18} height={40} fill="#4a0a10" />
              <ellipse cx={x} cy={20} rx={6} ry={3.4} fill="#d8ccb4" opacity={0.7} />
              <circle cx={x} cy={20} r={1.8} fill="#0a0a0a" />
            </g>
          ))}
          <path d="M -4 180 L -4 120 L 10 112 L 22 120 L 22 150 L 34 160 L 34 180 Z" fill={SOMBRA} />
        </>
      );
      break;
    case 'cofre':
      desenho = (
        <>
          {/* pilhas de moedas e um baú na frente */}
          {[0, 1, 2, 3].map((k) => (
            <ellipse key={k} cx={20} cy={172 - k * 4} rx={16 - k * 2} ry={4} fill={SOMBRA} stroke="#5a4010" strokeWidth={0.5} />
          ))}
          <rect x={282} y={150} width={40} height={30} fill={SOMBRA} />
          <rect x={282} y={146} width={40} height={6} fill="#1a1006" />
          <circle className="pp-chama" cx={300} cy={160} r={1.6} fill="#f2c14e" />
        </>
      );
      break;
  }
  return (
    <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" className="primeiro-plano pointer-events-none absolute inset-0 z-[12] h-full w-full" aria-hidden>
      {desenho}
    </svg>
  );
}
