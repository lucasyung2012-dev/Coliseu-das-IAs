import type { CSSProperties } from 'react';
import type { ArenaId } from '@/game/coliseu';
import type { IaId } from '@/game/personagens';

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
  tema,
}: {
  corA: string;
  corB: string;
  viva?: boolean;
  festa?: boolean;
  arena?: ArenaId;
  /** De quem é esta arena: cada combatente tem as suas (pedido do Lucas). */
  tema?: IaId;
}) {
  const base = ARENAS[arena];
  // Ajustes de cor de alguns temas (amanhecer da colina de Helios, Templo do Sol dourado).
  const a =
    tema === 'gemini' && arena === 'madeira'
      ? { ...base, ceu: ['#3a2a6a', '#c86a9a', '#ffb08a'] as [string, string, string] }
      : tema === 'gemini' && arena === 'marmore'
        ? { ...base, muro: '#f0dca0', friso: '#f2c14e', ceu: ['#2a1a50', '#8a3a6a', '#e07a4a'] as [string, string, string], estrelas: false }
        : base;
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
      {tema && <CeuDoTema tema={tema} arena={arena} />}
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
      {tema && <FrenteDoTema tema={tema} arena={arena} />}
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

/** Pedaços de céu de cada tema (desenhados antes da arquibancada; aparece o alto do céu). */
function CeuDoTema({ tema, arena }: { tema: IaId; arena: ArenaId }) {
  if (tema === 'claude' && arena === 'estatuas') {
    // lua crescente sobre a Biblioteca
    return (
      <g fill="#f4ecd0">
        <rect x={140} y={2} width={4} height={6} />
        <rect x={139} y={3} width={1} height={4} />
        <rect x={142} y={2} width={3} height={5} fill="#0b0620" />
      </g>
    );
  }
  if (tema === 'chatgpt' && arena === 'pedra') {
    // o mar do Porto de Óstia, com dois navios no horizonte
    return (
      <g>
        <rect y={10} width={160} height={4} fill="#2a5a90" />
        <rect y={10} width={160} height={1} fill="#ffb04a" opacity={0.6} />
        {[24, 118].map((x) => (
          <g key={x}>
            <rect x={x} y={9} width={10} height={2} fill="#4a2a18" />
            <rect x={x + 4} y={2} width={1} height={7} fill="#4a2a18" />
            <rect x={x + 1} y={3} width={3} height={5} fill="#f0e0c0" />
            <rect x={x + 5} y={4} width={3} height={4} fill="#f0e0c0" />
          </g>
        ))}
      </g>
    );
  }
  if (tema === 'gemini' && arena === 'madeira') {
    // o sol nascendo atrás da colina
    return (
      <g>
        <rect x={116} y={8} width={14} height={6} fill="#ffcf6a" />
        <rect x={119} y={6} width={8} height={2} fill="#ffcf6a" />
      </g>
    );
  }
  if (tema === 'gemini' && arena === 'estatuas') {
    // constelações: estrelas ligadas por linhas finas
    const pontos: [number, number][] = [
      [20, 3],
      [28, 6],
      [36, 4],
      [44, 9],
      [100, 2],
      [108, 7],
      [118, 5],
      [126, 10],
    ];
    const linhas = [0, 1, 2, 4, 5, 6].map((i) => [pontos[i]!, pontos[i + 1]!] as const);
    return (
      <g>
        {linhas.map(([p1, p2], i) => (
          <line key={i} x1={p1[0]} y1={p1[1]} x2={p2[0]} y2={p2[1]} stroke="#9fb8ff" strokeWidth={0.4} opacity={0.7} />
        ))}
        {pontos.map(([x, y]) => (
          <rect key={x * 100 + y} x={x} y={y} width={1} height={1} fill="#ffffff" />
        ))}
      </g>
    );
  }
  if (tema === 'gemini' && arena === 'marmore') {
    // o grande disco do sol sobre o Templo
    return (
      <g fill="#ffd04a">
        <rect x={72} y={2} width={16} height={12} />
        <rect x={74} y={0} width={12} height={2} />
        <rect x={70} y={4} width={2} height={8} />
        <rect x={88} y={4} width={2} height={8} />
      </g>
    );
  }
  if (tema === 'gemini' && arena === 'imperial') {
    // eclipse: a lua escura na frente do sol, com o anel de ouro
    return (
      <g>
        <rect x={72} y={1} width={16} height={12} fill="#f2c14e" />
        <rect x={74} y={3} width={12} height={8} fill="#14061e" />
      </g>
    );
  }
  return null;
}

/** Enfeites de cada tema na frente da muralha (acima da areia, para não atrapalhar a luta). */
function FrenteDoTema({ tema, arena }: { tema: IaId; arena: ArenaId }) {
  if (tema === 'claude') {
    if (arena === 'madeira')
      // oliveiras na frente da paliçada
      return (
        <g>
          {[6, 46, 106, 146].map((x) => (
            <g key={x}>
              <rect x={x + 3} y={50} width={2} height={12} fill="#6a4a2a" />
              <rect x={x} y={40} width={8} height={10} fill="#5a7a30" />
              <rect x={x + 1} y={38} width={6} height={2} fill="#5a7a30" />
              <rect x={x + 2} y={42} width={2} height={2} fill="#8aaa4a" />
              <rect x={x + 5} y={45} width={1} height={1} fill="#2a2a3a" />
            </g>
          ))}
        </g>
      );
    if (arena === 'pedra')
      // colunas brancas do Fórum
      return (
        <g>
          {[14, 54, 98, 138].map((x) => (
            <g key={x}>
              <rect x={x - 1} y={29} width={7} height={2} fill="#f4ecd8" />
              <rect x={x} y={31} width={5} height={29} fill="#e8dcc0" />
              <rect x={x + 1} y={31} width={1} height={29} fill="#c8b898" />
              <rect x={x + 3} y={31} width={1} height={29} fill="#c8b898" />
              <rect x={x - 1} y={60} width={7} height={2} fill="#f4ecd8" />
            </g>
          ))}
        </g>
      );
    if (arena === 'estatuas')
      // pergaminhos guardados nos arcos de cima (a Biblioteca)
      return (
        <g>
          {[22, 42, 62, 82, 112, 132].map((x) => (
            <g key={x}>
              {[35, 38, 41].map((y) => (
                <rect key={y} x={x + 1} y={y} width={4} height={1.5} fill="#f0dcae" />
              ))}
            </g>
          ))}
        </g>
      );
    if (arena === 'marmore')
      // a estátua de Minerva com a coruja no ombro
      return (
        <g>
          <rect x={76} y={31} width={8} height={3} fill="#cfc8b8" />
          <rect x={77} y={30} width={6} height={1} fill="#e04030" />
          <rect x={77} y={34} width={6} height={4} fill="#f4f0e8" />
          <rect x={75} y={38} width={10} height={22} fill="#ece6da" />
          <rect x={86} y={34} width={1} height={26} fill="#a08a60" />
          <rect x={73} y={36} width={3} height={3} fill="#c8962a" />
          <rect x={73} y={60} width={14} height={2} fill="#d8d0c0" />
        </g>
      );
    if (arena === 'imperial')
      // a coruja de ouro ao lado do camarote
      return (
        <g fill="#f2c14e">
          <rect x={94} y={17} width={5} height={6} />
          <rect x={94} y={16} width={1} height={1} />
          <rect x={98} y={16} width={1} height={1} />
          <rect x={95} y={18} width={1} height={1} fill="#14061e" />
          <rect x={97} y={18} width={1} height={1} fill="#14061e" />
        </g>
      );
    return null;
  }
  if (tema === 'chatgpt') {
    if (arena === 'madeira')
      // tendas do acampamento
      return (
        <g>
          {[8, 50, 102, 144].map((x) => (
            <g key={x}>
              {[0, 1, 2, 3, 4, 5].map((k) => (
                <rect key={k} x={x + 5 - k} y={50 + k * 2} width={2 + k * 2} height={2} fill={k % 2 ? '#c8b480' : '#d8c8a0'} />
              ))}
              <rect x={x + 5} y={56} width={2} height={6} fill="#4a3418" />
            </g>
          ))}
        </g>
      );
    if (arena === 'estatuas')
      // o mapa de batalha pendurado no Quartel
      return (
        <g>
          <rect x={64} y={31} width={32} height={13} fill="#e8d4a0" />
          <rect x={64} y={31} width={32} height={1} fill="#7a4a22" />
          <rect x={64} y={43} width={32} height={1} fill="#7a4a22" />
          <rect x={68} y={35} width={10} height={1} fill="#c0283c" />
          <rect x={77} y={35} width={1} height={5} fill="#c0283c" />
          <rect x={78} y={39} width={12} height={1} fill="#c0283c" />
          <rect x={70} y={34} width={2} height={2} fill="#2a6aa0" />
          <rect x={88} y={38} width={2} height={2} fill="#2a6aa0" />
        </g>
      );
    if (arena === 'imperial')
      // âncoras de ouro no Palácio
      return (
        <g fill="#f2c14e">
          {[40, 116].map((x) => (
            <g key={x}>
              <rect x={x + 2} y={33} width={1} height={8} />
              <rect x={x} y={34} width={5} height={1} />
              <rect x={x} y={40} width={1} height={1} />
              <rect x={x + 4} y={40} width={1} height={1} />
              <rect x={x} y={41} width={5} height={1} />
            </g>
          ))}
        </g>
      );
    return null;
  }
  if (arena === 'madeira')
    // Helios: flores do campo na colina
    return (
      <g>
        {[12, 30, 58, 90, 120, 148].map((x, i) => (
          <rect key={x} x={x} y={59 + (i % 2)} width={1} height={1} fill={i % 2 ? '#ffd04a' : '#ff8ac8'} />
        ))}
      </g>
    );
  if (arena === 'pedra')
    // Helios: a torre do observatório com a luneta
    return (
      <g>
        <rect x={4} y={30} width={16} height={32} fill="#8a6a4a" />
        <rect x={4} y={30} width={16} height={2} fill="#c8a478" />
        <rect x={6} y={26} width={12} height={4} fill="#b8b0c8" />
        <rect x={8} y={24} width={8} height={2} fill="#b8b0c8" />
        <rect x={16} y={22} width={6} height={2} fill="#3a3448" />
        <rect x={10} y={40} width={4} height={6} fill="#2a1810" />
      </g>
    );
  if (arena === 'marmore')
    // Helios: o sol de ouro gravado na muralha do Templo
    return (
      <g fill="#f2c14e">
        <rect x={75} y={33} width={10} height={10} />
        <rect x={79} y={30} width={2} height={2} />
        <rect x={79} y={44} width={2} height={2} />
        <rect x={72} y={37} width={2} height={2} />
        <rect x={86} y={37} width={2} height={2} />
      </g>
    );
  if (arena === 'imperial')
    // Helios: estrelas de ouro na muralha
    return (
      <g fill="#f2c14e">
        {[30, 60, 100, 130].map((x) => (
          <g key={x}>
            <rect x={x} y={35} width={3} height={1} />
            <rect x={x + 1} y={34} width={1} height={3} />
          </g>
        ))}
      </g>
    );
  return null;
}
