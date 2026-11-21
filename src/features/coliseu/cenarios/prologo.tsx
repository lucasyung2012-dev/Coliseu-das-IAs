import type { Lugar } from '@/game/historia/roteiro';
import './prologo.css';

/**
 * Os cenários do prólogo em 320 × 180 (o dobro dos antigos), com camadas de
 * profundidade, luz e animação ambiente: Roma Eterna à noite e a praça,
 * a Guerra das Ideias pegando fogo, o salão do Censor, o Olho, o porto,
 * o observatório, a porta da Biblioteca e a tela de título.
 * Revisto em 21/11/2026 (o Lucas achou a Roma do começo simples demais).
 */
export function desenhoPrologo(lugar: Lugar): JSX.Element | null {
  switch (lugar) {
    case 'roma-noite':
      return <RomaNoite />;
    case 'roma-praca':
      return <RomaPraca />;
    case 'roma-chamas':
      return <RomaChamas />;
    case 'camarote':
      return <SalaoDoCensor />;
    case 'olho':
      return <OOlho />;
    case 'titulo':
      return <Titulo />;
    case 'porto':
      return <Porto />;
    case 'observatorio':
      return <Observatorio />;
    case 'biblioteca-porta':
      return <PortaBiblioteca />;
    default:
      return null;
  }
}

// ---------- ajudantes ----------

/** Número "aleatório" fixo (o desenho é sempre o mesmo). */
const rnd = (i: number, s = 1) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Um disco em pixel (linhas de retângulos). */
function Disco({ cx, cy, r, fill, opacity, className }: { cx: number; cy: number; r: number; fill: string; opacity?: number; className?: string }) {
  const linhas: JSX.Element[] = [];
  for (let dy = -r; dy <= r; dy++) {
    const w = Math.round(Math.sqrt(r * r - dy * dy));
    if (w <= 0) continue;
    linhas.push(<rect key={dy} x={cx - w} y={cy + dy} width={w * 2} height={1} fill={fill} />);
  }
  return (
    <g opacity={opacity} className={className}>
      {linhas}
    </g>
  );
}

/** Céu em faixas (degradê de pixel). */
function Ceu({ cores, ate }: { cores: string[]; ate: number }) {
  const h = Math.ceil(ate / cores.length);
  return (
    <>
      {cores.map((c, k) => (
        <rect key={c + k} y={k * h} width={320} height={h + 1} fill={c} />
      ))}
    </>
  );
}

function Estrelas({ n, ate, semente = 1 }: { n: number; ate: number; semente?: number }) {
  return (
    <>
      {Array.from({ length: n }, (_, k) => {
        const grande = rnd(k, semente + 5) > 0.88;
        return (
          <rect
            key={k}
            x={Math.floor(rnd(k, semente) * 320)}
            y={Math.floor(rnd(k, semente + 1) * ate)}
            width={grande ? 2 : 1}
            height={grande ? 2 : 1}
            fill={rnd(k, semente + 2) > 0.7 ? '#ffe8b0' : '#ffffff'}
            className={rnd(k, semente + 3) > 0.55 ? 'pro-cintila' : undefined}
            style={{ animationDelay: `${Math.floor(rnd(k, semente + 4) * 2400)}ms` }}
          />
        );
      })}
    </>
  );
}

function Lua({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <>
      <Disco cx={x} cy={y} r={r + 10} fill="#e8e0c0" opacity={0.05} />
      <Disco cx={x} cy={y} r={r + 5} fill="#e8e0c0" opacity={0.1} />
      <Disco cx={x} cy={y} r={r} fill="#ece4c4" />
      <Disco cx={x + 3} cy={y - 2} r={Math.round(r * 0.75)} fill="#f8f2dc" />
      <rect x={x - 6} y={y + 2} width={4} height={3} fill="#cfc6a4" />
      <rect x={x + 3} y={y + 6} width={3} height={2} fill="#cfc6a4" />
      <rect x={x - 2} y={y - 7} width={2} height={2} fill="#d8cfae" />
    </>
  );
}

/** Engrenagem com dentes e raios, girando devagar. */
function Engrenagem({ cx, cy, r, cor, fundo, dentes = 12, volta = false }: { cx: number; cy: number; r: number; cor: string; fundo: string; dentes?: number; volta?: boolean }) {
  return (
    <g className={volta ? 'pro-gira-volta' : 'pro-gira'} style={{ transformOrigin: `${cx}px ${cy}px` }}>
      {Array.from({ length: dentes }, (_, k) => (
        <rect key={k} x={cx - 4} y={cy - r - 6} width={8} height={8} fill={cor} transform={`rotate(${(k * 360) / dentes} ${cx} ${cy})`} />
      ))}
      <Disco cx={cx} cy={cy} r={r} fill={cor} />
      <Disco cx={cx} cy={cy} r={Math.round(r * 0.72)} fill={fundo} />
      {[0, 60, 120].map((a) => (
        <rect key={a} x={cx - 2} y={cy - r + 2} width={4} height={r * 2 - 4} fill={cor} transform={`rotate(${a} ${cx} ${cy})`} />
      ))}
      <Disco cx={cx} cy={cy} r={Math.max(3, Math.round(r * 0.2))} fill={cor} />
    </g>
  );
}

/** Vapor subindo de uma chaminé. */
function Vapor({ x, y, cor = '#8a8098', n = 4, lento = false }: { x: number; y: number; cor?: string; n?: number; lento?: boolean }) {
  return (
    <>
      {Array.from({ length: n }, (_, k) => (
        <rect
          key={k}
          x={x - 3}
          y={y - 4}
          width={7}
          height={6}
          fill={cor}
          className={lento ? 'pro-vapor-lento' : 'pro-vapor'}
          style={{ animationDelay: `${k * (lento ? 1100 : 800)}ms` }}
        />
      ))}
    </>
  );
}

/** Silhueta de uma pessoa (para a multidão que passa ao fundo). */
function Passante({ y, cor, dur, atraso, volta = false, alto = 12 }: { y: number; cor: string; dur: number; atraso: number; volta?: boolean; alto?: number }) {
  return (
    <g className={volta ? 'pro-passante-volta' : 'pro-passante'} style={{ animationDuration: `${dur}s`, animationDelay: `${-atraso}s` }}>
      <g className="pro-passo">
        <rect x={1} y={y - alto} width={4} height={4} fill={cor} />
        <rect x={0} y={y - alto + 4} width={6} height={alto - 7} fill={cor} />
        <rect x={1} y={y - 3} width={1} height={3} fill={cor} />
        <rect x={4} y={y - 3} width={1} height={3} fill={cor} />
      </g>
    </g>
  );
}

/** Poste de lampião com halo. */
function Lampiao({ x, chao }: { x: number; chao: number }) {
  return (
    <g>
      <Disco cx={x + 2} cy={chao - 40} r={14} fill="#ffb04a" opacity={0.08} />
      <rect x={x + 1} y={chao - 36} width={2} height={36} fill="#2a2030" />
      <rect x={x - 1} y={chao - 2} width={6} height={2} fill="#2a2030" />
      <rect x={x - 1} y={chao - 44} width={6} height={8} fill="#3a2a30" />
      <rect x={x} y={chao - 43} width={4} height={6} fill="#ffd04a" className="tocha" />
      <rect x={x - 2} y={chao - 46} width={8} height={2} fill="#2a2030" />
    </g>
  );
}

/** Chão de pedras (paralelepípedos). */
function Calcada({ y, cores }: { y: number; cores: [string, string, string] }) {
  const pedras: JSX.Element[] = [];
  for (let linha = 0; y + linha * 6 < 180; linha++) {
    for (let k = 0; k < 24; k++) {
      const x = k * 14 + (linha % 2) * 7 - 7;
      pedras.push(<rect key={`${linha}-${k}`} x={x + 1} y={y + linha * 6 + 1} width={12} height={4} fill={rnd(k + linha * 31, 9) > 0.6 ? cores[1] : cores[2]} />);
    }
  }
  return (
    <>
      <rect y={y} width={320} height={180 - y} fill={cores[0]} />
      {pedras}
    </>
  );
}

/** Coliseu em três andares de arcos, iluminado por dentro. */
function Coliseu({ x, y, w, h, pedra, sombra, luz }: { x: number; y: number; w: number; h: number; pedra: string; sombra: string; luz: string }) {
  const andares = 3;
  const ha = Math.floor((h - 6) / andares);
  const arcos = Math.floor(w / 9);
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={pedra} />
      <rect x={x} y={y} width={w} height={6} fill={sombra} />
      {Array.from({ length: Math.floor(w / 6) }, (_, k) => (
        <rect key={`t${k}`} x={x + 1 + k * 6} y={y + 1} width={3} height={4} fill={pedra} />
      ))}
      {Array.from({ length: andares }, (_, a) =>
        Array.from({ length: arcos }, (_, k) => {
          const ax = x + 3 + k * 9;
          const ay = y + 8 + a * ha;
          const acesa = rnd(k + a * 40, 3) > 0.35;
          return (
            <g key={`${a}-${k}`}>
              <rect x={ax} y={ay + 1} width={5} height={ha - 4} fill={acesa ? luz : sombra} opacity={acesa ? 0.85 : 1} />
              <rect x={ax + 1} y={ay} width={3} height={1} fill={acesa ? luz : sombra} opacity={acesa ? 0.85 : 1} />
            </g>
          );
        }),
      )}
      {Array.from({ length: andares }, (_, a) => (
        <rect key={`c${a}`} x={x} y={y + 6 + a * ha} width={w} height={2} fill={sombra} />
      ))}
    </g>
  );
}

/** Prédios da cidade, com janelas acesas e apagadas. */
function Predios({ y, cores, janela, semente, alturas }: { y: number; cores: [string, string]; janela: string; semente: number; alturas: [number, number] }) {
  const out: JSX.Element[] = [];
  let x = -4;
  let k = 0;
  while (x < 324) {
    const w = 16 + Math.floor(rnd(k, semente) * 20);
    const h = alturas[0] + Math.floor(rnd(k, semente + 1) * (alturas[1] - alturas[0]));
    const topo = y - h;
    out.push(<rect key={`p${k}`} x={x} y={topo} width={w} height={h + 40} fill={k % 2 ? cores[0] : cores[1]} />);
    out.push(<rect key={`t${k}`} x={x - 1} y={topo} width={w + 2} height={2} fill={cores[1]} />);
    for (let jy = topo + 5; jy < y - 4; jy += 7) {
      for (let jx = x + 3; jx < x + w - 4; jx += 6) {
        const r = rnd(jx * 7 + jy, semente + 2);
        if (r > 0.5) out.push(<rect key={`j${jx}-${jy}`} x={jx} y={jy} width={2} height={3} fill={janela} opacity={r > 0.8 ? 1 : 0.55} className={r > 0.96 ? 'tocha' : undefined} />);
      }
    }
    x += w;
    k++;
  }
  return <>{out}</>;
}

/** Templo com colunas e frontão. */
function Templo({ x, y, w, cor, sombra, claro }: { x: number; y: number; w: number; cor: string; sombra: string; claro: string }) {
  const colunas = Math.floor((w - 6) / 10);
  return (
    <g>
      <polygon points={`${x},${y + 10} ${x + w / 2},${y} ${x + w},${y + 10}`} fill={cor} />
      <polygon points={`${x + 6},${y + 9} ${x + w / 2},${y + 3} ${x + w - 6},${y + 9}`} fill={sombra} />
      <rect x={x} y={y + 10} width={w} height={4} fill={claro} />
      <rect x={x + 2} y={y + 14} width={w - 4} height={40} fill={sombra} />
      {Array.from({ length: colunas + 1 }, (_, k) => (
        <g key={k}>
          <rect x={x + 3 + k * 10} y={y + 14} width={5} height={40} fill={cor} />
          <rect x={x + 4 + k * 10} y={y + 14} width={1} height={40} fill={claro} />
        </g>
      ))}
      <rect x={x - 2} y={y + 54} width={w + 4} height={3} fill={claro} />
      <rect x={x - 4} y={y + 57} width={w + 8} height={3} fill={cor} />
    </g>
  );
}

/** O olho vermelho do Censor (em estandartes e no alto das torres). */
function OlhoPequeno({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-5} y={-2} width={10} height={4} fill="#3a0a0a" />
      <rect x={-3} y={-3} width={6} height={6} fill="#3a0a0a" />
      <rect x={-2} y={-2} width={4} height={4} fill="#ff2a2a" className="pro-pulsa" />
      <rect x={-1} y={-1} width={1} height={1} fill="#ffd0d0" />
    </g>
  );
}

// ---------- os cenários ----------

/** Roma Eterna à noite, vista de longe: a primeira imagem do jogo. */
function RomaNoite() {
  return (
    <>
      <Ceu cores={['#05031a', '#08052a', '#0c0834', '#120c40', '#1c1250', '#2a1a5a']} ate={120} />
      <Estrelas n={70} ate={90} />
      <Lua x={262} y={30} r={14} />
      {/* nuvens finas passando na frente da lua */}
      <g className="pro-nuvem">
        <rect x={230} y={36} width={46} height={3} fill="#2a2260" opacity={0.8} />
        <rect x={238} y={39} width={30} height={2} fill="#2a2260" opacity={0.7} />
        <rect x={40} y={22} width={50} height={3} fill="#1c1650" opacity={0.8} />
        <rect x={52} y={25} width={26} height={2} fill="#1c1650" opacity={0.7} />
      </g>
      {/* o dirigível da guarda cruzando o céu */}
      <g className="pro-dirigivel">
        <rect x={0} y={44} width={34} height={8} fill="#3a2e48" />
        <rect x={3} y={42} width={28} height={12} fill="#3a2e48" />
        <rect x={6} y={41} width={22} height={1} fill="#5a4a6a" />
        <rect x={4} y={44} width={26} height={1} fill="#5a4a6a" />
        <rect x={-4} y={45} width={4} height={6} fill="#2a2038" />
        <rect x={12} y={54} width={12} height={4} fill="#2a2038" />
        <rect x={14} y={55} width={2} height={2} fill="#ffb04a" />
        <rect x={19} y={55} width={2} height={2} fill="#ffb04a" />
        <rect x={34} y={46} width={2} height={2} fill="#ff2a2a" className="piscar" />
      </g>
      {/* montes ao longe */}
      <polygon points="0,104 30,88 64,98 100,84 140,96 180,86 222,98 262,82 300,94 320,88 320,120 0,120" fill="#1a1238" />
      {/* engrenagens gigantes atrás da cidade */}
      <Engrenagem cx={66} cy={78} r={30} cor="#241a3c" fundo="#1a1238" dentes={14} />
      <Engrenagem cx={248} cy={72} r={36} cor="#241a3c" fundo="#1a1238" dentes={16} volta />
      <Engrenagem cx={292} cy={104} r={16} cor="#2a1e44" fundo="#1a1238" dentes={9} />
      {/* a cidade de longe */}
      <Predios y={124} cores={['#1e1638', '#241a42']} janela="#ffb04a" semente={3} alturas={[14, 34]} />
      {/* o aqueduto */}
      <rect x={0} y={100} width={320} height={4} fill="#3a2c4c" />
      {Array.from({ length: 23 }, (_, k) => (
        <g key={k}>
          <rect x={k * 14} y={104} width={4} height={22} fill="#3a2c4c" />
          <rect x={k * 14 + 4} y={104} width={10} height={2} fill="#3a2c4c" />
        </g>
      ))}
      <rect x={0} y={99} width={320} height={1} fill="#4a3c5e" />
      {/* o Coliseu no meio da cidade, com o farol do Censor no topo */}
      <polygon points="160,60 110,150 210,150" fill="#ff2a2a" opacity={0.05} className="pro-varre" style={{ transformOrigin: '160px 60px' }} />
      <Coliseu x={104} y={80} w={112} h={48} pedra="#4a3440" sombra="#2a1a26" luz="#ffb04a" />
      <rect x={156} y={64} width={8} height={16} fill="#2a1a26" />
      <rect x={154} y={62} width={12} height={3} fill="#3a2430" />
      <OlhoPequeno x={160} y={60} s={1.4} />
      {/* chaminés de vapor */}
      {[
        [20, 92, 5],
        [96, 96, 4],
        [226, 90, 5],
        [300, 94, 4],
      ].map(([x, y, w]) => (
        <g key={x}>
          <rect x={x!} y={y!} width={w!} height={40} fill="#2a2036" />
          <rect x={x! - 1} y={y!} width={w! + 2} height={2} fill="#3a2e4a" />
          <rect x={x!} y={y! + 3} width={w!} height={1} fill="#ff6a2a" opacity={0.6} />
          <Vapor x={x! + 2} y={y!} cor="#6a6080" lento />
        </g>
      ))}
      {/* a cidade de perto: telhados, um templo e prédios */}
      <Predios y={150} cores={['#2a1e34', '#322440']} janela="#ffc060" semente={7} alturas={[8, 22]} />
      <Templo x={8} y={104} w={66} cor="#5a4a5a" sombra="#2e2232" claro="#7a6a78" />
      <Templo x={246} y={110} w={56} cor="#5a4a5a" sombra="#2e2232" claro="#7a6a78" />
      {/* a rua lá embaixo */}
      <Calcada y={164} cores={['#1a1420', '#2a2230', '#241c2a']} />
      {[40, 120, 200, 280].map((x) => (
        <Lampiao key={x} x={x} chao={166} />
      ))}
    </>
  );
}

/** A praça das fontes: a cidade de perto, com gente passando calada. */
function RomaPraca() {
  return (
    <>
      <Ceu cores={['#1a1040', '#2a1850', '#3a2058', '#5a2a5a', '#7a3a58']} ate={90} />
      <Estrelas n={24} ate={40} semente={4} />
      <Lua x={40} y={22} r={9} />
      {/* fundo: prédios altos com varandas */}
      <Predios y={116} cores={['#3a2840', '#44304a']} janela="#ffb860" semente={11} alturas={[30, 60]} />
      {/* estandartes com o olho do Censor */}
      {[70, 250].map((x) => (
        <g key={x} className="pro-balanca" style={{ transformOrigin: `${x + 8}px 40px` }}>
          <rect x={x} y={40} width={16} height={40} fill="#8a1a1a" />
          <rect x={x} y={40} width={16} height={2} fill="#c8962a" />
          <rect x={x + 2} y={80} width={3} height={4} fill="#8a1a1a" />
          <rect x={x + 11} y={80} width={3} height={4} fill="#8a1a1a" />
          <OlhoPequeno x={x + 8} y={56} s={1.2} />
        </g>
      ))}
      {/* colunata */}
      <rect x={0} y={96} width={320} height={4} fill="#8a7a78" />
      {Array.from({ length: 17 }, (_, k) => (
        <g key={k}>
          <rect x={4 + k * 19} y={100} width={6} height={36} fill="#7a6a6a" />
          <rect x={5 + k * 19} y={100} width={1} height={36} fill="#9a8a88" />
        </g>
      ))}
      <rect x={0} y={100} width={320} height={36} fill="#000" opacity={0.25} />
      {/* gente passando lá no fundo, em silêncio */}
      <Passante y={136} cor="#1a1020" dur={22} atraso={0} />
      <Passante y={136} cor="#20142a" dur={28} atraso={9} volta />
      <Passante y={136} cor="#1a1020" dur={25} atraso={15} alto={10} />
      <Passante y={136} cor="#20142a" dur={31} atraso={4} volta alto={13} />
      {/* a fonte que a Eco limpava */}
      <rect x={130} y={124} width={60} height={14} fill="#9a8a88" />
      <rect x={132} y={126} width={56} height={8} fill="#2a6a9a" />
      <rect x={132} y={126} width={56} height={1} fill="#6ab0e0" />
      <rect x={156} y={98} width={8} height={28} fill="#8a7a78" />
      <rect x={150} y={96} width={20} height={4} fill="#9a8a88" />
      {[0, 1, 2, 3, 4].map((k) => (
        <rect key={k} x={152 + k * 4} y={100} width={1} height={24} fill="#8ad0ff" opacity={0.7} className="pro-agua" style={{ animationDelay: `${k * 120}ms` }} />
      ))}
      <rect x={128} y={122} width={64} height={3} fill="#b8a8a4" />
      {/* respiradouros de vapor no chão */}
      {[34, 290].map((x) => (
        <g key={x}>
          <rect x={x - 6} y={150} width={12} height={3} fill="#3a3040" />
          <Vapor x={x} y={150} cor="#c0b8d0" n={3} />
        </g>
      ))}
      <Calcada y={138} cores={['#3a3040', '#4a4050', '#423848']} />
      {[96, 224].map((x) => (
        <Lampiao key={x} x={x} chao={150} />
      ))}
    </>
  );
}

/** Quinhentos anos atrás: a Guerra das Ideias e Roma pegando fogo. */
function RomaChamas() {
  return (
    <>
      <Ceu cores={['#1a0606', '#2a0a08', '#4a1008', '#7a2008', '#a8380a', '#c8501a']} ate={130} />
      {/* fumaça grossa no céu */}
      <g className="pro-nuvem">
        {Array.from({ length: 9 }, (_, k) => (
          <Disco key={k} cx={k * 40 + 10} cy={20 + (k % 3) * 10} r={14 + (k % 2) * 6} fill="#1a0a0a" opacity={0.75} />
        ))}
      </g>
      {/* o Coliseu ao fundo, escuro contra o fogo */}
      <Coliseu x={110} y={74} w={100} h={46} pedra="#2a0e0a" sombra="#1a0606" luz="#ff8a2a" />
      {/* prédios queimando */}
      {Array.from({ length: 9 }, (_, k) => {
        const x = k * 36 - 6;
        const h = 40 + Math.floor(rnd(k, 21) * 40);
        const y = 150 - h;
        return (
          <g key={k}>
            <rect x={x} y={y} width={30} height={h + 30} fill="#140606" />
            <rect x={x + 3} y={y + 8} width={4} height={6} fill="#ff6a2a" opacity={0.8} />
            <rect x={x + 18} y={y + 20} width={4} height={6} fill="#ffb04a" opacity={0.7} className="tocha" />
            {/* labaredas no telhado */}
            {[2, 10, 18].map((dx, n) => (
              <g key={dx} className="pro-chama" style={{ animationDelay: `${(k * 3 + n) * 90}ms` }}>
                <rect x={x + dx} y={y - 10} width={8} height={10} fill="#ff5a1a" />
                <rect x={x + dx + 2} y={y - 14} width={4} height={8} fill="#ffb04a" />
                <rect x={x + dx + 3} y={y - 16} width={2} height={4} fill="#fff0a0" />
              </g>
            ))}
          </g>
        );
      })}
      {/* uma coluna caída */}
      <rect x={30} y={150} width={60} height={8} fill="#5a3a30" transform="rotate(-8 60 154)" />
      {/* gente fugindo */}
      <Passante y={166} cor="#0a0202" dur={7} atraso={0} />
      <Passante y={166} cor="#0a0202" dur={8} atraso={3} alto={10} />
      <Passante y={166} cor="#0a0202" dur={6} atraso={5} />
      <rect y={166} width={320} height={14} fill="#100404" />
      <rect y={166} width={320} height={1} fill="#ff6a2a" opacity={0.4} />
    </>
  );
}

/** O salão do Censor: o trono, as cortinas vermelhas e a grande janela de engrenagem. */
function SalaoDoCensor() {
  return (
    <>
      <rect width={320} height={180} fill="#14040a" />
      {/* a janela redonda com a cidade lá fora */}
      <Disco cx={160} cy={66} r={52} fill="#2a1430" />
      <Disco cx={160} cy={66} r={46} fill="#0c0828" />
      <Estrelas n={18} ate={60} semente={8} />
      <rect x={118} y={92} width={84} height={20} fill="#1a1238" />
      <Coliseu x={130} y={84} w={60} h={22} pedra="#2a1e40" sombra="#1a1230" luz="#ffb04a" />
      <g className="pro-gira" style={{ transformOrigin: '160px 66px' }}>
        {Array.from({ length: 16 }, (_, k) => (
          <rect key={k} x={157} y={10} width={6} height={10} fill="#5a3a20" transform={`rotate(${k * 22.5} 160 66)`} />
        ))}
      </g>
      {[0, 45, 90, 135].map((a) => (
        <rect key={a} x={159} y={20} width={2} height={92} fill="#3a2014" transform={`rotate(${a} 160 66)`} />
      ))}
      {/* cortinas */}
      {[0, 270].map((x) => (
        <g key={x}>
          <rect x={x} y={0} width={50} height={160} fill="#6a0a14" />
          {Array.from({ length: 5 }, (_, k) => (
            <rect key={k} x={x + 4 + k * 10} y={0} width={3} height={160} fill="#4a0610" />
          ))}
          <rect x={x} y={0} width={50} height={6} fill="#c8962a" />
        </g>
      ))}
      {/* colunas douradas */}
      {[56, 254].map((x) => (
        <g key={x}>
          <rect x={x} y={8} width={10} height={150} fill="#8a6a2a" />
          <rect x={x + 2} y={8} width={2} height={150} fill="#c8962a" />
          <rect x={x - 2} y={6} width={14} height={4} fill="#c8962a" />
        </g>
      ))}
      {/* o trono atrás do Censor */}
      <rect x={136} y={104} width={48} height={50} fill="#3a1018" />
      <rect x={130} y={98} width={60} height={8} fill="#c8962a" />
      <rect x={140} y={108} width={40} height={40} fill="#5a1420" />
      <OlhoPequeno x={160} y={116} s={1.6} />
      {/* braseiros */}
      {[96, 218].map((x) => (
        <g key={x}>
          <Disco cx={x + 3} cy={128} r={18} fill="#ff6a2a" opacity={0.08} />
          <rect x={x} y={136} width={8} height={22} fill="#3a2a20" />
          <rect x={x - 3} y={132} width={14} height={5} fill="#5a3a20" />
          <g className="pro-chama">
            <rect x={x - 1} y={124} width={10} height={8} fill="#ff5a1a" />
            <rect x={x + 2} y={120} width={4} height={6} fill="#ffd04a" />
          </g>
        </g>
      ))}
      {/* degraus e piso */}
      <rect y={152} width={320} height={28} fill="#2a0a12" />
      <rect x={110} y={150} width={100} height={4} fill="#4a1420" />
      <rect x={100} y={154} width={120} height={4} fill="#3a1018" />
      {Array.from({ length: 10 }, (_, k) => (
        <rect key={k} x={k * 32} y={162} width={30} height={1} fill="#1a0408" />
      ))}
      {/* cabos no chão, ligando o Censor à cidade */}
      <rect x={0} y={170} width={320} height={2} fill="#1a1a24" />
      <rect x={0} y={174} width={320} height={1} fill="#24242e" />
    </>
  );
}

/** O Olho do Censor, de perto. */
function OOlho() {
  return (
    <>
      <rect width={320} height={180} fill="#050205" />
      {/* cabos saindo do olho para todos os lados */}
      {Array.from({ length: 12 }, (_, k) => (
        <rect key={k} x={158} y={-60} width={4} height={150} fill="#1a1018" transform={`rotate(${k * 30} 160 90)`} />
      ))}
      {Array.from({ length: 12 }, (_, k) => (
        <rect key={`l${k}`} x={159} y={-40} width={2} height={4} fill="#ff2a2a" className="pro-pulso-cabo" style={{ animationDelay: `${k * 150}ms` }} transform={`rotate(${k * 30 + 15} 160 90)`} />
      ))}
      <Disco cx={160} cy={90} r={70} fill="#ff2a2a" opacity={0.05} />
      {/* anel de metal com parafusos, girando */}
      <g className="pro-gira" style={{ transformOrigin: '160px 90px' }}>
        <Disco cx={160} cy={90} r={58} fill="#3a3040" />
        {Array.from({ length: 16 }, (_, k) => (
          <rect key={k} x={158} y={34} width={4} height={4} fill="#8a8098" transform={`rotate(${k * 22.5} 160 90)`} />
        ))}
      </g>
      <Disco cx={160} cy={90} r={50} fill="#1a1018" />
      {/* a íris vermelha */}
      <g className="pro-gira-volta" style={{ transformOrigin: '160px 90px' }}>
        <Disco cx={160} cy={90} r={42} fill="#5a0a0a" />
        {Array.from({ length: 24 }, (_, k) => (
          <rect key={k} x={159} y={50} width={2} height={22} fill="#8a1414" transform={`rotate(${k * 15} 160 90)`} />
        ))}
      </g>
      <Disco cx={160} cy={90} r={26} fill="#c81a1a" className="pro-pulsa" />
      <Disco cx={160} cy={90} r={16} fill="#ff3a3a" />
      <Disco cx={160} cy={90} r={8} fill="#140204" />
      <rect x={168} y={76} width={6} height={4} fill="#ffd0d0" />
      <rect x={170} y={80} width={2} height={2} fill="#ffd0d0" />
      {/* a linha de varredura */}
      <rect x={0} y={0} width={320} height={2} fill="#ff2a2a" opacity={0.25} className="pro-varredura" />
    </>
  );
}

/** A tela de título: o Coliseu sob as três estrelas, e o Olho no alto. */
function Titulo() {
  return (
    <>
      <Ceu cores={['#030208', '#06040e', '#0a0614', '#140818', '#24081a', '#3a0a18']} ate={150} />
      <Estrelas n={60} ate={110} semente={6} />
      {/* as três estrelas alinhadas */}
      {[146, 160, 174].map((x, k) => (
        <g key={x}>
          <Disco cx={x} cy={22 + k * 6} r={5} fill="#ffd04a" opacity={0.15} className="pro-pulsa" />
          <rect x={x - 1} y={21 + k * 6} width={3} height={3} fill="#fff0a0" />
        </g>
      ))}
      {/* raios vermelhos saindo do Olho */}
      <g className="pro-gira" style={{ transformOrigin: '160px 84px' }}>
        {Array.from({ length: 8 }, (_, k) => (
          <polygon key={k} points="160,84 154,-60 166,-60" fill="#ff2a2a" opacity={0.07} transform={`rotate(${k * 45} 160 84)`} />
        ))}
      </g>
      <Coliseu x={70} y={100} w={180} h={62} pedra="#1e1018" sombra="#0e060c" luz="#c8962a" />
      <rect x={154} y={86} width={12} height={14} fill="#0e060c" />
      <OlhoPequeno x={160} y={84} s={2} />
      <rect y={162} width={320} height={18} fill="#08040a" />
    </>
  );
}

/** O Porto de Óstia: o Esperança, o navio de guerra do Censor e o farol. */
function Porto() {
  return (
    <>
      <Ceu cores={['#04081e', '#060c28', '#0a1232', '#0e1a3e']} ate={96} />
      <Estrelas n={40} ate={70} semente={9} />
      <Lua x={70} y={26} r={11} />
      {/* o farol e o facho girando */}
      <polygon points="290,40 380,10 380,70" fill="#fff0a0" opacity={0.12} className="pro-farol" style={{ transformOrigin: '290px 40px' }} />
      <rect x={284} y={40} width={12} height={60} fill="#c8bca0" />
      {[50, 64, 78].map((y) => (
        <rect key={y} x={284} y={y} width={12} height={5} fill="#a83a2a" />
      ))}
      <rect x={282} y={34} width={16} height={6} fill="#3a3040" />
      <rect x={286} y={36} width={8} height={4} fill="#fff0a0" className="tocha" />
      {/* o mar, com ondas */}
      <rect y={96} width={320} height={50} fill="#0a2048" />
      {Array.from({ length: 6 }, (_, l) => (
        <g key={l} className="pro-onda" style={{ animationDelay: `${l * 300}ms` }}>
          {Array.from({ length: 22 }, (_, k) => (
            <rect key={k} x={k * 16 + (l % 2) * 8} y={100 + l * 7} width={6} height={1} fill={l < 2 ? '#2a4a80' : '#3a5a98'} />
          ))}
        </g>
      ))}
      {/* reflexo da lua */}
      {[100, 106, 112, 118].map((y, k) => (
        <rect key={y} x={64 - k} y={y} width={12 + k * 2} height={1} fill="#e8e0c0" opacity={0.35} className="pro-cintila" />
      ))}
      {/* o Esperança: navio de refugiados, com lanternas e gente a bordo */}
      <g className="pro-boia">
        <polygon points="24,112 100,112 92,126 32,126" fill="#5a3418" />
        <rect x={28} y={112} width={68} height={2} fill="#7a4a22" />
        <rect x={60} y={58} width={2} height={54} fill="#3a2010" />
        <rect x={40} y={62} width={20} height={34} fill="#e8dcc0" />
        <rect x={62} y={66} width={18} height={28} fill="#d8ccb0" />
        <rect x={41} y={74} width={18} height={1} fill="#c8bca0" />
        {[36, 46, 70, 80, 88].map((x) => (
          <rect key={x} x={x} y={106} width={3} height={6} fill="#2a1a10" />
        ))}
        {[34, 86].map((x) => (
          <rect key={x} x={x} y={104} width={2} height={2} fill="#ffd04a" className="tocha" />
        ))}
      </g>
      {/* o navio de guerra do Censor */}
      <g className="pro-boia" style={{ animationDelay: '700ms' }}>
        <polygon points="160,104 262,104 254,124 168,124" fill="#2a2a36" />
        <rect x={164} y={98} width={94} height={6} fill="#3a3a48" />
        {[176, 196, 216, 236].map((x) => (
          <rect key={x} x={x} y={110} width={4} height={3} fill="#ff6a2a" opacity={0.8} />
        ))}
        {[190, 222].map((x) => (
          <g key={x}>
            <rect x={x} y={78} width={8} height={20} fill="#1a1a24" />
            <rect x={x} y={80} width={8} height={2} fill="#8a1a1a" />
            <Vapor x={x + 4} y={78} cor="#4a4858" />
          </g>
        ))}
        <rect x={244} y={60} width={2} height={38} fill="#1a1a24" />
        <rect x={246} y={62} width={14} height={10} fill="#8a1a1a" />
        <OlhoPequeno x={253} y={67} s={0.8} />
      </g>
      {/* o cais: tábuas, caixotes, cordas */}
      <rect y={146} width={320} height={34} fill="#4a2e18" />
      {Array.from({ length: 6 }, (_, k) => (
        <rect key={k} y={148 + k * 6} width={320} height={1} fill="#2e1a0c" />
      ))}
      {Array.from({ length: 12 }, (_, k) => (
        <rect key={`v${k}`} x={k * 28 + (k % 2) * 6} y={146} width={1} height={34} fill="#3a2210" />
      ))}
      <rect y={144} width={320} height={3} fill="#6a4426" />
      {[8, 300].map((x) => (
        <g key={x}>
          <rect x={x} y={136} width={6} height={10} fill="#2e1a0c" />
          <rect x={x - 1} y={134} width={8} height={3} fill="#4a2e18" />
        </g>
      ))}
      <rect x={240} y={130} width={16} height={14} fill="#7a4a22" />
      <rect x={240} y={136} width={16} height={1} fill="#5a3418" />
      <rect x={258} y={134} width={12} height={10} fill="#8a5a2a" />
    </>
  );
}

/** O Observatório: a cúpula, o grande telescópio e as três estrelas. */
function Observatorio() {
  return (
    <>
      <Ceu cores={['#020110', '#040318', '#060420', '#0a0628', '#100a34']} ate={130} />
      {/* a Via Láctea */}
      {Array.from({ length: 90 }, (_, k) => {
        const t = rnd(k, 31);
        return <rect key={k} x={Math.floor(t * 320)} y={Math.floor(70 - t * 60 + (rnd(k, 32) - 0.5) * 22)} width={1} height={1} fill="#b8a8ff" opacity={0.5} />;
      })}
      <Estrelas n={60} ate={120} semente={12} />
      {/* estrela cadente */}
      <rect x={240} y={14} width={8} height={1} fill="#fff" className="pro-cadente" />
      {/* as três estrelas alinhadas sobre o Coliseu */}
      {[200, 214, 228].map((x, k) => (
        <g key={x}>
          <Disco cx={x} cy={24 + k * 8} r={7} fill="#ffd04a" opacity={0.15} className="pro-pulsa" />
          <rect x={x - 1} y={23 + k * 8} width={3} height={3} fill="#fff0a0" />
          <rect x={x} y={21 + k * 8} width={1} height={7} fill="#ffd04a" opacity={0.6} />
          <rect x={x - 3} y={24 + k * 8} width={7} height={1} fill="#ffd04a" opacity={0.6} />
        </g>
      ))}
      {/* o Coliseu lá embaixo, bem longe */}
      <Coliseu x={186} y={126} w={60} h={20} pedra="#2a2040" sombra="#1a1430" luz="#ffb04a" />
      {/* a cúpula */}
      <rect x={10} y={106} width={110} height={50} fill="#4a4064" />
      <rect x={10} y={106} width={110} height={3} fill="#6a6088" />
      {Array.from({ length: 5 }, (_, k) => (
        <rect key={k} x={18 + k * 22} y={116} width={6} height={10} fill="#ffd090" opacity={0.6} />
      ))}
      <Disco cx={65} cy={106} r={40} fill="#5a5078" />
      <rect x={20} y={106} width={92} height={42} fill="#4a4064" />
      <rect x={60} y={66} width={10} height={40} fill="#1a1430" />
      {/* o grande telescópio de latão */}
      <g transform="rotate(-32 70 92)">
        <rect x={60} y={86} width={90} height={12} fill="#a8782a" />
        <rect x={60} y={86} width={90} height={2} fill="#e8b84a" />
        <rect x={140} y={83} width={14} height={18} fill="#c8962a" />
        <rect x={86} y={84} width={4} height={16} fill="#7a5418" />
        <rect x={112} y={84} width={4} height={16} fill="#7a5418" />
      </g>
      {/* a esfera armilar girando */}
      <g className="pro-gira" style={{ transformOrigin: '270px 140px' }}>
        <rect x={252} y={139} width={36} height={2} fill="#c8962a" />
        <rect x={269} y={122} width={2} height={36} fill="#c8962a" />
        <rect x={256} y={127} width={28} height={2} fill="#a8782a" transform="rotate(35 270 140)" />
      </g>
      <Disco cx={270} cy={140} r={3} fill="#4ef0dc" />
      <rect x={268} y={156} width={4} height={6} fill="#5a4a30" />
      {/* o terraço */}
      <rect y={156} width={320} height={24} fill="#2a2440" />
      {Array.from({ length: 20 }, (_, k) => (
        <rect key={k} x={k * 16} y={156} width={15} height={1} fill="#3a3456" />
      ))}
      {Array.from({ length: 20 }, (_, k) => (
        <rect key={`b${k}`} x={k * 16 + 8} y={166} width={1} height={14} fill="#1e1a30" />
      ))}
    </>
  );
}

/** A porta da Grande Biblioteca, de noite. */
function PortaBiblioteca() {
  return (
    <>
      <rect width={320} height={180} fill="#1a100a" />
      {/* estantes dos dois lados */}
      {[4, 232].map((x0) => (
        <g key={x0}>
          <rect x={x0} y={10} width={84} height={138} fill="#3a2212" />
          {Array.from({ length: 6 }, (_, p) => (
            <g key={p}>
              <rect x={x0} y={30 + p * 20} width={84} height={3} fill="#24140a" />
              {Array.from({ length: 20 }, (_, i) => {
                const alt = 10 + Math.floor(rnd(i + p * 20 + x0, 41) * 7);
                return (
                  <rect
                    key={i}
                    x={x0 + 2 + i * 4}
                    y={30 + p * 20 - alt}
                    width={3}
                    height={alt}
                    fill={['#a83a2a', '#3a6a9a', '#c8962a', '#4a8a3a', '#7a3a8a', '#d8c8a0'][Math.floor(rnd(i + p * 7 + x0, 42) * 6)]}
                  />
                );
              })}
            </g>
          ))}
        </g>
      ))}
      {/* o arco da porta */}
      <rect x={100} y={8} width={120} height={148} fill="#4a3a30" />
      <rect x={104} y={12} width={112} height={4} fill="#6a5a48" />
      {Array.from({ length: 7 }, (_, k) => (
        <rect key={k} x={104 + k * 16} y={16} width={14} height={6} fill="#5a4a3c" />
      ))}
      {/* a porta dupla de madeira, com tachas de bronze */}
      <rect x={116} y={30} width={88} height={126} fill="#5a3418" />
      <rect x={118} y={32} width={41} height={124} fill="#7a4a22" />
      <rect x={161} y={32} width={41} height={124} fill="#7a4a22" />
      {Array.from({ length: 8 }, (_, k) => (
        <g key={k}>
          <rect x={118} y={40 + k * 15} width={41} height={1} fill="#5a3418" />
          <rect x={161} y={40 + k * 15} width={41} height={1} fill="#5a3418" />
        </g>
      ))}
      {Array.from({ length: 5 }, (_, l) =>
        [124, 150, 168, 194].map((x) => <rect key={`${l}-${x}`} x={x} y={48 + l * 24} width={2} height={2} fill="#c8962a" />),
      )}
      {/* o emblema do livro aberto */}
      <rect x={146} y={60} width={28} height={18} fill="#c8962a" />
      <rect x={148} y={62} width={11} height={14} fill="#f0e0b0" />
      <rect x={161} y={62} width={11} height={14} fill="#f0e0b0" />
      <rect x={159} y={60} width={2} height={18} fill="#8a6a1a" />
      {[150, 163].map((x) => [65, 68, 71].map((y) => <rect key={`${x}-${y}`} x={x} y={y} width={7} height={1} fill="#8a7a5a" />))}
      <rect x={152} y={100} width={4} height={8} fill="#c8962a" />
      <rect x={164} y={100} width={4} height={8} fill="#c8962a" />
      {/* tochas */}
      {[96, 220].map((x) => (
        <g key={x}>
          <Disco cx={x + 2} cy={60} r={20} fill="#ff8a3c" opacity={0.08} />
          <rect x={x} y={64} width={4} height={14} fill="#4a2a10" />
          <g className="pro-chama">
            <rect x={x - 1} y={56} width={6} height={8} fill="#ff6a2a" />
            <rect x={x + 1} y={52} width={2} height={6} fill="#ffd04a" />
          </g>
        </g>
      ))}
      {/* piso de mármore em xadrez */}
      <rect y={152} width={320} height={28} fill="#3a2e28" />
      {Array.from({ length: 4 }, (_, l) =>
        Array.from({ length: 20 }, (_, k) => ((k + l) % 2 ? <rect key={`${l}-${k}`} x={k * 16} y={152 + l * 7} width={16} height={7} fill="#4a3e36" /> : null)),
      )}
      {/* poeira no ar */}
      {Array.from({ length: 10 }, (_, k) => (
        <rect key={`d${k}`} x={20 + k * 30} y={60 + (k % 4) * 20} width={1} height={1} fill="#ffe8b0" opacity={0.6} className="pro-poeira" style={{ animationDelay: `${k * 400}ms` }} />
      ))}
    </>
  );
}
