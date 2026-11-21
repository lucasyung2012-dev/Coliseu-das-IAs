/**
 * Cenários do quarto bloco de capítulos do modo História (Coliseu), em pixel art de 320 × 180:
 * o caminho do Octavius, a IA comandante naval, de volta a Roma Eterna. O mercado da Subura de dia,
 * os telhados ao pôr do sol, a Cloaca Maxima, o cofre do Cobrador, a frota fantasma de Marco Remo
 * escondida na enseada, a batalha no mar à noite e o Coliseu inundado para a naumaquia.
 *
 * `desenhoCapitulo4(lugar)` devolve só o conteúdo do SVG (sem a tag <svg>) para viewBox "0 0 320 180";
 * quem chama põe o <svg> com shapeRendering="crispEdges". Lugares que não são destes capítulos devolvem null.
 *
 * Regras do desenho: coordenadas inteiras, quase tudo em <rect>, chão (ou convés) entre y 136 e 180
 * (os pés dos personagens ficam por volta de y 155), a faixa central (y 70 a 150) mais calma para os
 * personagens e o topo (uns 18 px) livre de detalhe importante, porque o HUD pode cobrir.
 * As animações de ambiente usam as classes "c4-" de capitulos4.css; os ids de <defs> começam com "c4-".
 */
import './capitulos4.css';
import type { CSSProperties } from 'react';

export function desenhoCapitulo4(lugar: string): JSX.Element | null {
  switch (lugar) {
    case 'subura-mercado':
      return suburaMercado();
    case 'subura-telhados':
      return suburaTelhados();
    case 'subura-esgoto':
      return suburaEsgoto();
    case 'cofre-cobrador':
      return cofreCobrador();
    case 'frota-noite':
      return frotaNoite();
    case 'mar-batalha':
      return marBatalha();
    case 'coliseu-inundado':
      return coliseuInundado();
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

/** Linha (cordas, varais, cabos); largura em unidades do desenho. */
function linha(t: Pincel, x1: number, y1: number, x2: number, y2: number, cor: string, largura = 1): void {
  t.el((k) => <line key={k} x1={x1} y1={y1} x2={x2} y2={y2} stroke={cor} strokeWidth={largura} />);
}

/** Padrão de textura (telha, tijolo, pedra, tábua) que se repete pelo desenho todo; o id deve começar com "c4-". */
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

/** Olho do Censor: (cx, cy) é o centro e e é a escala inteira (1 = 12 × 6). */
function olho(t: Pincel, cx: number, cy: number, e: number, atrasoMs: number): void {
  t.r(cx - 6 * e, cy - e, 12 * e, 2 * e, '#f0e6dc');
  t.r(cx - 4 * e, cy - 2 * e, 8 * e, 4 * e, '#f0e6dc');
  t.r(cx - 2 * e, cy - 3 * e, 4 * e, 6 * e, '#f0e6dc');
  t.ra(cx - 2 * e, cy - 2 * e, 4 * e, 4 * e, '#e0201a', 'c4-olho', atraso(atrasoMs));
  t.r(cx - e, cy - e, 2 * e, 2 * e, '#1a0606');
}

/** Estandarte vermelho do Censor, com o olho no meio e a ponta em V. */
function bandeiraOlho(t: Pincel, x: number, y: number, w: number, h: number, e: number, atrasoMs: number): void {
  const cx = x + Math.floor(w / 2);
  const cy = y + Math.floor(h / 2) - 2;
  const q = Math.floor(w / 4);
  t.g('c4-bandeira', atraso(atrasoMs), (s) => {
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
    'c4-gira',
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

/** Lanterna de latão pendurada balançando; (x, y) é o gancho, comp o cordão e luz a força do halo (0 = apagada). */
function lanterna(t: Pincel, x: number, y: number, comp: number, cor: string, luz: number, atrasoMs: number): void {
  if (luz > 0) halo(t, x, y + comp + 6, 22, cor, luz, 'c4-pulsar', atraso(atrasoMs));
  t.g('c4-balancar', atraso(atrasoMs), (s) => {
    s.r(x, y, 1, comp, '#3a2a20');
    s.r(x - 3, y + comp, 7, 2, '#a07a2a');
    s.r(x - 3, y + comp + 2, 7, 8, '#4a3418');
    s.r(x - 2, y + comp + 3, 5, 6, cor);
    s.r(x - 1, y + comp + 4, 3, 3, '#fff4c0');
    s.r(x - 4, y + comp + 10, 9, 2, '#a07a2a');
    s.r(x, y + comp + 12, 1, 2, '#a07a2a');
  });
}

/** Pássaro (silhueta) cruzando o céu e batendo as asas. */
function passaro(t: Pincel, x: number, y: number, cor: string, atrasoMs: number, duracaoS: number): void {
  t.g('c4-passaro', { animationDelay: `${atrasoMs}ms`, animationDuration: `${duracaoS}s` }, (s) => {
    s.r(x, y, 3, 1, cor);
    s.g('c4-asa', atraso(atrasoMs), (a) => {
      a.r(x - 3, y - 2, 3, 1, cor);
      a.r(x + 3, y - 2, 3, 1, cor);
      a.r(x - 1, y - 1, 1, 1, cor);
      a.r(x + 3, y - 1, 1, 1, cor);
    });
  });
}

/**
 * Coluna de fumaça ou vapor: n baforadas que sobem e somem, espalhadas no tempo.
 * (x, y) é a boca da chaminé; classe é "c4-fumaca" (lenta) ou "c4-vapor" (rápido).
 */
function fumaca(
  t: Pincel,
  x: number,
  y: number,
  n: number,
  cores: readonly string[],
  tam: number,
  classe: string,
  duracaoS: number,
  atrasoMs: number,
): void {
  for (let i = 0; i < n; i++) {
    const c = de(cores, i);
    const a = tam + (i % 2);
    const d = atrasoMs - Math.round((i * duracaoS * 1000) / n);
    t.g(classe, { animationDelay: `${d}ms`, animationDuration: `${duracaoS}s` }, (s) => {
      s.r(x - a, y - a + 1, a * 2, a * 2 - 2, c);
      s.r(x - a + 1, y - a, a * 2 - 2, a * 2, c);
    });
  }
}

/** Pessoa miúda (17 px de altura) andando ao fundo; (x, y) é o topo da cabeça. */
function pessoa(t: Pincel, x: number, y: number, roupa: string, pele: string, carga: string | undefined): void {
  t.r(x + 1, y, 4, 4, pele);
  t.r(x + 1, y, 4, 1, '#2a1a12');
  t.r(x, y + 4, 6, 8, roupa);
  t.r(x + 1, y + 12, 2, 5, '#3a2a20');
  t.r(x + 3, y + 12, 2, 5, '#4a3424');
  if (carga) {
    t.r(x - 1, y - 4, 8, 4, carga);
    t.r(x - 1, y - 4, 8, 1, '#e8c890');
  }
}

/** Fila de gente do mercado (cabeças e ombros) até o chão em y 136; cada metade balança num tempo. */
function multidao(t: Pincel, x0: number, x1: number, y: number, semente: number): void {
  const roupas = ['#8a3a2a', '#3a5a7a', '#c8a050', '#5a7a3a', '#7a4a6a', '#d8c8a8', '#6a4a2a'];
  const peles = ['#e0b088', '#c08a60', '#8a5a3a', '#f0c8a0'];
  for (const fase of [0, 1]) {
    t.g('c4-multidao', atraso(fase * -700), (s) => {
      for (let x = x0 + fase * 5; x < x1; x += 10) {
        const n = semente + x;
        const yy = y + entre(n, 0, 3) + fase * 2;
        s.r(x + 1, yy, 4, 4, de(peles, entre(n + 1, 0, 3)));
        s.r(x + 1, yy, 4, 1, '#2a1a12');
        s.r(x, yy + 4, 6, 136 - yy - 4, de(roupas, entre(n + 2, 0, 6)));
      }
    });
  }
}

/** Pombo no chão, bicando de vez em quando; (x, y) é o dorso. */
function pombo(t: Pincel, x: number, y: number, atrasoMs: number): void {
  t.g('c4-pombo', atraso(atrasoMs), (s) => {
    s.r(x, y, 5, 3, '#8a8e9a');
    s.r(x + 4, y - 2, 3, 3, '#9aa0ac');
    s.r(x + 4, y, 2, 1, '#6a9a8a');
    s.r(x + 7, y - 1, 1, 1, '#e0a040');
    s.r(x + 5, y - 1, 1, 1, '#1a1a1a');
    s.r(x + 1, y, 3, 1, '#6a7080');
    s.r(x - 2, y + 1, 2, 1, '#6a7080');
    s.r(x + 1, y + 3, 1, 1, '#c86a5a');
    s.r(x + 3, y + 3, 1, 1, '#c86a5a');
  });
}

/** Barril de pé; (x, y) é o canto de cima. */
function barril(t: Pincel, x: number, y: number): void {
  t.r(x + 1, y, 10, 14, '#7a4a28');
  t.r(x, y + 2, 12, 10, '#7a4a28');
  t.r(x + 2, y + 1, 2, 12, '#9a6a3a');
  t.r(x + 9, y + 1, 2, 12, '#5a3418');
  t.r(x, y + 3, 12, 1, '#3a3a44');
  t.r(x, y + 10, 12, 1, '#3a3a44');
}

/** Caixote de madeira; (x, y) é o canto de cima. */
function caixote(t: Pincel, x: number, y: number, w: number, h: number): void {
  t.r(x, y, w, h, '#8a5a30');
  t.r(x, y, w, 1, '#b07a44');
  t.r(x, y, 2, h, '#a06a3a');
  t.r(x + w - 2, y, 2, h, '#5a3a1e');
  t.r(x, y + h - 2, w, 2, '#5a3a1e');
  t.r(x + 2, y + Math.floor(h / 2), w - 4, 1, '#6a4424');
}

/** Faísca de brilho (moeda, água ao sol) que acende de vez em quando. */
function brilho(t: Pincel, x: number, y: number, cor: string, atrasoMs: number): void {
  t.g('c4-brilho', atraso(atrasoMs), (s) => {
    s.r(x - 2, y, 5, 1, cor);
    s.r(x, y - 2, 1, 5, cor);
  });
}

/* ------------------------------------------------------------------ */
/* Subura: o mercado de dia                                            */
/* ------------------------------------------------------------------ */

/** Janela de insula com venezianas; (x, y) é o canto de cima. */
function janela(t: Pincel, x: number, y: number, veneziana: string, flores: boolean): void {
  t.r(x, y, 12, 16, '#3a2218');
  t.r(x + 1, y + 1, 10, 3, '#5a3a2a');
  t.r(x - 3, y, 3, 16, veneziana);
  t.r(x + 12, y, 3, 16, veneziana);
  t.r(x - 3, y + 5, 3, 1, '#2a3a2a');
  t.r(x + 12, y + 10, 3, 1, '#2a3a2a');
  t.r(x - 2, y + 16, 16, 2, '#d8c0a0');
  if (flores) {
    t.r(x, y + 13, 12, 3, '#6a4428');
    t.r(x + 1, y + 11, 10, 2, '#4a8a3a');
    t.r(x + 2, y + 10, 2, 2, '#d83a3a');
    t.r(x + 7, y + 10, 2, 2, '#f0d040');
  }
}

function suburaMercado(): JSX.Element {
  const t = pincel();
  padrao(t, 'c4-pedra-rua', 12, 12, (s) => {
    s.r(0, 0, 12, 12, '#5e4e3e');
    s.r(0, 0, 11, 5, '#9a866c');
    s.r(0, 0, 11, 1, '#b4a084');
    s.r(0, 6, 5, 5, '#8e7a62');
    s.r(6, 6, 6, 5, '#9a866c');
    s.r(0, 6, 5, 1, '#b4a084');
    s.r(6, 6, 6, 1, '#b4a084');
  });

  // céu estreito entre os prédios
  ceu(t, ['#8ec8e8', '#a4d4ec', '#bcdff0', '#d4eaf2'], 0, 48);
  t.r(150, 6, 22, 3, '#f4fbff');
  t.r(144, 8, 36, 3, '#f4fbff');
  t.r(206, 18, 18, 2, '#eaf6fc');

  // insulae do fundo (mais claras, de longe)
  t.r(64, 14, 70, 100, '#d4a87e');
  t.r(134, 22, 60, 92, '#c89870');
  t.r(194, 8, 62, 106, '#d8b48c');
  t.r(62, 12, 74, 3, '#a4523a');
  t.r(132, 20, 64, 3, '#9a4a34');
  t.r(192, 6, 66, 3, '#a4523a');
  t.r(64, 15, 70, 1, '#8a4a34');
  t.r(194, 9, 62, 1, '#8a4a34');
  for (let y = 22; y < 96; y += 16) {
    t.r(64, y + 14, 192, 1, '#b88a64');
    for (let x = 70; x < 250; x += 14) {
      if (sorte(x * 3 + y) < 0.18) continue;
      const yy = y + (x >= 134 && x < 194 ? 6 : 0);
      t.r(x, yy, 5, 7, '#5a3a2c');
      if (sorte(x + y * 5) < 0.3) t.r(x - 1, yy, 1, 7, '#5a8a6a');
    }
  }
  // luz do sol batendo na fachada da direita
  t.r(194, 8, 62, 106, '#fff0c0', 0.12);

  // varais cruzando a rua, com roupa secando
  linha(t, 62, 26, 258, 34, '#4a3a2a');
  const roupas = ['#e8e0d0', '#c83a2a', '#3a6a9a', '#e8c050', '#7aa04a', '#d8a0b0', '#f0ece0'];
  const varal: Ponto[] = [[76, 8], [92, 10], [110, 6], [128, 12], [150, 8], [172, 10], [196, 6], [214, 12], [236, 8]];
  varal.forEach(([x, h], i) => {
    const yy = 26 + Math.round(((x - 62) * 8) / 196);
    const w = 6 + (i % 3) * 2;
    t.g('c4-roupa', atraso(-i * 430), (s) => {
      s.r(x, yy, w, h, de(roupas, i));
      s.r(x, yy + h - 1, w, 1, '#8a7a6a');
      s.r(x + 1, yy, 1, 1, '#4a3a2a');
      s.r(x + w - 2, yy, 1, 1, '#4a3a2a');
    });
  });
  // cabo das lanternas
  linha(t, 62, 46, 258, 42, '#3a2a20');
  for (const [x, i] of [[96, 0], [160, 1], [224, 2]] as Ponto[]) {
    const yy = 46 - Math.round(((x - 62) * 4) / 196);
    lanterna(t, x, yy, 4, '#ffc860', 0.05, -i * 900);
  }

  // insula da esquerda (perto, em sombra parcial)
  t.r(0, 0, 62, 136, '#b06a44');
  t.r(56, 0, 6, 136, '#8a4a30');
  t.r(0, 34, 62, 3, '#d8b48c');
  t.r(0, 66, 62, 3, '#d8b48c');
  t.r(0, 37, 62, 1, '#7a4028');
  t.r(0, 69, 62, 1, '#7a4028');
  janela(t, 10, 12, '#4a7a5a', false);
  janela(t, 34, 12, '#4a7a5a', true);
  janela(t, 10, 44, '#6a8aa0', true);
  janela(t, 34, 44, '#6a8aa0', false);
  // reboco descascando
  t.r(4, 26, 5, 3, '#c88a5a');
  t.r(46, 54, 6, 4, '#c88a5a');
  t.r(47, 55, 3, 2, '#9a6a4a');
  // sacada de madeira
  t.r(0, 76, 50, 3, '#6a4428');
  t.r(0, 76, 50, 1, '#9a6a3a');
  for (let x = 2; x < 50; x += 6) t.r(x, 70, 2, 6, '#5a3a20');
  t.r(0, 70, 50, 2, '#7a5030');
  t.r(8, 79, 2, 6, '#4a2a18');
  t.r(40, 79, 2, 6, '#4a2a18');
  // vasos na sacada
  t.r(14, 66, 6, 4, '#b8582e');
  t.r(13, 62, 8, 4, '#4a8a3a');
  t.r(30, 66, 6, 4, '#b8582e');
  t.r(29, 63, 8, 3, '#5a9a40');
  // loja no térreo em arco, com ânforas e prateleira
  arco(t, 30, 92, 18, 26, '#2a1a12');
  t.r(12, 108, 36, 2, '#5a3a20');
  for (const x of [16, 24, 32, 40]) {
    t.r(x, 101, 5, 7, '#b8683a');
    t.r(x + 1, 99, 3, 2, '#b8683a');
    t.r(x + 1, 102, 1, 4, '#d88a54');
  }
  t.r(14, 120, 32, 16, '#3a2418');
  t.r(14, 120, 32, 2, '#6a4428');
  t.r(18, 116, 6, 4, '#d8c070');
  t.r(28, 115, 8, 5, '#c8a050');
  // placa pendurada
  t.r(48, 84, 12, 1, '#2a1a10');
  t.r(50, 85, 1, 3, '#2a1a10');
  t.r(57, 85, 1, 3, '#2a1a10');
  t.r(48, 88, 12, 8, '#7a5030');
  t.r(49, 89, 10, 6, '#c8a050');
  t.r(51, 91, 6, 2, '#7a3a1a');

  // insula da direita
  t.r(258, 0, 62, 136, '#c07a4c');
  t.r(258, 0, 4, 136, '#e0a070');
  t.r(258, 34, 62, 3, '#e8c49c');
  t.r(258, 66, 62, 3, '#e8c49c');
  janela(t, 270, 12, '#a04a3a', true);
  janela(t, 296, 12, '#a04a3a', false);
  janela(t, 270, 44, '#4a7a5a', false);
  janela(t, 296, 44, '#4a7a5a', true);
  // porta no térreo e o pichação rebelde: o olho do Censor riscado
  t.r(296, 104, 18, 32, '#3a2418');
  t.r(294, 102, 22, 2, '#e8c49c');
  t.r(298, 106, 6, 30, '#4a3020');
  t.r(310, 118, 2, 2, '#d8a83a');
  t.r(266, 100, 16, 6, '#e8e0d0');
  t.r(270, 98, 8, 10, '#e8e0d0');
  t.r(272, 101, 4, 4, '#a8161a');
  linha(t, 264, 95, 282, 113, '#2a2a3a', 2);
  linha(t, 282, 95, 264, 113, '#2a2a3a', 2);
  // estandarte oficial do Censor (bem mais alto que a pichação)
  t.r(284, 72, 22, 2, '#b8862a');
  bandeiraOlho(t, 286, 74, 18, 18, 1, -300);

  // barraca 1: frutas, com toldo listrado e manivela de engrenagem
  t.r(68, 94, 56, 8, '#e8d8b0');
  for (let x = 68; x < 124; x += 8) {
    t.r(x, 94, 4, 8, '#b83a2a');
    t.r(x, 102, 4, 2, '#b83a2a');
    t.r(x + 4, 102, 4, 2, '#e8d8b0');
  }
  t.r(68, 94, 56, 1, '#f8ecd0');
  t.r(70, 104, 2, 32, '#5a3a22');
  t.r(120, 104, 2, 32, '#5a3a22');
  t.r(68, 116, 56, 4, '#7a5432');
  t.r(68, 116, 56, 1, '#a07448');
  for (const [x, c] of [[74, '#e88a2a'], [88, '#c83a2a'], [102, '#6a3a7a']] as const) {
    t.r(x, 112, 10, 4, c);
    t.r(x + 2, 109, 6, 3, c);
    t.r(x + 4, 107, 2, 2, c);
    t.r(x + 1, 112, 2, 1, '#f8e0b0');
  }
  engrenagem(t, 116, 108, 4, '#c89a3a', '#5a4018', 6, false);

  // barraca 2: tecidos pendurados e o caldeirão fumegante
  t.r(128, 96, 58, 3, '#5a3a22');
  t.r(130, 99, 2, 37, '#4a2e1a');
  t.r(182, 99, 2, 37, '#4a2e1a');
  const tecidos = ['#3a6a9a', '#c8a050', '#8a3a6a', '#4a8a5a', '#d86a3a', '#e8e0d0'];
  for (let i = 0; i < 6; i++) {
    t.g('c4-roupa', atraso(-i * 520 - 200), (s) => {
      s.r(134 + i * 8, 99, 6, 12 + (i % 3) * 3, de(tecidos, i));
      s.r(134 + i * 8, 99, 1, 12 + (i % 3) * 3, '#f8f0e0');
    });
  }
  t.r(166, 118, 14, 8, '#2a2a30');
  t.r(164, 117, 18, 2, '#4a4a54');
  t.ra(168, 126, 10, 3, '#ff9a2a', 'c4-chama');
  fumaca(t, 173, 112, 4, ['#f0f0f0', '#e0e4e8'], 3, 'c4-vapor', 2.8, 0);

  // cabine de bronze do Cobrador, com o olho do Censor
  t.r(198, 72, 52, 64, '#a87a2a');
  t.r(198, 72, 3, 64, '#d0a040');
  t.r(247, 72, 3, 64, '#6a4a18');
  arco(t, 224, 54, 22, 0, '#b8862a');
  arco(t, 216, 58, 8, 0, '#e0b048');
  t.r(223, 46, 2, 8, '#6a4a18');
  t.r(221, 43, 6, 3, '#e0b048');
  t.r(198, 78, 52, 2, '#6a4a18');
  for (let x = 201; x < 248; x += 6) t.r(x, 80, 2, 2, '#f0c860');
  olho(t, 224, 92, 2, 0);
  t.r(208, 104, 32, 10, '#6a4a18');
  t.r(210, 106, 28, 6, '#1a1208');
  t.r(214, 108, 20, 1, '#e0b048');
  t.r(194, 114, 60, 4, '#d0a040');
  t.r(194, 117, 60, 1, '#6a4a18');
  t.r(206, 122, 36, 10, '#8a6420');
  t.r(208, 124, 32, 1, '#c89a3a');
  t.r(208, 128, 32, 1, '#c89a3a');
  engrenagem(t, 202, 128, 4, '#e0b048', '#5a4018', 5, false);
  engrenagem(t, 246, 128, 4, '#e0b048', '#5a4018', 5, true);
  // cano de vapor da cabine
  t.r(248, 40, 4, 34, '#7a5a20');
  t.r(249, 40, 1, 34, '#c89a3a');
  t.r(246, 38, 8, 3, '#a07a2a');
  fumaca(t, 250, 34, 5, ['#f4f4f4', '#e4e8ec', '#d8dce0'], 3, 'c4-vapor', 3, -400);

  // gente do mercado, na frente das barracas
  multidao(t, 70, 190, 118, 11);
  // passantes cruzando (um carregador com cesto na cabeça)
  t.g('c4-andar', atraso(0), (s) => pessoa(s, 150, 113, '#4a6a8a', '#c08a60', '#c8a060'));
  t.g('c4-andar', { animationDelay: '-7s', animationDuration: '18s' }, (s) => pessoa(s, 40, 113, '#9a4a2a', '#e0b088', undefined));

  // calçamento
  t.r(0, 136, 320, 44, 'url(#c4-pedra-rua)');
  t.r(0, 136, 320, 2, '#6a5a48');
  t.r(0, 136, 320, 44, '#fff0c0', 0.08);
  t.r(0, 136, 70, 44, '#2a1a10', 0.18);
  t.r(0, 172, 320, 3, '#4a3e30');
  t.r(0, 172, 320, 1, '#2a2218');
  // restos do mercado no chão
  t.r(84, 160, 4, 2, '#7aa04a');
  t.r(226, 150, 3, 3, '#e0b048');
  t.r(227, 151, 1, 1, '#fff0a0');
  t.r(118, 166, 4, 3, '#e88a2a');
  t.r(256, 164, 10, 5, '#a07a4a');
  t.r(257, 165, 8, 1, '#c8a070');
  // pombos
  pombo(t, 20, 160, 0);
  pombo(t, 32, 164, -1300);
  pombo(t, 284, 158, -2200);
  pombo(t, 300, 166, -600);
  pombo(t, 42, 67, -3100);
  return <>{t.itens}</>;
}

/* ------------------------------------------------------------------ */
/* Subura: os telhados ao pôr do sol                                   */
/* ------------------------------------------------------------------ */

/** Chaminé de tijolo com fumaça; (x, y) é o topo e h a altura. */
function chamine(t: Pincel, x: number, y: number, h: number, atrasoMs: number): void {
  t.r(x, y, 8, h, '#8a4a3a');
  t.r(x, y, 2, h, '#b06a4a');
  t.r(x - 1, y - 2, 10, 3, '#6a3a30');
  t.r(x + 2, y - 2, 4, 1, '#1a0c10');
  for (let k = 4; k < h; k += 5) t.r(x, y + k, 8, 1, '#6a3a30');
  fumaca(t, x + 4, y - 4, 4, ['#8a7a8a', '#9a8898', '#7a6a7e'], 3, 'c4-fumaca', 5, atrasoMs);
}

function suburaTelhados(): JSX.Element {
  const t = pincel();
  padrao(t, 'c4-telha', 8, 8, (s) => {
    s.r(0, 0, 8, 8, '#b4562e');
    s.r(0, 0, 8, 1, '#e08a54');
    s.r(0, 3, 8, 1, '#7a3218');
    s.r(3, 0, 2, 3, '#c86a3a');
    s.r(0, 4, 8, 1, '#e08a54');
    s.r(0, 7, 8, 1, '#7a3218');
    s.r(7, 4, 1, 3, '#c86a3a');
    s.r(0, 4, 1, 3, '#c86a3a');
  });

  // céu do entardecer
  ceu(t, ['#3a2a5a', '#5a3468', '#8a3e66', '#c4505a', '#e8744a', '#f4a050', '#f8c870'], 0, 98);
  halo(t, 248, 82, 40, '#ffd890', 0.08, 'c4-pulsar');
  disco(t, 248, 82, 14, '#ffe0a0');
  disco(t, 248, 82, 10, '#fff0c0');
  // nuvens compridas pegando a luz
  t.g('c4-nuvem', undefined, (s) => {
    s.r(30, 30, 60, 3, '#e87a6a');
    s.r(40, 28, 30, 2, '#f8a080');
    s.r(150, 44, 80, 3, '#f09060');
    s.r(170, 42, 40, 2, '#f8b880');
    s.r(250, 22, 50, 2, '#c8607a');
    s.r(200, 60, 40, 2, '#f8c070');
  });

  // cidade ao longe e o Coliseu
  const longe = '#6a3456';
  const blocos: (readonly [number, number, number])[] = [
    [0, 20, 84], [18, 16, 80], [112, 14, 78], [126, 24, 86], [150, 10, 74], [160, 30, 82], [190, 18, 76],
    [208, 26, 84], [234, 20, 88], [254, 30, 80], [284, 14, 76], [298, 22, 84],
  ];
  for (const [x, w, y] of blocos) {
    t.r(x, y, w, 100 - y, longe);
    t.r(x, y, w, 1, '#a0506a');
  }
  // templo com frontão
  t.r(160, 78, 30, 2, '#8a4062');
  t.r(164, 76, 22, 2, '#8a4062');
  t.r(170, 74, 10, 2, '#8a4062');
  // aqueduto
  t.r(196, 88, 60, 3, '#7a3a5a');
  for (let x = 198; x < 256; x += 10) t.r(x, 91, 3, 9, '#7a3a5a');
  // Coliseu
  t.r(34, 64, 76, 36, '#7a3e5e');
  t.r(38, 60, 52, 4, '#7a3e5e');
  t.r(90, 54, 18, 10, '#7a3e5e');
  t.r(34, 64, 76, 1, '#b05a6a');
  t.r(90, 54, 18, 1, '#b05a6a');
  for (const y of [66, 76, 86]) {
    for (let x = 38; x < 106; x += 6) {
      t.r(x, y, 3, 6, sorte(x + y) < 0.3 && y === 66 ? '#f0a060' : '#4a2244');
    }
  }
  t.r(97, 48, 1, 6, '#3a1a34');
  t.ra(96, 47, 3, 2, '#ff3a2a', 'c4-olho');

  // telhados do meio (mais longe, tingidos pelo entardecer)
  t.r(0, 100, 70, 8, 'url(#c4-telha)');
  t.r(0, 108, 70, 28, '#7a3a34');
  t.r(70, 92, 8, 44, '#241226');
  t.r(78, 92, 72, 8, 'url(#c4-telha)');
  t.r(78, 100, 72, 36, '#8a4438');
  t.r(150, 92, 6, 44, '#241226');
  t.r(156, 104, 74, 8, 'url(#c4-telha)');
  t.r(156, 112, 74, 24, '#7a3a34');
  t.r(230, 92, 6, 44, '#241226');
  t.r(236, 96, 84, 8, 'url(#c4-telha)');
  t.r(236, 104, 84, 32, '#843e36');
  for (const [x, y] of [[10, 114], [30, 116], [90, 106], [120, 108], [176, 118], [206, 118], [250, 110], [280, 112], [306, 110]] as Ponto[]) {
    t.r(x, y, 6, 8, '#3a1a20');
    if (sorte(x) < 0.6) t.r(x + 1, y + 1, 4, 6, '#ffb860');
  }
  t.r(0, 92, 320, 44, '#4a1a4a', 0.22);
  // caixa d'água sobre pernas de madeira
  t.r(110, 80, 2, 12, '#3a2018');
  t.r(128, 80, 2, 12, '#3a2018');
  t.r(110, 86, 20, 1, '#3a2018');
  t.r(108, 64, 24, 16, '#5a3424');
  t.r(108, 64, 3, 16, '#7a4a30');
  t.r(106, 62, 28, 3, '#4a2a1c');
  t.r(108, 68, 24, 1, '#2a2a34');
  t.r(108, 76, 24, 1, '#2a2a34');
  t.r(118, 58, 4, 4, '#4a2a1c');
  // varal entre os telhados do meio, com roupas tremulando
  t.r(160, 88, 2, 16, '#3a2018');
  t.r(222, 86, 2, 18, '#3a2018');
  linha(t, 161, 89, 223, 87, '#2a1420');
  for (const [x, i] of [[168, 0], [180, 1], [194, 2], [208, 3]] as Ponto[]) {
    t.g('c4-roupa', atraso(-i * 500), (s) => {
      s.r(x, 89, 7, 8 + (i % 2) * 3, de(['#e8d8c8', '#c84a4a', '#4a7aaa', '#e8c060'], i));
      s.r(x, 89, 7, 1, '#6a4a3a');
    });
  }
  chamine(t, 210, 92, 12, 0);
  chamine(t, 262, 82, 14, -1800);
  chamine(t, 40, 88, 12, -900);
  // bandeirola do Censor no mastro de um telhado
  t.r(300, 66, 1, 30, '#2a1420');
  bandeiraOlho(t, 301, 66, 12, 10, 1, -200);

  // pássaros voltando para casa
  passaro(t, -10, 30, '#2a1a2a', 0, 22);
  passaro(t, 20, 38, '#2a1a2a', -5000, 24);
  passaro(t, 4, 26, '#2a1a2a', -11000, 20);
  passaro(t, -20, 46, '#3a2236', -15000, 26);
  passaro(t, 10, 52, '#3a2236', -8000, 23);

  // telhado da frente (onde os personagens andam)
  t.r(0, 134, 290, 4, '#8a3a22');
  t.r(0, 134, 290, 1, '#e8905a');
  for (let x = 4; x < 290; x += 12) t.r(x, 133, 6, 2, '#a04a2a');
  t.r(0, 138, 290, 42, 'url(#c4-telha)');
  t.r(0, 138, 290, 42, '#ffb070', 0.12);
  t.r(0, 170, 290, 10, '#3a1420', 0.25);
  // vão entre os prédios (cuidado!)
  t.r(290, 128, 14, 52, '#1a0c18');
  t.r(290, 128, 1, 52, '#3a1a2a');
  t.r(295, 172, 4, 4, '#ffb860');
  halo(t, 297, 174, 10, '#ffb860', 0.12, 'c4-pulsar', atraso(-700));
  t.r(304, 130, 16, 4, '#8a3a22');
  t.r(304, 130, 16, 1, '#e8905a');
  t.r(304, 134, 16, 46, 'url(#c4-telha)');
  // chaminé grande na frente, à esquerda
  t.r(8, 104, 18, 32, '#9a5040');
  t.r(8, 104, 4, 32, '#c87050');
  t.r(22, 104, 4, 32, '#6a3028');
  for (let y = 108; y < 136; y += 6) t.r(8, y, 18, 1, '#6a3028');
  t.r(6, 100, 22, 5, '#5a2a24');
  t.r(10, 100, 14, 1, '#1a0c10');
  fumaca(t, 17, 96, 6, ['#9a8898', '#8a7a8a', '#aa98a6'], 4, 'c4-fumaca', 6, -300);
  // vaso com planta e um gato no cume
  t.r(250, 126, 10, 8, '#b85a2e');
  t.r(248, 120, 14, 6, '#4a7a3a');
  t.r(252, 117, 6, 3, '#5a8a40');
  t.r(270, 126, 10, 8, '#2a1a22');
  t.r(278, 122, 5, 5, '#2a1a22');
  t.r(278, 120, 1, 2, '#2a1a22');
  t.r(282, 120, 1, 2, '#2a1a22');
  t.r(280, 124, 1, 1, '#f0d040');
  t.g('c4-balancar', { animationDuration: '2s' }, (s) => {
    s.r(268, 118, 2, 10, '#2a1a22');
  });
  pombo(t, 60, 131, -1500);
  return <>{t.itens}</>;
}

/* ------------------------------------------------------------------ */
/* Cloaca Maxima: o esgoto                                             */
/* ------------------------------------------------------------------ */

/** Gota caindo do cano até o canal (30 px), com a ondinha quando bate. */
function goteira(t: Pincel, x: number, y: number, atrasoMs: number): void {
  t.ra(x, y, 1, 2, '#a8d8a0', 'c4-gota', atraso(atrasoMs));
  t.ra(x - 3, y + 31, 7, 1, '#a8d8a0', 'c4-ondinha', atraso(atrasoMs));
}

/** Par de olhos brilhando no escuro (ratos, ou coisa pior). */
function olhosEscuro(t: Pincel, x: number, y: number, cor: string, atrasoMs: number): void {
  t.g('c4-piscar', atraso(atrasoMs), (s) => {
    s.r(x, y, 2, 1, cor);
    s.r(x + 4, y, 2, 1, cor);
  });
}

function suburaEsgoto(): JSX.Element {
  const t = pincel();
  padrao(t, 'c4-tijolo', 12, 8, (s) => {
    s.r(0, 0, 12, 8, '#1e1a14');
    s.r(0, 0, 11, 3, '#4a3e2e');
    s.r(0, 0, 11, 1, '#5a4c38');
    s.r(0, 4, 5, 3, '#443828');
    s.r(6, 4, 6, 3, '#4a3e2e');
    s.r(6, 4, 6, 1, '#5a4c38');
  });
  padrao(t, 'c4-laje-esgoto', 20, 10, (s) => {
    s.r(0, 0, 20, 10, '#2a2620');
    s.r(0, 0, 19, 4, '#4a443a');
    s.r(0, 0, 19, 1, '#5e5648');
    s.r(0, 5, 9, 4, '#443e34');
    s.r(10, 5, 10, 4, '#4a443a');
  });

  // parede de tijolos do fundo
  t.r(0, 0, 320, 106, 'url(#c4-tijolo)');
  // abóbada: escuridão fora da curva e a nervura de pedra na borda
  for (let dy = 0; dy < 64; dy += 4) {
    const meio = Math.round(170 * Math.sqrt(Math.max(0, 1 - ((64 - dy - 2) / 64) ** 2)));
    const esq = 160 - meio;
    if (esq > 0) {
      t.r(0, dy, esq, 4, '#0a0c0a');
      t.r(320 - esq, dy, esq, 4, '#0a0c0a');
    }
    t.r(Math.max(0, esq - 4), dy, 4, 4, '#6a5c48');
    t.r(Math.min(316, 316 - esq + 4), dy, 4, 4, '#6a5c48');
  }
  // sombra geral (só a luz das grades ilumina)
  t.r(0, 0, 320, 106, '#0a120c', 0.45);

  // túneis laterais escuros, com olhos brilhando
  arco(t, 64, 42, 26, 38, '#060806');
  arco(t, 256, 42, 26, 38, '#060806');
  for (const cx of [64, 256]) {
    for (let dy = 0; dy < 26; dy += 4) {
      const m = Math.round(Math.sqrt(Math.max(0, 30 * 30 - (30 - dy - 2) ** 2)));
      t.r(cx - m, 38 + dy, 4, 4, '#6a5c48');
      t.r(cx + m - 4, 38 + dy, 4, 4, '#6a5c48');
    }
    t.r(cx - 30, 64, 4, 42, '#6a5c48');
    t.r(cx + 26, 64, 4, 42, '#6a5c48');
    t.r(cx - 3, 38, 6, 6, '#7a6c56');
  }
  olhosEscuro(t, 56, 84, '#f0e040', 0);
  olhosEscuro(t, 70, 92, '#f0e040', -1700);
  olhosEscuro(t, 250, 80, '#ff4030', -900);
  olhosEscuro(t, 262, 94, '#f0e040', -3100);

  // canos de bronze pela parede, com registro e gotas
  t.r(0, 82, 34, 5, '#6a5428');
  t.r(94, 82, 132, 5, '#6a5428');
  t.r(286, 82, 34, 5, '#6a5428');
  t.r(94, 82, 132, 1, '#a08440');
  t.r(0, 82, 34, 1, '#a08440');
  t.r(286, 82, 34, 1, '#a08440');
  for (const x of [20, 120, 180, 300]) t.r(x, 80, 4, 9, '#4a3a1a');
  t.r(150, 72, 2, 10, '#4a3a1a');
  t.r(144, 70, 14, 3, '#a8341a');
  t.r(150, 68, 2, 7, '#a8341a');
  t.r(206, 87, 5, 18, '#6a5428');
  t.r(206, 87, 1, 18, '#a08440');
  goteira(t, 40, 88, 0);
  goteira(t, 132, 88, -900);
  goteira(t, 230, 88, -1600);
  goteira(t, 296, 88, -400);
  // olho de vigia do Censor preso no cano
  t.r(162, 76, 12, 8, '#5a4a28');
  t.r(161, 77, 14, 6, '#5a4a28');
  t.r(165, 78, 6, 4, '#1a0a08');
  t.ra(167, 79, 2, 2, '#ff2a1a', 'c4-olho');
  halo(t, 168, 80, 8, '#ff2a1a', 0.08, 'c4-olho');
  // musgo e limo escorrendo
  for (let i = 0; i < 12; i++) {
    const x = entre(i * 11 + 5, 2, 314);
    t.r(x, 88 + entre(i * 3 + 1, 0, 6), 2, entre(i * 5 + 2, 3, 10), i % 2 ? '#2e5a2a' : '#3a6a30');
  }
  // escada de ferro subindo para a grade
  t.r(192, 14, 2, 92, '#3a3a40');
  t.r(202, 14, 2, 92, '#3a3a40');
  for (let y = 18; y < 104; y += 8) t.r(192, y, 12, 1, '#5a5a64');
  // grades no teto e a luz do dia entrando
  for (const [gx, d] of [[112, 0], [190, -1500]] as Ponto[]) {
    t.r(gx - 2, 6, 24, 8, '#1a1a1c');
    t.r(gx, 8, 20, 4, '#e8f0c8');
    for (let x = gx + 2; x < gx + 20; x += 4) t.r(x, 8, 1, 4, '#2a2a2e');
    t.g('c4-feixe', atraso(d), (s) => {
      s.r(gx, 14, 20, 30, '#e0f0c0', 0.1);
      s.r(gx - 4, 44, 28, 36, '#e0f0c0', 0.08);
      s.r(gx - 8, 80, 36, 36, '#e0f0c0', 0.06);
      s.r(gx - 12, 116, 44, 22, '#e0f0c0', 0.08);
    });
  }

  // passarela do fundo
  t.r(0, 104, 320, 4, '#5a5448');
  t.r(0, 104, 320, 1, '#7a7262');
  t.r(0, 108, 320, 8, '#2e2a24');
  for (let x = 6; x < 320; x += 20) t.r(x, 108, 1, 8, '#1e1a16');
  // rato andando na passarela
  t.g('c4-rato', undefined, (s) => {
    s.r(86, 100, 7, 4, '#4a4048');
    s.r(92, 101, 3, 3, '#5a5058');
    s.r(94, 102, 1, 1, '#ff4030');
    s.r(80, 103, 6, 1, '#7a6a6a');
  });

  // canal de água esverdeada correndo
  t.r(0, 116, 320, 22, '#24402c');
  t.r(0, 116, 320, 3, '#14261a');
  t.r(0, 124, 320, 6, '#2c4c32');
  t.r(0, 132, 320, 6, '#20382a');
  t.g('c4-correnteza', undefined, (s) => {
    for (let x = -24; x < 336; x += 12) {
      const y = 120 + ((x + 24) % 36 === 0 ? 0 : (x + 24) % 36 === 12 ? 6 : 12);
      s.r(x, y, 6, 1, '#5a8a50');
      s.r(x + 3, y + 3, 3, 1, '#3e6a40');
    }
  });
  // reflexo das grades na água
  t.ra(108, 126, 28, 2, '#c8e8a8', 'c4-agua');
  t.ra(184, 126, 32, 2, '#c8e8a8', 'c4-agua', atraso(-900));
  // coisas boiando (com a correnteza)
  t.g('c4-boiando', undefined, (s) => {
    s.r(40, 127, 8, 2, '#6a5030');
    s.r(170, 121, 4, 3, '#8a8a70');
  });

  // passarela da frente (onde os personagens andam)
  t.r(0, 138, 320, 42, 'url(#c4-laje-esgoto)');
  t.r(0, 138, 320, 3, '#7a7262');
  t.r(0, 141, 320, 1, '#2a2620');
  t.r(0, 160, 320, 20, '#0a0c0a', 0.3);
  // poças com o brilho da luz
  t.r(104, 150, 34, 3, '#2a4030');
  t.ra(110, 151, 16, 1, '#a8d0a0', 'c4-agua', atraso(-300));
  t.r(214, 164, 26, 3, '#2a4030');
  t.ra(218, 165, 12, 1, '#a8d0a0', 'c4-agua', atraso(-1200));
  // corrente velha e uma argola na parede de pedra
  for (let k = 0; k < 6; k++) t.r(10 + k * 4, 146, 3, k % 2 ? 1 : 3, '#5a5a62');
  barril(t, 290, 124);
  t.r(290, 132, 12, 1, '#3a6a30');
  t.r(276, 132, 10, 6, '#3a3a40');
  t.r(277, 133, 8, 1, '#5a5a64');
  return <>{t.itens}</>;
}

/* ------------------------------------------------------------------ */
/* O cofre do Cobrador                                                 */
/* ------------------------------------------------------------------ */

/** Monte de moedas; cx é o meio, y a base (chão) e larg a metade da largura. */
function monteMoedas(t: Pincel, cx: number, y: number, larg: number): void {
  for (let k = 0; k < larg; k += 3) {
    const w = (larg - k) * 2;
    t.r(cx - larg + k, y - k - 3, w, 3, k % 2 ? '#d8a830' : '#c89020');
    t.r(cx - larg + k, y - k - 3, w, 1, '#f8d860');
    t.r(cx - larg + k + 2, y - k - 2, 2, 1, '#8a5a10');
  }
}

/** Saco de moedas amarrado; (x, y) é o canto de cima. */
function saco(t: Pincel, x: number, y: number): void {
  t.r(x + 1, y + 4, 12, 10, '#8a6a40');
  t.r(x, y + 6, 14, 7, '#8a6a40');
  t.r(x + 4, y + 1, 6, 3, '#8a6a40');
  t.r(x + 3, y, 8, 2, '#a8865a');
  t.r(x + 4, y + 3, 6, 1, '#c8302a');
  t.r(x + 2, y + 6, 2, 6, '#a8865a');
  t.r(x + 11, y + 6, 3, 7, '#5a4428');
  t.r(x + 5, y + 8, 4, 3, '#e0b048');
  t.r(x + 6, y + 9, 2, 1, '#8a5a10');
}

function cofreCobrador(): JSX.Element {
  const t = pincel();
  padrao(t, 'c4-laje-cofre', 24, 12, (s) => {
    s.r(0, 0, 24, 12, '#1e160e');
    s.r(0, 0, 23, 5, '#3a2c1c');
    s.r(0, 0, 23, 1, '#5a4428');
    s.r(0, 6, 11, 5, '#34281a');
    s.r(12, 6, 12, 5, '#3a2c1c');
    s.r(12, 6, 12, 1, '#5a4428');
  });

  // paredes de pedra escura com pilastras de latão
  t.r(0, 0, 320, 136, '#2a2018');
  for (let y = 6; y < 136; y += 10) t.r(0, y, 320, 1, '#1e160e');
  for (let i = 0; i < 18; i++) t.r(entre(i * 7 + 2, 0, 316), 7 + entre(i * 3 + 9, 0, 12) * 10, 1, 9, '#1e160e');
  for (const x of [92, 222]) {
    t.r(x, 0, 8, 136, '#8a6a2a');
    t.r(x, 0, 2, 136, '#c89a3a');
    t.r(x + 6, 0, 2, 136, '#5a4018');
    t.r(x - 2, 128, 12, 8, '#a07a2a');
  }
  // brilho do ouro no ar
  halo(t, 160, 72, 90, '#ffc040', 0.05, 'c4-pulsar');

  // porta redonda gigante do cofre
  disco(t, 160, 72, 52, '#3a2a12', 4);
  disco(t, 160, 72, 48, '#b8862a', 4);
  disco(t, 160, 72, 42, '#9a6e20', 4);
  disco(t, 160, 72, 30, '#a87a24', 4);
  t.r(112, 70, 96, 4, '#d8a840');
  t.r(158, 24, 4, 96, '#d8a840');
  // rebites em volta
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2;
    t.r(160 + Math.round(Math.cos(a) * 45) - 1, 72 + Math.round(Math.sin(a) * 45) - 1, 2, 2, '#f0c860');
  }
  // trancas de bronze
  for (const [dx, dy] of [[0, -36], [26, -26], [36, 0], [26, 26], [0, 36], [-26, 26], [-36, 0], [-26, -26]] as Ponto[]) {
    t.r(160 + dx - 3, 72 + dy - 3, 6, 6, '#e0b048');
    t.r(160 + dx - 1, 72 + dy - 1, 2, 2, '#5a4018');
  }
  // dobradiças
  t.r(206, 44, 10, 8, '#6a4a18');
  t.r(206, 92, 10, 8, '#6a4a18');
  t.r(206, 44, 10, 1, '#c89a3a');
  t.r(206, 92, 10, 1, '#c89a3a');
  // volante girando em volta do olho do Censor
  t.g('c4-gira', { transformOrigin: '160px 72px', animationDuration: '24s' }, (s) => {
    s.r(142, 71, 36, 2, '#f0c860');
    s.r(159, 54, 2, 36, '#f0c860');
    for (const [dx, dy] of [[-13, -13], [12, -13], [-13, 12], [12, 12]] as Ponto[]) s.r(160 + dx, 72 + dy, 2, 2, '#f0c860');
    for (const [dx, dy] of [[-18, -2], [16, -2], [-2, -18], [-2, 16]] as Ponto[]) s.r(160 + dx, 72 + dy, 4, 4, '#fff0a0');
  });
  disco(t, 160, 72, 10, '#5a4018');
  olho(t, 160, 72, 1, 0);

  // engrenagens na parede
  engrenagem(t, 236, 34, 9, '#a07a2a', '#3a2a12', 10, false);
  engrenagem(t, 252, 48, 6, '#c89a3a', '#3a2a12', 7, true);
  engrenagem(t, 76, 30, 7, '#a07a2a', '#3a2a12', 9, true);
  t.r(258, 48, 62, 3, '#6a5428');
  t.r(258, 48, 62, 1, '#a08440');

  // ábaco na parede da esquerda
  t.r(14, 24, 48, 3, '#5a3a1e');
  t.r(14, 53, 48, 3, '#5a3a1e');
  t.r(14, 24, 3, 32, '#5a3a1e');
  t.r(59, 24, 3, 32, '#5a3a1e');
  for (let i = 0; i < 5; i++) {
    const y = 29 + i * 5;
    t.r(17, y, 42, 1, '#c89a3a');
    const n = entre(i * 9 + 4, 2, 5);
    for (let k = 0; k < n; k++) t.r(18 + k * 4, y - 1, 3, 3, k % 2 ? '#c83a2a' : '#e8d8b0');
    t.r(52, y - 1, 3, 3, '#3a6a9a');
  }

  // estante de livros-caixa à direita
  t.r(240, 58, 74, 4, '#5a3a1e');
  for (const y of [82, 106, 130]) {
    t.r(240, y, 74, 3, '#6a4424');
    t.r(240, y, 74, 1, '#9a6a3a');
  }
  t.r(240, 58, 3, 78, '#4a2e18');
  t.r(311, 58, 3, 78, '#4a2e18');
  const capas = ['#7a2a1e', '#2a4a6a', '#5a3a1e', '#3a5a2a', '#8a6a2a', '#6a2a4a'];
  for (const y of [82, 106, 130]) {
    let x = 244;
    let i = y;
    while (x < 306) {
      const w = entre(i, 3, 5);
      const h = entre(i + 3, 14, 19);
      if (x + w > 310) break;
      t.r(x, y - h, w, h, de(capas, i));
      t.r(x, y - h + 3, w, 1, '#d8a840');
      x += w + 1;
      i += 7;
    }
  }
  // rolos de pergaminho no topo da estante
  t.r(246, 52, 20, 4, '#d8c8a0');
  t.r(252, 48, 18, 4, '#e8d8b0');
  t.r(266, 52, 2, 4, '#a89870');

  // mesa com a balança de bronze, à esquerda
  t.r(16, 106, 74, 4, '#6a4424');
  t.r(16, 106, 74, 1, '#9a6a3a');
  t.r(20, 110, 4, 26, '#4a2e18');
  t.r(82, 110, 4, 26, '#4a2e18');
  t.r(50, 70, 4, 36, '#b8862a');
  t.r(50, 70, 1, 36, '#e0b048');
  t.r(44, 102, 16, 4, '#a07a2a');
  linha(t, 28, 74, 76, 70, '#d8a840', 2);
  t.r(50, 66, 4, 4, '#e0b048');
  linha(t, 30, 75, 24, 92, '#8a6a2a');
  linha(t, 30, 75, 36, 92, '#8a6a2a');
  linha(t, 74, 71, 68, 88, '#8a6a2a');
  linha(t, 74, 71, 80, 88, '#8a6a2a');
  t.r(22, 92, 16, 3, '#c89a3a');
  t.r(66, 88, 16, 3, '#c89a3a');
  t.r(26, 89, 8, 3, '#f0c860');
  t.r(28, 87, 4, 2, '#f0c860');
  t.r(70, 86, 8, 2, '#e8e0d0');
  // livro-caixa aberto na mesa
  t.r(58, 100, 22, 6, '#e8d8b0');
  t.r(68, 100, 2, 6, '#a89870');
  for (const y of [101, 103]) {
    t.r(60, y, 7, 1, '#5a4a3a');
    t.r(71, y, 7, 1, '#5a4a3a');
  }

  // chão de pedra com o reflexo dourado
  t.r(0, 136, 320, 44, 'url(#c4-laje-cofre)');
  t.r(0, 136, 320, 2, '#6a5030');
  t.r(108, 136, 104, 44, '#ffc040', 0.08);
  t.r(130, 136, 60, 44, '#ffc040', 0.06);

  // montes de moedas e sacos (nas beiradas, longe do centro)
  monteMoedas(t, 30, 150, 24);
  monteMoedas(t, 56, 146, 15);
  monteMoedas(t, 290, 152, 27);
  monteMoedas(t, 262, 146, 12);
  saco(t, 72, 136);
  saco(t, 4, 156);
  saco(t, 236, 138);
  saco(t, 300, 160);
  for (let i = 0; i < 14; i++) {
    const x = entre(i * 17 + 3, 6, 314);
    const y = entre(i * 5 + 8, 160, 176);
    t.r(x, y, 3, 2, '#e0b048');
    t.r(x, y, 3, 1, '#f8d860');
  }
  // brilhos nas moedas
  const brilhos: Ponto[] = [[22, 130], [36, 138], [58, 134], [284, 128], [298, 140], [264, 138], [80, 142], [242, 146], [168, 68], [34, 90], [12, 166], [306, 168]];
  brilhos.forEach(([x, y], i) => brilho(t, x, y, '#fff8d0', -i * 470));
  return <>{t.itens}</>;
}

/* ------------------------------------------------------------------ */
/* A enseada da frota fantasma, à noite                                */
/* ------------------------------------------------------------------ */

/**
 * Navio velho remendado da frota fantasma, boiando.
 * (x, y) é o canto esquerdo da linha d'água, w o comprimento do casco e mastro a altura do mastro.
 */
function navio(t: Pincel, x: number, y: number, w: number, mastro: number, casco: string, vela: string, atrasoMs: number): void {
  t.g('c4-boiar', atraso(atrasoMs), (s) => {
    s.r(x, y - 4, w, 4, casco);
    s.r(x - 3, y - 8, w + 6, 4, casco);
    s.r(x - 6, y - 12, w + 10, 4, casco);
    s.r(x - 9, y - 16, 12, 4, casco);
    s.r(x + w - 8, y - 20, 14, 8, casco);
    s.r(x - 6, y - 12, w + 10, 1, '#4a4a5a');
    s.r(x + w - 8, y - 20, 14, 1, '#4a4a5a');
    for (let k = x + 4; k < x + w - 10; k += 8) s.r(k, y - 9, 3, 2, '#0a0a12');
    s.r(x + w - 6, y - 17, 2, 2, '#ffc860');
    s.r(x + w - 2, y - 17, 2, 2, '#ffc860');
    // remendos no casco
    s.r(x + 8, y - 6, 6, 3, '#3a3020');
    s.r(x + w - 20, y - 7, 5, 3, '#2a3a3a');
    const mastros = w > 50 ? [x + Math.floor(w / 3), x + Math.floor((w * 2) / 3)] : [x + Math.floor(w / 2)];
    mastros.forEach((mx, i) => {
      const alto = mastro - i * 8;
      s.r(mx, y - 12 - alto, 2, alto, '#14141c');
      s.r(mx - 12, y - 12 - alto + 4, 26, 1, '#14141c');
      // vela rasgada e remendada
      s.r(mx - 10, y - 12 - alto + 5, 22, Math.floor(alto / 2), vela);
      s.r(mx - 6, y - 12 - alto + 8, 6, 5, '#5a5040');
      s.r(mx + 4, y - 12 - alto + 12, 5, 4, '#3a4050');
      s.r(mx + 8, y - 12 - alto + 5 + Math.floor(alto / 2) - 4, 4, 4, '#0e1428');
      linha(s, mx + 1, y - 12 - alto, x - 9, y - 16, '#22222c');
    });
    halo(s, x + w + 4, y - 24, 12, '#ffc060', 0.1, 'c4-pulsar', atraso(atrasoMs));
    s.r(x + w + 3, y - 26, 3, 4, '#ffd070');
  });
}

function frotaNoite(): JSX.Element {
  const t = pincel();
  padrao(t, 'c4-tabua', 24, 8, (s) => {
    s.r(0, 0, 24, 8, '#3a2618');
    s.r(0, 0, 23, 7, '#5a4030');
    s.r(0, 0, 23, 1, '#7a5a40');
    s.r(4, 3, 2, 1, '#3a2618');
    s.r(16, 4, 3, 1, '#4a3222');
  });

  ceu(t, ['#060a1c', '#0a1028', '#0e1634', '#141e40', '#1a284c'], 0, 100);
  // estrelas
  for (const fase of [0, 1]) {
    t.g('c4-estrela', atraso(fase * -1500), (s) => {
      for (let i = fase; i < 34; i += 2) {
        s.r(entre(i * 13 + 2, 2, 318), entre(i * 7 + 5, 4, 70), 1, 1, i % 5 ? '#c8d4f0' : '#fff8d0');
      }
    });
  }
  // lua
  halo(t, 244, 34, 34, '#d8e0ff', 0.06, 'c4-pulsar');
  disco(t, 244, 34, 12, '#f0ecd0');
  t.r(238, 28, 4, 3, '#d0ccb0');
  t.r(246, 36, 5, 4, '#d0ccb0');
  t.r(240, 40, 3, 2, '#d0ccb0');

  // falésia do fundo
  t.r(0, 84, 320, 16, '#101626');
  for (let x = 0; x < 320; x += 16) t.r(x, 78 + entre(x, 0, 8), 16, 10, '#101626');
  // falésias dos lados
  const esq = [38, 44, 52, 60, 70, 80, 90, 98];
  esq.forEach((y, i) => {
    t.r(i * 8, y, 8, 140 - y, '#0a0c16');
    t.r(i * 8, y, 8, 1, '#2a3450');
  });
  const dir = [98, 86, 72, 60, 50, 42, 36];
  dir.forEach((y, i) => {
    t.r(264 + i * 8, y, 8, 140 - y, '#0a0c16');
    t.r(264 + i * 8, y, 8, 1, '#3a4664');
  });
  // farol em ruínas no alto da falésia da direita
  t.r(300, 20, 8, 16, '#14182a');
  t.r(298, 18, 12, 3, '#1e2438');
  t.r(302, 22, 3, 4, '#2a2010');

  // água da enseada
  t.r(64, 100, 200, 40, '#0e1a30');
  t.r(0, 112, 320, 28, '#0e1a30');
  t.r(0, 116, 320, 8, '#12223a');
  t.r(0, 128, 320, 12, '#162a44');
  // reflexo da lua
  for (let k = 0; k < 7; k++) {
    t.ra(240 - (k % 3) * 2, 102 + k * 5, 8 + (k % 2) * 4, 1, '#e8e4c8', 'c4-agua', atraso(-k * 260));
  }
  t.g('c4-onda', undefined, (s) => {
    for (let i = 0; i < 16; i++) s.r(entre(i * 19 + 1, 0, 310), entre(i * 3 + 7, 104, 136), 6, 1, '#2a4468');
  });

  // a frota fantasma
  navio(t, 150, 100, 44, 34, '#141824', '#3a3e4c', -700);
  navio(t, 72, 110, 60, 46, '#1a1e2c', '#4a4e5a', 0);
  navio(t, 214, 114, 52, 40, '#1c202e', '#50505a', -1400);
  // bote amarrado
  t.g('c4-boiar', atraso(-300), (s) => {
    s.r(30, 130, 30, 4, '#3a2a1e');
    s.r(28, 128, 34, 2, '#5a4030');
    s.r(34, 134, 22, 2, '#2a1e14');
    s.r(40, 126, 2, 2, '#5a4030');
  });
  linha(t, 60, 129, 74, 140, '#8a7a5a');

  // neblina sobre a água
  t.g('c4-neblina', undefined, (s) => {
    s.r(-20, 100, 180, 4, '#a8b4c8', 0.12);
    s.r(40, 106, 220, 5, '#a8b4c8', 0.1);
    s.r(180, 98, 160, 4, '#a8b4c8', 0.1);
  });
  t.g('c4-neblina-volta', undefined, (s) => {
    s.r(-30, 118, 200, 6, '#b8c4d8', 0.12);
    s.r(140, 124, 200, 5, '#b8c4d8', 0.1);
    s.r(20, 132, 150, 4, '#b8c4d8', 0.08);
  });

  // cais de madeira em primeiro plano
  t.r(0, 140, 320, 40, 'url(#c4-tabua)');
  t.r(0, 138, 320, 3, '#7a5a3a');
  t.r(0, 138, 320, 1, '#9a7a50');
  t.r(0, 141, 320, 2, '#1a120c');
  t.r(0, 160, 320, 20, '#060810', 0.3);
  for (const x of [74, 298]) {
    t.r(x, 118, 6, 22, '#4a3020');
    t.r(x, 118, 2, 22, '#6a4a30');
    t.r(x - 1, 116, 8, 2, '#5a3a26');
    t.r(x - 1, 124, 8, 3, '#8a7a5a');
  }
  // lampião aceso no poste da direita
  halo(t, 301, 110, 30, '#ffb04a', 0.08, 'c4-pulsar');
  t.r(296, 104, 10, 2, '#2a2a30');
  t.r(297, 106, 8, 10, '#2a2a30');
  t.r(298, 107, 6, 8, '#ffc860');
  t.ra(300, 109, 2, 5, '#fff0b0', 'c4-chama');
  // caixotes, barris e rolo de corda
  caixote(t, 6, 124, 18, 16);
  caixote(t, 10, 112, 12, 12);
  barril(t, 26, 126);
  barril(t, 262, 126);
  caixote(t, 276, 128, 16, 12);
  t.r(240, 134, 14, 6, '#8a7a5a');
  t.r(242, 132, 10, 2, '#a8986a');
  t.r(245, 135, 4, 2, '#5a4a30');
  return <>{t.itens}</>;
}

/* ------------------------------------------------------------------ */
/* Batalha no mar, à noite                                             */
/* ------------------------------------------------------------------ */

/**
 * Couraçado de ferro do Censor ao longe, de lado, atirando.
 * (x, y) é o canto esquerdo da linha d'água; atrasoMs acerta o ritmo dos tiros.
 */
function couracado(t: Pincel, x: number, y: number, w: number, atrasoMs: number): void {
  t.r(x, y - 6, w, 6, '#1a1a22');
  t.r(x + 4, y - 12, w - 8, 6, '#22222c');
  t.r(x - 6, y - 10, 8, 4, '#1a1a22');
  t.r(x + 4, y - 12, w - 8, 1, '#4a4a58');
  for (let k = x + 6; k < x + w - 6; k += 6) t.r(k, y - 4, 1, 1, '#3a3a48');
  // casario e chaminés
  t.r(x + Math.floor(w / 3), y - 22, Math.floor(w / 3), 10, '#26262e');
  t.r(x + Math.floor(w / 3), y - 22, Math.floor(w / 3), 1, '#4a4a58');
  const c1 = x + Math.floor(w / 3) + 4;
  const c2 = x + Math.floor(w / 2) + 4;
  t.r(c1, y - 32, 5, 10, '#1a1a22');
  t.r(c2, y - 30, 5, 8, '#1a1a22');
  fumaca(t, c1 + 2, y - 34, 4, ['#2a2228', '#3a2e30'], 4, 'c4-fumaca', 6, atrasoMs);
  fumaca(t, c2 + 2, y - 32, 3, ['#2a2228', '#3a2e30'], 3, 'c4-fumaca', 6, atrasoMs - 900);
  // mastro com a bandeira do Censor
  t.r(x + w - 14, y - 40, 1, 28, '#14141a');
  t.r(x + w - 13, y - 40, 8, 5, '#a8161a');
  t.ra(x + w - 10, y - 38, 2, 1, '#ffd0c0', 'c4-olho');
  // portinholas dos canhões, com clarão e fumaça
  for (let k = 0; k < 4; k++) {
    const px = x + 8 + Math.floor(((w - 16) * k) / 3);
    const d = atrasoMs - k * 700;
    t.r(px, y - 9, 3, 2, '#ff7a2a');
    t.g('c4-clarao', atraso(d), (s) => {
      s.r(px - 8, y - 14, 19, 12, '#ffb040', 0.25);
      s.r(px - 3, y - 11, 9, 6, '#ffd070');
      s.r(px - 6, y - 9, 15, 2, '#fff0b0');
      s.r(px, y - 14, 3, 12, '#fff0b0');
    });
    t.g('c4-fumaca-canhao', atraso(d), (s) => {
      s.r(px - 6, y - 16, 12, 8, '#5a4a4a');
      s.r(px - 3, y - 19, 8, 4, '#6a5a58');
    });
  }
}

function marBatalha(): JSX.Element {
  const t = pincel();
  padrao(t, 'c4-conves', 28, 8, (s) => {
    s.r(0, 0, 28, 8, '#2a1a10');
    s.r(0, 0, 27, 7, '#5a3a24');
    s.r(0, 0, 27, 1, '#7a5434');
    s.r(6, 3, 3, 1, '#3a2416');
    s.r(20, 5, 2, 1, '#3a2416');
  });

  ceu(t, ['#0a0610', '#140a14', '#1e0c16', '#2a1018', '#3a1414', '#5a1e14'], 0, 90);
  for (let i = 0; i < 14; i++) t.ra(entre(i * 11 + 4, 2, 318), entre(i * 5 + 1, 4, 34), 1, 1, '#c8c0d0', 'c4-estrela', atraso(-i * 300));
  // nuvens de fumaça da batalha
  t.g('c4-nuvem', undefined, (s) => {
    s.r(0, 40, 120, 8, '#1a1014', 0.8);
    s.r(30, 34, 70, 6, '#1a1014', 0.7);
    s.r(180, 30, 140, 10, '#1a1014', 0.8);
    s.r(210, 24, 80, 6, '#1a1014', 0.6);
    s.r(100, 56, 120, 6, '#2a1614', 0.6);
  });
  // brilho do fogo no horizonte
  t.r(0, 80, 320, 10, '#8a3a1a', 0.5);
  halo(t, 230, 86, 50, '#ff7a2a', 0.06, 'c4-pulsar');

  // couraçados do Censor
  couracado(t, 26, 92, 70, 0);
  couracado(t, 190, 90, 90, -1800);
  couracado(t, 120, 88, 44, -3100);
  // mar
  t.r(0, 90, 320, 50, '#0c1220');
  t.r(0, 100, 320, 10, '#101828');
  t.r(0, 116, 320, 24, '#141e30');
  // navio aliado em chamas, mais perto
  t.r(110, 100, 36, 6, '#2a1a12');
  t.r(106, 98, 6, 4, '#2a1a12');
  t.r(118, 74, 2, 26, '#2a1a12');
  t.r(108, 98, 40, 1, '#4a2a1a');
  t.ra(112, 92, 10, 8, '#ff7a2a', 'c4-chama');
  t.ra(124, 86, 8, 12, '#ffb040', 'c4-chama', atraso(-200));
  halo(t, 122, 92, 18, '#ff8a2a', 0.12, 'c4-pulsar', atraso(-500));
  fumaca(t, 122, 80, 5, ['#2a1e1e', '#3a2a26'], 4, 'c4-fumaca', 5, -200);
  t.ra(200, 96, 40, 1, '#ff9a4a', 'c4-agua');
  t.ra(110, 106, 30, 1, '#ff8a3a', 'c4-agua', atraso(-500));
  t.ra(40, 100, 30, 1, '#ff9a4a', 'c4-agua', atraso(-1100));
  t.g('c4-onda', undefined, (s) => {
    for (let i = 0; i < 18; i++) s.r(entre(i * 23 + 6, 0, 312), entre(i * 3 + 2, 96, 138), 8, 1, i % 3 ? '#2a3a54' : '#4a5a74');
  });
  // colunas d'água onde os tiros caem
  for (const [x, d] of [[90, 0], [250, -2600], [170, -4200]] as Ponto[]) {
    t.g('c4-respingo', atraso(d), (s) => {
      s.r(x - 2, 104, 4, 16, '#c8d8e8');
      s.r(x - 5, 112, 10, 8, '#a8bcd0');
      s.r(x - 1, 100, 2, 4, '#e8f0f8');
    });
  }

  // amurada do nosso navio
  t.r(0, 122, 320, 5, '#5a3a22');
  t.r(0, 122, 320, 1, '#8a6038');
  t.r(0, 126, 320, 1, '#2a1a10');
  for (let x = 4; x < 320; x += 14) {
    t.r(x, 127, 4, 13, '#4a2e1a');
    t.r(x, 127, 1, 13, '#6a4428');
  }
  t.r(0, 138, 320, 3, '#3a2416');
  // convés
  t.r(0, 140, 320, 40, 'url(#c4-conves)');
  t.r(0, 141, 320, 2, '#1a100a');
  t.r(0, 166, 320, 14, '#0a0608', 0.3);
  t.r(0, 140, 320, 40, '#ff7a2a', 0.05);

  // canhão de bronze à esquerda, apontado para o mar
  t.r(14, 112, 48, 10, '#8a6a2a');
  t.r(14, 112, 48, 2, '#c89a3a');
  t.r(14, 120, 48, 2, '#5a4018');
  t.r(60, 110, 6, 14, '#a07a2a');
  t.r(8, 114, 6, 6, '#6a4a18');
  t.r(4, 116, 4, 2, '#6a4a18');
  t.r(26, 112, 3, 10, '#5a4018');
  t.r(44, 112, 3, 10, '#5a4018');
  t.r(12, 122, 44, 12, '#5a3a22');
  t.r(12, 122, 44, 1, '#7a5432');
  disco(t, 20, 140, 6, '#3a2416');
  disco(t, 48, 140, 6, '#3a2416');
  t.r(18, 138, 4, 4, '#a07a2a');
  t.r(46, 138, 4, 4, '#a07a2a');
  // fumacinha do pavio aceso
  fumaca(t, 6, 110, 3, ['#8a8088', '#6a6068'], 2, 'c4-vapor', 2.4, 0);
  t.ra(5, 112, 2, 2, '#ffb040', 'c4-chama');
  // balas empilhadas e balde
  for (const [x, y] of [[284, 150], [292, 150], [300, 150], [288, 145], [296, 145], [292, 140]] as Ponto[]) {
    disco(t, x, y, 4, '#22222a');
    t.r(x - 2, y - 3, 2, 1, '#5a5a6a');
  }
  t.r(264, 144, 12, 12, '#6a4428');
  t.r(264, 144, 12, 2, '#3a3a44');
  t.r(266, 146, 8, 1, '#4a6a8a');
  // lanterna no mastro da direita
  t.r(312, 60, 4, 62, '#3a2416');
  t.r(306, 91, 8, 1, '#3a2416');
  lanterna(t, 306, 92, 3, '#ffb848', 0.07, -400);
  return <>{t.itens}</>;
}

/* ------------------------------------------------------------------ */
/* O Coliseu inundado para a naumaquia                                 */
/* ------------------------------------------------------------------ */

/** Barquinho de batalha na arena alagada; (x, y) é a linha d'água, à esquerda. */
function barco(t: Pincel, x: number, y: number, vela: string, atrasoMs: number): void {
  t.g('c4-boiar', atraso(atrasoMs), (s) => {
    s.r(x, y - 4, 40, 4, '#5a3a22');
    s.r(x - 3, y - 6, 46, 2, '#7a5432');
    s.r(x - 5, y - 9, 5, 3, '#7a5432');
    s.r(x + 20, y - 26, 2, 20, '#3a2416');
    s.r(x + 12, y - 24, 18, 12, vela);
    s.r(x + 12, y - 24, 18, 1, '#f0e0c0');
    for (let k = 0; k < 4; k++) {
      s.r(x + 4 + k * 8, y - 10, 3, 4, de(['#d8a070', '#c08a60', '#e0b088'], k));
      linha(s, x + 5 + k * 8, y - 2, x + 1 + k * 8, y + 3, '#a07a4a');
    }
  });
}

function coliseuInundado(): JSX.Element {
  const t = pincel();
  padrao(t, 'c4-povo-a', 10, 10, (s) => {
    s.r(0, 0, 10, 10, '#a89474');
    s.r(1, 0, 3, 3, '#e0b088');
    s.r(0, 3, 5, 7, '#b83a2a');
    s.r(6, 1, 3, 3, '#c08a60');
    s.r(5, 4, 5, 6, '#e8e0d0');
  });
  padrao(t, 'c4-povo-b', 10, 10, (s) => {
    s.r(0, 0, 10, 10, '#9a8668');
    s.r(2, 1, 3, 3, '#8a5a3a');
    s.r(1, 4, 5, 6, '#3a6a9a');
    s.r(6, 0, 3, 3, '#f0c8a0');
    s.r(5, 3, 5, 7, '#c8a050');
  });

  // céu e sol
  ceu(t, ['#5aa8e0', '#78bce8', '#98ceee'], 0, 18);
  halo(t, 290, 4, 30, '#fff4c0', 0.1, 'c4-pulsar');
  // ático com arcos abertos para o céu e os mastros do velário
  t.r(0, 14, 320, 16, '#c8b490');
  t.r(0, 14, 320, 2, '#e8d8b0');
  for (let x = 6; x < 320; x += 16) {
    t.r(x, 18, 8, 10, '#98ceee');
    t.r(x, 18, 8, 2, '#78bce8');
    t.r(x + 11, 6, 2, 12, '#7a5a3a');
  }
  // velário (toldo de lona) nas pontas
  t.r(0, 0, 60, 6, '#e8dcc0');
  for (let x = 0; x < 60; x += 12) t.r(x, 0, 6, 6, '#c84a3a');
  t.r(260, 0, 60, 6, '#e8dcc0');
  for (let x = 260; x < 320; x += 12) t.r(x, 0, 6, 6, '#c84a3a');

  // arquibancadas lotadas (cada fileira balança num tempo)
  const fileiras: (readonly [number, string])[] = [
    [30, 'url(#c4-povo-a)'],
    [42, 'url(#c4-povo-b)'],
    [54, 'url(#c4-povo-a)'],
    [66, 'url(#c4-povo-b)'],
    [78, 'url(#c4-povo-a)'],
  ];
  fileiras.forEach(([y, f], i) => {
    t.r(0, y, 320, 12, '#8a7656');
    t.g('c4-multidao', atraso(-i * 350), (s) => s.r(0, y, 320, 10, f));
    t.r(0, y + 10, 320, 2, '#d8c8a0');
  });
  // sombra do velário nas fileiras de cima
  t.r(0, 30, 70, 24, '#2a1a10', 0.18);
  t.r(250, 30, 70, 24, '#2a1a10', 0.18);
  // panos e bandeirinhas acenando na plateia
  for (let i = 0; i < 10; i++) {
    const x = entre(i * 29 + 3, 4, 314);
    if (x > 124 && x < 196) continue;
    const y = 28 + entre(i * 3 + 1, 0, 4) * 12;
    t.ra(x, y, 3, 3, i % 3 ? '#f8f0e0' : '#e0b030', 'c4-aceno', atraso(-i * 260));
  }

  // camarote do Censor
  t.r(128, 26, 64, 66, '#e8dcc4');
  t.r(128, 26, 64, 2, '#fff4e0');
  t.r(124, 30, 72, 8, '#a8161a');
  t.r(124, 30, 72, 2, '#d8a83a');
  for (let x = 126; x < 196; x += 6) t.r(x, 38, 3, 2, '#d8a83a');
  t.r(132, 40, 4, 22, '#d8c8a8');
  t.r(184, 40, 4, 22, '#d8c8a8');
  t.r(136, 40, 48, 22, '#3a1010');
  // trono com a tela do olho
  t.r(150, 42, 20, 18, '#6a1a1a');
  t.r(148, 40, 24, 3, '#d8a83a');
  halo(t, 160, 50, 16, '#ff3a2a', 0.1, 'c4-olho');
  olho(t, 160, 50, 1, 0);
  t.r(128, 62, 64, 4, '#c8b490');
  t.r(128, 62, 64, 1, '#fff4e0');
  t.r(132, 66, 56, 26, '#d8c8a8');
  bandeiraOlho(t, 136, 66, 14, 18, 1, 0);
  bandeiraOlho(t, 170, 66, 14, 18, 1, -800);
  // estandartes compridos no muro do pódio
  for (const [x, d] of [[34, -400], [270, -1200]] as Ponto[]) {
    t.r(x - 2, 64, 18, 2, '#b8862a');
    bandeiraOlho(t, x, 66, 14, 20, 1, d);
  }

  // muro do pódio com portões meio afundados
  t.r(0, 90, 320, 12, '#d8cca8');
  t.r(0, 90, 320, 2, '#f0e4c4');
  for (let x = 10; x < 320; x += 40) {
    t.r(x, 94, 10, 8, '#1a2a30');
    t.r(x + 1, 93, 8, 1, '#1a2a30');
    t.r(x + 20, 95, 8, 3, '#b8862a');
  }

  // água da arena
  t.r(0, 102, 320, 36, '#2a7a8a');
  t.r(0, 102, 320, 3, '#1e5a6a');
  t.r(0, 112, 320, 10, '#3a8a9a');
  t.r(0, 126, 320, 12, '#3a94a2');
  t.g('c4-onda', undefined, (s) => {
    for (let i = 0; i < 20; i++) s.r(entre(i * 17 + 9, 0, 312), entre(i * 7 + 3, 106, 136), 7, 1, i % 2 ? '#8ad0d8' : '#6ab8c4');
  });
  for (let i = 0; i < 8; i++) brilho(t, entre(i * 31 + 7, 8, 312), entre(i * 13 + 2, 108, 134), '#ffffff', -i * 520);
  // luz do sol caindo na arena
  t.g('c4-feixe', undefined, (s) => {
    s.r(220, 18, 40, 120, '#fff8d0', 0.06);
    s.r(236, 18, 18, 120, '#fff8d0', 0.06);
  });
  // barcos e jangada lutando ao fundo
  barco(t, 28, 118, '#a8161a', 0);
  barco(t, 246, 116, '#3a6aaa', -1100);
  t.g('c4-boiar', atraso(-600), (s) => {
    s.r(146, 106, 30, 3, '#7a5432');
    s.r(150, 98, 3, 8, '#3a2a20');
    s.r(158, 97, 3, 9, '#5a3a2a');
    s.r(166, 99, 3, 7, '#3a2a20');
    s.r(160, 94, 1, 4, '#c8c8d0');
  });
  t.r(100, 124, 8, 2, '#7a5432');
  t.r(212, 130, 6, 2, '#7a5432');

  // nossa jangada em primeiro plano (personagens em pé aqui)
  t.r(0, 136, 320, 6, '#3a94a2');
  t.ra(10, 138, 20, 1, '#c8ecf0', 'c4-agua');
  t.ra(290, 139, 18, 1, '#c8ecf0', 'c4-agua', atraso(-700));
  for (let y = 140; y < 180; y += 6) {
    t.r(4, y, 312, 6, '#8a5a30');
    t.r(4, y, 312, 1, '#b07a44');
    t.r(4, y + 5, 312, 1, '#4a2e18');
    t.r(2, y, 4, 6, '#c89a60');
    t.r(314, y, 4, 6, '#c89a60');
    t.r(3, y + 2, 2, 2, '#7a5432');
    t.r(315, y + 2, 2, 2, '#7a5432');
  }
  for (const x of [40, 160, 280]) {
    t.r(x, 140, 3, 40, '#d8c08a');
    for (let y = 142; y < 180; y += 6) t.r(x - 1, y, 5, 2, '#b8a070');
  }
  // mastro com o nosso estandarte azul e dourado
  t.r(300, 90, 3, 50, '#4a2e18');
  t.r(300, 90, 1, 50, '#7a5432');
  t.g('c4-bandeira', undefined, (s) => {
    s.r(303, 92, 14, 10, '#2a5aaa');
    s.r(303, 92, 14, 2, '#e0b030');
    s.r(308, 96, 4, 3, '#e0b030');
  });
  // escudos, barril e lanças
  barril(t, 8, 128);
  disco(t, 34, 134, 6, '#a8161a');
  disco(t, 34, 134, 3, '#d8a83a');
  for (const x of [268, 274, 280]) {
    t.r(x, 104, 1, 36, '#6a4a2a');
    t.r(x - 1, 102, 3, 3, '#c8c8d0');
  }
  t.r(264, 132, 22, 3, '#5a3a22');
  t.r(0, 166, 320, 14, '#0a2a30', 0.2);
  return <>{t.itens}</>;
}
