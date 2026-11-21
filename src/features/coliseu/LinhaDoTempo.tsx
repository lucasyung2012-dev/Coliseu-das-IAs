import { useState } from 'react';
import { PERSONAGENS, type IaId } from '@/game/personagens';
import { CAPITULOS } from '@/game/historia/roteiro';
import { chaveCompleta } from '@/game/historia/roteiro4';
import type { SaveHistoria } from '@/game/historia/saves';
import { saveTerminado } from '@/game/premiosHistoria';
import { tocar } from '@/ui/somHistoria';

/**
 * O MAPA DE ROMA (a linha do tempo da História, refeita em 22/11/2026: o Lucas escolheu
 * o mapa). Três estradas saem da Biblioteca (Cassius), do Porto (Octavius) e do
 * Observatório (Helios), passam pelo Ludus (onde os três se conhecem), se separam e
 * chegam juntas ao Coliseu. Cada capítulo é um ponto na estrada: feito (pintado), onde
 * você está (piscando) ou ainda não (?). Debaixo da arena, a grade do segredo.
 */
const IAS: IaId[] = ['claude', 'chatgpt', 'gemini'];

/**
 * As estradas (refeitas em 22/11/2026, o Lucas achou o mapa bagunçado): cada uma vem reta
 * do seu lado até o Coliseu, sem cruzar as outras. O capítulo 3 (o Ludus) fica num anel
 * dourado em volta da arena, onde as três passam. O 7 é o próprio Coliseu.
 */
const COLISEU: [number, number] = [160, 116];
const ORIGENS: Record<IaId, [number, number]> = {
  claude: [42, 34], // a Grande Biblioteca, no noroeste
  gemini: [278, 34], // o Observatório, no nordeste
  chatgpt: [160, 204], // o Porto, no sul (no mar)
};
/** O anel do Ludus: a mesma distância do Coliseu nas três estradas. */
const RAIO_LUDUS = 62;
const PONTOS: Record<IaId, [number, number][]> = Object.fromEntries(
  (Object.keys(ORIGENS) as IaId[]).map((ia) => {
    const [ox, oy] = ORIGENS[ia];
    const dx = ox - COLISEU[0];
    const dy = oy - COLISEU[1];
    const tam = Math.hypot(dx, dy);
    // Distância de cada capítulo até o Coliseu: a origem, o meio do caminho, o Ludus e três já perto da arena.
    const dist = [tam, (tam + RAIO_LUDUS) / 2, RAIO_LUDUS, 49, 37, 25];
    return [ia, dist.map((d) => [Math.round(COLISEU[0] + (dx / tam) * d), Math.round(COLISEU[1] + (dy / tam) * d)] as [number, number])];
  }),
) as Record<IaId, [number, number][]>;
const ORIGEM: Record<IaId, { nome: string }> = {
  claude: { nome: 'BIBLIOTECA' },
  chatgpt: { nome: 'PORTO' },
  gemini: { nome: 'OBSERVATÓRIO' },
};

function alcance(saves: SaveHistoria[], ia: IaId): { capitulo: number; terminou: boolean } {
  const meus = saves.filter((s) => !s.secreto && s.gladiador === ia);
  return { capitulo: Math.max(0, ...meus.map((s) => s.capitulo)), terminou: meus.some(saveTerminado) };
}

type Escolhido = { ia: IaId; n: number } | { segredo: true } | null;

export function LinhaDoTempo({ saves, segredos }: { saves: SaveHistoria[]; segredos: string[] | undefined }) {
  const [aberta, setAberta] = useState(true);
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

  // O texto do ponto escolhido (embaixo do mapa).
  let info: { titulo: string; texto: string; cor: string } | null = null;
  if (escolhido && 'segredo' in escolhido) {
    info = secretoFeito
      ? { titulo: '🏆 OS TRÊS', texto: 'Você abriu o segredo. O Coliseu agora é livre.', cor: '#f2c14e' }
      : temChave
        ? { titulo: '🔑 A GRADE DEBAIXO DA ARENA', texto: 'A chave está inteira. Procure a grade no título lá em cima...', cor: '#7ad0ff' }
        : { titulo: '🔒 ???', texto: 'Dizem que, depois dos três caminhos, existe um último capítulo debaixo da arena.', cor: '#888' };
  } else if (escolhido) {
    const cap = CAPITULOS[escolhido.ia][escolhido.n - 1];
    const st = estado(escolhido.ia, escolhido.n);
    const cor = `rgb(${PERSONAGENS[escolhido.ia].cor})`;
    info =
      st === 'nao' || !cap
        ? { titulo: `${PERSONAGENS[escolhido.ia].gladiador.toUpperCase()} · CAPÍTULO ${escolhido.n === 7 ? 'FINAL' : escolhido.n}: ???`, texto: 'Ainda não. Siga a estrada para descobrir.', cor }
        : { titulo: `${PERSONAGENS[escolhido.ia].gladiador.toUpperCase()} · ${escolhido.n === 7 ? 'O FINAL' : `CAPÍTULO ${escolhido.n}`}: ${cap.titulo.toUpperCase()}`, texto: `${cap.lugar}${st === 'aqui' ? ' · você está aqui' : ' · feito ✓'}`, cor };
  }

  return (
    <section aria-label="Mapa de Roma: a linha do tempo da História" className="pixel-box mapa-roma flex flex-col gap-2 p-3 sm:p-4">
      <button
        type="button"
        onClick={() => {
          tocar('pagina');
          setAberta((a) => !a);
        }}
        className="flex items-center justify-between gap-2 text-left"
        aria-expanded={aberta}
      >
        <span className="font-pixel text-[10px] text-[#f2c14e] sm:text-xs">🗺️ O MAPA DE ROMA</span>
        <span className="font-pixel text-[8px] text-muted">{aberta ? '▲ FECHAR' : '▼ ABRIR'}</span>
      </button>
      {aberta && (
        <>
          <p className="text-xs text-muted">Três condenados, a mesma noite. As estradas se cruzam no Ludus e se juntam no Coliseu. Toque num ponto.</p>
          <div className="relative w-full overflow-hidden border-4 border-[#5a3a1a]">
            <svg viewBox="0 0 320 220" className="block w-full" shapeRendering="crispEdges" role="img" aria-label="Mapa com as três estradas">
              <defs>
                <pattern id="mr-papel" width="8" height="8" patternUnits="userSpaceOnUse">
                  <rect width="8" height="8" fill="#e6d2a0" />
                  <rect x="1" y="2" width="1" height="1" fill="#d8c08a" />
                  <rect x="5" y="6" width="1" height="1" fill="#d8c08a" />
                </pattern>
              </defs>
              {/* o pergaminho do mapa */}
              <rect width="320" height="220" fill="url(#mr-papel)" />
              {/* o mar, no sul (onde fica o Porto), com ondinhas */}
              <path d="M0 196 Q80 188 160 196 Q240 204 320 194 V220 H0 Z" fill="#7ab0c8" shapeRendering="auto" />
              {[30, 90, 230, 290].map((x) => (
                <rect key={x} x={x} y="206" width="9" height="1" fill="#d8eef6" />
              ))}
              {/* morros e bosques, só nos cantos (longe das estradas) */}
              <ellipse cx="160" cy="26" rx="34" ry="12" fill="#cfc492" shapeRendering="auto" />
              <ellipse cx="28" cy="120" rx="20" ry="26" fill="#cfc492" shapeRendering="auto" />
              <ellipse cx="292" cy="120" rx="20" ry="26" fill="#cfc492" shapeRendering="auto" />
              {[
                [150, 22],
                [164, 20],
                [24, 112],
                [32, 126],
                [288, 110],
                [298, 128],
              ].map(([x, y], k) => (
                <rect key={k} x={x} y={y} width="5" height="5" fill="#8aa05a" />
              ))}

              {/* o anel do Ludus: no capítulo 3, as três estradas passam por ele */}
              <ellipse cx={COLISEU[0]} cy={COLISEU[1]} rx={RAIO_LUDUS} ry={RAIO_LUDUS} fill="none" stroke="#c8962a" strokeWidth="2" strokeDasharray="3 3" shapeRendering="auto" />
              <text x={COLISEU[0] + RAIO_LUDUS * 0.72} y={COLISEU[1] + RAIO_LUDUS * 0.72 + 8} textAnchor="middle" fontSize="6.5" className="font-pixel" fill="#8a5a1a">
                LUDUS
              </text>

              {/* as estradas (pontilhadas; pintadas até onde você chegou) */}
              {IAS.map((ia) => {
                const cor = `rgb(${PERSONAGENS[ia].cor})`;
                const pts = [...PONTOS[ia], COLISEU];
                return pts.slice(1).map(([x2, y2], k) => {
                  const [x1, y1] = pts[k]!;
                  const feito = estado(ia, k + 1) === 'feito';
                  return (
                    <line
                      key={`${ia}-${k}`}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={feito ? cor : '#a08060'}
                      strokeWidth={feito ? 3.5 : 2.5}
                      strokeDasharray={feito ? undefined : '5 3'}
                      strokeLinecap="round"
                      shapeRendering="auto"
                    />
                  );
                });
              })}

              {/* o nome do lugar de onde cada um sai */}
              {IAS.map((ia) => {
                const [x, y] = PONTOS[ia][0]!;
                const sul = ia === 'chatgpt';
                return (
                  <text
                    key={ia}
                    x={sul ? x + 10 : x}
                    y={sul ? y + 3 : y - 10}
                    textAnchor={sul ? 'start' : 'middle'}
                    fontSize="7.5"
                    className="font-pixel"
                    fill="#3a2410"
                  >
                    {ORIGEM[ia].nome}
                  </text>
                );
              })}

              {/* o Coliseu no centro, com a grade do segredo no chão da arena */}
              <ellipse cx={COLISEU[0]} cy={COLISEU[1]} rx="19" ry="13" fill="#c8a070" stroke="#5a3a1a" strokeWidth="2" shapeRendering="auto" />
              {[-13, -6.5, 0, 6.5, 13].map((dx) => (
                <rect key={dx} x={COLISEU[0] + dx - 1} y={COLISEU[1] - 12} width="2" height="3" fill="#5a3a1a" />
              ))}
              <ellipse cx={COLISEU[0]} cy={COLISEU[1] + 1} rx="10" ry="6" fill="#e6c890" shapeRendering="auto" />
              <g role="button" tabIndex={0} aria-label="A grade debaixo da arena" onClick={() => escolher({ segredo: true })} className="cursor-pointer">
                <rect x={COLISEU[0] - 4} y={COLISEU[1] - 2} width="8" height="6" fill={secretoFeito ? '#f2c14e' : temChave ? '#7ad0ff' : '#5a4a3a'} stroke="#1a0e06" />
                {[0, 2, 4, 6].map((dx) => (
                  <rect key={dx} x={COLISEU[0] - 3.5 + dx} y={COLISEU[1] - 1} width="0.8" height="4" fill="#1a0e06" />
                ))}
              </g>
              <text x={COLISEU[0]} y={COLISEU[1] - 16} textAnchor="middle" fontSize="7.5" className="font-pixel" fill="#3a2410">
                COLISEU
              </text>

              {/* os pontos de cada capítulo (o número; apagado se ainda não chegou) */}
              {IAS.map((ia) =>
                PONTOS[ia].map(([x, y], k) => {
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
                      onKeyDown={(ev) => (ev.key === 'Enter' || ev.key === ' ') && escolher({ ia, n })}
                      className={`cursor-pointer ${st === 'aqui' ? 'mapa-aqui' : ''}`}
                      style={{ transformOrigin: `${x}px ${y}px` }}
                    >
                      <circle cx={x} cy={y} r="5.6" fill={st === 'nao' ? '#e6d6ae' : cor} stroke={st === 'aqui' ? '#ffffff' : st === 'nao' ? '#a08060' : '#3a2410'} strokeWidth={st === 'aqui' ? 1.8 : 1.2} shapeRendering="auto" />
                      <text x={x} y={y + 2.4} textAnchor="middle" fontSize="6.5" className="font-pixel" fill={st === 'nao' ? '#a08060' : '#1a0e06'}>
                        {st === 'feito' ? '✓' : n}
                      </text>
                    </g>
                  );
                }),
              )}
              {/* a rosa dos ventos */}
              <g transform="translate(296 186)">
                <rect x="-1" y="-9" width="2" height="18" fill="#5a3a1a" />
                <rect x="-9" y="-1" width="18" height="2" fill="#5a3a1a" />
                <text x="0" y="-11" textAnchor="middle" fontSize="6" className="font-pixel" fill="#3a2410">
                  N
                </text>
              </g>
            </svg>
          </div>
          {/* O que é o ponto tocado */}
          <div className="min-h-[3.2rem] border-2 border-[#5a3a1a] bg-black/40 p-2" style={{ borderColor: info?.cor }}>
            {info ? (
              <>
                <p className="font-pixel text-[8px] sm:text-[10px]" style={{ color: info.cor }}>
                  {info.titulo}
                </p>
                <p className="mt-1 text-xs text-white/80">{info.texto}</p>
              </>
            ) : (
              <p className="text-xs text-muted">
                {IAS.map((ia) => (
                  <span key={ia} className="mr-3 inline-flex items-center gap-1">
                    <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: `rgb(${PERSONAGENS[ia].cor})` }} />
                    {PERSONAGENS[ia].gladiador}
                    {chegou[ia].terminou ? ' 🏆' : chegou[ia].capitulo > 0 ? ` · cap. ${Math.min(7, chegou[ia].capitulo)}` : ''}
                  </span>
                ))}
              </p>
            )}
          </div>
        </>
      )}
    </section>
  );
}
