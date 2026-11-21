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

/** Onde fica cada capítulo (1 a 6) no mapa, por caminho. O 7 é o Coliseu. */
const PONTOS: Record<IaId, [number, number][]> = {
  claude: [
    [52, 42], // 1 a Grande Biblioteca
    [84, 76], // 2 as ruas de Roma
    [120, 128], // 3 o Ludus
    [146, 178], // 4 as Catacumbas
    [168, 150], // 5 o Fórum
    [188, 132], // 6 a Grande Arena
  ],
  chatgpt: [
    [30, 176], // 1 o Porto de Óstia
    [62, 196], // 2 as galés, no mar
    [120, 128], // 3 o Ludus
    [104, 92], // 4 a Subura
    [258, 196], // 5 a frota, no mar
    [222, 140], // 6 a Naumaquia
  ],
  gemini: [
    [282, 36], // 1 o Observatório
    [238, 52], // 2 os telhados
    [120, 128], // 3 o Ludus
    [164, 40], // 4 o Aqueduto
    [252, 92], // 5 o Templo de Apolo
    [214, 106], // 6 o Coliseu no eclipse
  ],
};
const COLISEU: [number, number] = [204, 122];
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
              {/* o mar (oeste e sul), com ondinhas */}
              <path d="M0 0 H18 V150 Q30 170 48 205 H300 Q305 214 320 214 V220 H0 Z" fill="#7ab0c8" />
              {[30, 70, 110, 150].map((y) => (
                <rect key={y} x="5" y={y} width="6" height="1" fill="#d8eef6" />
              ))}
              {[70, 130, 190, 250, 290].map((x) => (
                <rect key={x} x={x} y="212" width="7" height="1" fill="#d8eef6" />
              ))}
              {/* o rio Tibre, do norte até o mar */}
              <path d="M150 0 Q130 40 140 70 Q150 100 110 110 Q70 120 70 160 Q72 190 60 210" fill="none" stroke="#7ab0c8" strokeWidth="6" shapeRendering="auto" />
              {/* os morros e as casinhas da cidade */}
              {[
                [240, 20, 26, 12],
                [180, 70, 22, 10],
                [90, 150, 20, 10],
                [290, 130, 20, 12],
              ].map(([x, y, w, h], k) => (
                <ellipse key={k} cx={x} cy={y} rx={w} ry={h} fill="#c8c08a" shapeRendering="auto" />
              ))}
              {Array.from({ length: 26 }, (_, k) => {
                const x = 60 + ((k * 47) % 230);
                const y = 20 + ((k * 31) % 170);
                return <rect key={k} x={x} y={y} width="5" height="4" fill="#b88a5a" opacity="0.55" />;
              })}
              {/* o Aqueduto (arcos no norte) */}
              {[0, 1, 2, 3, 4, 5].map((k) => (
                <rect key={k} x={140 + k * 8} y="34" width="3" height="10" fill="#9a7a5a" />
              ))}
              <rect x="138" y="31" width="48" height="3" fill="#9a7a5a" />

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
                      stroke={feito ? cor : '#8a6a4a'}
                      strokeWidth={feito ? 3 : 2}
                      strokeDasharray={feito ? undefined : '4 3'}
                      shapeRendering="auto"
                      opacity={feito ? 1 : 0.8}
                    />
                  );
                });
              })}

              {/* os lugares de onde cada um sai */}
              {IAS.map((ia) => {
                const [x, y] = PONTOS[ia][0]!;
                const o = ORIGEM[ia];
                return (
                  <text key={ia} x={x} y={y - 9} textAnchor="middle" fontSize="7" className="font-pixel" fill="#3a2410">
                    {o.nome}
                  </text>
                );
              })}
              {/* o Ludus (onde os caminhos se cruzam) */}
              <text x="120" y="146" textAnchor="middle" fontSize="6.5" className="font-pixel" fill="#3a2410">
                LUDUS
              </text>

              {/* o Coliseu no centro */}
              <ellipse cx={COLISEU[0]} cy={COLISEU[1]} rx="20" ry="12" fill="#c8a070" stroke="#5a3a1a" strokeWidth="2" shapeRendering="auto" />
              <ellipse cx={COLISEU[0]} cy={COLISEU[1]} rx="11" ry="6" fill="#e6c890" shapeRendering="auto" />
              {[-14, -7, 0, 7, 14].map((dx) => (
                <rect key={dx} x={COLISEU[0] + dx - 1} y={COLISEU[1] - 11} width="2" height="3" fill="#5a3a1a" />
              ))}
              <text x={COLISEU[0]} y={COLISEU[1] - 16} textAnchor="middle" fontSize="7" className="font-pixel" fill="#3a2410">
                COLISEU
              </text>

              {/* os pontos de cada capítulo */}
              {IAS.map((ia) =>
                PONTOS[ia].map(([x, y], k) => {
                  const n = k + 1;
                  // O Ludus é um ponto só para os três: desenha um, mas cada um com o seu anel.
                  const st = estado(ia, n);
                  const cor = `rgb(${PERSONAGENS[ia].cor})`;
                  const desloca = n === 3 ? (IAS.indexOf(ia) - 1) * 9 : 0;
                  return (
                    <g
                      key={`${ia}-${n}`}
                      role="button"
                      tabIndex={0}
                      aria-label={`${PERSONAGENS[ia].gladiador}, capítulo ${n}`}
                      onClick={() => escolher({ ia, n })}
                      onKeyDown={(ev) => (ev.key === 'Enter' || ev.key === ' ') && escolher({ ia, n })}
                      className={`cursor-pointer ${st === 'aqui' ? 'mapa-aqui' : ''}`}
                      style={{ transformOrigin: `${x + desloca}px ${y}px` }}
                    >
                      <circle cx={x + desloca} cy={y} r="6.5" fill={st === 'nao' ? '#d8c8a0' : cor} stroke={st === 'aqui' ? '#fff' : '#3a2410'} strokeWidth={st === 'aqui' ? 2 : 1.4} shapeRendering="auto" />
                      <text x={x + desloca} y={y + 2.6} textAnchor="middle" fontSize="7" className="font-pixel" fill={st === 'nao' ? '#8a6a4a' : '#1a0e06'}>
                        {st === 'nao' ? '?' : st === 'feito' ? '✓' : n}
                      </text>
                    </g>
                  );
                }),
              )}

              {/* a grade do segredo, debaixo da arena */}
              <g role="button" tabIndex={0} aria-label="A grade debaixo da arena" onClick={() => escolher({ segredo: true })} className="cursor-pointer">
                <rect x={COLISEU[0] - 6} y={COLISEU[1] + 14} width="12" height="7" fill={secretoFeito ? '#f2c14e' : temChave ? '#7ad0ff' : '#5a4a3a'} stroke="#1a0e06" />
                {[0, 3, 6, 9].map((dx) => (
                  <rect key={dx} x={COLISEU[0] - 5 + dx} y={COLISEU[1] + 15} width="1" height="5" fill="#1a0e06" />
                ))}
              </g>

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
