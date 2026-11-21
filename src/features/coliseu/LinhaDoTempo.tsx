import { useState, type ReactNode } from 'react';
import { PERSONAGENS, type IaId } from '@/game/personagens';
import { CAPITULOS } from '@/game/historia/roteiro';
import { chaveCompleta } from '@/game/historia/roteiro4';
import type { SaveHistoria } from '@/game/historia/saves';
import { saveTerminado } from '@/game/premiosHistoria';
import { tocar } from '@/ui/somHistoria';

/**
 * O MAPA DE ROMA (a linha do tempo da História; detalhado em 22/11/2026, a pedido do
 * Lucas). Três estradas retas, cada uma do seu lado: a Biblioteca (Cassius, noroeste),
 * o Observatório (Helios, nordeste) e o Porto (Octavius, sul, no mar). No capítulo 3
 * elas passam pelo anel do Ludus e chegam juntas ao Coliseu. Cada capítulo tem o seu
 * desenho do lado do ponto. Debaixo da arena, a grade do segredo.
 */
const IAS: IaId[] = ['claude', 'chatgpt', 'gemini'];
const L = 360;
const A = 252;
const COLISEU: [number, number] = [180, 122];
const ORIGENS: Record<IaId, [number, number]> = {
  claude: [46, 40],
  gemini: [314, 40],
  chatgpt: [180, 226],
};
const NOME_ORIGEM: Record<IaId, string> = { claude: 'BIBLIOTECA', chatgpt: 'PORTO DE ÓSTIA', gemini: 'OBSERVATÓRIO' };
const RAIO_LUDUS = 64;

/** O desenho de cada capítulo (o 3 é o Ludus, que fica no anel). */
type Marco = 'biblioteca' | 'ruas' | 'catacumbas' | 'forum' | 'arena' | 'porto' | 'gale' | 'subura' | 'frota' | 'naumaquia' | 'observatorio' | 'telhados' | 'aqueduto' | 'templo' | 'eclipse';
const MARCOS: Record<IaId, (Marco | null)[]> = {
  claude: ['biblioteca', 'ruas', null, 'catacumbas', 'forum', 'arena'],
  chatgpt: ['porto', 'gale', null, 'subura', 'frota', 'naumaquia'],
  gemini: ['observatorio', 'telhados', null, 'aqueduto', 'templo', 'eclipse'],
};

/** Onde cai cada capítulo e para que lado vai o desenho (para fora da estrada). */
const PONTOS: Record<IaId, { x: number; y: number; px: number; py: number }[]> = Object.fromEntries(
  IAS.map((ia) => {
    const [ox, oy] = ORIGENS[ia];
    const dx = ox - COLISEU[0];
    const dy = oy - COLISEU[1];
    const tam = Math.hypot(dx, dy);
    const ux = dx / tam;
    const uy = dy / tam;
    const dist = [tam, (tam + RAIO_LUDUS) / 2, RAIO_LUDUS, 52, 41, 30];
    // Perpendicular, sempre para o mesmo lado (sentido horário): os desenhos não batem nas outras estradas.
    return [ia, dist.map((d) => ({ x: COLISEU[0] + ux * d, y: COLISEU[1] + uy * d, px: -uy, py: ux }))];
  }),
) as Record<IaId, { x: number; y: number; px: number; py: number }[]>;

function alcance(saves: SaveHistoria[], ia: IaId): { capitulo: number; terminou: boolean } {
  const meus = saves.filter((s) => !s.secreto && s.gladiador === ia);
  return { capitulo: Math.max(0, ...meus.map((s) => s.capitulo)), terminou: meus.some(saveTerminado) };
}

type Escolhido = { ia: IaId; n: number } | { segredo: true } | null;

export function LinhaDoTempo({ saves, segredos }: { saves: SaveHistoria[]; segredos: string[] | undefined }) {
  const [escolhido, setEscolhido] = useState<Escolhido>(null);
  const chegou = Object.fromEntries(IAS.map((ia) => [ia, alcance(saves, ia)])) as Record<IaId, { capitulo: number; terminou: boolean }>;
  const temChave = chaveCompleta(segredos);
  const secretoFeito = saves.some((s) => s.secreto && saveTerminado(s));
  const estado = (ia: IaId, n: number) => {
    const { capitulo, terminou } = chegou[ia];
    if (terminou || capitulo > n) return 'feito' as const;
    if (capitulo === n) return 'aqui' as const;
    return 'nao' as const;
  };
  const escolher = (e: Escolhido) => {
    tocar('pagina');
    setEscolhido(e);
  };

  let info: { titulo: string; texto: string; cor: string } | null = null;
  if (escolhido && 'segredo' in escolhido) {
    info = secretoFeito
      ? { titulo: 'OS TRÊS', texto: 'Você abriu o segredo. O Coliseu agora é livre.', cor: '#f2c14e' }
      : temChave
        ? { titulo: 'A GRADE DEBAIXO DA ARENA', texto: 'A chave está inteira. Procure a grade no título lá em cima...', cor: '#7ad0ff' }
        : { titulo: '???', texto: 'Dizem que, depois dos três caminhos, existe um último capítulo debaixo da arena.', cor: '#aaa' };
  } else if (escolhido) {
    const cap = CAPITULOS[escolhido.ia][escolhido.n - 1];
    const st = estado(escolhido.ia, escolhido.n);
    const cor = `rgb(${PERSONAGENS[escolhido.ia].cor})`;
    const quem = PERSONAGENS[escolhido.ia].gladiador.toUpperCase();
    info =
      st === 'nao' || !cap
        ? { titulo: `${quem} · CAPÍTULO ${escolhido.n}: ???`, texto: 'Ainda não. Siga a estrada para descobrir.', cor }
        : { titulo: `${quem} · CAPÍTULO ${escolhido.n}: ${cap.titulo.toUpperCase()}`, texto: `${cap.lugar}${st === 'aqui' ? ' · você está aqui' : ' · feito'}`, cor };
  }

  return (
    <section aria-label="Mapa de Roma" className="mapa-roma flex flex-col gap-2">
      <div className="relative w-full overflow-hidden border-4 border-[#5a3a1a] shadow-[0_0_0_2px_#c8962a]">
        <svg viewBox={`0 0 ${L} ${A}`} className="block w-full" role="img" aria-label="O mapa de Roma com as três estradas">
          <defs>
            <pattern id="mr-papel" width="10" height="10" patternUnits="userSpaceOnUse">
              <rect width="10" height="10" fill="#e8d4a2" />
              <rect x="2" y="3" width="1" height="1" fill="#dcc48c" />
              <rect x="7" y="8" width="1" height="1" fill="#dcc48c" />
            </pattern>
            <radialGradient id="mr-borda" cx="0.5" cy="0.5" r="0.75">
              <stop offset="0.65" stopColor="#000" stopOpacity="0" />
              <stop offset="1" stopColor="#5a3410" stopOpacity="0.45" />
            </radialGradient>
          </defs>
          <rect width={L} height={A} fill="url(#mr-papel)" />

          {/* O mar no sul, com ondas e um navio */}
          <path d={`M0 214 Q90 204 180 214 Q270 224 ${L} 210 V${A} H0 Z`} fill="#7ab4cc" />
          <path d={`M0 214 Q90 204 180 214 Q270 224 ${L} 210`} fill="none" stroke="#5a90aa" strokeWidth="1.5" />
          {[20, 70, 120, 250, 300, 340].map((x, k) => (
            <path key={x} d={`M${x} ${232 + (k % 2) * 8} q3 -2 6 0 q3 2 6 0`} fill="none" stroke="#e0f2f8" strokeWidth="1" />
          ))}
          <g transform="translate(318 230)">
            <path d="M-12 0 H12 L8 6 H-8 Z" fill="#6a4220" />
            <rect x="-1" y="-16" width="2" height="16" fill="#4a2a14" />
            <path d="M1 -15 L11 -6 H1 Z" fill="#f0e6cc" />
          </g>

          {/* O rio Tibre, no oeste, descendo até o mar */}
          <path d="M14 0 Q30 40 18 80 Q6 120 26 160 Q40 190 34 214" fill="none" stroke="#7ab4cc" strokeWidth="7" strokeLinecap="round" />
          <path d="M14 0 Q30 40 18 80 Q6 120 26 160 Q40 190 34 214" fill="none" stroke="#a8d0e0" strokeWidth="2" strokeLinecap="round" />

          {/* A muralha da cidade (pontilhada, com torres) */}
          <circle cx={COLISEU[0]} cy={COLISEU[1]} r="104" fill="none" stroke="#a88a64" strokeWidth="3" strokeDasharray="10 6" />
          {Array.from({ length: 12 }, (_, k) => {
            const a = (k / 12) * Math.PI * 2 + 0.2;
            return <rect key={k} x={COLISEU[0] + Math.cos(a) * 104 - 3} y={COLISEU[1] + Math.sin(a) * 104 - 3} width="6" height="6" fill="#a88a64" stroke="#6a4a2a" strokeWidth="0.8" />;
          })}

          {/* Árvores nos cantos */}
          {[
            [96, 20],
            [108, 28],
            [252, 22],
            [264, 30],
            [330, 120],
            [340, 140],
            [70, 150],
            [60, 168],
            [300, 180],
            [120, 196],
          ].map(([x, y], k) => (
            <g key={k}>
              <rect x={x! - 0.8} y={y! + 3} width="1.6" height="3" fill="#6a4a2a" />
              <circle cx={x} cy={y} r="4.5" fill={k % 2 ? '#7a9a4a' : '#8aaa5a'} />
            </g>
          ))}

          {/* O título do mapa */}
          <g transform={`translate(${L / 2} 16)`}>
            <path d="M-56 -9 H56 L62 0 L56 9 H-56 L-62 0 Z" fill="#f4e6c0" stroke="#6a4220" strokeWidth="1.5" />
            <text y="3.5" textAnchor="middle" fontSize="9" className="font-pixel" fill="#5a2a10">
              ROMA ETERNA
            </text>
          </g>

          {/* O anel do Ludus: no capítulo 3, as três estradas passam por ele */}
          <circle cx={COLISEU[0]} cy={COLISEU[1]} r={RAIO_LUDUS} fill="none" stroke="#c8962a" strokeWidth="2.2" strokeDasharray="4 3" />
          <Ludus x={COLISEU[0] + RAIO_LUDUS * 0.71} y={COLISEU[1] + RAIO_LUDUS * 0.71} />

          {/* As estradas (pontilhadas; pintadas até onde você chegou) */}
          {IAS.map((ia) => {
            const cor = `rgb(${PERSONAGENS[ia].cor})`;
            const pts = [...PONTOS[ia].map((p) => [p.x, p.y] as [number, number]), COLISEU];
            return pts.slice(1).map(([x2, y2], k) => {
              const [x1, y1] = pts[k]!;
              const feito = estado(ia, k + 1) === 'feito';
              return (
                <g key={`${ia}-${k}`}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#b89a70" strokeWidth="6" strokeLinecap="round" />
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={feito ? cor : '#8a6a4a'} strokeWidth={feito ? 3 : 1.6} strokeDasharray={feito ? undefined : '4 3'} strokeLinecap="round" />
                </g>
              );
            });
          })}

          {/* Os desenhos de cada lugar, do lado do ponto */}
          {IAS.map((ia) =>
            PONTOS[ia].map((p, k) => {
              const m = MARCOS[ia][k];
              if (!m) return null;
              const longe = k <= 1 ? 17 : 13;
              return <Desenho key={`${ia}-m${k}`} tipo={m} x={p.x + p.px * longe} y={p.y + p.py * longe} apagado={estado(ia, k + 1) === 'nao'} />;
            }),
          )}

          {/* O Coliseu no centro */}
          <Coliseu x={COLISEU[0]} y={COLISEU[1]} />
          {/* A grade do segredo, no chão da arena */}
          <g role="button" tabIndex={0} aria-label="A grade debaixo da arena" onClick={() => escolher({ segredo: true })} className="cursor-pointer">
            <rect x={COLISEU[0] - 5} y={COLISEU[1] - 1} width="10" height="7" fill={secretoFeito ? '#f2c14e' : temChave ? '#7ad0ff' : '#4a3a2a'} stroke="#1a0e06" />
            {[0, 2.5, 5, 7.5].map((dx) => (
              <rect key={dx} x={COLISEU[0] - 4 + dx} y={COLISEU[1]} width="0.9" height="5" fill="#1a0e06" />
            ))}
          </g>

          {/* O nome de onde cada um sai */}
          {IAS.map((ia) => {
            const p = PONTOS[ia][0]!;
            // Sul: à direita do ponto. Norte: embaixo do ponto (o desenho fica do outro lado).
            const caixaX = ia === 'chatgpt' ? p.x + 10 : ia === 'claude' ? p.x - 42 : p.x - 30;
            const caixaY = ia === 'chatgpt' ? p.y - 6 : p.y + 9;
            return (
              <g key={`nome-${ia}`}>
                <rect x={caixaX} y={caixaY} width="72" height="11" fill="#f4e6c0" stroke="#6a4220" strokeWidth="0.8" opacity="0.94" />
                <text x={caixaX + 36} y={caixaY + 8} textAnchor="middle" fontSize="6.5" className="font-pixel" fill={`rgb(${PERSONAGENS[ia].cor})`} stroke="#3a2410" strokeWidth="0.25">
                  {NOME_ORIGEM[ia]}
                </text>
              </g>
            );
          })}

          {/* Os pontos de cada capítulo */}
          {IAS.map((ia) =>
            PONTOS[ia].map((p, k) => {
              const n = k + 1;
              const st = estado(ia, n);
              const cor = `rgb(${PERSONAGENS[ia].cor})`;
              return (
                <g
                  key={`${ia}-${n}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`${PERSONAGENS[ia].gladiador}, capítulo ${n}`}
                  onClick={() => escolher({ ia, n })}
                  onKeyDown={(ev) => {
                    if (ev.key === 'Enter' || ev.key === ' ') escolher({ ia, n });
                  }}
                  className={`cursor-pointer ${st === 'aqui' ? 'mapa-aqui' : ''}`}
                  style={{ transformOrigin: `${p.x}px ${p.y}px` }}
                >
                  <circle cx={p.x} cy={p.y} r="6.2" fill={st === 'nao' ? '#efe0b8' : cor} stroke={st === 'aqui' ? '#ffffff' : st === 'nao' ? '#a08060' : '#3a2410'} strokeWidth={st === 'aqui' ? 2 : 1.3} />
                  <text x={p.x} y={p.y + 2.5} textAnchor="middle" fontSize="7" className="font-pixel" fill={st === 'nao' ? '#a08060' : '#1a0e06'}>
                    {st === 'feito' ? '✓' : n}
                  </text>
                </g>
              );
            }),
          )}

          {/* A rosa dos ventos */}
          <g transform={`translate(${L - 28} 188)`}>
            <circle r="13" fill="#f4e6c0" stroke="#6a4220" strokeWidth="1" />
            <path d="M0 -12 L3 0 L0 12 L-3 0 Z" fill="#8a3a1a" />
            <path d="M-12 0 L0 3 L12 0 L0 -3 Z" fill="#6a4220" />
            <text y="-15" textAnchor="middle" fontSize="6" className="font-pixel" fill="#5a2a10">
              N
            </text>
          </g>
          {/* A borda envelhecida do pergaminho */}
          <rect width={L} height={A} fill="url(#mr-borda)" pointerEvents="none" />
        </svg>
      </div>

      {/* O que é o ponto tocado */}
      <div className="min-h-[3.4rem] border-2 bg-black/40 p-2" style={{ borderColor: info?.cor ?? '#5a3a1a' }}>
        {info ? (
          <>
            <p className="font-pixel text-[8px] sm:text-[10px]" style={{ color: info.cor }}>
              {info.titulo}
            </p>
            <p className="mt-1 text-xs text-white/80">{info.texto}</p>
          </>
        ) : (
          <p className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
            {IAS.map((ia) => (
              <span key={ia} className="inline-flex items-center gap-1">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: `rgb(${PERSONAGENS[ia].cor})` }} />
                {PERSONAGENS[ia].gladiador}
                {chegou[ia].terminou ? ' · completo' : chegou[ia].capitulo > 0 ? ` · capítulo ${Math.min(7, chegou[ia].capitulo)}` : ' · não começou'}
              </span>
            ))}
            <span className="w-full">Toque num ponto para ver o capítulo.</span>
          </p>
        )}
      </div>
    </section>
  );
}

/** O Coliseu, com os arcos e a arena. */
function Coliseu({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <ellipse cx={x} cy={y + 3} rx="25" ry="16" fill="#00000022" />
      <ellipse cx={x} cy={y} rx="24" ry="16" fill="#c89a62" stroke="#5a3a1a" strokeWidth="1.8" />
      <ellipse cx={x} cy={y} rx="19" ry="12" fill="#b88a52" />
      {Array.from({ length: 14 }, (_, k) => {
        const a = (k / 14) * Math.PI * 2;
        return <rect key={k} x={x + Math.cos(a) * 21.5 - 1} y={y + Math.sin(a) * 14 - 1.2} width="2" height="2.4" fill="#4a2a10" />;
      })}
      <ellipse cx={x} cy={y + 1} rx="12" ry="7" fill="#ecd4a0" />
      <text x={x} y={y - 19} textAnchor="middle" fontSize="7" className="font-pixel" fill="#3a2410">
        COLISEU
      </text>
    </g>
  );
}

/** O Ludus, a escola de gladiadores (no anel). */
function Ludus({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-11" y="-6" width="22" height="12" fill="#c8a070" stroke="#5a3a1a" strokeWidth="1" />
      <rect x="-7" y="-3" width="14" height="6" fill="#e6c890" />
      <rect x="-1" y="-3" width="2" height="6" fill="#8a5a2a" />
      <text y="15" textAnchor="middle" fontSize="6.5" className="font-pixel" fill="#8a4a10">
        LUDUS
      </text>
    </g>
  );
}

/** Os desenhos dos lugares de cada capítulo (pequenos). */
function Desenho({ tipo, x, y, apagado }: { tipo: Marco; x: number; y: number; apagado: boolean }) {
  const d: Record<Marco, ReactNode> = {
    biblioteca: (
      <>
        <path d="M-12 -4 L0 -12 L12 -4 Z" fill="#c8862a" stroke="#4a2a10" strokeWidth="0.8" />
        <rect x="-11" y="-4" width="22" height="2" fill="#e8d0a0" />
        {[-9, -4, 1, 6].map((c) => (
          <rect key={c} x={c} y="-2" width="2.4" height="9" fill="#f4ead2" stroke="#8a6a4a" strokeWidth="0.4" />
        ))}
        <rect x="-12" y="7" width="24" height="2.5" fill="#c8b08a" />
      </>
    ),
    ruas: (
      <>
        {[-9, 0, 8].map((c, k) => (
          <g key={c}>
            <rect x={c - 4} y={-3 + (k % 2) * 2} width="8" height="8" fill="#e8d0a0" stroke="#6a4a2a" strokeWidth="0.6" />
            <path d={`M${c - 5} ${-3 + (k % 2) * 2} L${c} ${-8 + (k % 2) * 2} L${c + 5} ${-3 + (k % 2) * 2} Z`} fill="#b83a2a" />
            <rect x={c - 1} y={1 + (k % 2) * 2} width="2" height="4" fill="#5a3418" />
          </g>
        ))}
      </>
    ),
    catacumbas: (
      <>
        <path d="M-10 6 Q-10 -8 0 -8 Q10 -8 10 6 Z" fill="#8a7a6a" stroke="#3a2a1a" strokeWidth="0.8" />
        <path d="M-6 6 Q-6 -3 0 -3 Q6 -3 6 6 Z" fill="#1a1008" />
        <circle cx="0" cy="1" r="1.5" fill="#f0e8d8" />
      </>
    ),
    forum: (
      <>
        <rect x="-13" y="5" width="26" height="3" fill="#c8b08a" />
        {[-11, -6, -1, 4, 9].map((c) => (
          <rect key={c} x={c} y="-6" width="2.4" height="11" fill="#f4ead2" stroke="#8a6a4a" strokeWidth="0.4" />
        ))}
        <rect x="-13" y="-8" width="26" height="2.5" fill="#e8d8b8" stroke="#8a6a4a" strokeWidth="0.4" />
      </>
    ),
    arena: <path d="M0 -8 V6 M0 -8 L8 -5 L0 -2" fill="#e0782c" stroke="#4a2a10" strokeWidth="1" />,
    porto: (
      <>
        <rect x="-12" y="2" width="16" height="3" fill="#8a5a2a" />
        {[-10, -4, 2].map((c) => (
          <rect key={c} x={c} y="5" width="1.4" height="5" fill="#5a3418" />
        ))}
        <path d="M2 4 H14 L11 8 H5 Z" fill="#6a4220" />
        <rect x="7.5" y="-8" width="1.2" height="12" fill="#4a2a14" />
        <path d="M9 -7 L14 0 H9 Z" fill="#f0e6cc" />
      </>
    ),
    gale: (
      <>
        <path d="M-12 0 H12 L9 5 H-9 Z" fill="#5a3418" stroke="#2a1408" strokeWidth="0.6" />
        {[-8, -4, 0, 4, 8].map((c) => (
          <line key={c} x1={c} y1="4" x2={c - 2} y2="9" stroke="#2a1408" strokeWidth="0.8" />
        ))}
        <rect x="-0.6" y="-11" width="1.2" height="11" fill="#2a1408" />
        <rect x="-7" y="-10" width="14" height="7" fill="#b83a2a" />
      </>
    ),
    subura: (
      <>
        {[-9, -3, 3, 9].map((c, k) => (
          <rect key={c} x={c - 3} y={-6 - (k % 2) * 3} width="6" height={12 + (k % 2) * 3} fill="#d8b890" stroke="#6a4a2a" strokeWidth="0.5" />
        ))}
        {[-9, -3, 3, 9].map((c, k) => (
          <rect key={`j${c}`} x={c - 1} y={-3 - (k % 2) * 3} width="2" height="2" fill="#5a3418" />
        ))}
        <path d="M-12 6 L-7 2 L-2 6 Z" fill="#2aa08a" />
      </>
    ),
    frota: (
      <>
        {[-7, 6].map((c, k) => (
          <g key={c} transform={`translate(${c} ${k * 3})`}>
            <path d="M-6 0 H6 L4 4 H-4 Z" fill="#2a2a34" />
            <rect x="-0.5" y="-9" width="1" height="9" fill="#1a1a20" />
            <path d="M0.5 -8 L5 -2 H0.5 Z" fill="#4a4a5a" />
          </g>
        ))}
      </>
    ),
    naumaquia: (
      <>
        <path d="M-8 0 q2 -2 4 0 q2 2 4 0 q2 -2 4 0 q2 2 4 0" fill="none" stroke="#3a7aa0" strokeWidth="1.4" />
        <path d="M-8 4 q2 -2 4 0 q2 2 4 0 q2 -2 4 0 q2 2 4 0" fill="none" stroke="#3a7aa0" strokeWidth="1.4" />
      </>
    ),
    observatorio: (
      <>
        <rect x="-5" y="-4" width="10" height="13" fill="#d8c8a8" stroke="#6a5a4a" strokeWidth="0.6" />
        <path d="M-6 -4 Q0 -14 6 -4 Z" fill="#3a6aa0" stroke="#24466a" strokeWidth="0.6" />
        <line x1="2" y1="-8" x2="10" y2="-14" stroke="#c8962a" strokeWidth="1.8" />
        <rect x="-1.5" y="2" width="3" height="7" fill="#5a3418" />
        <circle cx="10" cy="-16" r="1.2" fill="#f2c14e" />
      </>
    ),
    telhados: (
      <>
        <path d="M-13 6 L-8 0 L-3 6 L2 -1 L7 6 L12 1 V9 H-13 Z" fill="#9a4a2a" stroke="#4a2010" strokeWidth="0.6" />
        <circle cx="8" cy="-8" r="3" fill="#f4ead2" />
        <circle cx="9.5" cy="-9" r="2.6" fill="#e8d4a2" />
      </>
    ),
    aqueduto: (
      <>
        <rect x="-13" y="-6" width="26" height="3" fill="#b8987a" />
        {[-12, -6, 0, 6].map((c) => (
          <path key={c} d={`M${c} 8 V-3 H${c + 6} V8 H${c + 4.5} V1 Q${c + 3} -1 ${c + 1.5} 1 V8 Z`} fill="#b8987a" stroke="#6a4a2a" strokeWidth="0.4" />
        ))}
        <rect x="-13" y="-7" width="26" height="1.2" fill="#7ab4cc" />
      </>
    ),
    templo: (
      <>
        <path d="M-10 -3 L0 -10 L10 -3 Z" fill="#e8d8b8" stroke="#8a6a4a" strokeWidth="0.6" />
        {[-8, -3, 2, 6].map((c) => (
          <rect key={c} x={c} y="-3" width="2" height="9" fill="#f4ead2" stroke="#8a6a4a" strokeWidth="0.3" />
        ))}
        <rect x="-11" y="6" width="22" height="2.4" fill="#c8b08a" />
        <circle cx="0" cy="-6" r="2" fill="#f2c14e" />
      </>
    ),
    eclipse: (
      <>
        <circle r="7" fill="#f2c14e" />
        <circle r="6" cx="1" fill="#2a1a40" />
      </>
    ),
  };
  return (
    <g transform={`translate(${x} ${y})`} opacity={apagado ? 0.55 : 1} style={{ filter: apagado ? 'grayscale(0.6)' : undefined }}>
      {d[tipo]}
    </g>
  );
}
