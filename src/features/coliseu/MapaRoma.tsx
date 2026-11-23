import type { ReactNode } from 'react';
import type { IaId } from '@/game/personagens';
import { BAIRROS, type BairroId, type EstadoRoma, type HeroiRoma } from '@/game/historia/roma';
import { GladiadorPixel } from '@/ui/pixel/Personagens';

/**
 * O MAPA DE ROMA (22/11/2026): Roma inteira em pixel, com os bairros da história. O bairro da
 * cena pisca, os que ainda não foram visitados ficam na névoa, o próximo destino ganha um "!",
 * e os três aparecem onde cada um está. `mini`: o minimapa do canto (sem nomes nem retratos).
 */
const IA_DO_HEROI: Record<HeroiRoma, IaId> = { cassius: 'claude', octavius: 'chatgpt', helios: 'gemini' };

/** O desenho de cada bairro (pequeno, em pixel, centrado em x, y). */
function Predio({ id, x, y, ato }: { id: BairroId; x: number; y: number; ato: number }): ReactNode {
  const r = (dx: number, dy: number, w: number, h: number, cor: string, k?: string) => <rect key={k} x={x + dx} y={y + dy} width={w} height={h} fill={cor} />;
  switch (id) {
    case 'coliseu':
      return (
        <g>
          <ellipse cx={x} cy={y} rx={8} ry={5.5} fill="#c8a878" stroke="#6a4a2a" strokeWidth={0.8} />
          <ellipse cx={x} cy={y} rx={4.5} ry={2.8} fill="#e8d0a0" />
          {[-6, -3, 0, 3, 6].map((dx) => r(dx - 0.5, -4.6, 1, 1.4, '#6a4a2a', `a${dx}`))}
        </g>
      );
    case 'ludus':
      return (
        <g>
          {r(-6, -4, 12, 8, '#8a5a2a')}
          {r(-4, -2.4, 8, 4.8, '#d8b88a')}
          {r(-1, -1, 2, 2, '#6a4a2a')}
        </g>
      );
    case 'forum':
      return (
        <g>
          {r(-6, -5, 12, 1.6, '#c8bca8')}
          {[-5, -2, 1, 4].map((dx) => r(dx, -3.4, 1.2, 5, '#f0e8d8', `c${dx}`))}
          {r(-6.5, 1.6, 13, 1.6, '#a89c88')}
        </g>
      );
    case 'subura':
      return (
        <g>
          {[-6, -1, 4].map((dx, k) => (
            <g key={dx}>
              {r(dx - 2, -1 + (k % 2), 4.4, 4, '#d8b890')}
              <polygon points={`${x + dx - 2.6},${y - 1 + (k % 2)} ${x + dx + 0.2},${y - 4 + (k % 2)} ${x + dx + 3},${y - 1 + (k % 2)}`} fill="#b8543a" />
            </g>
          ))}
        </g>
      );
    case 'biblioteca':
      return (
        <g>
          <polygon points={`${x - 7},${y - 3} ${x},${y - 7} ${x + 7},${y - 3}`} fill="#8a3a2a" />
          {r(-6.5, -3, 13, 1.2, '#c8bca8')}
          {[-5.5, -2.5, 0.5, 3.5].map((dx) => r(dx, -1.8, 1.4, 5, '#e8dcc0', `b${dx}`))}
          {r(-7, 3.2, 14, 1.4, '#a89c88')}
          {/* No primeiro ato, a Biblioteca está pegando fogo */}
          {ato <= 1 && (
            <g className="mapa-fogo">
              {r(-5, -10, 2, 3, '#ff7a2a')}
              {r(-1, -12, 2, 4, '#ffb03a')}
              {r(3, -10, 2, 3, '#ff5a2a')}
            </g>
          )}
        </g>
      );
    case 'observatorio':
      return (
        <g>
          <path d={`M ${x - 5} ${y} A 5 5 0 0 1 ${x + 5} ${y} Z`} fill="#7a8aa8" stroke="#3a4a6a" strokeWidth={0.6} />
          {r(-6, 0, 12, 4, '#c8c0b0')}
          <line x1={x + 1} y1={y - 3} x2={x + 6} y2={y - 7} stroke="#3a4a6a" strokeWidth={1.2} />
        </g>
      );
    case 'templo':
      return (
        <g>
          <polygon points={`${x - 6},${y - 2.5} ${x},${y - 6} ${x + 6},${y - 2.5}`} fill="#f0e8d8" stroke="#a89c88" strokeWidth={0.5} />
          {[-4.5, -1.5, 1.5].map((dx) => r(dx, -2, 1.2, 4.6, '#f8f4ec', `t${dx}`))}
          {r(-6, 2.6, 12, 1.4, '#c8bca8')}
        </g>
      );
    case 'aqueduto':
      return (
        <g>
          {r(-9, -4, 18, 2, '#b8b0a0')}
          {[-8, -3.5, 1, 5.5].map((dx) => r(dx, -2, 1.6, 6, '#a8a090', `q${dx}`))}
          {r(-9, -4.6, 18, 0.8, '#5a8ac8')}
        </g>
      );
    case 'catacumbas':
      return (
        <g>
          {r(-6, -4, 12, 8, '#4a4038')}
          <path d={`M ${x - 3} ${y + 4} L ${x - 3} ${y} A 3 3 0 0 1 ${x + 3} ${y} L ${x + 3} ${y + 4} Z`} fill="#0c0a08" />
          {r(-1.4, -3, 2.8, 1.6, '#d8d0c0')}
        </g>
      );
    case 'porto':
      return (
        <g>
          {r(-8, 1, 10, 2, '#8a5a2a')}
          <path d={`M ${x + 1} ${y + 1} L ${x + 9} ${y + 1} L ${x + 7} ${y + 4} L ${x + 3} ${y + 4} Z`} fill="#6a4220" />
          <line x1={x + 5} y1={y + 1} x2={x + 5} y2={y - 6} stroke="#4a2a12" strokeWidth={0.7} />
          <polygon points={`${x + 5.4},${y - 6} ${x + 9},${y - 1} ${x + 5.4},${y - 1}`} fill="#f0e8d8" />
          {r(-8, -6, 2, 7, '#c8c0b0')}
          {r(-8.4, -7.4, 2.8, 1.6, '#ffb03a')}
        </g>
      );
  }
}

export function MapaRoma({ estado, mini = false }: { estado: EstadoRoma; mini?: boolean }) {
  const visto = (id: BairroId) => estado.visitados.includes(id);
  const centro = BAIRROS.find((b) => b.id === 'coliseu')!;
  // Onde fica cada um dos três (juntos, um do lado do outro).
  const marcadores = (Object.keys(estado.herois) as HeroiRoma[]).flatMap((h) => {
    const b = BAIRROS.find((x) => x.id === estado.herois[h]);
    return b ? [{ h, b }] : [];
  });
  return (
    <div className={`relative w-full ${mini ? '' : 'pixel-box'} overflow-hidden`} style={{ aspectRatio: '160 / 100' }}>
      <svg viewBox="0 0 160 100" className="absolute inset-0 h-full w-full" shapeRendering="crispEdges" aria-label={mini ? 'Minimapa de Roma' : 'Mapa de Roma'} role="img">
        <rect width="160" height="100" fill="#e6d4a8" />
        {/* manchas do pergaminho */}
        {!mini && [[20, 12], [120, 80], [70, 90], [150, 10]].map(([cx, cy]) => <circle key={`${cx}`} cx={cx} cy={cy} r={9} fill="#d8c290" opacity={0.5} />)}
        {/* o mar e o rio Tibre */}
        <path d="M 0 68 Q 22 74 34 86 L 44 100 L 0 100 Z" fill="#4a7ab8" />
        <path d="M 0 74 Q 18 80 28 90" stroke="#7aaae0" strokeWidth={0.6} fill="none" />
        <polyline points="72,0 66,14 60,28 56,44 52,58 44,72 36,84" stroke="#5a8ac8" strokeWidth={3} fill="none" />
        {/* a muralha da cidade */}
        <ellipse cx={92} cy={46} rx={56} ry={36} stroke="#8a6a4a" strokeWidth={1} strokeDasharray="3 2" fill="none" />
        {/* as estradas até o Coliseu */}
        {BAIRROS.filter((b) => b.id !== 'coliseu').map((b) => (
          <line key={b.id} x1={centro.x} y1={centro.y} x2={b.x} y2={b.y} stroke="#c8ae78" strokeWidth={1} opacity={visto(b.id) ? 0.9 : 0.35} />
        ))}
        {/* os bairros (os não visitados ficam na névoa) */}
        {BAIRROS.map((b) => (
          <g key={b.id} opacity={visto(b.id) ? 1 : 0.32} style={visto(b.id) ? undefined : { filter: 'grayscale(1)' }}>
            <Predio id={b.id} x={b.x} y={b.y} ato={estado.ato} />
            {/* depois do Encontro, as três estrelas vão sendo pintadas nos bairros visitados */}
            {visto(b.id) && estado.ato >= 4 && <polygon points={`${b.x + 8},${b.y - 7} ${b.x + 9},${b.y - 5} ${b.x + 11},${b.y - 5} ${b.x + 9.5},${b.y - 4} ${b.x + 10},${b.y - 2} ${b.x + 8},${b.y - 3.2} ${b.x + 6},${b.y - 2} ${b.x + 6.5},${b.y - 4} ${b.x + 5},${b.y - 5} ${b.x + 7},${b.y - 5}`} fill="#f2c14e" />}
            {!mini && (
              <text x={b.x} y={b.y + 10} textAnchor="middle" fontSize={3.6} fill={visto(b.id) ? '#3a2412' : '#7a6a54'} className="font-pixel" style={{ letterSpacing: '0.02em' }}>
                {visto(b.id) ? b.nome : '???'}
              </text>
            )}
          </g>
        ))}
        {/* onde a história está agora */}
        {(() => {
          const b = BAIRROS.find((x) => x.id === estado.atual)!;
          return <circle cx={b.x} cy={b.y} r={mini ? 10 : 9} fill="none" stroke="#e0281e" strokeWidth={mini ? 2 : 1.2} className="mapa-atual" />;
        })()}
        {/* o próximo destino */}
        {estado.proximo &&
          (() => {
            const b = BAIRROS.find((x) => x.id === estado.proximo)!;
            return (
              <g className="piscar">
                <rect x={b.x - 2.5} y={b.y - 16} width={5} height={6} fill="#f2c14e" stroke="#5a3a12" strokeWidth={0.6} />
                <rect x={b.x - 0.5} y={b.y - 15} width={1} height={2.8} fill="#3a2412" />
                <rect x={b.x - 0.5} y={b.y - 11.6} width={1} height={1} fill="#3a2412" />
              </g>
            );
          })()}
        {!mini && (
          <g>
            <text x={152} y={95} textAnchor="end" fontSize={3.4} fill="#5a3a12" className="font-pixel">
              ROMA ETERNA
            </text>
            {/* a rosa dos ventos */}
            <polygon points="12,8 13.5,14 12,13 10.5,14" fill="#5a3a12" />
            <text x={12} y={7} textAnchor="middle" fontSize={3} fill="#5a3a12" className="font-pixel">
              N
            </text>
          </g>
        )}
      </svg>
      {/* Os três, onde cada um está */}
      {!mini &&
        marcadores.map(({ h, b }, k) => {
          const juntosAqui = marcadores.filter((m) => m.b.id === b.id);
          const pos = juntosAqui.findIndex((m) => m.h === h);
          return (
            <div
              key={h}
              className="pointer-events-none absolute w-[6%]"
              style={{ left: `${((b.x - 4 + pos * 4) / 160) * 100}%`, top: `${((b.y - 20) / 100) * 100}%`, zIndex: 5 + k }}
              aria-label={`${h} está aqui`}
            >
              <div className="respirar">
                <GladiadorPixel ia={IA_DO_HEROI[h]} />
              </div>
            </div>
          );
        })}
    </div>
  );
}

/** A legenda do mapa grande: onde vocês estão e para onde vão. */
export function LegendaRoma({ estado, ato }: { estado: EstadoRoma; ato?: string }) {
  const nome = (id: BairroId | null) => BAIRROS.find((b) => b.id === id)?.nome ?? '';
  return (
    <div className="flex flex-col gap-1 text-xs text-white/85">
      {ato && <p className="font-pixel text-[9px] text-[#f2c14e]">AGORA: {ato.toUpperCase()}</p>}
      <p>
        {estado.juntos ? 'Os três estão em ' : 'A cena está em '}
        <b className="text-white">{nome(estado.atual)}</b>
        {estado.proximo ? (
          <>
            {' '}· próximo destino: <b className="text-[#f2c14e]">{nome(estado.proximo)}</b>
          </>
        ) : null}
      </p>
      <p className="text-[11px] text-muted">
        Bairros visitados: {estado.visitados.length} de {BAIRROS.length}. Os outros ainda estão na névoa.
      </p>
    </div>
  );
}
