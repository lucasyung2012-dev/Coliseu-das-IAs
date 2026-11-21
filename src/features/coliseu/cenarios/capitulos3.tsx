/**
 * Cenários do terceiro bloco de capítulos do modo História (Coliseu), em pixel art de 320 × 180:
 * o caminho do Octavius, a IA comandante naval condenada a remar na galera de guerra do Censor.
 * O porão dos remadores, o convés da galera na tempestade, a praia do naufrágio ao amanhecer
 * e o pátio do Ludus à noite.
 *
 * `desenhoCapitulo3(lugar)` devolve só o conteúdo do SVG (sem a tag <svg>) para viewBox "0 0 320 180";
 * quem chama põe o <svg> com shapeRendering="crispEdges". Lugares que não são destes capítulos devolvem null.
 *
 * Regras do desenho: coordenadas inteiras, quase tudo em <rect>, chão entre y 136 e 180 (os pés dos
 * personagens ficam por volta de y 155), a faixa central (y 70 a 150) mais calma para os personagens e
 * o topo (uns 18 px) livre de detalhe importante, porque o HUD pode cobrir.
 * As animações de ambiente usam as classes "c3-" de capitulos3.css.
 */
import './capitulos3.css';
import type { CSSProperties } from 'react';

export function desenhoCapitulo3(lugar: string): JSX.Element | null {
  switch (lugar) {
    case 'galera-porao':
      return galeraPorao();
    case 'galera-tempestade':
      return galeraTempestade();
    case 'praia-naufragio':
      return praiaNaufragio();
    case 'ludus-patio-noite':
      return ludusPatioNoite();
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
  /** Polígono (usar pouco). */
  p(pontos: string, fill: string, opacity?: number): void;
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
    p(pontos, fill, opacity) {
      itens.push(<polygon key={itens.length} points={pontos} fill={fill} opacity={opacity} />);
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

/** Linha (cordas, cabos, cabos de remo); largura em unidades do desenho. */
function linha(t: Pincel, x1: number, y1: number, x2: number, y2: number, cor: string, largura = 1): void {
  t.el((k) => <line key={k} x1={x1} y1={y1} x2={x2} y2={y2} stroke={cor} strokeWidth={largura} />);
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

/** Poeira (ou cisco na luz) flutuando numa região. */
function poeira(t: Pincel, n: number, x0: number, x1: number, y0: number, y1: number, cores: readonly string[], semente: number): void {
  for (let i = 0; i < n; i++) {
    const x = entre(semente + i * 13 + 1, x0, x1);
    const y = entre(semente + i * 7 + 3, y0, y1);
    t.ra(x, y, 1, 1, de(cores, i), 'c3-poeira', {
      animationDelay: `${-i * 370}ms`,
      animationDuration: `${6 + (i % 4)}s`,
    });
  }
}

/** Olho do Censor: (cx, cy) é o centro e e é a escala inteira (1 = 12 × 6). */
function olho(t: Pincel, cx: number, cy: number, e: number, atrasoMs: number): void {
  t.r(cx - 6 * e, cy - e, 12 * e, 2 * e, '#f0e6dc');
  t.r(cx - 4 * e, cy - 2 * e, 8 * e, 4 * e, '#f0e6dc');
  t.r(cx - 2 * e, cy - 3 * e, 4 * e, 6 * e, '#f0e6dc');
  t.ra(cx - 2 * e, cy - 2 * e, 4 * e, 4 * e, '#e0201a', 'c3-olho', atraso(atrasoMs));
  t.r(cx - e, cy - e, 2 * e, 2 * e, '#1a0606');
}

/** Estandarte vermelho do Censor, com o olho no meio e a ponta em V. */
function bandeiraOlho(t: Pincel, x: number, y: number, w: number, h: number, e: number, atrasoMs: number): void {
  const cx = x + Math.floor(w / 2);
  const cy = y + Math.floor(h / 2) - 2;
  const q = Math.floor(w / 4);
  t.g('c3-bandeira', atraso(atrasoMs), (s) => {
    s.r(x, y, w, h, '#a8161a');
    s.r(x, y, w, 2, '#d8a83a');
    s.r(x, y + 2, 2, h - 2, '#c8282a');
    s.r(x + w - 2, y + 2, 2, h - 2, '#7a0e12');
    s.r(x + 2, y + h - 4, w - 4, 1, '#d8a83a');
    s.r(x + 2, y + h, w - 4, 2, '#a8161a');
    s.r(x + q, y + h + 2, w - 2 * q, 2, '#a8161a');
    s.r(cx - 2, y + h + 4, 4, 2, '#a8161a');
    olho(s, cx, cy, e, atrasoMs);
  });
}

/** Engrenagem girando em volta do próprio centro (origem da rotação em unidades do desenho). */
function engrenagem(t: Pincel, cx: number, cy: number, r: number, cor: string, escuro: string, duracaoS: number, reversa: boolean): void {
  const d = Math.round(r * 0.7);
  t.g(
    'c3-gira',
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

/** Gaivota planando pelo céu. */
function gaivota(t: Pincel, x: number, y: number, atrasoMs: number, duracaoS: number): void {
  t.g('c3-gaivota', { animationDelay: `${atrasoMs}ms`, animationDuration: `${duracaoS}s` }, (s) => {
    s.r(x, y, 5, 2, '#f4f0ea');
    s.r(x + 5, y, 2, 1, '#e0a040');
    s.g('c3-asa', atraso(atrasoMs), (a) => {
      a.r(x - 4, y - 2, 5, 2, '#d8d4cc');
      a.r(x + 3, y - 2, 4, 2, '#d8d4cc');
      a.r(x - 5, y - 3, 2, 1, '#3a3a40');
    });
  });
}

/** Caixote de madeira; (x, y) é o canto de cima. */
function caixote(t: Pincel, x: number, y: number, w: number, h: number, marca: boolean): void {
  t.r(x, y, w, h, '#8a5a30');
  t.r(x, y, w, 1, '#b07a44');
  t.r(x, y, 2, h, '#a06a3a');
  t.r(x + w - 2, y, 2, h, '#5a3a1e');
  t.r(x, y + h - 2, w, 2, '#5a3a1e');
  t.r(x + 2, y + Math.floor(h / 2), w - 4, 1, '#6a4424');
  if (marca) {
    t.r(x + Math.floor(w / 2) - 3, y + 3, 6, 3, '#e8d8c0');
    t.r(x + Math.floor(w / 2) - 1, y + 4, 2, 1, '#a8161a');
  }
}

/** Barril de pé; (x, y) é o canto de cima. */
function barril(t: Pincel, x: number, y: number): void {
  t.r(x + 1, y, 10, 14, '#7a4a28');
  t.r(x, y + 2, 12, 10, '#7a4a28');
  t.r(x + 2, y + 1, 2, 12, '#9a6a3a');
  t.r(x, y + 3, 12, 1, '#3a3a44');
  t.r(x, y + 10, 12, 1, '#3a3a44');
}

/** Corrente deitada no chão, elo a elo, da esquerda para a direita a partir de (x, y). */
function corrente(t: Pincel, x: number, y: number, elos: number): void {
  for (let k = 0; k < elos; k++) {
    if (k % 2) {
      t.r(x + k * 4, y + 1, 5, 1, '#7a7a86');
    } else {
      t.r(x + k * 4, y, 5, 3, '#5a5a66');
      t.r(x + k * 4 + 1, y + 1, 3, 1, '#1a1410');
    }
  }
}

/* ------------------------------------------------------------------ */
/* Galera: o porão dos remadores                                       */
/* ------------------------------------------------------------------ */

/** Lanterna pendurada balançando; (x, y) é o gancho no teto e comp o tamanho da corrente. */
function lanterna(t: Pincel, x: number, y: number, comp: number, atrasoMs: number): void {
  halo(t, x, y + comp + 6, 30, '#ffb04a', 0.07, 'c3-pulsar', atraso(atrasoMs));
  t.g('c3-balancar', atraso(atrasoMs), (s) => {
    s.r(x, y, 1, comp, '#5a5a66');
    s.r(x - 4, y + comp, 9, 2, '#2a2a30');
    s.r(x - 3, y + comp + 2, 7, 9, '#2a2a30');
    s.r(x - 2, y + comp + 3, 5, 7, '#ffc860');
    s.r(x - 1, y + comp + 5, 3, 3, '#fff0b0');
    s.r(x - 4, y + comp + 11, 9, 2, '#2a2a30');
  });
}

/** Portinhola do remo no costado, com um pedaço do mar lá fora; cx é o meio e y o topo da abertura. */
function portinhola(t: Pincel, cx: number, y: number, atrasoMs: number): void {
  t.r(cx - 6, y - 2, 12, 12, '#5a3a24');
  t.r(cx - 4, y, 8, 3, '#7a9ab4');
  t.r(cx - 4, y + 3, 8, 1, '#c0d4dc');
  t.r(cx - 4, y + 4, 8, 4, '#1e4a6a');
  t.ra(cx - 3, y + 5, 3, 1, '#8ab8d0', 'c3-agua', atraso(atrasoMs));
}

/**
 * Remador acorrentado no banco (silhueta à meia-luz) com o remo saindo pela portinhola.
 * px é o meio da portinhola e hx onde ficam as mãos; o remo gira em volta da portinhola.
 */
function remador(t: Pincel, px: number, hx: number): void {
  const py = 88;
  // banco
  t.r(hx - 9, 128, 20, 3, '#5a3a22');
  t.r(hx - 9, 128, 20, 1, '#7a5432');
  t.r(hx - 7, 131, 2, 17, '#3a2416');
  t.r(hx + 7, 131, 2, 17, '#3a2416');
  // corpo curvado, indo e vindo no ritmo
  t.g('c3-remador', undefined, (s) => {
    s.r(hx - 3, 104, 7, 7, '#2a1a12');
    s.r(hx - 3, 104, 7, 2, '#120a06');
    s.r(hx - 4, 111, 9, 17, '#2a1a12');
    s.r(hx - 4, 111, 2, 17, '#4a3020');
  });
  // pernas, grilhão no tornozelo e a corrente até a barra do chão
  t.r(hx - 4, 128, 9, 4, '#22150e');
  t.r(hx - 3, 132, 7, 12, '#22150e');
  t.r(hx - 4, 142, 9, 2, '#8a8a96');
  t.r(hx, 144, 1, 6, '#5a5a66');
  // remo e mãos
  t.g('c3-remo', { transformOrigin: `${px}px ${py}px` }, (s) => {
    linha(s, px, py, hx, 119, '#5a3a22', 3);
    linha(s, px, py, hx, 119, '#9a6a40', 1);
    s.r(hx - 3, 117, 7, 4, '#6a4a36');
    s.r(hx - 3, 117, 7, 1, '#9a7458');
  });
}

/** Gota pingando do teto até a poça do chão (cai 128 px), com a ondinha quando bate. */
function goteira(t: Pincel, x: number, y: number, atrasoMs: number): void {
  t.r(x - 1, y, 3, 1, '#3a5a6a');
  t.r(x - 8, y + 128, 17, 3, '#1e3038');
  t.r(x - 5, y + 128, 6, 1, '#4a6a78');
  t.ra(x, y + 1, 1, 2, '#9ad0e8', 'c3-gota', atraso(atrasoMs));
  t.ra(x - 3, y + 129, 7, 1, '#9ad0e8', 'c3-ondinha', atraso(atrasoMs));
}

function galeraPorao(): JSX.Element {
  const t = pincel();
  // costado: tábuas do casco por dentro
  t.r(0, 0, 320, 180, '#120a07');
  t.r(0, 14, 320, 122, '#2e1d13');
  for (let y = 14; y < 136; y += 6) t.r(0, y, 320, 1, '#1c110b');
  for (let i = 0; i < 10; i++) {
    t.r(entre(i * 13 + 5, 0, 316), 15 + entre(i * 7 + 2, 0, 19) * 6, 1, 5, '#1c110b');
  }
  // casco molhado embaixo, com limo
  t.r(0, 116, 320, 20, '#1a2a2a', 0.35);
  for (let i = 0; i < 5; i++) t.r(entre(i * 17 + 3, 0, 316), entre(i * 5 + 1, 124, 134), 2, 1, i % 2 ? '#3a5a3a' : '#2e4a34');

  // teto: tábuas do convés de cima e as vigas
  t.r(0, 0, 320, 14, '#1a0f09');
  t.r(0, 12, 320, 2, '#3a2414');
  for (let x = 0; x < 320; x += 40) {
    t.r(x, 0, 5, 14, '#3a2414');
    t.r(x, 0, 1, 14, '#5a3a22');
  }
  // grade da escotilha no teto, com a luz de fora entrando
  t.r(52, 2, 34, 10, '#d8c8a0');
  for (let x = 54; x < 86; x += 5) t.r(x, 2, 2, 10, '#2a1a10');
  t.r(52, 6, 34, 1, '#2a1a10');
  t.g('c3-feixe', undefined, (s) => {
    s.r(54, 14, 30, 40, '#f0e0b0', 0.07);
    s.r(50, 54, 38, 40, '#f0e0b0', 0.06);
    s.r(46, 94, 46, 42, '#f0e0b0', 0.05);
    s.r(40, 136, 58, 12, '#f0e0b0', 0.08);
  });

  // cavernas (costelas de madeira do casco)
  for (const x of [0, 36, 72, 108, 206, 242, 278, 314]) {
    t.r(x, 14, 6, 122, '#4a2e1c');
    t.r(x, 14, 1, 122, '#6a4630');
    t.r(x + 5, 14, 1, 122, '#2a1a10');
    t.r(x - 2, 14, 10, 4, '#4a2e1c');
  }

  // plataforma do tambor, ao fundo
  t.r(116, 100, 88, 36, '#3a2416');
  t.r(114, 98, 92, 4, '#6a4630');
  t.r(114, 98, 92, 1, '#8a6040');
  for (let x = 124; x < 204; x += 16) t.r(x, 102, 1, 34, '#24170d');
  t.r(116, 116, 88, 1, '#24170d');
  t.r(142, 124, 36, 6, '#5a3a24');
  t.r(142, 124, 36, 1, '#7a5434');
  t.r(138, 130, 44, 6, '#5a3a24');
  t.r(138, 130, 44, 1, '#7a5434');
  // estandarte do Censor atrás do tambor
  t.r(144, 20, 32, 2, '#b8862a');
  bandeiraOlho(t, 148, 22, 24, 28, 1, -400);

  // tambor de guerra (treme a cada batida)
  t.g('c3-tambor', undefined, (s) => {
    s.r(138, 72, 44, 28, '#7a3a1e');
    s.r(136, 74, 48, 24, '#7a3a1e');
    s.r(138, 72, 6, 28, '#9a5030');
    s.r(176, 72, 6, 28, '#5a2a14');
    for (let k = 0; k < 8; k++) {
      s.r(139 + k * 6, k % 2 ? 78 : 91, 2, 3, '#c8a870');
    }
    s.r(136, 75, 48, 3, '#b8862a');
    s.r(136, 75, 48, 1, '#e8b848');
    s.r(136, 95, 48, 3, '#b8862a');
    s.r(136, 95, 48, 1, '#e8b848');
    s.r(138, 68, 44, 4, '#d8c8a0');
    s.r(142, 67, 36, 1, '#ece0c0');
    s.r(138, 71, 44, 1, '#a89870');
    olho(s, 160, 87, 1, 0);
    s.r(140, 100, 4, 3, '#3a2416');
    s.r(176, 100, 4, 3, '#3a2416');
  });
  // tamborileiro autômato: caixa de bronze, engrenagem e o braço com a maça
  t.r(188, 66, 14, 32, '#8a6a2a');
  t.r(188, 66, 14, 1, '#c8a048');
  t.r(188, 66, 2, 32, '#a8842a');
  for (const y of [70, 92]) {
    t.r(190, y, 1, 1, '#e8c860');
    t.r(199, y, 1, 1, '#e8c860');
  }
  engrenagem(t, 195, 82, 5, '#c89a3a', '#5a4018', 3.2, false);
  t.ra(197, 94, 2, 2, '#ff3a2a', 'c3-olho', atraso(-600));
  t.g('c3-malho', { transformOrigin: '194px 66px' }, (s) => {
    s.r(170, 65, 26, 3, '#a8842a');
    s.r(170, 65, 26, 1, '#e0b848');
    s.r(163, 59, 9, 9, '#5a3a24');
    s.r(163, 62, 9, 3, '#3a2a20');
    s.r(163, 59, 2, 9, '#7a5434');
    s.r(192, 64, 4, 4, '#e0b848');
  });
  // estalo da batida
  t.g('c3-batida', undefined, (s) => {
    s.r(129, 64, 5, 1, '#f8e0a8');
    s.r(127, 70, 6, 1, '#f8e0a8');
    s.r(131, 59, 1, 3, '#f8e0a8');
    s.r(154, 60, 1, 4, '#f8e0a8');
    s.r(150, 63, 2, 1, '#f8e0a8');
  });

  // barras de ferro onde as correntes dos remadores ficam presas
  t.r(0, 150, 116, 3, '#4a4a56');
  t.r(0, 150, 116, 1, '#7a7a86');
  t.r(204, 150, 116, 3, '#4a4a56');
  t.r(204, 150, 116, 1, '#7a7a86');

  // portinholas e remadores (todos no mesmo ritmo do tambor)
  for (const [px, lado] of [[20, 1], [56, 1], [92, 1], [228, -1], [264, -1], [300, -1]] as Ponto[]) {
    portinhola(t, px, 84, -px * 7);
    remador(t, px, px + lado * 10);
  }
  // água vazando em volta de uma portinhola
  t.r(233, 94, 1, 42, '#3a6070');
  t.ra(233, 94, 1, 3, '#9ad0e0', 'c3-escorre', undefined);
  t.ra(233, 94, 1, 3, '#9ad0e0', 'c3-escorre', atraso(-900));

  // lanternas balançando com o mar
  lanterna(t, 112, 14, 14, 0);
  lanterna(t, 214, 14, 16, -2200);

  // chão de tábuas, com água acumulada
  t.r(0, 136, 320, 44, '#3a2616');
  const fiadas = [136, 141, 147, 154, 162, 171];
  for (const y of fiadas) {
    t.r(0, y, 320, 1, '#22150c');
    t.r(0, y + 1, 320, 1, '#4a3220');
  }
  for (let i = 0; i < 10; i++) {
    t.r(entre(i * 11 + 3, 0, 316), (fiadas[i % 6] ?? 136) + 2, 1, 3 + (i % 6), '#22150c');
  }
  t.r(118, 148, 84, 7, '#1e3038', 0.7);
  t.r(104, 152, 110, 4, '#1e3038', 0.5);
  t.g('c3-agua', atraso(-500), (s) => {
    s.r(126, 149, 14, 1, '#6a9aaa');
    s.r(170, 151, 18, 1, '#6a9aaa');
    s.r(150, 153, 10, 1, '#4a7a8a');
    s.r(232, 140, 8, 1, '#6a9aaa');
  });
  // goteiras do teto
  goteira(t, 132, 14, 0);
  goteira(t, 239, 14, -1300);

  // correntes soltas, grilhão aberto, balde de esgotar e um rato
  corrente(t, 18, 168, 8);
  corrente(t, 230, 174, 6);
  t.r(66, 166, 6, 6, '#6a6a76');
  t.r(68, 168, 2, 2, '#3a2616');
  t.r(14, 156, 14, 12, '#6a4428');
  t.r(13, 155, 16, 2, '#4a4a56');
  t.r(15, 157, 3, 10, '#8a5a34');
  t.r(16, 158, 10, 2, '#3a6070');
  t.r(296, 144, 8, 4, '#3a3036');
  t.r(303, 143, 4, 3, '#3a3036');
  t.r(289, 146, 7, 1, '#5a4a50');
  t.ra(305, 144, 1, 1, '#ff5040', 'c3-piscar', atraso(-1700));

  // poeira na luz da escotilha e cantos escuros
  poeira(t, 8, 46, 92, 30, 130, ['#f8e8c0', '#e0c890'], 5);
  t.r(0, 0, 20, 180, '#000000', 0.3);
  t.r(300, 0, 20, 180, '#000000', 0.3);
  t.r(0, 172, 320, 8, '#000000', 0.25);
  return <>{t.itens}</>;
}

/* ------------------------------------------------------------------ */
/* Galera: o convés na tempestade (noite)                              */
/* ------------------------------------------------------------------ */

/** Vagalhão enorme atrás da amurada: cx é o meio, topo é a crista, base é onde some atrás do navio. */
function vagalhao(t: Pincel, cx: number, topo: number, base: number, larg: number, atrasoMs: number): void {
  t.g('c3-vaga', atraso(atrasoMs), (s) => {
    const linhas = Math.ceil((base - topo) / 8);
    for (let i = 0; i < linhas; i++) {
      const y = topo + i * 8;
      const hw = 6 + Math.round(((larg - 6) * i) / Math.max(1, linhas - 1));
      s.r(cx - hw, y, hw * 2, 8, i % 2 ? '#0e2a34' : '#10303a');
      // face da onda, mais clara do lado aceso pelos relâmpagos
      s.r(cx + Math.round(hw / 3), y, Math.max(2, Math.round(hw / 2)), 8, '#16404c');
      if (i > 1 && i % 3 === 0) s.r(cx - Math.round(hw / 2), y + 3, Math.max(2, Math.round(hw / 2)), 1, '#5a8a96');
    }
    // crista de espuma enrolando para a esquerda
    s.r(cx - 6, topo - 3, 14, 3, '#c8e0e4');
    s.r(cx - 12, topo - 1, 8, 3, '#e8f4f4');
    s.r(cx - 14, topo + 2, 3, 3, '#c8e0e4');
    s.r(cx - 15, topo + 5, 2, 2, '#9ac0c8');
    s.r(cx + 2, topo + 3, 6, 2, '#9ac0c8');
  });
}

/** Raio que só aparece no clarão; lista de segmentos (x, y, altura). */
function raio(t: Pincel, segmentos: readonly (readonly [number, number, number])[], atrasoMs: number): void {
  t.g('c3-raio', atraso(atrasoMs), (s) => {
    for (const [x, y, h] of segmentos) s.r(x, y, 2, h, '#eef2ff');
  });
}

function galeraTempestade(): JSX.Element {
  const t = pincel();
  ceu(t, ['#04070b', '#060b11', '#091018', '#0c151e', '#0f1b25', '#12212c'], 0, 96);
  // nuvens pesadas, com a borda acesa de roxo pelos relâmpagos
  t.g('c3-nuvem', undefined, (s) => {
    for (const [x, y, w] of [[-10, 22, 96], [96, 8, 84], [196, 20, 110], [250, 50, 80]] as const) {
      s.r(x, y, w, 9, '#18232e');
      s.r(x + 8, y - 5, w - 18, 5, '#1c2834');
      s.r(x + 12, y - 6, w - 30, 1, '#3a3a5a');
      s.r(x + 4, y + 9, w - 10, 3, '#111a22');
    }
  });
  // raios (cada um no seu tempo, junto com o clarão)
  raio(t, [[94, 12, 8], [90, 20, 7], [92, 27, 6], [86, 33, 9], [82, 42, 7], [84, 49, 8], [95, 33, 5], [97, 38, 4]], 0);
  raio(t, [[262, 10, 7], [266, 17, 8], [262, 25, 6], [268, 31, 9], [264, 40, 8], [258, 34, 5]], -3500);

  // mar fundo e os vagalhões enormes
  t.r(0, 84, 320, 30, '#0a222c');
  vagalhao(t, 54, 30, 114, 74, 0);
  vagalhao(t, 284, 42, 114, 60, -1800);
  vagalhao(t, 168, 74, 114, 52, -900);
  t.g('c3-onda', undefined, (s) => {
    for (let x = -20; x < 340; x += 40) {
      s.r(x, 104, 14, 3, '#1a4652');
      s.r(x + 3, 103, 6, 1, '#7aa8b4');
    }
  });

  // mastro único, verga de bronze e a vela vermelha rasgada
  t.r(204, 0, 6, 132, '#4a3020');
  t.r(204, 0, 2, 132, '#6a4830');
  for (const y of [30, 76, 104]) t.r(203, y, 8, 2, '#a8742a');
  t.r(146, 18, 124, 3, '#5a3a22');
  t.r(144, 17, 4, 5, '#c8943a');
  t.r(268, 17, 4, 5, '#c8943a');
  t.g('c3-vela', undefined, (s) => {
    s.r(150, 21, 114, 44, '#8a1418');
    s.r(150, 21, 114, 2, '#a8282a');
    for (let k = 1; k < 6; k++) s.r(150 + k * 20, 23, 1, 42, '#6a0e12');
    s.r(258, 23, 6, 42, '#5a0a0e');
    // barra rasgada embaixo
    for (let k = 0; k < 8; k++) s.r(150 + k * 14, 65, 14, entre(k * 3 + 1, 0, 6), '#8a1418');
    // rasgos mostrando o céu
    s.r(166, 30, 10, 6, '#0a1219');
    s.r(170, 36, 5, 5, '#0a1219');
    s.r(164, 29, 3, 2, '#0a1219');
    s.r(236, 50, 12, 5, '#0a1219');
    s.r(240, 55, 5, 4, '#0a1219');
    s.r(165, 36, 1, 3, '#c8282a');
    s.r(235, 55, 1, 2, '#c8282a');
    olho(s, 207, 42, 2, 0);
  });
  // tiras soltas da vela batendo no vento
  for (const [x, ms] of [[186, 0], [222, -250]] as Ponto[]) {
    t.g('c3-farrapo', atraso(ms), (s) => {
      s.r(x, 66, 4, 8, '#8a1418');
      s.r(x + 1, 74, 3, 5, '#7a1014');
      s.r(x + 2, 79, 2, 3, '#6a0e12');
    });
  }
  // cordame: estais e um cabo solto chicoteando
  linha(t, 207, 2, 20, 36, '#5a4a3a');
  linha(t, 207, 2, 304, 28, '#5a4a3a');
  linha(t, 205, 22, 140, 112, '#4a3a2e');
  linha(t, 209, 22, 276, 112, '#4a3a2e');
  t.g('c3-chicote', { transformOrigin: '146px 21px' }, (s) => {
    for (const [x, y, h] of [[146, 21, 8], [145, 29, 8], [143, 37, 6], [140, 43, 5], [136, 48, 4], [131, 52, 3]] as const) {
      s.r(x, y, 1, h, '#a08060');
    }
    s.r(129, 54, 3, 2, '#a08060');
  });
  t.g('c3-chicote', { transformOrigin: '270px 21px', animationDelay: '-400ms' }, (s) => {
    for (const [x, y, h] of [[270, 21, 7], [271, 28, 7], [273, 35, 6], [276, 41, 5], [280, 46, 3]] as const) {
      s.r(x, y, 1, h, '#a08060');
    }
  });

  // remos para fora do casco, subindo e descendo
  for (let k = 0; k < 8; k++) {
    const x = 44 + k * 32;
    t.g('c3-remo-fora', { transformOrigin: `${x}px 116px`, animationDelay: `${-k * 60}ms` }, (s) => {
      linha(s, x, 116, x + 20, 100, '#5a3a22', 2);
      s.r(x + 18, 97, 9, 4, '#7a5030');
      s.r(x + 18, 97, 9, 1, '#a07040');
    });
  }

  // amurada de madeira com os escudos de bronze pendurados
  t.r(0, 113, 320, 19, '#3e2818');
  t.r(0, 118, 320, 1, '#2a1a10');
  t.r(0, 125, 320, 1, '#2a1a10');
  t.r(0, 110, 320, 4, '#7a5230');
  t.r(0, 110, 320, 1, '#a87444');
  t.r(0, 130, 320, 2, '#22140c');
  for (let k = 0; k < 7; k++) {
    const x = 56 + k * 34;
    disco(t, x, 121, 6, '#8a5a1e', 3);
    t.r(x - 3, 118, 6, 6, '#b8862a');
    t.r(x - 1, 120, 2, 2, '#f0c860');
    t.r(x - 5, 119, 1, 3, '#d8a848');
  }

  // proa subindo à esquerda (com o olho pintado) e a popa enrolada à direita
  t.p('0,132 0,64 6,52 12,42 18,34 24,34 22,40 18,54 18,70 24,94 40,110 40,132', '#4a2e1c');
  t.p('0,132 0,66 6,54 10,48 12,52 8,66 8,96 16,112 16,132', '#5e3a24');
  t.r(16, 28, 10, 6, '#b8862a');
  t.r(22, 24, 6, 4, '#b8862a');
  t.r(26, 26, 3, 3, '#e0b848');
  t.r(16, 28, 10, 1, '#e8c860');
  olho(t, 14, 94, 1, -700);
  t.p('320,132 320,40 314,28 304,24 296,28 298,34 306,36 310,46 308,80 292,104 280,112 280,132', '#4a2e1c');
  t.p('320,132 320,44 316,36 314,48 314,84 300,108 296,132', '#5e3a24');
  t.r(296, 24, 8, 3, '#b8862a');
  t.r(294, 27, 4, 4, '#e0b848');
  // lanterna da popa
  halo(t, 300, 74, 22, '#ffa040', 0.08, 'c3-pulsar');
  t.r(306, 64, 8, 2, '#a8742a');
  t.r(296, 66, 8, 2, '#2a2a30');
  t.r(297, 68, 6, 10, '#2a2a30');
  t.r(298, 70, 4, 6, '#ffc860');
  t.g('c3-chama', undefined, (s) => {
    s.r(298, 71, 4, 4, '#ff8a2a');
    s.r(299, 70, 2, 3, '#fff0b0');
  });

  // espuma estourando por cima da amurada
  for (const [x, ms] of [[72, 0], [150, -1500], [240, -2800]] as Ponto[]) {
    t.g('c3-espuma', atraso(ms), (s) => {
      s.r(x - 8, 104, 16, 6, '#8ab8c4');
      s.r(x - 5, 98, 10, 6, '#b8d8e0');
      s.r(x - 2, 94, 4, 4, '#e8f4f8');
      s.r(x + 8, 100, 3, 3, '#b8d8e0');
      s.r(x - 12, 101, 3, 3, '#b8d8e0');
    });
  }

  // convés de tábuas molhadas
  t.r(0, 132, 320, 48, '#4a3020');
  for (const [y, h] of [[132, 6], [138, 7], [145, 9], [154, 11], [165, 15]] as Ponto[]) {
    t.r(0, y, 320, 1, '#2a1a0e');
    t.r(0, y + 1, 320, 1, '#5a3a26');
    for (let x = (y * 7) % 50; x < 320; x += 70 + (y % 3) * 10) t.r(x, y + 1, 1, h - 1, '#2a1a0e');
  }
  t.g('c3-agua', undefined, (s) => {
    for (let i = 0; i < 10; i++) s.r(entre(i * 7 + 3, 0, 300), entre(i * 5 + 1, 136, 176), entre(i + 4, 6, 18), 1, '#6a7a8a');
  });
  // grade do porão com a luz dos remadores lá embaixo
  halo(t, 160, 158, 30, '#ff9a4a', 0.05, 'c3-pulsar');
  t.r(128, 150, 64, 18, '#2a1a10');
  t.ra(130, 152, 60, 14, '#c86a2a', 'c3-pulsar');
  for (let x = 132; x < 190; x += 6) t.r(x, 152, 2, 14, '#2a1a10');
  t.r(130, 158, 60, 2, '#2a1a10');
  t.r(128, 150, 64, 1, '#c8943a');
  t.r(128, 167, 64, 1, '#8a5a1e');
  // rolo de corda, balde virado, escudo caído e cunho de bronze
  for (const [w, dy] of [[22, 0], [18, 2], [12, 4]] as Ponto[]) {
    t.r(62 - w / 2, 160 + dy, w, 2, '#a8865a');
    t.r(62 - w / 2, 162 + dy, w, 1, '#6a5030');
  }
  t.r(254, 162, 12, 9, '#6a4428');
  t.r(252, 170, 16, 2, '#4a4a56');
  t.r(256, 163, 3, 7, '#8a5a34');
  disco(t, 292, 160, 7, '#8a5a1e', 2);
  t.r(289, 157, 6, 6, '#b8862a');
  t.r(291, 159, 2, 2, '#f0c860');
  t.r(98, 136, 12, 3, '#a8742a');
  t.r(102, 133, 4, 3, '#a8742a');

  // chuva em diagonal (o desenho se repete a cada 60 px na descida)
  t.g('c3-chuva', undefined, (s) => {
    for (let k = -1; k < 3; k++) {
      for (let i = 0; i < 9; i++) {
        s.r(entre(i * 3 + 11, 0, 350) - k * 10, entre(i * 5 + 17, 0, 59) + k * 60, 1, 5, '#8aa8c0');
      }
    }
  });
  // clarão do relâmpago na cena toda
  t.ra(0, 0, 320, 180, '#d8e8ff', 'c3-relampago');
  t.ra(0, 0, 320, 180, '#d8e8ff', 'c3-relampago', atraso(-3500));
  return <>{t.itens}</>;
}

/* ------------------------------------------------------------------ */
/* Praia do naufrágio ao amanhecer, com Roma Eterna no horizonte       */
/* ------------------------------------------------------------------ */

/** Remo quebrado deitado na areia, descendo da esquerda para a direita; (x, y) é a ponta da pá. */
function remoQuebrado(t: Pincel, x: number, y: number, gomos: number): void {
  t.r(x, y - 2, 7, 5, '#9a6a3a');
  t.r(x, y - 2, 7, 1, '#c08a50');
  for (let k = 0; k < gomos; k++) {
    t.r(x + 7 + k * 8, y + Math.floor(k / 2), 9, 2, '#8a5a32');
    t.r(x + 7 + k * 8, y + Math.floor(k / 2), 9, 1, '#b07a44');
  }
  const fim = x + 7 + gomos * 8;
  const yf = y + Math.floor((gomos - 1) / 2);
  t.r(fim, yf - 1, 2, 2, '#c8a070');
  t.r(fim + 2, yf, 1, 1, '#c8a070');
  t.r(x - 2, y + 3, fim - x + 2, 1, '#000000', 0.12);
}

function praiaNaufragio(): JSX.Element {
  const t = pincel();
  ceu(t, ['#4a3a6e', '#6a4a7a', '#8e5a7e', '#b8687a', '#de8270', '#f2a070', '#f8c088', '#fcd8a0'], 0, 96);
  // últimas estrelas sumindo
  t.ra(30, 20, 1, 1, '#fff6e0', 'c3-estrela');
  t.ra(300, 22, 1, 1, '#fff6e0', 'c3-estrela', atraso(-1200));
  t.ra(150, 26, 1, 1, '#fff6e0', 'c3-estrela', atraso(-600));
  // nuvens rosadas
  t.g('c3-nuvem', atraso(-9000), (s) => {
    s.r(176, 42, 80, 2, '#f8b890');
    s.r(190, 40, 44, 2, '#fcd0a0');
    s.r(268, 56, 50, 2, '#f8c090');
    s.r(10, 34, 64, 2, '#c87888');
    s.r(22, 32, 30, 2, '#d88a90');
    s.r(120, 60, 40, 2, '#fcc898');
  });
  // sol nascendo
  halo(t, 236, 92, 44, '#fff0b0', 0.1, 'c3-pulsar');
  disco(t, 236, 94, 18, '#ffe8a0', 3);
  disco(t, 236, 94, 13, '#fff4c8', 3);
  // Roma Eterna ao longe: engrenagens gigantes atrás, o Coliseu e as torres
  engrenagem(t, 40, 70, 16, '#7a4e6e', '#6a4262', 60, false);
  engrenagem(t, 140, 62, 20, '#7a4e6e', '#6a4262', 80, true);
  t.r(0, 84, 200, 10, '#6a4466');
  t.r(0, 82, 200, 2, '#7a5070');
  for (let x = 2; x < 200; x += 12) t.r(x, 80, 4, 2, '#6a4466');
  t.r(18, 56, 8, 28, '#5e3e60');
  t.r(16, 54, 12, 3, '#5e3e60');
  t.r(26, 56, 1, 28, '#8a5a72');
  t.r(150, 48, 6, 36, '#5e3e60');
  t.r(148, 46, 10, 3, '#5e3e60');
  t.r(156, 48, 1, 36, '#8a5a72');
  t.ra(20, 51, 4, 3, '#ff3a2a', 'c3-olho');
  t.ra(151, 43, 4, 3, '#ff3a2a', 'c3-olho', atraso(-1100));
  // o Coliseu (com a borda de cima quebrada de um lado)
  t.r(60, 70, 68, 14, '#6a4466');
  t.r(62, 67, 64, 3, '#6a4466');
  t.r(66, 64, 46, 3, '#6a4466');
  t.r(112, 65, 6, 2, '#6a4466');
  t.r(60, 70, 68, 1, '#8a5a72');
  for (let k = 0; k < 8; k++) {
    t.r(66 + k * 7, 72, 3, 4, '#4a2e50');
    t.r(66 + k * 7, 78, 3, 4, '#4a2e50');
  }
  t.r(66, 65, 46, 1, '#a8707e');
  // aqueduto e cúpulas
  t.r(160, 76, 40, 3, '#6a4466');
  for (let x = 162; x < 200; x += 8) t.r(x, 79, 3, 5, '#6a4466');
  arco(t, 46, 74, 6, 4, '#6a4466', 2);
  arco(t, 140, 72, 7, 5, '#6a4466', 2);
  // névoa da manhã sobre a cidade
  t.r(0, 78, 210, 16, '#f8c088', 0.25);

  // mar
  t.r(0, 94, 320, 36, '#6a6a96');
  t.r(0, 94, 320, 2, '#c8a0a0');
  t.r(0, 100, 320, 8, '#5a6490');
  t.r(0, 108, 320, 10, '#4e6088');
  t.r(0, 118, 320, 12, '#46607e');
  // caminho de brilho do sol na água
  t.g('c3-agua', undefined, (s) => {
    const largs = [30, 24, 26, 18, 20, 12, 14, 8, 8];
    largs.forEach((w, k) => s.r(236 - w / 2, 96 + k * 4, w, 1, k % 2 ? '#f8c890' : '#fff0c0'));
  });
  t.g('c3-agua', atraso(-1100), (s) => {
    for (let i = 0; i < 8; i++) s.r(entre(i * 5 + 2, 0, 310), entre(i * 3 + 7, 98, 126), entre(i + 9, 4, 10), 1, i % 2 ? '#9a8aaa' : '#7a8aaa');
  });
  // destroços boiando: barril e tábua
  t.g('c3-boiar', undefined, (s) => {
    s.r(112, 112, 14, 6, '#7a4a28');
    s.r(115, 112, 1, 6, '#3a3a44');
    s.r(122, 112, 1, 6, '#3a3a44');
    s.r(112, 112, 14, 1, '#a06a3a');
    s.r(110, 118, 18, 1, '#8aa0b8');
  });
  t.g('c3-boiar', atraso(-1200), (s) => {
    s.r(172, 116, 22, 2, '#8a5a32');
    s.r(172, 116, 22, 1, '#b07a44');
    s.r(170, 118, 26, 1, '#8aa0b8');
  });
  // rochas dentro d'água, à direita
  t.r(298, 108, 22, 22, '#4a3e4c');
  t.r(304, 102, 16, 6, '#4a3e4c');
  t.r(298, 108, 4, 10, '#a87a72');
  t.r(304, 102, 6, 2, '#a87a72');

  // beira: ondas chegando e voltando
  t.r(0, 128, 320, 8, '#b8906e');
  t.g('c3-mare', undefined, (s) => {
    s.r(0, 127, 320, 2, '#7a9ab0');
    for (let x = -10; x < 330; x += 32) {
      s.r(x, 128, 18, 2, '#f0f0ec');
      s.r(x + 4, 127, 8, 1, '#ffffff');
    }
  });
  t.g('c3-mare-volta', undefined, (s) => {
    for (let x = 2; x < 330; x += 30) s.r(x, 132, 14, 1, '#e8e0d8');
  });

  // areia
  t.r(0, 136, 320, 44, '#e2bc8e');
  t.r(0, 136, 320, 3, '#c89c76');
  t.r(0, 139, 320, 3, '#d4ac82');
  t.r(0, 166, 320, 14, '#eccaa0');
  for (let i = 0; i < 4; i++) t.r(entre(i * 9 + 3, 0, 280), entre(i * 4 + 70, 146, 176), entre(i + 90, 20, 40), 1, '#d6b086');
  for (let i = 0; i < 10; i++) {
    t.r(entre(i * 17 + 2, 0, 318), entre(i * 11 + 6, 142, 178), 1, 1, de(['#c89c76', '#f6dcb4', '#e8a8a0'], i));
  }
  // pegadas saindo do mar
  for (let k = 0; k < 6; k++) t.r(150 - k * 9, 140 + k * 3 + (k % 2) * 2, 3, 2, '#c4996e');
  // estrela-do-mar
  t.r(172, 172, 5, 1, '#e88a5a');
  t.r(174, 170, 1, 5, '#e88a5a');

  // rochas grandes na frente, à esquerda, com algas
  t.r(0, 112, 26, 62, '#4a3e4c');
  t.r(0, 104, 16, 8, '#4a3e4c');
  t.r(26, 128, 22, 40, '#564858');
  t.r(12, 104, 4, 30, '#8a6a6a');
  t.r(22, 112, 4, 18, '#a87a72');
  t.r(44, 128, 4, 18, '#a87a72');
  t.r(26, 128, 18, 1, '#8a6a6a');
  for (const [x, y] of [[4, 120], [8, 138], [32, 140], [18, 150], [38, 156]] as Ponto[]) t.r(x, y, 2, 1, '#d8ccc0');
  t.r(0, 166, 50, 4, '#3a5a34');
  t.r(6, 164, 10, 2, '#4a7a3e');
  t.r(30, 164, 8, 2, '#4a7a3e');
  // barril caído encostado nas rochas
  t.r(50, 150, 18, 11, '#7a4a28');
  t.r(50, 150, 18, 2, '#9a6a3a');
  t.r(53, 150, 1, 11, '#3a3a44');
  t.r(64, 150, 1, 11, '#3a3a44');
  t.r(68, 152, 2, 7, '#5a3a20');
  t.r(48, 161, 22, 1, '#000000', 0.15);

  // pedaço da vela do Censor rasgado na areia
  t.r(70, 162, 40, 10, '#8a1418');
  t.r(74, 160, 30, 2, '#8a1418');
  t.r(70, 162, 40, 1, '#a8282a');
  t.r(104, 168, 8, 6, '#7a1014');
  t.r(80, 164, 10, 4, '#e8dccc');
  t.r(82, 164, 4, 4, '#c0201a');
  t.r(83, 165, 2, 2, '#1a0606');
  remoQuebrado(t, 118, 170, 5);
  remoQuebrado(t, 190, 160, 3);

  // casco partido da galera encalhado à direita
  t.r(244, 128, 76, 22, '#4a2e1c');
  t.r(250, 124, 70, 4, '#4a2e1c');
  for (let y = 130; y < 150; y += 4) {
    t.r(244, y, 76, 1, '#2e1c10');
    t.r(244, y + 1, 76, 1, '#6a4428');
  }
  for (const [x, h] of [[252, 14], [262, 22], [272, 18], [284, 26], [296, 16], [308, 24]] as Ponto[]) {
    t.r(x, 124 - h, 4, h, '#5a3a24');
    t.r(x, 124 - h, 1, h, '#7a5434');
    t.r(x + 3, 124 - h - 2, 1, 2, '#5a3a24');
  }
  t.r(244, 128, 2, 22, '#2a180c');
  t.r(240, 140, 6, 2, '#5a3a24');
  t.r(238, 144, 8, 1, '#5a3a24');
  // aríete de bronze caído, com zinabre
  t.r(286, 150, 24, 7, '#a8742a');
  t.r(282, 152, 4, 3, '#a8742a');
  t.r(286, 150, 24, 1, '#e0b048');
  t.r(296, 153, 6, 2, '#5a9a7a');
  t.r(284, 157, 28, 1, '#000000', 0.15);
  // sombra do casco na areia
  t.r(240, 150, 80, 3, '#000000', 0.15);
  // caixote e barril de pé, com uma gaivota pousada
  caixote(t, 222, 142, 18, 14, true);
  barril(t, 206, 142);
  t.r(204, 156, 38, 1, '#000000', 0.15);
  t.r(227, 136, 6, 4, '#f4f0ea');
  t.r(232, 134, 3, 3, '#f4f0ea');
  t.r(235, 135, 2, 1, '#e0a040');
  t.r(225, 137, 3, 2, '#8a8a96');
  t.r(229, 140, 1, 2, '#e0a040');
  // pedaço de remo cravado na areia
  t.r(176, 136, 3, 18, '#8a5a32');
  t.r(176, 136, 1, 18, '#b07a44');
  t.r(176, 134, 1, 2, '#8a5a32');
  t.r(178, 133, 1, 3, '#8a5a32');

  // caranguejo andando de lado
  t.g('c3-caranguejo', undefined, (s) => {
    s.r(140, 172, 6, 3, '#d8503a');
    s.r(141, 171, 4, 1, '#e8704a');
    s.r(141, 170, 1, 1, '#1a1a1a');
    s.r(144, 170, 1, 1, '#1a1a1a');
    s.r(138, 171, 2, 2, '#c84030');
    s.r(146, 171, 2, 2, '#c84030');
    s.r(139, 175, 1, 1, '#c84030');
    s.r(146, 175, 1, 1, '#c84030');
  });
  // gaivotas no céu
  gaivota(t, -20, 30, 0, 20);
  gaivota(t, -30, 46, -7000, 24);
  gaivota(t, -10, 24, -13000, 22);
  return <>{t.itens}</>;
}

/* ------------------------------------------------------------------ */
/* Ludus: o pátio de treino à noite                                    */
/* ------------------------------------------------------------------ */

/** Tocha de parede; (x, y) é o canto de cima da chama. */
function tocha(t: Pincel, x: number, y: number, atrasoMs = 0): void {
  halo(t, x + 2, y + 5, 30, '#ff9a3c', 0.08, 'c3-pulsar', atraso(atrasoMs));
  t.r(x - 2, y + 7, 8, 2, '#5a4030');
  t.r(x - 1, y + 9, 6, 2, '#3a2a20');
  t.r(x + 1, y + 11, 2, 8, '#4a3020');
  t.r(x + 1, y + 11, 1, 8, '#6a4a30');
  t.r(x - 1, y + 17, 6, 3, '#2a2228');
  t.g('c3-chama', atraso(atrasoMs), (s) => {
    s.r(x - 1, y + 3, 6, 5, '#e0401a');
    s.r(x, y + 1, 4, 6, '#ff8a2a');
    s.r(x + 1, y - 2, 2, 5, '#ffc04a');
    s.r(x + 1, y + 3, 2, 3, '#fff0b0');
  });
  t.ra(x + 1, y - 2, 1, 1, '#ffc04a', 'c3-brasa', atraso(atrasoMs - 600));
}

/** Porta de cela com grade; x é a esquerda (22 de largura) e y o topo do arco. Termina em y + 32. */
function portaCela(t: Pincel, x: number, y: number): void {
  arco(t, x + 11, y, 11, 21, '#1e140e', 3);
  for (let k = 0; k < 5; k++) t.r(x + 2 + k * 4, y + 4, 2, 28, '#4a4a54');
  t.r(x, y + 12, 22, 2, '#5a5a66');
  t.r(x, y + 22, 22, 2, '#5a5a66');
  t.r(x + 15, y + 15, 4, 5, '#2a2a30');
}

/** Suporte de armas de treino encostado no muro; x é a esquerda (36 de largura), pé em y 136. */
function suporteArmas(t: Pincel, x: number): void {
  t.r(x, 110, 3, 26, '#6a4224');
  t.r(x + 33, 110, 3, 26, '#6a4224');
  t.r(x, 112, 36, 3, '#8a5a30');
  t.r(x, 112, 36, 1, '#b07a44');
  t.r(x, 128, 36, 3, '#8a5a30');
  for (const dx of [6, 13]) {
    t.r(x + dx, 104, 2, 26, '#b08250');
    t.r(x + dx, 104, 1, 26, '#d0a26a');
    t.r(x + dx - 1, 118, 4, 1, '#5a3a1a');
  }
  t.r(x + 22, 94, 1, 40, '#7a5432');
  t.r(x + 21, 90, 3, 5, '#c8ccd8');
  t.r(x + 22, 89, 1, 1, '#e8ecf4');
  t.r(x + 25, 118, 10, 18, '#9a6a3a');
  t.r(x + 25, 118, 10, 1, '#c08a50');
  t.r(x + 28, 125, 4, 4, '#c8a050');
}

/** Boneco de treino de palha num poste; x é o centro, pé em y 156. */
function boneco(t: Pincel, x: number, escudo: string): void {
  t.r(x - 11, 154, 22, 3, '#b89a68');
  t.r(x - 2, 108, 4, 48, '#7a5030');
  t.r(x - 2, 108, 1, 48, '#a07040');
  t.r(x - 6, 152, 12, 4, '#5a3a20');
  t.r(x - 14, 120, 28, 3, '#7a5030');
  t.r(x - 14, 120, 28, 1, '#a07040');
  t.r(x - 7, 116, 14, 22, '#d8b860');
  t.r(x - 7, 116, 3, 22, '#b8963e');
  t.r(x - 7, 124, 14, 1, '#8a6a2a');
  t.r(x - 7, 132, 14, 1, '#8a6a2a');
  t.r(x + 2, 138, 2, 3, '#d8b860');
  t.r(x - 4, 138, 1, 4, '#c8a850');
  t.r(x + 1, 127, 5, 1, '#f4e4a8');
  t.r(x - 4, 104, 8, 8, '#d8b860');
  t.r(x - 5, 101, 10, 5, '#8a8a96');
  t.r(x - 5, 101, 10, 1, '#c0c0cc');
  t.r(x + 2, 103, 2, 2, '#6a6a76');
  t.r(x - 1, 98, 2, 3, '#c8962a');
  t.r(x + 9, 122, 6, 10, escudo);
  t.r(x + 11, 125, 2, 3, '#e0c060');
}

/** Poço de pedra com telhadinho, sarilho e balde; x é a esquerda (36 de largura). */
function poco(t: Pincel, x: number): void {
  t.r(x - 3, 158, 42, 3, '#b89a68');
  t.r(x, 136, 36, 22, '#a89880');
  t.r(x, 136, 4, 22, '#8e8068');
  for (const [dx, dy] of [[8, 140], [20, 140], [14, 146], [26, 146], [8, 152], [20, 152]] as Ponto[]) t.r(x + dx, dy, 1, 5, '#7a6c58');
  t.r(x, 145, 36, 1, '#7a6c58');
  t.r(x, 151, 36, 1, '#7a6c58');
  t.r(x - 1, 131, 38, 5, '#cfc0a6');
  t.r(x - 1, 131, 38, 1, '#e8dcc4');
  t.r(x + 4, 132, 28, 2, '#1e2a30');
  t.r(x + 1, 104, 3, 27, '#6a4224');
  t.r(x + 32, 104, 3, 27, '#6a4224');
  t.r(x - 3, 100, 42, 4, '#b85a32');
  t.r(x - 3, 100, 42, 1, '#e07c4c');
  t.r(x + 3, 96, 30, 4, '#a04a28');
  t.r(x + 4, 112, 28, 2, '#5a3a20');
  t.r(x + 35, 110, 2, 6, '#5a3a20');
  t.r(x + 37, 114, 3, 2, '#5a3a20');
  t.r(x + 18, 114, 1, 12, '#c8a870');
  t.r(x + 14, 124, 10, 7, '#7a5030');
  t.r(x + 14, 126, 10, 1, '#3a3a44');
  t.r(x + 15, 124, 2, 7, '#9a6a40');
}

/** Estrela grande e brilhante (cruz com brilho em volta), piscando devagar. */
function estrelaForte(t: Pincel, x: number, y: number, atrasoMs: number): void {
  t.g('c3-cintilar', atraso(atrasoMs), (s) => {
    s.r(x - 3, y, 7, 1, '#c8d8ff', 0.35);
    s.r(x, y - 3, 1, 7, '#c8d8ff', 0.35);
    s.r(x - 1, y, 3, 1, '#e8f0ff');
    s.r(x, y - 1, 1, 3, '#e8f0ff');
    s.r(x, y, 1, 1, '#ffffff');
  });
}

function ludusPatioNoite(): JSX.Element {
  const t = pincel();
  ceu(t, ['#060a1c', '#0a1026', '#0e1632', '#131d3e', '#18264c', '#1e2e58'], 0, 60);
  // estrelas miúdas
  for (let i = 0; i < 10; i++) {
    t.ra(entre(i * 19 + 4, 4, 316), entre(i * 23 + 9, 18, 46), 1, 1, i % 3 ? '#d8e0ff' : '#fff6e0', 'c3-estrela', {
      animationDelay: `${-i * 430}ms`,
      animationDuration: `${2 + (i % 3)}s`,
    });
  }
  // as três estrelas alinhadas
  estrelaForte(t, 196, 22, 0);
  estrelaForte(t, 212, 27, -700);
  estrelaForte(t, 228, 32, -1400);
  // lua cheia
  halo(t, 56, 30, 26, '#e8ecff', 0.06, 'c3-pulsar');
  disco(t, 56, 30, 10, '#f0ecd8', 2);
  t.r(50, 25, 4, 3, '#d0ccb8');
  t.r(58, 31, 5, 4, '#d0ccb8');
  t.r(53, 34, 3, 2, '#d0ccb8');
  t.r(60, 23, 2, 2, '#d0ccb8');
  // Roma dormindo ao longe: morros, ciprestes e o Coliseu com janelas acesas
  t.r(0, 44, 320, 16, '#141c3a');
  t.r(0, 40, 70, 4, '#141c3a');
  t.r(120, 38, 60, 6, '#141c3a');
  t.r(206, 32, 80, 22, '#1a2244');
  t.r(206, 31, 80, 1, '#2a3460');
  for (let k = 0; k < 9; k++) t.r(214 + k * 8, 38, 4, 6, '#0e1430');
  t.ra(222, 39, 2, 3, '#e8a050', 'c3-piscar', atraso(-800));
  t.ra(254, 39, 2, 3, '#e8a050', 'c3-piscar', atraso(-3100));
  for (const x of [20, 27, 154]) {
    t.r(x, 34, 5, 22, '#0c1428');
    t.r(x + 1, 30, 3, 4, '#0c1428');
  }

  // muro do Ludus (cores do dia; a noite cai por cima com um véu azul)
  t.r(0, 60, 320, 76, '#d6b282');
  t.r(0, 53, 320, 7, '#b85a32');
  t.r(0, 53, 320, 1, '#e07c4c');
  for (let k = 0; k < 8; k++) t.r(k * 40 + 4, 54, 1, 6, '#94401e');
  t.r(0, 60, 320, 2, '#8a5a3a');
  for (const cx of [18, 50, 82, 114, 206, 238, 270, 302]) {
    t.r(cx - 12, 66, 24, 30, '#e6c896');
    arco(t, cx, 68, 10, 18, '#3a2418', 4);
  }
  // estandarte do Brutus enrolado para a noite
  t.r(142, 62, 36, 2, '#6a4a2a');
  t.r(146, 64, 28, 6, '#24366e');
  t.r(146, 64, 28, 1, '#e0b040');
  t.r(146, 69, 28, 1, '#16204a');
  t.r(0, 96, 320, 4, '#c09a6a');
  t.r(0, 96, 320, 1, '#f2dcae');
  t.r(0, 99, 320, 1, '#8a6440');
  for (const x of [8, 46, 252, 290]) portaCela(t, x, 104);
  // portão do meio, trancado
  arco(t, 160, 100, 24, 12, '#b89060', 3);
  arco(t, 160, 104, 20, 12, '#5a3a22', 3);
  for (const x of [148, 154, 166, 172]) t.r(x, 114, 1, 22, '#3e2616');
  t.r(159, 104, 2, 32, '#2a180c');
  t.r(142, 114, 36, 2, '#3a3a44');
  t.r(141, 128, 38, 2, '#3a3a44');
  t.r(156, 119, 8, 6, '#5a5a66');
  t.r(159, 121, 2, 2, '#1a1a20');
  suporteArmas(t, 84);
  suporteArmas(t, 200);
  t.r(0, 132, 320, 4, '#a8845a');

  // areia do pátio
  t.r(0, 136, 320, 44, '#e2c890');
  t.r(0, 136, 320, 5, '#c4a670');
  t.r(0, 168, 320, 12, '#e8d29e');
  for (let i = 0; i < 4; i++) t.r(entre(i * 9 + 3, 0, 280), entre(i * 4 + 70, 146, 176), entre(i + 90, 20, 40), 1, '#d2b67e');
  for (let i = 0; i < 6; i++) t.r(entre(i * 17 + 2, 0, 318), entre(i * 11 + 6, 144, 178), 1, 1, i % 3 ? '#c8aa72' : '#f2deb0');
  boneco(t, 40, '#4a6a9a');
  boneco(t, 240, '#8a3a2a');
  poco(t, 278);
  t.r(4, 140, 8, 12, '#b0603a');
  t.r(5, 137, 6, 3, '#b0603a');
  t.r(6, 152, 4, 3, '#8a4a2a');

  // a noite: véu azul por cima de tudo que está embaixo do céu
  t.r(0, 53, 320, 127, '#0a1236', 0.6);
  // luar na areia e sombras compridas para a direita (a lua está à esquerda)
  t.r(0, 160, 320, 20, '#a8b8e8', 0.08);
  t.r(52, 153, 34, 3, '#02040c', 0.35);
  t.r(252, 153, 30, 3, '#02040c', 0.35);
  t.r(310, 158, 10, 3, '#02040c', 0.3);

  // janela acesa na galeria, com alguém de vigia
  t.r(232, 76, 12, 17, '#e8a050', 0.55);
  t.r(236, 82, 5, 5, '#1a1220');
  t.r(234, 87, 9, 6, '#1a1220');
  // olhos no escuro de uma cela e um gato no telhado
  t.ra(54, 118, 1, 1, '#ffe070', 'c3-piscar', atraso(-2400));
  t.ra(58, 118, 1, 1, '#ffe070', 'c3-piscar', atraso(-2400));
  t.r(98, 47, 8, 6, '#04060e');
  t.r(104, 44, 5, 5, '#04060e');
  t.r(104, 43, 1, 1, '#04060e');
  t.r(108, 43, 1, 1, '#04060e');
  t.r(94, 44, 2, 8, '#04060e');
  t.ra(105, 46, 1, 1, '#c8f070', 'c3-piscar', atraso(-1000));
  t.ra(107, 46, 1, 1, '#c8f070', 'c3-piscar', atraso(-1000));

  // tochas acesas no muro e a luz delas na areia
  for (const [x, y, ms] of [[34, 78, 0], [131, 104, -300], [185, 104, -650], [284, 78, -150]] as const) {
    tocha(t, x, y, ms);
    t.g('c3-pulsar', atraso(ms), (s) => {
      s.r(x - 12, 137, 28, 7, '#ff9a3c', 0.08);
    });
  }
  // poeira levantada no pátio
  poeira(t, 8, 20, 300, 110, 160, ['#f0d8a8', '#c8d0f0'], 7);
  return <>{t.itens}</>;
}
