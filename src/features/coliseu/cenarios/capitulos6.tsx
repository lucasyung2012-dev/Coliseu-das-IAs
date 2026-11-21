/**
 * Cenários do sexto bloco de capítulos do modo História (Coliseu), em pixel art de 320 × 180:
 * o capítulo secreto "Os Três", o final verdadeiro em que Cassius, Octavius e Helios lutam juntos.
 * O Hipogeu (os túneis debaixo da arena), a câmara do Núcleo (onde vive a cópia de reserva do Censor)
 * e o Coliseu livre, num dia de festa depois da queda, com o olho do Censor já azul.
 *
 * `desenhoCapitulo6(lugar)` devolve só o conteúdo do SVG (sem a tag <svg>) para viewBox "0 0 320 180";
 * quem chama põe o <svg> com shapeRendering="crispEdges". Lugares que não são destes capítulos devolvem null.
 *
 * Regras do desenho: coordenadas inteiras, quase tudo em <rect>, chão entre y 136 e 180
 * (os pés dos personagens ficam por volta de y 155), a faixa central (y 70 a 150) mais calma para os
 * personagens e o topo (uns 18 px) livre de detalhe importante, porque o HUD pode cobrir.
 * As animações de ambiente usam as classes "c6-" de capitulos6.css; os ids de <defs> começam com "c6-".
 */
import './capitulos6.css';
import type { CSSProperties } from 'react';

export function desenhoCapitulo6(lugar: string): JSX.Element | null {
  switch (lugar) {
    case 'hipogeu':
      return hipogeu();
    case 'nucleo-camara':
      return nucleoCamara();
    case 'coliseu-livre':
      return coliseuLivre();
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/* Ferramentas de desenho                                              */
/* ------------------------------------------------------------------ */

/** Ponto (x, y) em unidades do desenho. */
type Ponto = readonly [number, number];

/** Junta os elementos de um desenho; a chave de cada um é a sua posição na lista. */
interface Pincel {
  itens: JSX.Element[];
  /** Retângulo simples. */
  r(x: number, y: number, w: number, h: number, fill: string, opacity?: number): void;
  /** Retângulo animado (classe e estilo próprios, sem opacity fixa). */
  ra(x: number, y: number, w: number, h: number, fill: string, className: string | undefined, style?: CSSProperties): void;
  /** Grupo, com classe e estilo opcionais, desenhado por outro pincel. */
  g(className: string | undefined, style: CSSProperties | undefined, desenhar: (s: Pincel) => void): void;
  /** Qualquer outro elemento. */
  el(criar: (key: number) => JSX.Element): void;
}

function pincel(): Pincel {
  const itens: JSX.Element[] = [];
  return {
    itens,
    r(x, y, w, h, fill, opacity) {
      itens.push(<rect key={itens.length} x={x} y={y} width={w} height={h} fill={fill} opacity={opacity} />);
    },
    ra(x, y, w, h, fill, className, style) {
      itens.push(<rect key={itens.length} x={x} y={y} width={w} height={h} fill={fill} className={className} style={style} />);
    },
    g(className, style, desenhar) {
      const sub = pincel();
      desenhar(sub);
      itens.push(
        <g key={itens.length} className={className} style={style}>
          {sub.itens}
        </g>,
      );
    },
    el(criar) {
      itens.push(criar(itens.length));
    },
  };
}

/** Número "aleatório" fixo entre 0 e 1 a partir de uma semente: o desenho sai igual em toda renderização. */
function sorte(n: number): number {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

/** Inteiro fixo entre a e b (inclusive) a partir de uma semente. */
function entre(n: number, a: number, b: number): number {
  return a + Math.floor(sorte(n) * (b - a + 1));
}

/** Item da lista pela posição, dando a volta. */
function de(lista: readonly string[], n: number): string {
  const i = ((Math.round(n) % lista.length) + lista.length) % lista.length;
  return lista[i] ?? '#000000';
}

function atraso(ms: number): CSSProperties {
  return { animationDelay: `${ms}ms` };
}

/** Linha (cabos, cordas); largura em unidades do desenho. */
function linha(t: Pincel, x1: number, y1: number, x2: number, y2: number, cor: string, largura = 1): void {
  t.el((k) => <line key={k} x1={x1} y1={y1} x2={x2} y2={y2} stroke={cor} strokeWidth={largura} />);
}

/** Contorno de elipse (anéis no piso da câmara). */
function elipse(t: Pincel, cx: number, cy: number, rx: number, ry: number, cor: string): void {
  t.el((k) => <ellipse key={k} cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={cor} strokeWidth={1} />);
}

/** Padrão de textura (pedra, laje, grade, plateia) que se repete pelo desenho todo; o id deve começar com "c6-". */
function padrao(t: Pincel, id: string, w: number, h: number, desenhar: (s: Pincel) => void): void {
  const sub = pincel();
  desenhar(sub);
  t.el((k) => (
    <defs key={k}>
      <pattern id={id} x={0} y={0} width={w} height={h} patternUnits="userSpaceOnUse">
        {sub.itens}
      </pattern>
    </defs>
  ));
}

/** Céu em faixas (degradê em degraus) de y0 até y1. */
function ceu(t: Pincel, cores: readonly string[], y0: number, y1: number): void {
  const h = Math.ceil((y1 - y0) / cores.length);
  cores.forEach((c, i) => t.r(0, y0 + i * h, 320, h, c));
}

/** Arco em degraus (semicírculo de raio r com o topo em y) e o corpo reto embaixo (altura base). */
function arco(t: Pincel, cx: number, y: number, r: number, base: number, cor: string, passo = 2): void {
  for (let dy = 0; dy < r; dy += passo) {
    const h = Math.min(passo, r - dy);
    const meio = Math.round(Math.sqrt(Math.max(0, r * r - (r - dy - h / 2) ** 2)));
    if (meio > 0) t.r(cx - meio, y + dy, meio * 2, h, cor);
  }
  if (base > 0) t.r(cx - r, y + r, r * 2, base, cor);
}

/** Disco cheio em faixas de altura passo (o número de retângulos é 2r / passo). */
function disco(t: Pincel, cx: number, cy: number, r: number, cor: string, passo = 2): void {
  for (let dy = -r; dy < r; dy += passo) {
    const h = Math.min(passo, r - dy);
    const meio = Math.round(Math.sqrt(Math.max(0, r * r - (dy + h / 2) ** 2)));
    if (meio > 0) t.r(cx - meio, cy + dy, meio * 2, h, cor);
  }
}

/** Halo de luz em degraus: cruzes concêntricas bem transparentes. */
function halo(t: Pincel, cx: number, cy: number, r: number, cor: string, op: number, className?: string, style?: CSSProperties): void {
  t.g(className, style, (s) => {
    for (const f of [1, 0.66, 0.36]) {
      const a = Math.max(1, Math.round(r * f));
      const b = Math.max(1, Math.round(a * 0.55));
      s.r(cx - a, cy - b, a * 2, b * 2, cor, op);
      s.r(cx - b, cy - a, b * 2, a * 2, cor, op);
    }
  });
}

/** Olho do Censor: (cx, cy) é o centro e e é a escala inteira (1 = 12 × 6); a íris pisca na classe dada. */
function olho(t: Pincel, cx: number, cy: number, e: number, iris: string, classe: string, atrasoMs: number): void {
  t.r(cx - 6 * e, cy - e, 12 * e, 2 * e, '#f0ece4');
  t.r(cx - 4 * e, cy - 2 * e, 8 * e, 4 * e, '#f0ece4');
  t.r(cx - 2 * e, cy - 3 * e, 4 * e, 6 * e, '#f0ece4');
  t.ra(cx - 2 * e, cy - 2 * e, 4 * e, 4 * e, iris, classe, atraso(atrasoMs));
  t.r(cx - e, cy - e, 2 * e, 2 * e, '#0a0a1a');
}

/** Engrenagem (ou roldana) girando em volta do próprio centro (origem da rotação em unidades do desenho). */
function engrenagem(t: Pincel, cx: number, cy: number, r: number, cor: string, escuro: string, duracaoS: number, reversa: boolean): void {
  const d = Math.round(r * 0.7);
  t.g(
    'c6-gira',
    {
      transformOrigin: `${cx}px ${cy}px`,
      animationDuration: `${duracaoS}s`,
      animationDirection: reversa ? 'reverse' : 'normal',
    },
    (s) => {
      s.r(cx - r - 3, cy - 2, r * 2 + 6, 4, cor);
      s.r(cx - 2, cy - r - 3, 4, r * 2 + 6, cor);
      for (const [dx, dy] of [[-d, -d], [d, -d], [-d, d], [d, d]] as Ponto[]) s.r(cx + dx - 2, cy + dy - 2, 4, 4, cor);
      disco(s, cx, cy, r, cor, 3);
      disco(s, cx, cy, Math.max(2, Math.round(r * 0.45)), escuro, 3);
      s.r(cx - 1, cy - 1, 2, 2, cor);
    },
  );
}

/**
 * Anel de engrenagem gigante girando em volta de (cx, cy): o aro parado (círculos com traço)
 * e n dentes com alguns rebites que giram por cima.
 */
function anel(
  t: Pincel,
  cx: number,
  cy: number,
  r: number,
  n: number,
  cor: string,
  escuro: string,
  duracaoS: number,
  reversa: boolean,
): void {
  t.el((k) => <circle key={k} cx={cx} cy={cy} r={r} fill="none" stroke={escuro} strokeWidth={6} />);
  t.el((k) => <circle key={k} cx={cx} cy={cy} r={r} fill="none" stroke={cor} strokeWidth={2} />);
  t.g(
    'c6-gira',
    {
      transformOrigin: `${cx}px ${cy}px`,
      animationDuration: `${duracaoS}s`,
      animationDirection: reversa ? 'reverse' : 'normal',
    },
    (s) => {
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const x = Math.round(cx + Math.cos(a) * (r + 4));
        const y = Math.round(cy + Math.sin(a) * (r + 4));
        s.r(x - 2, y - 2, 4, 4, cor);
        if (i % 4 === 0) {
          const xi = Math.round(cx + Math.cos(a) * r);
          const yi = Math.round(cy + Math.sin(a) * r);
          s.r(xi - 1, yi - 1, 2, 2, '#c8a060');
        }
      }
    },
  );
}

/**
 * Coluna de vapor: n baforadas que sobem e somem, espalhadas no tempo.
 * (x, y) é a boca; a classe é "c6-vapor".
 */
function vapor(t: Pincel, x: number, y: number, n: number, cores: readonly string[], tam: number, duracaoS: number, atrasoMs: number): void {
  for (let i = 0; i < n; i++) {
    const c = de(cores, i);
    const a = tam + (i % 2);
    const d = atrasoMs - Math.round((i * duracaoS * 1000) / n);
    t.g('c6-vapor', { animationDelay: `${d}ms`, animationDuration: `${duracaoS}s` }, (s) => {
      s.r(x - a, y - a + 1, a * 2, a * 2 - 2, c);
      s.r(x - a + 1, y - a, a * 2 - 2, a * 2, c);
    });
  }
}

/** Faísca de brilho em cruz que acende de vez em quando. */
function brilho(t: Pincel, x: number, y: number, cor: string, atrasoMs: number): void {
  t.g('c6-brilho', atraso(atrasoMs), (s) => {
    s.r(x - 2, y, 5, 1, cor);
    s.r(x, y - 2, 1, 5, cor);
  });
}

/** Labareda de largura w (pelo menos 4) com a base em (x, y). */
function fogo(t: Pincel, x: number, y: number, w: number, atrasoMs: number): void {
  t.g('c6-chama', atraso(atrasoMs), (s) => {
    s.r(x, y - 4, w, 4, '#c83a12');
    s.r(x + 1, y - 7, w - 2, 4, '#f07a1a');
    s.r(x + Math.floor(w / 2) - 1, y - 10, 2, 5, '#ffc040');
    s.r(x + 1, y - 3, w - 2, 2, '#ffe080');
  });
}

/** Tocha de parede com chama e halo; (x, y) é a boca do suporte. */
function tocha(t: Pincel, x: number, y: number, atrasoMs: number, luz = 0.1): void {
  halo(t, x + 2, y - 4, 26, '#ff9a3a', luz, 'c6-tremor', atraso(atrasoMs));
  t.r(x - 1, y + 5, 7, 1, '#6a5020');
  t.r(x + 1, y + 3, 3, 8, '#4a3018');
  t.r(x, y, 5, 3, '#8a6a2a');
  t.r(x, y, 5, 1, '#d8a84a');
  fogo(t, x, y, 5, atrasoMs);
}

/** Faísca que salta e cai apagando; (x, y) é o ponto de partida, para a esquerda ou para a direita. */
function faisca(t: Pincel, x: number, y: number, cor: string, atrasoMs: number, esquerda: boolean): void {
  t.ra(x, y, 1, 1, cor, esquerda ? 'c6-faisca-volta' : 'c6-faisca', atraso(atrasoMs));
}

/** Corrente pendurada de n elos a partir de (x, y), com gancho na ponta se pedir. */
function corrente(t: Pincel, x: number, y: number, n: number, gancho: boolean): void {
  for (let i = 0; i < n; i++) {
    if (i % 2 === 0) {
      t.r(x, y + i * 3, 3, 3, '#6a6a76');
      t.r(x + 1, y + i * 3 + 1, 1, 1, '#1a1214');
    } else {
      t.r(x + 1, y + i * 3, 1, 3, '#9a9aa8');
    }
  }
  if (gancho) {
    const yb = y + n * 3;
    t.r(x + 1, yb, 1, 3, '#a8a8b0');
    t.r(x - 1, yb + 3, 3, 1, '#a8a8b0');
    t.r(x - 1, yb + 1, 1, 2, '#a8a8b0');
  }
}

/** Pomba branca cruzando o céu e batendo as asas; começa em (x, y), fora da tela à esquerda. */
function pomba(t: Pincel, x: number, y: number, atrasoMs: number, duracaoS: number): void {
  t.g('c6-pomba', { animationDelay: `${atrasoMs}ms`, animationDuration: `${duracaoS}s` }, (s) => {
    s.r(x - 2, y, 2, 1, '#d8dce4');
    s.r(x, y, 4, 2, '#f8f8f4');
    s.r(x + 4, y - 1, 2, 2, '#f8f8f4');
    s.r(x + 6, y, 1, 1, '#e8a040');
    s.g('c6-asa', atraso(atrasoMs), (a) => {
      a.r(x + 1, y - 3, 3, 3, '#ffffff');
      a.r(x, y - 4, 2, 1, '#ffffff');
    });
  });
}

/* ------------------------------------------------------------------ */
/* O Hipogeu                                                           */
/* ------------------------------------------------------------------ */

/** Jaula de fera vazia encostada na parede; (x, y) é o canto de cima das grades. */
function jaula(t: Pincel, x: number, y: number, w: number, h: number, semente: number, portaAberta: boolean): void {
  t.r(x, y, w, h, '#120c0a');
  t.r(x, y + h - 6, w, 6, '#5a4628');
  for (let i = 0; i < w - 4; i += 7) t.r(x + i + entre(semente + i, 0, 3), y + h - 7, 3, 1, '#8a7038');
  // corrente arrebentada lá dentro
  corrente(t, x + 6, y + 2, 5, false);
  // moldura de madeira
  t.r(x - 2, y - 4, w + 4, 4, '#4a3624');
  t.r(x - 2, y - 4, w + 4, 1, '#7a5a34');
  t.r(x - 2, y + h, w + 4, 3, '#4a3624');
  // grades (com um vão onde a porta está aberta)
  for (let i = 0; i <= w - 2; i += 6) {
    if (portaAberta && i >= 12 && i <= 24) continue;
    t.r(x + i, y, 2, h, '#6a5e52');
    t.r(x + i, y, 1, h, '#9a8a78');
  }
  if (portaAberta) {
    // a porta de grade aberta, vista de lado, e o cadeado caído na palha
    t.r(x + 11, y + 2, 2, h - 4, '#7a6a5a');
    t.r(x + 10, y + 6, 4, 2, '#5a4a3a');
    t.r(x + 10, y + h - 10, 4, 2, '#5a4a3a');
    t.r(x + 22, y + h - 4, 4, 3, '#b8862a');
    t.r(x + 23, y + h - 6, 2, 2, '#8a8a96');
  }
  // plaquinha de bronze
  const px = x + Math.floor(w / 2) - 4;
  t.r(px, y - 3, 8, 3, '#8a6a2a');
  t.r(px, y - 3, 8, 1, '#c8a050');
}

/**
 * Elevador de corda e roldana que sobe até um alçapão da arena; (x) é o lado esquerdo da cabine
 * (largura 24). A cabine sobe e desce (c6-elevador) e o contrapeso faz o contrário.
 */
function elevador(t: Pincel, x: number, atrasoMs: number): void {
  const w = 24;
  // vigas-guia
  t.r(x - 3, 14, 3, 122, '#4a3020');
  t.r(x - 3, 14, 1, 122, '#7a5432');
  t.r(x + w, 14, 3, 122, '#4a3020');
  t.r(x + w, 14, 1, 122, '#7a5432');
  for (let y = 30; y < 136; y += 40) {
    t.r(x - 4, y, 5, 2, '#2a1a10');
    t.r(x + w - 1, y, 5, 2, '#2a1a10');
  }
  // contrapeso (começa embaixo quando a cabine está em cima)
  t.g('c6-elevador', { animationDelay: `${atrasoMs}ms`, animationDirection: 'alternate-reverse' }, (s) => {
    s.r(x + w + 5, -30, 1, 70, '#a88a5a');
    s.r(x + w + 3, 40, 5, 12, '#4a4a52');
    s.r(x + w + 3, 40, 5, 1, '#7a7a86');
    s.r(x + w + 4, 45, 3, 1, '#2a2a30');
  });
  // cabine de grade com caixotes
  t.g('c6-elevador', atraso(atrasoMs), (s) => {
    s.r(x + 5, -40, 1, 90, '#b89a68');
    s.r(x + w - 6, -40, 1, 90, '#b89a68');
    s.r(x + 2, 50, w - 4, 2, '#5a3a20');
    s.r(x + 10, 46, 4, 4, '#6a6a76');
    for (let i = 0; i <= w - 4; i += 4) s.r(x + 2 + i, 52, 1, 24, '#7a6a58');
    s.r(x + 3, 70, 7, 6, '#8a6234');
    s.r(x + 3, 70, 7, 1, '#b8884a');
    s.r(x + 14, 72, 6, 4, '#7a5a30');
    s.r(x, 76, w, 4, '#6a4424');
    s.r(x, 76, w, 1, '#9a6a3a');
    s.r(x + 2, 80, w - 4, 2, '#3a2414');
  });
  // roldana no alto
  engrenagem(t, x + 12, 20, 6, '#8a6a3a', '#2a1a10', 6, atrasoMs < -500);
}

/** Cano de cobre do chão ao teto com registro que vaza vapor; (x) é o lado esquerdo e yv a altura do registro. */
function cano(t: Pincel, x: number, yv: number, atrasoMs: number): void {
  t.r(x, 16, 4, 120, '#7a5a3a');
  t.r(x, 16, 1, 120, '#b08850');
  for (let y = 30; y < 136; y += 32) t.r(x - 1, y, 6, 2, '#5a3e24');
  t.r(x - 3, yv, 10, 2, '#a83a2a');
  t.r(x + 1, yv - 3, 2, 8, '#a83a2a');
  vapor(t, x + 6, yv - 2, 3, ['#c8c0c8', '#a8a0b0'], 2, 3, atrasoMs);
}

function hipogeu(): JSX.Element {
  const t = pincel();
  padrao(t, 'c6-pedra', 24, 12, (s) => {
    s.r(0, 0, 24, 12, '#3a2c2a');
    s.r(0, 0, 24, 1, '#4c3c36');
    s.r(0, 6, 24, 1, '#4c3c36');
    s.r(0, 5, 24, 1, '#221816');
    s.r(0, 11, 24, 1, '#221816');
    s.r(11, 0, 1, 5, '#221816');
    s.r(23, 6, 1, 5, '#221816');
    s.r(4, 2, 3, 1, '#443432');
    s.r(16, 8, 2, 1, '#302422');
  });
  padrao(t, 'c6-laje', 40, 11, (s) => {
    s.r(0, 0, 40, 11, '#2e2422');
    s.r(0, 0, 40, 1, '#4a3a34');
    s.r(0, 10, 40, 1, '#181210');
    s.r(19, 1, 1, 9, '#181210');
    s.r(6, 4, 2, 1, '#3a2e2a');
    s.r(30, 6, 3, 1, '#3a2e2a');
  });

  // teto: o piso de madeira da arena, com as vigas
  t.r(0, 0, 320, 16, '#2a1a10');
  for (let x = 0; x < 320; x += 40) t.r(x, 0, 1, 12, '#1a0e08');
  t.r(0, 12, 320, 4, '#5a3a20');
  t.r(0, 12, 320, 1, '#8a6234');
  // alçapões abertos e a grelha do meio: a luz do dia vem da arena lá em cima
  for (const x of [58, 236]) {
    t.r(x, 0, 24, 12, '#ffe6a8');
    t.r(x, 0, 24, 3, '#fff6d8');
    t.r(x - 2, 12, 28, 2, '#3a2412');
  }
  t.r(148, 0, 24, 12, '#d8b878');
  for (let x = 148; x < 172; x += 4) t.r(x, 0, 1, 12, '#2a1a10');

  // paredes de pedra
  t.r(0, 16, 320, 120, 'url(#c6-pedra)');
  t.r(0, 16, 320, 8, '#0a0606', 0.35);

  // corredor do meio, fundo e escuro, que leva até o Núcleo
  arco(t, 160, 38, 36, 62, '#5a4840', 4);
  t.r(156, 34, 8, 6, '#6a5a50');
  t.r(156, 34, 8, 1, '#8a7a6a');
  arco(t, 160, 42, 32, 62, '#1a1214', 4);
  arco(t, 160, 56, 22, 58, '#120c0c', 4);
  arco(t, 160, 68, 14, 54, '#0a0606', 4);
  t.r(128, 128, 64, 8, '#1e1614');
  t.r(140, 124, 40, 4, '#161010');
  halo(t, 160, 110, 18, '#ff2a1a', 0.1, 'c6-pulso');
  olho(t, 160, 108, 1, '#e0201a', 'c6-olho', 0);

  // cabos vermelhos correndo pela parede e descendo para dentro do corredor
  const cabos: readonly (readonly [number, string])[] = [
    [26, '#6a0e10'],
    [29, '#8a1414'],
    [32, '#5a0a0c'],
  ];
  cabos.forEach(([y, c], i) => {
    const xl = 128 + i * 3;
    const xr = 190 - i * 3;
    const yb = 124 + i * 3;
    t.r(0, y, xl + 2, 2, c);
    t.r(xr, y, 320 - xr, 2, c);
    t.r(xl, y, 2, yb - y + 2, c);
    t.r(xr, y, 2, yb - y + 2, c);
    t.r(xl, yb, xr - xl + 2, 2, c);
  });
  for (let x = 14; x < 320; x += 40) {
    if (x > 120 && x < 200) continue;
    t.r(x, 24, 2, 11, '#3a3a42');
  }
  // o pulso dos cabos e os sinais que correm em direção ao corredor
  t.g('c6-cabo', undefined, (s) => {
    cabos.forEach(([y], i) => {
      const xl = 128 + i * 3;
      const xr = 190 - i * 3;
      s.r(0, y, xl + 2, 1, '#ff4a30');
      s.r(xr, y, 320 - xr, 1, '#ff4a30');
    });
  });
  cabos.forEach(([y], i) => {
    const xl = 128 + i * 3;
    const xr = 190 - i * 3;
    t.ra(0, y, 3, 2, '#ffb0a0', 'c6-sinal', { '--dx': `${xl - 2}px`, animationDelay: `${-i * 700}ms` } as CSSProperties);
    t.ra(317, y, 3, 2, '#ffb0a0', 'c6-sinal', { '--dx': `${xr - 317}px`, animationDelay: `${-i * 700 - 1200}ms` } as CSSProperties);
  });

  // pilares
  for (const x of [100, 208]) {
    t.r(x, 16, 12, 120, '#4a3c36');
    t.r(x, 16, 2, 120, '#6a5a50');
    t.r(x + 10, 16, 2, 120, '#2a201e');
    t.r(x - 2, 16, 16, 4, '#5a4a42');
    t.r(x - 2, 130, 16, 6, '#5a4a42');
  }

  // feixes de luz caindo dos alçapões e da grelha
  t.g('c6-luz', undefined, (s) => {
    for (const x of [58, 236]) {
      for (let i = 0; i < 5; i++) s.r(x - i * 2, 14 + i * 24, 24 + i * 4, 24, '#ffe8b0', 0.07);
    }
    for (let i = 0; i < 3; i++) s.r(148 - i * 2, 12 + i * 8, 24 + i * 4, 8, '#ffe8b0', 0.06);
  });

  // jaulas vazias das feras
  jaula(t, 6, 80, 40, 53, 3, false);
  jaula(t, 274, 80, 40, 53, 9, true);

  // canos com vapor
  cano(t, 92, 96, 0);
  cano(t, 223, 108, -1500);

  // elevadores de corda subindo até os alçapões
  elevador(t, 58, 0);
  elevador(t, 236, -3500);

  // correntes penduradas do teto
  corrente(t, 36, 16, 12, true);
  corrente(t, 200, 16, 10, true);
  corrente(t, 284, 16, 10, false);

  // tochas nos pilares
  tocha(t, 104, 58, 0);
  tocha(t, 212, 58, -400);

  // chão de lajes, montinhos de areia que caem da arena e a poça de luz
  t.r(0, 136, 320, 44, 'url(#c6-laje)');
  t.r(0, 136, 320, 2, '#5a4a42');
  for (const x of [58, 236]) {
    t.r(x - 4, 136, 32, 10, '#ffe8b0', 0.1);
    t.r(x - 8, 146, 40, 10, '#ffe8b0', 0.05);
    t.r(x + 4, 134, 16, 2, '#c8a870');
    t.r(x + 8, 132, 8, 2, '#d8b880');
  }
  t.r(150, 136, 20, 6, '#ffe8b0', 0.06);
  // areia caindo dos alçapões
  for (let i = 0; i < 6; i++) {
    const x = (i % 2 === 0 ? 60 : 238) + entre(i * 11 + 4, 0, 20);
    t.ra(x, 14, 1, 1, '#e8d0a0', 'c6-poeira', { animationDelay: `${-i * 690}ms`, animationDuration: `${3 + (i % 3)}s` });
  }
  // sombra no pé da tela
  t.r(0, 164, 320, 16, '#000000', 0.25);
  return <>{t.itens}</>;
}

/* ------------------------------------------------------------------ */
/* A câmara do Núcleo                                                  */
/* ------------------------------------------------------------------ */

/**
 * Estante da antiga biblioteca do Guardião Zero (o Censor já foi bibliotecário), meio soterrada
 * na parede; (x, y) é o canto de cima. As pedras cobrem o lado de fora (esquerda ou direita).
 */
function estante(t: Pincel, x: number, y: number, w: number, h: number, semente: number, pedrasDireita: boolean): void {
  const cores = ['#6a2a2a', '#2a4a6a', '#5a5a2a', '#4a2a5a', '#2a5a4a', '#7a5a2a', '#3a3a4a'];
  t.r(x, y, w, h, '#2a1810');
  t.r(x - 2, y - 4, w + 4, 4, '#5a3a22');
  t.r(x - 2, y - 4, w + 4, 1, '#8a5e34');
  t.r(x - 2, y, 3, h, '#4a2e1a');
  t.r(x + w - 1, y, 3, h, '#4a2e1a');
  for (let p = 0; p < 3; p++) {
    const yb = y + 4 + p * 20;
    let bx = x + 2;
    let i = 0;
    while (bx < x + w - 4) {
      const bw = entre(semente + p * 31 + i * 7, 3, 6);
      const bh = entre(semente + p * 17 + i * 5, 11, 15);
      if (bx + bw > x + w - 2) break;
      t.r(bx, yb + 15 - bh, bw, bh, de(cores, semente + i + p * 3));
      if (i % 3 === 0) t.r(bx, yb + 17 - bh, bw, 1, '#a8884a');
      bx += bw + (entre(semente + i * 13 + p, 0, 3) === 0 ? 2 : 0);
      i++;
    }
    t.r(x, yb + 15, w, 3, '#5a3a22');
    t.r(x, yb + 15, w, 1, '#7a5232');
  }
  // um livro ainda brilha azul: a memória boa do velho bibliotecário
  t.ra(x + Math.floor(w / 2), y + 25, 3, 14, '#4ac0ff', 'c6-pulsar');
  // poeira por cima de tudo
  t.r(x, y, w, h, '#8a8078', 0.12);
  // plaquinha de bronze
  t.r(x + Math.floor(w / 2) - 6, y - 3, 12, 2, '#c8a050');
  // pedras e entulho soterrando o lado de fora
  const bx0 = pedrasDireita ? x + w - 26 : x - 4;
  const sinal = pedrasDireita ? -1 : 1;
  t.r(bx0, y + h - 34, 30, 38, '#3a2a26');
  t.r(bx0, y + h - 34, 30, 2, '#5a4640');
  t.r(bx0 + sinal * 20, y + h - 20, 26, 24, '#34261f');
  t.r(bx0 + sinal * 20, y + h - 20, 26, 2, '#4e3c36');
  t.r(bx0 + sinal * 38, y + h - 8, 22, 12, '#2e211c');
  t.r(bx0 + sinal * 38, y + h - 8, 22, 1, '#4a3832');
  t.r(bx0 - 2, y - 8, 22, 14, '#3a2a26');
  t.r(bx0 - 2, y + 4, 22, 2, '#241814');
}

function nucleoCamara(): JSX.Element {
  const t = pincel();
  const cx = 160;
  const cy = 100;
  padrao(t, 'c6-muro', 20, 10, (s) => {
    s.r(0, 0, 20, 10, '#2a1414');
    s.r(0, 0, 20, 1, '#3a1c1a');
    s.r(0, 9, 20, 1, '#160a0a');
    s.r(9, 1, 1, 8, '#160a0a');
    s.r(3, 4, 2, 1, '#341a18');
    s.r(14, 6, 3, 1, '#200e0e');
  });
  padrao(t, 'c6-grade', 8, 8, (s) => {
    s.r(0, 0, 8, 8, '#241616');
    s.r(0, 0, 8, 1, '#3e2826');
    s.r(0, 0, 1, 8, '#3e2826');
    s.r(3, 3, 3, 3, '#3a0a08');
    s.r(4, 4, 1, 1, '#a8201a');
  });

  // parede redonda da câmara, mais escura nas bordas e no alto da abóbada
  t.r(0, 0, 320, 136, 'url(#c6-muro)');
  t.r(0, 0, 320, 16, '#0a0404', 0.45);
  t.r(0, 0, 26, 136, '#0a0404', 0.35);
  t.r(0, 0, 12, 136, '#0a0404', 0.35);
  t.r(294, 0, 26, 136, '#0a0404', 0.35);
  t.r(308, 0, 12, 136, '#0a0404', 0.35);
  // nervuras da abóbada
  linha(t, 82, 136, 120, 0, '#3e2420', 3);
  linha(t, 238, 136, 200, 0, '#3e2420', 3);

  // engrenagens da parede
  engrenagem(t, 30, 30, 12, '#5a4030', '#1e120c', 14, false);
  engrenagem(t, 290, 34, 13, '#5a4030', '#1e120c', 16, true);

  // estantes da velha biblioteca do Guardião Zero, meio soterradas
  estante(t, 8, 62, 56, 64, 3, false);
  estante(t, 256, 62, 56, 64, 11, true);

  // o poço escuro do meio e a luz vermelha pulsando
  disco(t, cx, cy, 58, '#120808', 4);
  halo(t, cx, cy, 64, '#ff2010', 0.06, 'c6-pulso');
  halo(t, cx, cy, 34, '#ff4020', 0.1, 'c6-pulso', atraso(-600));

  // anéis de engrenagem gigantes girando em volta do centro
  anel(t, cx, cy, 64, 24, '#6a4a3a', '#2a1a16', 40, false);
  anel(t, cx, cy, 50, 18, '#8a5a3a', '#1e1210', 28, true);

  // centenas de cabos vermelhos convergindo para o centro vazio
  const fios: Ponto[] = [];
  for (let i = 0; i < 20; i++) fios.push([6 + i * 16, -2]);
  for (let i = 0; i < 8; i++) fios.push([-2, 8 + i * 16]);
  for (let i = 0; i < 8; i++) fios.push([322, 8 + i * 16]);
  const ponta = (x0: number, y0: number): Ponto => {
    const ang = Math.atan2(y0 - cy, x0 - cx);
    return [Math.round(cx + Math.cos(ang) * 22), Math.round(cy + Math.sin(ang) * 22)];
  };
  fios.forEach(([x0, y0], i) => {
    const [x1, y1] = ponta(x0, y0);
    linha(t, x0, y0, x1, y1, de(['#4a0a0c', '#6a1012', '#3a0608', '#8a1a18'], i), i % 3 === 0 ? 2 : 1);
  });
  t.g('c6-cabo', undefined, (s) => {
    fios.forEach(([x0, y0], i) => {
      if (i % 2 !== 0) return;
      const [x1, y1] = ponta(x0, y0);
      linha(s, x0, y0, x1, y1, '#ff4a2a', 1);
    });
  });

  // o berço do centro: presilhas onde os cabos se plugam
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const x = Math.round(cx + Math.cos(a) * 22);
    const y = Math.round(cy + Math.sin(a) * 22);
    t.r(x - 2, y - 2, 5, 5, '#5a4a42');
    t.r(x - 2, y - 2, 5, 1, '#8a7a6a');
    t.r(x, y, 1, 1, '#ff3a2a');
  }
  halo(t, cx, cy, 14, '#ff6a3a', 0.12, 'c6-pulso', atraso(-1200));

  // faíscas saltando dos plugues
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.3;
    const x = Math.round(cx + Math.cos(a) * 24);
    const y = Math.round(cy + Math.sin(a) * 24);
    faisca(t, x, y, i % 2 === 0 ? '#ffd060' : '#ff8a3a', -i * 330, Math.cos(a) < 0);
  }
  brilho(t, cx - 30, cy - 40, '#ffb080', -500);
  brilho(t, cx + 34, cy - 30, '#ffb080', -1700);

  // piso: plataforma de grade sobre o vão, com anéis e cabos no chão
  t.r(0, 136, 320, 44, '#1a0e0c');
  t.r(0, 136, 320, 2, '#4a2a24');
  t.r(50, 138, 220, 30, 'url(#c6-grade)');
  elipse(t, cx, 152, 110, 15, '#5a3a30');
  elipse(t, cx, 152, 76, 10, '#7a4a36');
  elipse(t, cx, 152, 40, 5, '#a8402a');
  linha(t, 0, 170, 140, 148, '#5a0e10', 2);
  linha(t, 320, 172, 180, 148, '#5a0e10', 2);
  linha(t, 40, 180, 150, 152, '#6a1012', 1);
  linha(t, 280, 180, 170, 152, '#6a1012', 1);
  vapor(t, 24, 140, 4, ['#8a6a6a', '#6a5050'], 2, 3.4, 0);
  vapor(t, 296, 140, 4, ['#8a6a6a', '#6a5050'], 2, 3.4, -1700);
  t.r(0, 166, 320, 14, '#000000', 0.3);

  // a sala inteira pulsa em vermelho
  t.g('c6-pulso-sala', undefined, (s) => s.r(0, 0, 320, 180, '#ff1a0a', 0.07));
  return <>{t.itens}</>;
}

/* ------------------------------------------------------------------ */
/* O Coliseu livre                                                     */
/* ------------------------------------------------------------------ */

/** Herói dono do estandarte: Cassius (livro laranja), Octavius (âncora verde-água) ou Helios (sol dourado). */
type Emblema = 'livro' | 'ancora' | 'sol';

/** Estandarte comprido pendurado de um varão, balançando; (x, y) é o canto de cima do pano (16 × 34). */
function estandarte(t: Pincel, x: number, y: number, emblema: Emblema, atrasoMs: number): void {
  const fundo = emblema === 'livro' ? '#e0782a' : emblema === 'ancora' ? '#1a9a9a' : '#e8b020';
  const escuro = emblema === 'livro' ? '#a8501a' : emblema === 'ancora' ? '#0e6a6a' : '#b07a10';
  t.r(x - 2, y - 2, 20, 2, '#6a4a2a');
  t.r(x - 3, y - 3, 2, 3, '#f0d070');
  t.r(x + 17, y - 3, 2, 3, '#f0d070');
  t.g('c6-bandeira', atraso(atrasoMs), (s) => {
    s.r(x, y, 16, 30, fundo);
    s.r(x, y, 16, 2, escuro);
    s.r(x + 14, y, 2, 30, escuro);
    s.r(x, y + 30, 6, 4, fundo);
    s.r(x + 10, y + 30, 6, 4, fundo);
    s.r(x, y + 28, 16, 1, '#f0d070');
    if (emblema === 'livro') {
      s.r(x + 3, y + 9, 5, 8, '#fff4dc');
      s.r(x + 8, y + 9, 5, 8, '#f0e4c4');
      s.r(x + 7, y + 9, 2, 9, '#7a3a10');
      s.r(x + 4, y + 11, 3, 1, escuro);
      s.r(x + 4, y + 13, 3, 1, escuro);
      s.r(x + 9, y + 11, 3, 1, escuro);
      s.r(x + 9, y + 13, 3, 1, escuro);
    } else if (emblema === 'ancora') {
      const c = '#e8fff8';
      s.r(x + 6, y + 6, 4, 3, c);
      s.r(x + 7, y + 7, 2, 1, fundo);
      s.r(x + 7, y + 9, 2, 12, c);
      s.r(x + 4, y + 11, 8, 2, c);
      s.r(x + 3, y + 19, 10, 2, c);
      s.r(x + 3, y + 16, 2, 3, c);
      s.r(x + 11, y + 16, 2, 3, c);
      s.r(x + 2, y + 15, 2, 2, c);
      s.r(x + 12, y + 15, 2, 2, c);
    } else {
      const raioCor = '#fff8d0';
      s.r(x + 7, y + 6, 2, 16, raioCor);
      s.r(x + 1, y + 13, 14, 2, raioCor);
      for (const [dx, dy] of [[3, 8], [11, 8], [3, 18], [11, 18]] as Ponto[]) s.r(x + dx, y + dy, 2, 2, raioCor);
      disco(s, x + 8, y + 14, 4, '#ff8a1a', 2);
      disco(s, x + 8, y + 14, 2, '#fff2a0', 2);
    }
  });
}

function coliseuLivre(): JSX.Element {
  const t = pincel();
  padrao(t, 'c6-povo', 12, 10, (s) => {
    s.r(0, 0, 12, 10, '#6a4a3a');
    s.r(0, 4, 5, 6, '#d83a3a');
    s.r(6, 3, 5, 7, '#3a7ad8');
    s.r(1, 1, 3, 3, '#e0b080');
    s.r(7, 0, 3, 3, '#a8704a');
    s.r(1, 1, 3, 1, '#4a2a1a');
    s.r(7, 0, 3, 1, '#2a1a10');
  });
  padrao(t, 'c6-povo2', 12, 10, (s) => {
    s.r(0, 0, 12, 10, '#5a4a3a');
    s.r(0, 4, 5, 6, '#3aa84a');
    s.r(6, 3, 5, 7, '#e8b020');
    s.r(1, 1, 3, 3, '#8a5a3a');
    s.r(7, 0, 3, 3, '#f0c8a0');
    s.r(1, 1, 3, 1, '#1a1010');
    s.r(7, 0, 3, 1, '#c87a2a');
  });
  padrao(t, 'c6-areia', 16, 8, (s) => {
    s.r(0, 0, 16, 8, '#e0c08a');
    s.r(3, 2, 1, 1, '#f0d4a0');
    s.r(11, 5, 1, 1, '#f0d4a0');
    s.r(7, 6, 2, 1, '#c8a470');
    s.r(14, 1, 1, 1, '#c8a470');
  });

  // céu azul de dia de festa, sol, nuvens e pombas
  ceu(t, ['#5aa8e8', '#6ab4ec', '#7cc0f0', '#90ccf2', '#a8d8f4', '#c0e4f6'], 0, 54);
  halo(t, 30, 16, 22, '#fff4c0', 0.15, 'c6-pulsar');
  disco(t, 30, 16, 7, '#fff2b0', 2);
  disco(t, 30, 16, 5, '#fffae0', 2);
  t.g('c6-nuvem', undefined, (s) => {
    for (const [x, y] of [[84, 14], [206, 8], [282, 26]] as Ponto[]) {
      s.r(x, y + 3, 26, 5, '#ffffff');
      s.r(x + 5, y, 12, 4, '#ffffff');
      s.r(x + 2, y + 7, 22, 1, '#d8ecf8');
    }
  });
  pomba(t, -10, 30, 0, 14);
  pomba(t, -30, 20, -5000, 18);
  pomba(t, -20, 40, -9000, 16);

  // ático com arcos abertos para o céu e mastros do velário com flâmulas das três cores
  t.r(0, 50, 320, 14, '#c8a878');
  t.r(0, 50, 320, 1, '#f0d8a8');
  for (let x = 6, i = 0; x < 320; x += 32, i++) {
    t.r(x, 53, 8, 9, '#8ac4ee');
    t.r(x, 53, 8, 2, '#a8d4f2');
    t.r(x + 14, 36, 2, 16, '#6a4a2a');
    const cor = de(['#e07a2a', '#1a9a9a', '#e8b020'], i);
    t.g('c6-flamula', atraso(-i * 230), (s) => {
      s.r(x + 16, 36, 8, 3, cor);
      s.r(x + 16, 39, 4, 1, cor);
    });
  }

  // arquibancadas cheias de gente feliz
  [64, 76, 88].forEach((y, i) => {
    t.r(0, y, 320, 12, '#8a6a4a');
    t.g('c6-multidao', atraso(-i * 350), (s) => s.r(0, y, 320, 10, i % 2 === 0 ? 'url(#c6-povo)' : 'url(#c6-povo2)'));
    t.r(0, y + 10, 320, 2, '#b8946a');
    t.r(0, y + 10, 320, 1, '#e0c090');
  });
  // bandeirinhas agitadas pela plateia
  for (let i = 0; i < 12; i++) {
    const x = entre(i * 31 + 7, 6, 312);
    if (x > 128 && x < 192) continue;
    const y = 60 + (i % 3) * 12;
    t.r(x, y, 1, 6, '#4a3020');
    t.g('c6-aceno', atraso(-i * 170), (s) => s.r(x + 1, y, 4, 3, de(['#e07a2a', '#1a9a9a', '#e8b020', '#3a8aff'], i)));
  }

  // camarote do Censor, agora com o estandarte do olho azul (ele virou do bem)
  t.r(136, 56, 48, 44, '#d8c8a8');
  t.r(136, 56, 4, 44, '#f0e4c8');
  t.r(180, 56, 4, 44, '#b8a888');
  t.r(132, 54, 56, 6, '#2a5ab8');
  t.r(132, 54, 56, 1, '#f0d070');
  for (let i = 0; i < 7; i++) {
    t.r(134 + i * 8, 60, 6, 2, '#4a9a4a');
    t.r(136 + i * 8, 61, 2, 1, de(['#ff7ab0', '#ffd040', '#ffffff'], i));
  }
  t.r(142, 62, 36, 38, '#3a5a8a');
  halo(t, 160, 76, 16, '#6ac8ff', 0.12, 'c6-pulsar');
  t.g('c6-bandeira', undefined, (s) => {
    s.r(146, 62, 28, 30, '#2a6ad8');
    s.r(146, 62, 28, 2, '#f0d070');
    s.r(146, 62, 2, 30, '#1a4aa8');
    s.r(172, 62, 2, 30, '#1a4aa8');
    s.r(146, 92, 12, 4, '#2a6ad8');
    s.r(162, 92, 12, 4, '#2a6ad8');
  });
  olho(t, 160, 76, 1, '#3ab0ff', 'c6-olho', 0);
  brilho(t, 166, 71, '#ffffff', -800);

  // estandartes dos três heróis pendurados sobre a plateia
  estandarte(t, 20, 54, 'livro', 0);
  estandarte(t, 60, 54, 'ancora', -500);
  estandarte(t, 100, 54, 'sol', -1000);
  estandarte(t, 204, 54, 'sol', -300);
  estandarte(t, 244, 54, 'ancora', -800);
  estandarte(t, 284, 54, 'livro', -1300);

  // muro do pódio com guirlandas de flores
  t.r(0, 100, 320, 12, '#b89a74');
  t.r(0, 100, 320, 2, '#e0c8a0');
  for (let x = 26; x < 320; x += 52) {
    if (x > 130 && x < 190) continue;
    t.r(x, 104, 12, 8, '#5a4030');
  }
  for (let x = 0, i = 0; x < 320; x += 32, i++) {
    t.r(x + 4, 103, 24, 2, '#4a9a4a');
    t.r(x + 14, 105, 4, 1, '#4a9a4a');
    t.r(x + 15, 104, 2, 1, de(['#ff6a8a', '#ffd040', '#ffffff'], i));
  }

  // arena de areia clara, com pétalas e confete caído
  t.r(0, 112, 320, 68, 'url(#c6-areia)');
  t.r(0, 112, 320, 2, '#c89a60');
  t.r(0, 114, 320, 4, '#a87a4a', 0.25);
  const festa = ['#ff6a8a', '#ffd040', '#3ab0ff', '#e07a2a', '#1a9a9a', '#ffffff', '#8a5ae0'];
  for (let i = 0; i < 14; i++) {
    const x = entre(i * 13 + 3, 4, 316);
    const y = entre(i * 7 + 11, 120, 176);
    t.r(x, y, 2, 1, de(festa, i));
  }
  for (let i = 0; i < 5; i++) t.r(90 + i * 9, 166 - (i % 2) * 3, 3, 1, '#c8a470');
  t.r(0, 168, 320, 12, '#a87a4a', 0.15);

  // confete caindo do alto
  for (let i = 0; i < 28; i++) {
    const x = entre(i * 37 + 5, 2, 316);
    const y = entre(i * 41 + 9, 14, 50);
    t.ra(x, y, 2, i % 3 === 0 ? 1 : 2, de(festa, i + 2), 'c6-confete', {
      animationDelay: `${-entre(i * 53 + 1, 0, 6000)}ms`,
      animationDuration: `${entre(i * 59 + 2, 5, 9)}s`,
    });
  }
  return <>{t.itens}</>;
}
