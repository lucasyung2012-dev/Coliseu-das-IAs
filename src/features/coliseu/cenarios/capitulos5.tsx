/**
 * Cenários do quinto bloco de capítulos do modo História (Coliseu), em pixel art de 320 × 180:
 * o caminho do Helios, a IA misteriosa que observa as estrelas. O Grande Observatório à noite (em paz
 * e sob ataque dos drones do Censor), os telhados de Roma ao luar, o alto do aqueduto ao amanhecer,
 * o Templo de Apolo na hora dourada, a câmara do oráculo e o Coliseu durante o eclipse do sol.
 * Motivos do Helios: dourado, azul-céu e o sol de oito raios.
 *
 * `desenhoCapitulo5(lugar)` devolve só o conteúdo do SVG (sem a tag <svg>) para viewBox "0 0 320 180";
 * quem chama põe o <svg> com shapeRendering="crispEdges". Lugares que não são destes capítulos devolvem null.
 *
 * Regras do desenho: coordenadas inteiras, quase tudo em <rect>, chão entre y 136 e 180
 * (os pés dos personagens ficam por volta de y 155), a faixa central (y 70 a 150) mais calma para os
 * personagens e o topo (uns 18 px) livre de detalhe importante, porque o HUD pode cobrir.
 * As animações de ambiente usam as classes "c5-" de capitulos5.css; os ids de <defs> começam com "c5-".
 */
import './capitulos5.css';
import type { CSSProperties } from 'react';

export function desenhoCapitulo5(lugar: string): JSX.Element | null {
  switch (lugar) {
    case 'observatorio-dentro':
      return observatorio(false);
    case 'observatorio-ataque':
      return observatorio(true);
    case 'telhados-noite':
      return telhadosNoite();
    case 'aqueduto':
      return aqueduto();
    case 'templo-apolo':
      return temploApolo();
    case 'templo-oraculo':
      return temploOraculo();
    case 'coliseu-eclipse':
      return coliseuEclipse();
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

/** Linha (cordas, correntes, traços de mapa); largura em unidades do desenho. */
function linha(t: Pincel, x1: number, y1: number, x2: number, y2: number, cor: string, largura = 1): void {
  t.el((k) => <line key={k} x1={x1} y1={y1} x2={x2} y2={y2} stroke={cor} strokeWidth={largura} />);
}

/** Raio de luz: linha larga e transparente (feixes, raios do sol). */
function raio(t: Pincel, x1: number, y1: number, x2: number, y2: number, cor: string, largura: number, op: number): void {
  t.el((k) => <line key={k} x1={x1} y1={y1} x2={x2} y2={y2} stroke={cor} strokeWidth={largura} opacity={op} />);
}

/** Contorno de elipse (anéis do planetário, rosa dos ventos no piso). */
function elipse(t: Pincel, cx: number, cy: number, rx: number, ry: number, cor: string): void {
  t.el((k) => <ellipse key={k} cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={cor} strokeWidth={1} />);
}

/** Padrão de textura (telha, pedra, laje, plateia) que se repete pelo desenho todo; o id deve começar com "c5-". */
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
  t.ra(cx - 2 * e, cy - 2 * e, 4 * e, 4 * e, '#e0201a', 'c5-olho', atraso(atrasoMs));
  t.r(cx - e, cy - e, 2 * e, 2 * e, '#1a0606');
}

/** Sol do Helios: disco com oito raios; (cx, cy) é o centro, r o raio do disco. */
function sol(t: Pincel, cx: number, cy: number, r: number, cor: string, miolo: string): void {
  const l = r + Math.max(2, Math.round(r * 0.7));
  t.r(cx - 1, cy - l, 2, l * 2, cor);
  t.r(cx - l, cy - 1, l * 2, 2, cor);
  const d = Math.round(l * 0.72);
  const m = Math.max(r, Math.round(d * 0.8));
  for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as Ponto[]) {
    t.r(cx + dx * d - 1, cy + dy * d - 1, 2, 2, cor);
    t.r(cx + dx * m - 1, cy + dy * m - 1, 2, 2, cor);
  }
  disco(t, cx, cy, r, cor, r > 5 ? 2 : 1);
  if (r > 2) disco(t, cx, cy, r - 2, miolo, r > 7 ? 2 : 1);
}

/** Estilo de um planeta na órbita (raios da elipse em unidades do desenho) para a classe c5-orbita. */
function orbita(rx: number, ry: number, duracaoS: number, atrasoMs: number): CSSProperties {
  return {
    '--rx': `${rx}px`,
    '--ry': `${ry}px`,
    animationDuration: `${duracaoS}s`,
    animationDelay: `${atrasoMs}ms`,
  } as CSSProperties;
}

/** Engrenagem (ou roda) girando em volta do próprio centro (origem da rotação em unidades do desenho). */
function engrenagem(t: Pincel, cx: number, cy: number, r: number, cor: string, escuro: string, duracaoS: number, reversa: boolean): void {
  const d = Math.round(r * 0.7);
  t.g(
    'c5-gira',
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

/** Pássaro (silhueta) cruzando o céu e batendo as asas. */
function passaro(t: Pincel, x: number, y: number, cor: string, atrasoMs: number, duracaoS: number): void {
  t.g('c5-passaro', { animationDelay: `${atrasoMs}ms`, animationDuration: `${duracaoS}s` }, (s) => {
    s.r(x, y, 3, 1, cor);
    s.g('c5-asa', atraso(atrasoMs), (a) => {
      a.r(x - 3, y - 2, 3, 1, cor);
      a.r(x + 3, y - 2, 3, 1, cor);
      a.r(x - 1, y - 1, 1, 1, cor);
      a.r(x + 3, y - 1, 1, 1, cor);
    });
  });
}

/**
 * Coluna de fumaça ou vapor: n baforadas que sobem (ou descem) e somem, espalhadas no tempo.
 * (x, y) é a boca; classe é "c5-fumaca", "c5-vapor", "c5-exalar", "c5-incenso" ou "c5-rastro".
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

/** Faísca de brilho (vidro, água ao sol, anel do eclipse) que acende de vez em quando. */
function brilho(t: Pincel, x: number, y: number, cor: string, atrasoMs: number): void {
  t.g('c5-brilho', atraso(atrasoMs), (s) => {
    s.r(x - 2, y, 5, 1, cor);
    s.r(x, y - 2, 1, 5, cor);
  });
}

/** Céu estrelado: estrelas fixas, algumas piscando e umas poucas em cruz. */
function estrelas(t: Pincel, x0: number, x1: number, y0: number, y1: number, n: number, semente: number): void {
  const cores = ['#ffffff', '#cfe4ff', '#fff2c0', '#a8c0e8'];
  for (let i = 0; i < n; i++) {
    const x = entre(semente + i * 7, x0, x1);
    const y = entre(semente + i * 13 + 1, y0, y1);
    const c = de(cores, i);
    if (i % 9 === 0) {
      t.g('c5-estrela', atraso(-i * 370), (s) => {
        s.r(x - 1, y, 3, 1, c);
        s.r(x, y - 1, 1, 3, c);
      });
    } else if (i % 3 === 0) {
      t.ra(x, y, 1, 1, c, 'c5-estrela', atraso(-i * 290));
    } else {
      t.r(x, y, 1, 1, c, 0.45 + (i % 4) * 0.15);
    }
  }
}

/** Vela; (x, y) é o topo da cera e h a altura. Acesa, a chama treme; apagada, solta um fio de fumaça. */
function vela(t: Pincel, x: number, y: number, h: number, atrasoMs: number, acesa: boolean, luz = 0.08): void {
  if (acesa && luz > 0) halo(t, x + 1, y - 3, 10, '#ffc860', luz, 'c5-tremor', atraso(atrasoMs));
  t.r(x, y, 3, h, '#efe4c8');
  t.r(x + 2, y, 1, h, '#c8b898');
  t.r(x, y + 1, 1, 2, '#ffffff');
  t.r(x + 1, y - 1, 1, 1, '#2a1a10');
  if (acesa) {
    t.g('c5-vela', atraso(atrasoMs), (s) => {
      s.r(x, y - 4, 3, 3, '#f09030');
      s.r(x + 1, y - 6, 1, 5, '#ffd860');
      s.r(x + 1, y - 3, 1, 1, '#fff8e0');
    });
  } else {
    fumaca(t, x + 1, y - 3, 2, ['#6a6070', '#504858'], 1, 'c5-vapor', 3, atrasoMs);
  }
}

/** Labareda de largura w (pelo menos 4) com a base em (x, y). */
function fogo(t: Pincel, x: number, y: number, w: number, atrasoMs: number): void {
  t.g('c5-chama', atraso(atrasoMs), (s) => {
    s.r(x, y - 4, w, 4, '#c83a12');
    s.r(x + 1, y - 7, w - 2, 4, '#f07a1a');
    s.r(x + Math.floor(w / 2) - 1, y - 10, 2, 5, '#ffc040');
    s.r(x + 1, y - 3, w - 2, 2, '#ffe080');
  });
}

/** Tocha de parede com chama e halo; (x, y) é a boca do suporte. */
function tocha(t: Pincel, x: number, y: number, atrasoMs: number, luz = 0.1): void {
  halo(t, x + 2, y - 4, 26, '#ff9a3a', luz, 'c5-tremor', atraso(atrasoMs));
  t.r(x - 1, y + 5, 7, 1, '#6a5020');
  t.r(x + 1, y + 3, 3, 8, '#4a3018');
  t.r(x, y, 5, 3, '#8a6a2a');
  t.r(x, y, 5, 1, '#d8a84a');
  fogo(t, x, y, 5, atrasoMs);
}

/** Faísca que salta e cai apagando; (x, y) é o ponto de partida, para a esquerda ou para a direita. */
function faisca(t: Pincel, x: number, y: number, cor: string, atrasoMs: number, esquerda: boolean): void {
  t.ra(x, y, 1, 1, cor, esquerda ? 'c5-faisca-volta' : 'c5-faisca', atraso(atrasoMs));
}

/** Drone de fumaça do Censor: casco preto, olho vermelho e rastro de fumaça; (x, y) é o centro. */
function drone(t: Pincel, x: number, y: number, atrasoMs: number): void {
  t.g('c5-drone', atraso(atrasoMs), (s) => {
    fumaca(s, x, y + 8, 3, ['#1a161e', '#2a2430', '#0e0c12'], 2, 'c5-rastro', 2.4, atrasoMs);
    s.r(x - 7, y - 3, 14, 6, '#141018');
    s.r(x - 5, y - 5, 10, 10, '#141018');
    s.r(x - 4, y - 4, 4, 1, '#3a3040');
    s.r(x - 12, y - 6, 5, 1, '#2a2430');
    s.r(x + 7, y - 6, 5, 1, '#2a2430');
    s.r(x - 8, y - 6, 1, 4, '#2a2430');
    s.r(x + 7, y - 6, 1, 4, '#2a2430');
    s.r(x - 1, y + 5, 2, 2, '#141018');
    s.ra(x - 2, y - 1, 4, 2, '#ff2a1a', 'c5-olho', atraso(atrasoMs));
    s.r(x - 1, y - 1, 1, 1, '#ffd0c0');
  });
}

/** Coluna canelada com capitel e base, iluminada pela direita; (x, y) é o topo, w a largura do fuste e h a altura. */
function coluna(t: Pincel, x: number, y: number, w: number, h: number, claro: string, medio: string, escuro: string): void {
  t.r(x - 3, y, w + 6, 3, claro);
  t.r(x - 2, y + 3, w + 4, 2, medio);
  t.r(x, y + 5, w, h - 10, medio);
  t.r(x, y + 5, 2, h - 10, escuro);
  t.r(x + w - 3, y + 5, 3, h - 10, claro);
  for (let k = x + 4; k < x + w - 4; k += 3) t.r(k, y + 5, 1, h - 10, escuro);
  t.r(x - 2, y + h - 5, w + 4, 2, medio);
  t.r(x - 3, y + h - 3, w + 6, 3, claro);
}

/** Montanha em degraus: pico em (cx, base - h) e largura larg na base; topo é a cor da neve (ou undefined). */
function montanha(t: Pincel, cx: number, base: number, h: number, larg: number, cor: string, topo: string | undefined): void {
  for (let k = 0; k < h; k += 4) {
    const w = Math.max(2, Math.round((larg * (h - k)) / h));
    t.r(cx - Math.floor(w / 2), base - k - 4, w, 4, cor);
  }
  if (topo) {
    t.r(cx - 3, base - h, 6, 3, topo);
    t.r(cx - 5, base - h + 3, 4, 2, topo);
  }
}

/** Oliveira de tronco torto e copa prateada que balança; (x, y) é a base do tronco. */
function oliveira(t: Pincel, x: number, y: number, atrasoMs: number): void {
  t.r(x - 2, y - 26, 4, 26, '#5a4630');
  t.r(x - 4, y - 6, 3, 6, '#5a4630');
  t.r(x + 2, y - 16, 3, 4, '#5a4630');
  t.r(x + 4, y - 20, 3, 5, '#5a4630');
  t.r(x - 5, y - 28, 4, 5, '#5a4630');
  t.r(x + 1, y - 26, 1, 24, '#8a7050');
  t.g('c5-folha', atraso(atrasoMs), (s) => {
    s.r(x - 20, y - 42, 40, 14, '#5a6a3a');
    s.r(x - 16, y - 50, 30, 10, '#6a7a4a');
    s.r(x - 24, y - 36, 16, 8, '#6a7a4a');
    s.r(x + 6, y - 38, 18, 9, '#5a6a3a');
    s.r(x - 10, y - 54, 18, 6, '#7a8a5a');
    s.r(x - 12, y - 50, 10, 3, '#a8b48a');
    s.r(x + 4, y - 44, 12, 3, '#a8b48a');
    s.r(x - 20, y - 38, 8, 2, '#a8b48a');
    s.r(x + 10, y - 34, 10, 2, '#c8d0a8');
    s.r(x - 14, y - 30, 26, 2, '#46542e');
    for (const [dx, dy] of [[-8, -40], [4, -46], [12, -36], [-16, -34], [-2, -52]] as Ponto[]) s.r(x + dx, y + dy, 1, 1, '#2a2a1a');
  });
}

/** Estátua de bronze num pedestal de mármore; x é o canto esquerdo do pedestal (18 de largura), y o topo dele. */
function estatua(t: Pincel, x: number, y: number, espelhada: boolean): void {
  const b = '#7a4e26';
  const l = '#d8984a';
  const p = '#4a8a7a';
  t.r(x - 1, y, 20, 3, '#f4dcaa');
  t.r(x, y + 3, 18, 22, '#d8b484');
  t.r(x + 15, y + 3, 3, 22, '#f0d4a0');
  t.r(x, y + 3, 2, 22, '#a8805a');
  t.r(x + 5, y + 9, 8, 5, '#a8743a');
  t.r(x + 6, y + 10, 6, 1, '#f0c070');
  t.r(x - 1, y + 25, 20, 3, '#c49a6a');
  const cx = x + 9;
  // corpo
  t.r(cx - 2, y - 30, 4, 4, b);
  t.r(cx + 1, y - 30, 1, 4, l);
  t.r(cx - 3, y - 31, 6, 1, '#c8a040');
  t.r(cx - 3, y - 26, 6, 12, b);
  t.r(cx + 2, y - 26, 1, 12, l);
  t.r(cx - 3, y - 14, 2, 14, b);
  t.r(cx + 1, y - 14, 2, 14, b);
  t.r(cx + 2, y - 14, 1, 14, l);
  t.r(cx - 1, y - 21, 1, 6, p);
  t.r(cx - 3, y - 2, 1, 2, p);
  // capa e braços: um erguido segurando o sol, o outro com a lira
  const ergue = espelhada ? cx - 5 : cx + 3;
  const lira = espelhada ? cx + 3 : cx - 5;
  t.r(espelhada ? cx + 2 : cx - 5, y - 24, 2, 12, p);
  t.r(ergue, y - 34, 2, 10, b);
  sol(t, ergue + 1, y - 37, 2, '#f0c040', '#fff0a0');
  t.r(lira, y - 24, 2, 8, b);
  t.r(lira - 1, y - 18, 4, 5, '#c8a040');
  t.r(lira, y - 17, 2, 3, '#3a2a1a');
}

/** Carta celeste presa na parede com tachinhas; queimando, ganha borda chamuscada, fogo e fumaça. */
function cartaCeleste(t: Pincel, x: number, y: number, w: number, h: number, semente: number, queimando: boolean): void {
  t.r(x + 1, y + 1, w, h, '#06080e', 0.5);
  t.r(x, y, w, h, queimando ? '#c8ae80' : '#dccca0');
  t.r(x, y, w, 1, '#efe4c0');
  t.r(x, y + h - 1, w, 1, '#a8946a');
  t.r(x + 2, y + 2, w - 4, 1, '#a8946a');
  t.r(x + 2, y + h - 3, w - 4, 1, '#a8946a');
  const pts: Ponto[] = [];
  for (let i = 0; i < 5; i++) pts.push([entre(semente + i * 3, x + 4, x + w - 5), entre(semente + i * 5 + 1, y + 5, y + h - 6)]);
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    if (a && b) linha(t, a[0], a[1], b[0], b[1], '#8a94bc');
  }
  for (const [px, py] of pts) t.r(px, py, 2, 2, '#1a2a6a');
  t.r(x + 1, y - 1, 2, 2, '#c83a2a');
  t.r(x + w - 3, y - 1, 2, 2, '#c83a2a');
  if (queimando) {
    t.r(x, y + h - 5, w, 5, '#2a1a10');
    t.r(x + 2, y + h - 7, w - 6, 2, '#5a3a1a');
    fogo(t, x + 1, y + h, w - 2, -semente * 37);
    fumaca(t, x + Math.floor(w / 2), y - 2, 3, ['#2a2228', '#3a3036', '#1a161c'], 3, 'c5-fumaca', 4, -semente * 50);
  }
}

/* ------------------------------------------------------------------ */
/* O Grande Observatório (em paz e sob ataque)                         */
/* ------------------------------------------------------------------ */

function observatorio(ataque: boolean): JSX.Element {
  const t = pincel();
  const suf = ataque ? 'b' : 'a';
  padrao(t, `c5-pedra-obs-${suf}`, 24, 16, (s) => {
    s.r(0, 0, 24, 16, '#1c2238');
    s.r(0, 0, 24, 1, '#121728');
    s.r(0, 8, 24, 1, '#121728');
    s.r(0, 1, 1, 7, '#121728');
    s.r(12, 9, 1, 7, '#121728');
    s.r(2, 2, 6, 1, '#283050');
    s.r(15, 10, 5, 1, '#283050');
    s.r(19, 4, 2, 2, '#182034');
  });
  padrao(t, `c5-piso-obs-${suf}`, 16, 16, (s) => {
    s.r(0, 0, 16, 16, '#221c2e');
    s.r(0, 0, 15, 7, '#3a3248');
    s.r(0, 0, 15, 1, '#52486a');
    s.r(0, 8, 7, 7, '#3a3248');
    s.r(8, 8, 8, 7, '#3a3248');
    s.r(0, 8, 7, 1, '#52486a');
    s.r(8, 8, 8, 1, '#52486a');
    s.r(4, 3, 2, 1, '#2e283e');
  });
  padrao(t, `c5-rolos-${suf}`, 5, 4, (s) => {
    s.r(0, 0, 5, 4, '#1e140e');
    s.r(0, 0, 4, 4, '#e0d0a8');
    s.r(0, 0, 4, 1, '#f0e4c0');
    s.r(1, 1, 2, 2, '#a8946a');
  });

  // parede de pedra e o domo escuro com as nervuras
  t.r(0, 0, 320, 136, `url(#c5-pedra-obs-${suf})`);
  t.r(0, 0, 320, 58, '#0c1020', 0.55);
  for (const [x1, x2] of [[178, 120], [178, 50], [178, -20], [218, 270], [218, 340]] as Ponto[]) linha(t, x1, 0, x2, 58, '#2c3656', 2);

  // fenda aberta do domo com o céu da noite
  t.r(180, 0, 36, 58, '#080c22');
  t.r(180, 20, 36, 20, '#0e1430');
  t.r(180, 40, 36, 18, '#141c40');
  t.r(186, 14, 16, 4, '#2a2a5a', 0.6);
  t.r(192, 11, 8, 9, '#3a2a6a', 0.4);
  estrelas(t, 181, 214, 2, 55, ataque ? 8 : 18, 5);
  t.r(176, 0, 4, 58, '#8a6a2a');
  t.r(177, 0, 1, 58, '#e8c060');
  t.r(216, 0, 4, 58, '#8a6a2a');
  t.r(218, 0, 1, 58, '#5a4418');
  for (let y = 4; y < 58; y += 8) {
    t.r(178, y, 1, 1, '#f8d878');
    t.r(217, y, 1, 1, '#f8d878');
  }

  // galeria de latão que contorna o domo
  t.r(0, 58, 320, 4, '#8a6a2a');
  t.r(0, 58, 320, 1, '#e8c060');
  t.r(0, 62, 320, 2, '#0a0e1a');
  for (let x = 6; x < 320; x += 16) t.r(x, 60, 1, 1, '#f8d878');

  // luar descendo pela fenda até o piso
  if (!ataque) {
    t.g('c5-feixe', undefined, (s) => {
      for (let i = 0; i < 8; i++) s.r(178 - i * 6, 58 + i * 10, 38 + i * 2, 10, '#bcd8ff', 0.05);
      s.r(126, 138, 74, 12, '#bcd8ff', 0.06);
      s.r(136, 150, 58, 6, '#bcd8ff', 0.05);
    });
  }

  // cartas celestes e o mapa redondo do céu
  cartaCeleste(t, 10, 22, 26, 30, 3, ataque);
  t.r(43, 23, 28, 28, ataque ? '#c8ae80' : '#dccca0');
  t.r(43, 23, 28, 1, '#efe4c0');
  disco(t, 57, 37, 11, '#1a2a5a', 2);
  t.el((k) => <circle key={k} cx={57} cy={37} r={11} fill="none" stroke="#c8963a" strokeWidth={1} />);
  t.r(46, 37, 22, 1, '#c8963a', 0.6);
  t.r(57, 26, 1, 22, '#c8963a', 0.6);
  for (const [dx, dy] of [[-5, -4], [3, -6], [6, 2], [-3, 5], [1, 2], [-7, 1]] as Ponto[]) t.r(57 + dx, 37 + dy, 1, 1, '#f0e0a0');
  t.r(44, 22, 2, 2, '#c83a2a');
  t.r(68, 22, 2, 2, '#c83a2a');
  if (ataque) {
    t.r(43, 45, 28, 6, '#2a1a10');
    fogo(t, 45, 51, 24, -900);
  }
  cartaCeleste(t, 76, 24, 22, 26, 9, false);
  cartaCeleste(t, 286, 20, 26, 34, 17, ataque);

  // planetário pendurado: o sol no meio e os planetas nos anéis
  const ox = 138;
  const oy = 38;
  t.r(ox - 1, 0, 2, 26, '#5a4a2a');
  for (let y = 2; y < 26; y += 4) t.r(ox - 2, y, 4, 1, '#8a7a4a');
  t.r(ox - 6, 26, 12, 2, '#c8963a');
  t.r(ox - 1, 28, 2, 22, '#8a6a2a');
  t.r(ox - 4, 50, 8, 3, '#c8963a');
  t.r(ox - 4, 50, 8, 1, '#f0d070');
  elipse(t, ox, oy, 14, 4, '#a87a2a');
  elipse(t, ox, oy, 24, 7, '#a87a2a');
  elipse(t, ox, oy, 34, 10, '#8a6a2a');
  halo(t, ox, oy, 14, '#ffd060', ataque ? 0.06 : 0.12, 'c5-pulsar');
  disco(t, ox, oy, 5, '#f8c040', 2);
  t.r(ox - 2, oy - 3, 3, 2, '#fff0a0');
  const planetas: (readonly [number, number, string, number, number, number])[] = [
    [14, 4, '#6ab8e8', 3, 6, 0],
    [24, 7, '#d8603a', 4, 11, -3000],
    [34, 10, '#e8c870', 4, 17, -9000],
  ];
  planetas.forEach(([rx, ry, cor, tam, dur, d], i) => {
    const desenho = (s: Pincel): void => {
      const px = ox + rx - Math.floor(tam / 2);
      const py = oy - Math.floor(tam / 2);
      s.r(px, py, tam, tam, cor);
      s.r(px, py, 1, 1, '#ffffff');
      if (i === 2) s.r(px - 2, py + 2, tam + 4, 1, '#c8963a');
    };
    if (ataque) t.g(undefined, undefined, desenho);
    else t.g('c5-orbita', orbita(rx, ry, dur, d), desenho);
  });

  // estante de rolos de pergaminho, com globo celeste e vela em cima
  t.r(4, 66, 64, 70, '#3a2418');
  t.r(4, 66, 64, 3, '#5a3a24');
  t.r(4, 66, 2, 70, '#6a4a2a');
  t.r(8, 70, 56, 64, '#1e140e');
  for (const y of [88, 108, 128]) {
    t.r(6, y, 60, 3, '#6a4428');
    t.r(6, y, 60, 1, '#8a5a34');
  }
  const rolos = `url(#c5-rolos-${suf})`;
  t.r(10, 76, 20, 12, rolos);
  t.r(30, 80, 15, 8, rolos);
  t.r(10, 100, 15, 8, rolos);
  t.r(40, 96, 20, 12, rolos);
  t.r(15, 120, 25, 8, rolos);
  t.r(50, 124, 10, 4, rolos);
  for (const [x, y, h, c] of [[48, 78, 10, '#7a2a2a'], [51, 77, 11, '#2a4a6a'], [54, 79, 9, '#6a5a2a'], [28, 98, 10, '#3a5a3a'], [32, 99, 9, '#7a2a2a'], [42, 118, 10, '#2a4a6a']] as (readonly [number, number, number, string])[]) {
    t.r(x, y, 3, h, c);
    t.r(x, y + 2, 3, 1, '#d8a83a');
  }
  disco(t, 54, 60, 5, '#2a5a8a', 2);
  t.r(49, 60, 11, 1, '#e8c060');
  t.r(53, 55, 1, 10, '#e8c060');
  t.r(51, 65, 7, 1, '#8a6a2a');
  vela(t, 24, 60, 6, -300, !ataque);

  // candelabro alto
  t.r(80, 104, 2, 32, '#8a6a2a');
  t.r(76, 134, 10, 2, '#6a4a1a');
  t.r(77, 104, 8, 2, '#c8963a');
  vela(t, 79, 98, 6, -800, true);

  // escrivaninha com livro aberto, tinteiro, pena e velas
  t.r(284, 112, 36, 3, '#6a4428');
  t.r(284, 112, 36, 1, '#8a5a34');
  t.r(287, 115, 3, 21, '#4a2e1c');
  t.r(314, 115, 3, 21, '#4a2e1c');
  t.r(290, 108, 12, 4, '#efe4c8');
  t.r(296, 108, 1, 4, '#a8946a');
  t.r(304, 108, 3, 4, '#1a1a2a');
  t.r(306, 101, 1, 8, '#f0f0f0');
  vela(t, 311, 104, 8, -500, !ataque);
  vela(t, 316, 106, 6, -1100, true);

  // o grande telescópio de latão sobre as engrenagens
  t.r(230, 118, 52, 2, '#c8963a');
  t.r(232, 120, 48, 16, '#3a3248');
  t.r(232, 120, 48, 2, '#5a4e6a');
  t.r(236, 126, 40, 1, '#2a2436');
  engrenagem(t, 270, 110, 9, '#b8862a', '#5a4018', 14, false);
  engrenagem(t, 252, 108, 5, '#d8a83a', '#6a4a1a', 7, true);
  t.r(238, 98, 4, 22, '#8a6a2a');
  t.r(254, 98, 4, 22, '#8a6a2a');
  t.r(238, 98, 1, 22, '#e8c060');
  for (let k = 0; k <= 12; k++) t.r(252 - 4 * k - 6, 116 - 6 * k - 6, 13, 11, '#b8862a');
  for (let k = 0; k <= 12; k++) {
    const x = 252 - 4 * k;
    const y = 116 - 6 * k;
    t.r(x + 5, y - 6, 2, 6, '#f0d070');
    t.r(x - 6, y + 1, 2, 4, '#6a4a18');
  }
  for (const k of [2, 6, 10]) {
    const x = 252 - 4 * k;
    const y = 116 - 6 * k;
    t.r(x - 7, y - 7, 15, 3, '#e8c060');
    t.r(x - 7, y - 4, 15, 1, '#6a4a18');
  }
  for (const k of [3, 4, 5]) t.r(252 - 4 * k + 6, 116 - 6 * k - 9, 4, 3, '#8a6a2a');
  t.r(256, 116, 8, 4, '#6a4a18');
  t.r(264, 115, 3, 6, '#2a1a10');
  t.r(198, 36, 14, 6, '#d8a83a');
  t.r(198, 36, 14, 1, '#fff0a0');
  if (ataque) {
    t.r(200, 33, 10, 3, '#1a2a34');
    t.r(203, 33, 1, 3, '#cfe8f0');
    t.r(206, 34, 2, 1, '#cfe8f0');
  } else {
    t.r(200, 33, 10, 3, '#8ad8f8');
    t.r(202, 33, 2, 1, '#ffffff');
    brilho(t, 205, 33, '#ffffff', -1200);
  }

  // piso com a rosa dos ventos de latão embutida
  t.r(0, 136, 320, 44, `url(#c5-piso-obs-${suf})`);
  t.r(0, 136, 320, 2, '#52486a');
  elipse(t, 160, 158, 64, 12, '#c8963a');
  elipse(t, 160, 158, 40, 7, '#a87a2a');
  t.r(96, 158, 128, 1, '#a87a2a');
  t.r(159, 146, 2, 24, '#a87a2a');
  t.r(152, 156, 16, 4, '#c8963a');
  t.r(156, 154, 8, 8, '#c8963a');
  t.r(157, 156, 6, 4, '#f0d070');
  t.r(0, 168, 320, 12, '#06050c', 0.3);
  t.r(0, 0, 14, 180, '#04060c', 0.3);
  t.r(306, 0, 14, 180, '#04060c', 0.3);

  if (ataque) {
    // pergaminhos caídos, uma carta queimando no chão, lentes partidas e um planeta caído
    t.r(30, 146, 10, 4, '#e0d0a8');
    t.r(30, 146, 2, 4, '#a8946a');
    t.r(44, 150, 8, 3, '#e0d0a8');
    t.r(14, 156, 18, 10, '#c8ae80');
    t.r(14, 162, 18, 4, '#2a1a10');
    fogo(t, 15, 162, 14, -400);
    fumaca(t, 22, 150, 4, ['#2a2228', '#3a3036', '#1a161c'], 3, 'c5-fumaca', 5, -800);
    for (let i = 0; i < 9; i++) {
      const x = entre(i * 11 + 4, 170, 236);
      const y = entre(i * 7 + 2, 140, 172);
      t.r(x, y, 2 + (i % 2), 1, '#8ad8f8');
      if (i % 3 === 0) brilho(t, x, y, '#e8f8ff', -i * 600);
    }
    disco(t, 112, 170, 3, '#e8c870', 1);
    t.r(116, 171, 6, 1, '#c8963a');
    // fumaça no alto do domo
    t.g('c5-nuvem', undefined, (s) => {
      s.r(0, 0, 120, 12, '#08060a', 0.5);
      s.r(60, 10, 90, 8, '#140e12', 0.5);
      s.r(200, 0, 120, 10, '#08060a', 0.5);
      s.r(230, 10, 70, 8, '#140e12', 0.45);
      s.r(150, 2, 30, 6, '#1a1218', 0.5);
    });
    fumaca(t, 198, 14, 5, ['#1a161c', '#2a2228', '#0e0c10'], 4, 'c5-fumaca', 5, -200);
    // drones de fumaça apagando as luzes, com os fachos vermelhos
    t.g('c5-feixe', atraso(-1500), (s) => {
      s.r(191, 36, 14, 22, '#ff2a1a', 0.08);
      s.r(186, 58, 24, 30, '#ff2a1a', 0.06);
      s.r(296, 88, 12, 16, '#ff2a1a', 0.08);
    });
    drone(t, 198, 26, 0);
    drone(t, 28, 48, -700);
    drone(t, 302, 82, -1400);
    drone(t, 160, 14, -2100);
    // faíscas da lente quebrada, do planetário e das cartas
    const fontes: Ponto[] = [[204, 40], [138, 28], [20, 52], [296, 54], [57, 48]];
    for (let i = 0; i < 12; i++) {
      const p = fontes[i % fontes.length];
      if (!p) continue;
      faisca(t, p[0] + (i % 3), p[1], i % 2 ? '#ffd060' : '#ff8a2a', -i * 330, i % 2 === 0);
    }
    // luz de alarme vermelha
    t.r(0, 0, 320, 180, '#ff2a1a', 0.07);
    t.g('c5-alerta', undefined, (s) => s.r(0, 0, 320, 180, '#ff1a0a', 0.14));
  }
  return <>{t.itens}</>;
}

/* ------------------------------------------------------------------ */
/* Telhados de Roma ao luar                                            */
/* ------------------------------------------------------------------ */

/** Chaminé de tijolo ao luar com fumaça; (x, y) é o topo e h a altura. */
function chamine(t: Pincel, x: number, y: number, h: number, atrasoMs: number): void {
  t.r(x, y, 8, h, '#3a2a3a');
  t.r(x + 6, y, 2, h, '#6a5a7a');
  t.r(x - 1, y - 2, 10, 3, '#2a1e2c');
  t.r(x + 2, y - 2, 4, 1, '#0a060c');
  for (let k = 4; k < h; k += 5) t.r(x, y + k, 8, 1, '#2a1e2c');
  fumaca(t, x + 4, y - 4, 4, ['#4a4a64', '#5a5a74', '#3e3e56'], 3, 'c5-fumaca', 6, atrasoMs);
}

function telhadosNoite(): JSX.Element {
  const t = pincel();
  padrao(t, 'c5-telha-noite', 8, 8, (s) => {
    s.r(0, 0, 8, 8, '#3a3458');
    s.r(0, 0, 8, 1, '#6a6894');
    s.r(0, 3, 8, 1, '#221e38');
    s.r(3, 0, 2, 3, '#48446c');
    s.r(0, 4, 8, 1, '#6a6894');
    s.r(0, 7, 8, 1, '#221e38');
    s.r(7, 4, 1, 3, '#48446c');
    s.r(0, 4, 1, 3, '#48446c');
  });

  // céu, via láctea e estrelas
  ceu(t, ['#05081a', '#080c22', '#0c122c', '#101836', '#151e40', '#1c264a'], 0, 102);
  for (let i = 0; i < 8; i++) t.r(110 + i * 24, 4 + i * 6, 32, 6, '#2a3462', 0.25);
  estrelas(t, 0, 319, 2, 92, 70, 11);

  // lua cheia
  halo(t, 64, 42, 50, '#cfe0ff', 0.06, 'c5-pulsar');
  halo(t, 64, 42, 30, '#e8f0ff', 0.08, 'c5-pulsar', atraso(-1300));
  disco(t, 64, 42, 20, '#e4e8f2', 2);
  disco(t, 69, 46, 15, '#d4dae8', 2);
  for (const [x, y, w, h] of [[56, 32, 5, 3], [68, 38, 4, 4], [60, 48, 6, 3], [73, 30, 3, 2], [52, 42, 3, 3], [72, 50, 4, 2]] as (readonly [number, number, number, number])[]) {
    t.r(x, y, w, h, '#bcc4d6');
    t.r(x, y, w, 1, '#a8b0c4');
  }
  t.r(50, 28, 6, 2, '#f8faff');
  t.r(46, 34, 2, 6, '#f8faff');
  // nuvens finas passando na frente da lua
  t.g('c5-nuvem', undefined, (s) => {
    s.r(20, 50, 70, 2, '#3a4670', 0.7);
    s.r(34, 48, 40, 2, '#4a5680', 0.6);
    s.r(90, 30, 50, 2, '#2a3660', 0.6);
    s.r(230, 20, 60, 2, '#2a3660', 0.5);
    s.r(250, 18, 30, 2, '#36426c', 0.5);
    s.r(150, 60, 50, 2, '#2a3660', 0.5);
  });

  // cidade ao longe
  const blocos: (readonly [number, number, number])[] = [
    [0, 22, 90], [20, 18, 86], [96, 16, 88], [110, 26, 92], [136, 14, 84], [148, 30, 90], [176, 20, 86],
    [284, 18, 88], [300, 20, 84],
  ];
  for (const [x, w, y] of blocos) {
    t.r(x, y, w, 110 - y, '#141a34');
    t.r(x, y, w, 1, '#28305a');
    if (sorte(x) < 0.7) t.r(x + entre(x, 2, w - 4), y + 6, 2, 2, '#ffcf70');
  }
  // templo com frontão
  t.r(150, 82, 24, 2, '#1a2040');
  t.r(154, 80, 16, 2, '#1a2040');
  t.r(158, 78, 8, 2, '#1a2040');
  // o Coliseu longe, com o farol do Censor
  t.r(200, 74, 84, 36, '#1a2040');
  t.r(204, 70, 60, 4, '#1a2040');
  t.r(264, 62, 18, 12, '#1a2040');
  t.r(200, 74, 84, 1, '#3a4670');
  t.r(264, 62, 18, 1, '#3a4670');
  for (const y of [78, 88, 98]) {
    for (let x = 204; x < 280; x += 6) t.r(x, y, 3, 6, sorte(x * 3 + y) < 0.22 ? '#ff9a4a' : '#0c1028');
  }
  t.r(272, 56, 1, 6, '#0c1028');
  t.ra(271, 55, 3, 2, '#ff3a2a', 'c5-olho');

  // dirigível de patrulha do Censor varrendo a cidade com o holofote
  t.g('c5-patrulha', undefined, (s) => {
    s.g('c5-feixe', undefined, (f) => {
      f.r(242, 38, 8, 12, '#ff4a3a', 0.08);
      f.r(238, 50, 16, 16, '#ff4a3a', 0.06);
      f.r(234, 66, 24, 18, '#ff4a3a', 0.05);
    });
    s.r(232, 26, 30, 8, '#1a1a28');
    s.r(228, 28, 38, 4, '#1a1a28');
    s.r(234, 26, 26, 1, '#3a3a54');
    s.r(262, 23, 6, 3, '#14141e');
    s.r(262, 33, 6, 3, '#14141e');
    s.r(240, 34, 12, 4, '#24202c');
    s.ra(244, 35, 3, 2, '#ff2a1a', 'c5-olho');
  });

  // telhados do meio, com janelas acesas e becos escuros entre eles
  const meio: (readonly [number, number, number])[] = [
    [0, 60, 108],
    [64, 70, 100],
    [140, 50, 112],
    [194, 64, 104],
    [262, 58, 110],
  ];
  t.r(0, 100, 320, 40, '#06070f');
  meio.forEach(([x, w, topo], i) => {
    t.r(x, topo, w, 6, 'url(#c5-telha-noite)');
    t.r(x, topo, w, 1, '#8a88b4');
    t.r(x, topo + 6, w, 140 - topo - 6, '#24203a');
    t.r(x, topo + 6, w, 2, '#16122a');
    for (let k = 0; k < 3; k++) {
      const wx = x + 8 + k * Math.floor((w - 16) / 3);
      const acesa = sorte(i * 10 + k) < 0.55;
      t.r(wx, topo + 12, 5, 7, acesa ? '#ffb860' : '#100e1e');
      if (acesa) t.r(wx, topo + 12, 5, 1, '#ffe0a0');
    }
  });
  chamine(t, 90, 90, 10, 0);
  chamine(t, 280, 98, 12, -2200);
  // varal entre dois mastros, com roupa ao vento
  t.r(200, 90, 2, 14, '#16122a');
  t.r(248, 92, 2, 12, '#16122a');
  linha(t, 201, 91, 249, 93, '#0e0c1c');
  for (const [x, i] of [[206, 0], [216, 1], [228, 2], [238, 3]] as Ponto[]) {
    t.g('c5-roupa', atraso(-i * 500), (s) => {
      s.r(x, 91 + Math.floor(i / 2), 7, 7 + (i % 2) * 3, de(['#8a8aa8', '#7a4a5a', '#4a5a7a', '#a89a70'], i));
      s.r(x, 91 + Math.floor(i / 2), 7, 1, '#2a2440');
    });
  }
  // caixa d'água
  t.r(112, 82, 2, 18, '#16122a');
  t.r(128, 82, 2, 18, '#16122a');
  t.r(108, 68, 24, 14, '#2a2238');
  t.r(129, 68, 3, 14, '#5a5478');
  t.r(106, 66, 28, 3, '#1c1828');
  t.r(108, 74, 24, 1, '#16122a');

  // beco fundo entre os telhados da frente: a ronda passa lá embaixo com lanternas
  t.r(196, 128, 32, 52, '#08091a');
  t.r(196, 136, 5, 44, '#141428');
  t.r(223, 128, 5, 52, '#1a1a32');
  t.r(198, 146, 2, 3, '#ffcf70');
  t.r(225, 140, 2, 3, '#ffcf70');
  t.r(201, 174, 22, 6, '#1a1a2c');
  t.r(201, 174, 22, 1, '#2a2a44');
  for (const d of [0, -4500]) {
    t.g('c5-ronda', atraso(d), (s) => {
      halo(s, 204, 172, 8, '#ffcf70', 0.15);
      s.r(203, 170, 2, 2, '#ffd880');
      s.r(205, 168, 2, 6, '#0a0a14');
      s.r(205, 167, 2, 1, '#c83a2a');
    });
  }

  // telhado da frente à esquerda (onde os personagens andam)
  t.r(0, 134, 196, 3, '#2a2440');
  t.r(0, 134, 196, 1, '#9a98c4');
  for (let x = 4; x < 192; x += 12) t.r(x, 133, 6, 2, '#4a4670');
  t.r(0, 137, 196, 43, 'url(#c5-telha-noite)');
  t.r(0, 137, 196, 43, '#a8b8ff', 0.06);
  t.r(0, 168, 196, 12, '#05060e', 0.35);
  // claraboia com luz quente
  t.r(120, 146, 16, 8, '#2a1a14');
  t.ra(122, 148, 12, 4, '#ffb860', 'c5-tremor');
  t.r(127, 148, 1, 4, '#2a1a14');
  // chaminé grande na frente
  t.r(16, 106, 18, 30, '#3a2a3a');
  t.r(28, 106, 6, 30, '#6a5a7a');
  for (let y = 110; y < 134; y += 6) t.r(16, y, 18, 1, '#2a1e2c');
  t.r(14, 102, 22, 5, '#241a28');
  t.r(18, 102, 14, 1, '#0a060c');
  fumaca(t, 25, 98, 5, ['#4a4a64', '#5a5a74', '#3e3e56'], 4, 'c5-fumaca', 6, -900);

  // telhado da frente à direita, mais alto, com o cata-vento de sol e o gato
  t.r(228, 126, 92, 3, '#2a2440');
  t.r(228, 126, 92, 1, '#9a98c4');
  for (let x = 232; x < 320; x += 12) t.r(x, 125, 6, 2, '#4a4670');
  t.r(228, 129, 92, 51, 'url(#c5-telha-noite)');
  t.r(228, 129, 92, 51, '#a8b8ff', 0.06);
  t.r(228, 168, 92, 12, '#05060e', 0.35);
  t.r(250, 104, 1, 22, '#16122a');
  sol(t, 250, 101, 3, '#c8a040', '#f8d878');
  t.r(292, 118, 10, 8, '#0a0a14');
  t.r(300, 114, 5, 5, '#0a0a14');
  t.r(300, 112, 1, 2, '#0a0a14');
  t.r(304, 112, 1, 2, '#0a0a14');
  t.g('c5-piscar', undefined, (s) => {
    s.r(301, 116, 1, 1, '#c8f060');
    s.r(303, 116, 1, 1, '#c8f060');
  });
  t.r(288, 122, 5, 2, '#0a0a14');
  return <>{t.itens}</>;
}

/* ------------------------------------------------------------------ */
/* O alto do aqueduto ao amanhecer                                     */
/* ------------------------------------------------------------------ */

/** Comporta de madeira sobre o canal, com a roda de manivela girando; x é o poste da esquerda. */
function comporta(t: Pincel, x: number, atrasoMs: number, duracaoS: number): void {
  t.r(x, 104, 4, 46, '#5a3a24');
  t.r(x + 20, 104, 4, 46, '#5a3a24');
  t.r(x + 2, 104, 2, 46, '#8a5a34');
  t.r(x + 22, 104, 2, 46, '#8a5a34');
  t.r(x - 2, 102, 28, 4, '#4a2e1c');
  t.r(x - 2, 102, 28, 1, '#c8864a');
  t.r(x + 11, 106, 2, 22, '#6a6a7a');
  for (let y = 108; y < 128; y += 4) t.r(x + 10, y, 4, 1, '#8a8a9a');
  t.r(x + 4, 128, 16, 13, '#7a5432');
  t.r(x + 4, 128, 16, 1, '#c89a60');
  t.r(x + 4, 129, 16, 1, '#5a5a6a');
  t.r(x + 4, 133, 16, 1, '#5a3a22');
  t.r(x + 4, 137, 16, 1, '#5a3a22');
  engrenagem(t, x + 12, 94, 7, '#8a6a4a', '#3a2a1a', duracaoS, false);
  t.r(x + 11, 93, 2, 2, '#d8a84a');
  fumaca(t, x + 12, 144, 3, ['#d8f0ff', '#f0faff', '#b8e0f8'], 1, 'c5-vapor', 1.6, atrasoMs);
}

function aqueduto(): JSX.Element {
  const t = pincel();
  padrao(t, 'c5-laje', 16, 8, (s) => {
    s.r(0, 0, 16, 8, '#8a6a4e');
    s.r(0, 0, 15, 7, '#c49a72');
    s.r(0, 0, 15, 1, '#ecc898');
    s.r(3, 3, 2, 1, '#a88060');
    s.r(10, 5, 3, 1, '#a88060');
  });
  padrao(t, 'c5-bloco', 12, 6, (s) => {
    s.r(0, 0, 12, 6, '#8a6248');
    s.r(0, 0, 11, 5, '#b88a64');
    s.r(0, 0, 11, 1, '#dcae7e');
  });

  // céu do amanhecer, o sol nascendo e os raios
  ceu(t, ['#2a2a5a', '#4a3a72', '#7a4a7a', '#b85a6a', '#e07a5a', '#f4a058', '#f8c878', '#fce0a0'], 0, 112);
  halo(t, 236, 108, 64, '#ffd890', 0.07, 'c5-pulsar');
  t.g('c5-feixe', undefined, (s) => {
    for (const [x2, y2] of [[150, 0], [196, 0], [250, 0], [300, 0], [320, 44], [110, 30]] as Ponto[]) raio(s, 236, 108, x2, y2, '#fff0b8', 5, 0.1);
  });
  disco(t, 236, 108, 18, '#ffe49a', 2);
  disco(t, 236, 108, 13, '#fff4c8', 2);
  t.g('c5-nuvem', undefined, (s) => {
    s.r(20, 40, 70, 3, '#e8869a');
    s.r(36, 38, 34, 2, '#f8a8a0');
    s.r(120, 58, 60, 3, '#f09a7a');
    s.r(136, 56, 30, 2, '#f8c0a0');
    s.r(250, 30, 60, 2, '#d0708a');
    s.r(270, 70, 44, 2, '#f8c890');
  });
  estrelas(t, 0, 160, 2, 24, 10, 41);
  passaro(t, -10, 44, '#3a2a4a', 0, 22);
  passaro(t, 12, 52, '#3a2a4a', -6000, 24);
  passaro(t, -4, 36, '#3a2a4a', -12000, 21);
  passaro(t, 6, 62, '#4a3456', -16000, 26);
  passaro(t, -16, 48, '#4a3456', -3000, 23);

  // montanhas: as do fundo com neve, as da frente mais escuras
  montanha(t, 40, 112, 36, 150, '#8a6a9a', '#f4d8e0');
  montanha(t, 130, 112, 28, 120, '#7e6290', undefined);
  montanha(t, 186, 112, 30, 100, '#866898', '#f0d0dc');
  montanha(t, 304, 112, 42, 160, '#8a6a9a', '#f4d8e0');
  t.r(236, 108, 30, 4, '#c87a7a', 0.4);
  montanha(t, 80, 116, 16, 140, '#6a4a6a', undefined);
  montanha(t, 262, 116, 14, 130, '#6a4a6a', undefined);

  // a planície e Roma lá embaixo
  t.r(0, 112, 320, 16, '#8a5a5a');
  t.r(0, 112, 320, 1, '#c88a78');
  for (let x = 2; x < 320; x += 9) {
    const h = entre(x, 4, 11);
    const w = entre(x + 1, 5, 7);
    t.r(x, 126 - h, w, h, sorte(x * 7) < 0.5 ? '#e0b09a' : '#c89282');
    t.r(x, 126 - h, w, 2, '#a85a4a');
  }
  disco(t, 150, 117, 5, '#f0c8a8', 1);
  t.r(144, 117, 12, 4, '#e0b09a');
  t.r(90, 114, 22, 10, '#c89282');
  t.r(92, 110, 16, 4, '#c89282');
  for (let x = 92; x < 110; x += 4) t.r(x, 116, 2, 3, '#6a3a3a');
  t.g('c5-neblina', undefined, (s) => {
    s.r(0, 118, 140, 4, '#f8d8c0', 0.3);
    s.r(170, 120, 150, 4, '#f8d8c0', 0.3);
    s.r(40, 124, 200, 3, '#f8e0d0', 0.25);
  });
  // outro braço do aqueduto sumindo na distância
  let ax = 0;
  let aw = 16;
  while (ax < 150) {
    const topo = 104 + Math.round(ax / 25);
    t.r(ax, topo, 3, 126 - topo, '#a87a68');
    t.r(ax, topo, aw, 3, '#c89a80');
    t.r(ax, topo + 3, aw, 1, '#6a4a4a');
    ax += aw;
    aw = Math.max(5, aw - 1);
  }

  // o nosso aqueduto: parapeito de trás
  t.r(0, 124, 320, 3, '#e8c494');
  t.r(0, 124, 320, 1, '#fff0c0');
  t.r(0, 127, 320, 11, 'url(#c5-bloco)');
  t.r(160, 124, 160, 14, '#ffc070', 0.12);
  // canal com a água correndo
  t.r(0, 138, 320, 10, '#2a5a88');
  t.r(0, 138, 320, 2, '#1a3a60');
  t.r(0, 142, 320, 3, '#3a7aa8');
  t.g('c5-correr', undefined, (s) => {
    for (let x = -16; x < 320; x += 16) {
      s.r(x + 3, 140, 6, 1, '#8ac8e8');
      s.r(x + 10, 143, 4, 1, '#f8c878');
      s.r(x, 146, 3, 1, '#5a9ac8');
    }
  });
  for (let i = 0; i < 4; i++) brilho(t, 60 + i * 70, 142, '#fff8e0', -i * 800);
  t.r(0, 148, 320, 2, '#6a4a38');
  t.r(0, 150, 320, 1, '#ecc898');
  // passarela de lajes
  t.r(0, 151, 320, 21, 'url(#c5-laje)');
  t.r(160, 151, 160, 21, '#ffc070', 0.08);
  t.r(100, 160, 14, 2, '#f8c8a0');
  t.r(102, 162, 10, 1, '#7a9ac8');
  for (const [x, y] of [[40, 160], [190, 166], [282, 158]] as Ponto[]) {
    t.r(x, y, 1, 3, '#5a7a3a');
    t.r(x + 2, y - 1, 1, 4, '#6a8a40');
    t.r(x + 4, y + 1, 1, 2, '#5a7a3a');
  }
  // balde esquecido
  t.r(140, 160, 8, 7, '#6a4a2a');
  t.r(140, 160, 8, 1, '#a8a8b0');
  t.r(141, 156, 6, 1, '#8a8a98');
  // borda da frente e o topo dos arcos lá embaixo
  t.r(0, 172, 320, 3, '#a07a58');
  t.r(0, 172, 320, 1, '#f0cc98');
  t.r(0, 175, 320, 5, '#3a2a3a');
  for (let x = 0; x < 320; x += 40) t.r(x, 175, 10, 5, '#7a5a48');
  // comportas com as rodas
  comporta(t, 26, 0, 9);
  comporta(t, 272, -700, 12);
  return <>{t.itens}</>;
}

/* ------------------------------------------------------------------ */
/* O Templo de Apolo na hora dourada                                   */
/* ------------------------------------------------------------------ */

/** Braseiro de incenso num tripé, com a fumaça subindo; (x, y) é o pé do tripé. */
function braseiro(t: Pincel, x: number, y: number, atrasoMs: number): void {
  t.r(x - 6, y - 14, 2, 14, '#6a4a2a');
  t.r(x + 5, y - 14, 2, 14, '#6a4a2a');
  t.r(x, y - 12, 1, 12, '#4a3018');
  t.r(x - 7, y - 18, 15, 4, '#a8743a');
  t.r(x - 7, y - 18, 15, 1, '#f0c070');
  t.r(x - 6, y - 14, 13, 1, '#6a4a2a');
  t.ra(x - 5, y - 19, 11, 1, '#ff8a2a', 'c5-tremor', atraso(atrasoMs));
  fumaca(t, x, y - 22, 5, ['#f0e8e0', '#e0d4cc', '#f8f0e8'], 3, 'c5-incenso', 7, atrasoMs);
}

function temploApolo(): JSX.Element {
  const t = pincel();
  padrao(t, 'c5-marmore', 24, 12, (s) => {
    s.r(0, 0, 24, 12, '#b8946a');
    s.r(0, 0, 23, 5, '#e0c090');
    s.r(0, 0, 23, 1, '#f4dcaa');
    s.r(0, 6, 11, 5, '#d8b484');
    s.r(12, 6, 12, 5, '#e0c090');
    s.r(0, 6, 11, 1, '#f0d4a0');
    s.r(12, 6, 12, 1, '#f0d4a0');
    s.r(6, 2, 3, 1, '#c8a478');
  });

  // céu da hora dourada e o sol baixo à direita
  ceu(t, ['#4a6aa8', '#6a7ab0', '#9a88b0', '#c89a98', '#e8ac80', '#f6c47c', '#fad890'], 0, 98);
  halo(t, 286, 58, 70, '#ffe0a0', 0.07, 'c5-pulsar');
  halo(t, 286, 58, 34, '#fff0c0', 0.12, 'c5-pulsar', atraso(-1300));
  disco(t, 286, 58, 14, '#fff0b8', 2);
  disco(t, 286, 58, 10, '#fffadc', 2);
  t.g('c5-nuvem', undefined, (s) => {
    s.r(10, 26, 60, 3, '#f8c8a0');
    s.r(24, 24, 30, 2, '#fde0b8');
    s.r(200, 40, 50, 2, '#f8d0a0');
    s.r(90, 14, 40, 2, '#d8a8b0');
  });
  passaro(t, -10, 30, '#5a3a3a', -2000, 26);
  passaro(t, 4, 38, '#5a3a3a', -9000, 28);
  passaro(t, -6, 24, '#5a3a3a', -17000, 24);

  // colinas e ciprestes ao longe
  t.r(0, 92, 320, 30, '#b87a5a');
  t.r(0, 88, 90, 4, '#b87a5a');
  t.r(230, 86, 90, 6, '#b87a5a');
  t.r(0, 88, 90, 1, '#e8a878');
  t.r(230, 86, 90, 1, '#e8a878');
  for (const [x, h] of [[8, 22], [16, 18], [40, 20], [236, 20], [246, 24], [270, 16]] as Ponto[]) {
    t.r(x, 92 - h, 4, h, '#4a4a2e');
    t.r(x + 1, 90 - h, 2, 2, '#4a4a2e');
    t.r(x + 3, 92 - h, 1, h, '#8a7a48');
  }
  oliveira(t, 22, 112, 0);
  oliveira(t, 300, 112, -1500);

  // a cella, com a porta de bronze aberta e a luz dourada lá dentro
  t.r(56, 48, 208, 64, '#6a4030');
  t.r(56, 48, 208, 8, '#4a2a20');
  arco(t, 160, 70, 14, 28, '#2a160e');
  t.g('c5-pulsar', atraso(-600), (s) => {
    arco(s, 160, 74, 10, 28, '#c8862a');
    s.r(155, 84, 10, 28, '#f8c860');
  });
  t.r(158, 90, 4, 22, '#6a3a1a');
  t.r(158, 86, 4, 4, '#6a3a1a');
  t.r(157, 84, 6, 1, '#fff0a0');
  // colunas
  for (let i = 0; i < 6; i++) coluna(t, 58 + i * 38, 48, 14, 64, '#fff0c8', '#e0c08c', '#a8805a');
  // arquitrave, friso com tríglifos e cornija
  t.r(50, 40, 220, 8, '#e8cc98');
  t.r(50, 40, 220, 1, '#fff0c8');
  t.r(50, 47, 220, 1, '#a8805a');
  t.r(48, 32, 224, 8, '#d8b480');
  for (let x = 52; x < 268; x += 12) {
    t.r(x, 33, 4, 6, '#8a6a4a');
    t.r(x + 7, 35, 2, 2, '#f8d060');
  }
  t.r(44, 29, 232, 3, '#f4dcaa');
  t.r(44, 31, 232, 1, '#a8805a');
  // frontão em degraus, com o sol do Helios no meio
  for (let j = 0; j < 11; j++) {
    const y = 27 - 2 * j;
    const hw = 116 - j * 10;
    t.r(160 - hw, y, hw * 2, 2, '#e8cc98');
    if (hw > 12) t.r(168 - hw, y, (hw - 8) * 2, 2, '#c49a6a');
    t.r(160 - hw, y, 2, 2, '#f8e4b8');
    t.r(158 + hw, y, 2, 2, '#fff8dc');
  }
  halo(t, 160, 18, 12, '#ffe080', 0.15, 'c5-pulsar');
  sol(t, 160, 18, 4, '#f8c840', '#fff4c0');
  // escadaria
  t.r(46, 112, 228, 8, 'url(#c5-marmore)');
  t.r(46, 112, 228, 1, '#fff0c8');
  t.r(40, 120, 240, 8, 'url(#c5-marmore)');
  t.r(40, 120, 240, 1, '#fff0c8');
  t.r(34, 128, 252, 8, 'url(#c5-marmore)');
  t.r(34, 128, 252, 1, '#fff0c8');
  t.r(46, 119, 228, 1, '#8a6a4a');
  t.r(40, 127, 240, 1, '#8a6a4a');
  // coroa de louros e ânforas de oferenda nos degraus
  t.r(110, 108, 8, 4, '#a8743a');
  t.r(111, 106, 6, 2, '#c8864a');
  t.r(206, 108, 8, 4, '#a8743a');
  t.r(207, 106, 6, 2, '#c8864a');
  t.r(150, 124, 10, 2, '#5a8a3a');
  t.r(152, 123, 6, 1, '#7aa84a');
  // estátuas de bronze
  estatua(t, 8, 108, false);
  estatua(t, 294, 108, true);
  // praça de mármore
  t.r(0, 136, 320, 44, 'url(#c5-marmore)');
  t.r(0, 136, 320, 44, '#ffb060', 0.1);
  t.r(0, 136, 320, 1, '#fff0c8');
  t.r(22, 140, 26, 2, '#6a4030', 0.3);
  t.r(246, 140, 26, 2, '#6a4030', 0.3);
  t.r(0, 170, 320, 10, '#4a2a1a', 0.2);
  // braseiros em pé na praça (desenhados depois do chão)
  braseiro(t, 48, 144, -1200);
  braseiro(t, 272, 144, -3600);
  // folhas de oliveira caindo
  for (const [x, y, d] of [[30, 70, 0], [296, 66, -2500], [12, 80, -5000], [306, 78, -7000]] as (readonly [number, number, number])[]) {
    t.g('c5-cair', atraso(d), (s) => {
      s.r(x, y, 2, 1, '#8a9a6a');
      s.r(x + 1, y + 1, 1, 1, '#a8b48a');
    });
  }
  return <>{t.itens}</>;
}

/* ------------------------------------------------------------------ */
/* A câmara do oráculo                                                 */
/* ------------------------------------------------------------------ */

/** Espelho de bronze pendurado por uma corrente; (cx, cy) é o centro. */
function espelho(t: Pincel, cx: number, cy: number, atrasoMs: number): void {
  t.r(cx, 0, 1, cy - 9, '#6a5a3a');
  for (let y = 2; y < cy - 9; y += 4) t.r(cx - 1, y, 3, 1, '#8a7a4a');
  t.r(cx - 3, cy - 10, 7, 2, '#a8743a');
  disco(t, cx, cy, 9, '#7a4e26', 2);
  disco(t, cx, cy, 7, '#e8c070', 2);
  t.r(cx - 4, cy - 5, 3, 2, '#fff4d0');
  t.r(cx + 2, cy + 3, 3, 2, '#c8964a');
  brilho(t, cx - 2, cy - 3, '#ffffff', atrasoMs);
}

function temploOraculo(): JSX.Element {
  const t = pincel();
  padrao(t, 'c5-pedra-oraculo', 24, 16, (s) => {
    s.r(0, 0, 24, 16, '#1e1416');
    s.r(0, 0, 23, 7, '#30222a');
    s.r(0, 0, 23, 1, '#423038');
    s.r(0, 8, 11, 7, '#2c2026');
    s.r(12, 8, 12, 7, '#30222a');
    s.r(0, 8, 11, 1, '#423038');
    s.r(12, 8, 12, 1, '#423038');
  });
  padrao(t, 'c5-piso-oraculo', 16, 16, (s) => {
    s.r(0, 0, 16, 16, '#18101a');
    s.r(0, 0, 15, 7, '#2a1e26');
    s.r(0, 0, 15, 1, '#3a2c34');
    s.r(0, 8, 7, 7, '#2a1e26');
    s.r(8, 8, 8, 7, '#2a1e26');
    s.r(0, 8, 7, 1, '#3a2c34');
    s.r(8, 8, 8, 1, '#3a2c34');
  });
  padrao(t, 'c5-tessela', 3, 3, (s) => {
    s.r(0, 2, 3, 1, '#0a0608', 0.45);
    s.r(2, 0, 1, 2, '#0a0608', 0.45);
  });
  padrao(t, 'c5-friso-estrelas', 16, 8, (s) => {
    s.r(0, 0, 16, 8, '#1a2a4a');
    s.r(0, 0, 16, 1, '#c8963a');
    s.r(0, 7, 16, 1, '#c8963a');
    s.r(7, 2, 1, 4, '#e8c060');
    s.r(5, 3, 5, 2, '#e8c060');
    s.r(13, 4, 1, 1, '#a8c0e8');
  });

  // paredes e abóbada escura
  t.r(0, 0, 320, 136, 'url(#c5-pedra-oraculo)');
  t.r(0, 0, 320, 16, '#0e080a');
  t.r(0, 16, 320, 2, '#3a2a2a');
  // fresta no alto por onde entra o sol
  halo(t, 30, 8, 18, '#ffe8a0', 0.12, 'c5-pulsar');
  t.r(24, 0, 12, 16, '#ffe8a0');
  t.r(26, 0, 8, 16, '#fff8d8');

  // mosaico do sol no meio da parede
  t.r(134, 24, 52, 52, '#c8963a');
  t.r(136, 26, 48, 48, '#1a2a4a');
  for (const [dx, dy] of [[4, 4], [42, 6], [6, 42], [40, 40], [24, 4], [4, 24]] as Ponto[]) t.r(136 + dx, 26 + dy, 2, 2, '#a8c0e8');
  sol(t, 160, 50, 9, '#e8b040', '#fff0a0');
  t.r(136, 26, 48, 48, 'url(#c5-tessela)');
  // painéis menores de estrelas e lua
  for (const x of [52, 244]) {
    t.r(x, 36, 26, 26, '#c8963a');
    t.r(x + 1, 37, 24, 24, '#14203c');
    disco(t, x + 13, 49, 6, '#e8dcb0', 2);
    disco(t, x + 16, 47, 5, '#14203c', 2);
    t.r(x + 4, 40, 1, 1, '#fff2c0');
    t.r(x + 20, 56, 1, 1, '#fff2c0');
    t.r(x + 6, 54, 1, 1, '#a8c0e8');
    t.r(x + 1, 37, 24, 24, 'url(#c5-tessela)');
  }
  // nichos com ânforas
  for (const x of [26, 294]) {
    arco(t, x, 64, 10, 22, '#120a0c');
    t.r(x - 4, 80, 8, 10, '#8a4a2a');
    t.r(x - 2, 76, 4, 4, '#8a4a2a');
    t.r(x - 3, 82, 6, 1, '#e0b060');
    t.r(x - 2, 90, 4, 2, '#6a3a1e');
    t.r(x - 10, 96, 20, 2, '#4a3434');
  }
  // friso de estrelas
  t.r(0, 100, 320, 8, 'url(#c5-friso-estrelas)');
  t.r(0, 128, 320, 4, '#3a2a2a');
  t.r(0, 132, 320, 4, '#4a3434');
  t.r(0, 132, 320, 1, '#6a4e4e');
  // colunas escuras nas pontas
  coluna(t, 2, 18, 12, 118, '#6a5258', '#4a3840', '#2a1e24');
  coluna(t, 306, 18, 12, 118, '#6a5258', '#4a3840', '#2a1e24');

  // feixes de luz: da fresta ao 1º espelho, ao 2º espelho e daí ao tripé
  t.g('c5-feixe', undefined, (s) => {
    for (const [x1, y1, x2, y2] of [[30, 10, 106, 44], [106, 44, 214, 32], [214, 32, 238, 106]] as (readonly [number, number, number, number])[]) {
      raio(s, x1, y1, x2, y2, '#ffe8a0', 10, 0.08);
      raio(s, x1, y1, x2, y2, '#fff0b8', 4, 0.18);
      raio(s, x1, y1, x2, y2, '#ffffff', 1, 0.4);
    }
  });
  for (let i = 0; i < 8; i++) {
    const f = (i + 0.5) / 8;
    const x = i < 4 ? Math.round(30 + 76 * f * 2) : Math.round(106 + 108 * (f - 0.5) * 2);
    const y = i < 4 ? Math.round(10 + 34 * f * 2) + 2 : Math.round(44 - 12 * (f - 0.5) * 2) - 2;
    t.ra(x, y, 1, 1, '#fff8e0', 'c5-poeira', atraso(-i * 700));
  }
  espelho(t, 106, 44, -400);
  espelho(t, 214, 32, -1900);

  // chão e a fenda brilhando
  t.r(0, 136, 320, 44, 'url(#c5-piso-oraculo)');
  const fenda: Ponto[] = [
    [172, 140], [184, 142], [194, 141], [204, 144], [216, 143], [228, 146], [240, 145],
    [252, 149], [264, 151], [274, 155], [286, 159], [298, 165], [312, 172],
  ];
  t.g('c5-pulsar', undefined, (s) => {
    for (let i = 1; i < fenda.length; i++) {
      const a = fenda[i - 1];
      const b = fenda[i];
      if (a && b) s.r(a[0] - 2, Math.min(a[1], b[1]) - 3, b[0] - a[0] + 4, Math.abs(b[1] - a[1]) + 8, '#ff9a30', 0.16);
    }
  });
  for (let i = 1; i < fenda.length; i++) {
    const a = fenda[i - 1];
    const b = fenda[i];
    if (!a || !b) continue;
    t.r(a[0], a[1], b[0] - a[0], 2, '#ffa040');
    t.r(a[0] + 1, a[1], b[0] - a[0] - 2, 1, '#fff4c0');
    t.r(b[0] - 1, Math.min(a[1], b[1]), 2, Math.abs(b[1] - a[1]) + 2, '#ffa040');
  }
  // vapor saindo da fenda
  for (const [x, y, d] of [[190, 140, 0], [222, 142, -1300], [246, 144, -2600], [270, 152, -3900], [294, 160, -5200]] as (readonly [number, number, number])[]) {
    fumaca(t, x, y, 4, ['#e8f0d0', '#d8e4c0', '#f0f4e0'], 3, 'c5-exalar', 6, d);
  }

  // anel de velas em volta do tripé (as de trás primeiro)
  const velas: Ponto[] = [];
  for (let i = 0; i < 12; i++) {
    const ang = (i / 12) * Math.PI * 2;
    velas.push([Math.round(238 + 50 * Math.cos(ang)), Math.round(148 + 10 * Math.sin(ang))]);
  }
  velas.forEach(([x, y], i) => {
    if (y < 148) vela(t, x - 1, y - 5, 5, -i * 260, true, i % 2 ? 0.06 : 0);
  });
  // tripé de bronze sobre a fenda
  linha(t, 230, 112, 222, 146, '#7a4e26', 2);
  linha(t, 246, 112, 254, 146, '#7a4e26', 2);
  linha(t, 238, 112, 238, 148, '#5a3a1e', 2);
  t.r(220, 145, 5, 2, '#a8743a');
  t.r(252, 145, 5, 2, '#a8743a');
  halo(t, 238, 106, 14, '#fff0a0', 0.15, 'c5-pulsar');
  t.r(226, 106, 24, 6, '#a8743a');
  t.r(226, 106, 24, 1, '#f0c070');
  t.r(228, 112, 20, 2, '#6a4a2a');
  t.r(232, 105, 12, 1, '#fff8d8');
  t.r(244, 103, 6, 2, '#5a8a3a');
  t.r(246, 102, 3, 1, '#7aa84a');
  velas.forEach(([x, y], i) => {
    if (y >= 148) vela(t, x - 1, y - 5, 5, -i * 260, true, i % 2 ? 0.06 : 0);
  });

  // oferendas no chão: rolo da profecia e coroa de louros
  t.r(30, 150, 14, 4, '#e0d0a8');
  t.r(30, 150, 2, 4, '#a8946a');
  t.r(42, 150, 2, 4, '#a8946a');
  t.r(60, 160, 8, 2, '#5a8a3a');
  t.r(59, 158, 2, 2, '#5a8a3a');
  t.r(67, 158, 2, 2, '#5a8a3a');
  t.r(0, 166, 320, 14, '#06040a', 0.3);
  t.r(0, 0, 320, 180, '#2a1020', 0.08);
  return <>{t.itens}</>;
}

/* ------------------------------------------------------------------ */
/* O Coliseu durante o eclipse                                         */
/* ------------------------------------------------------------------ */

function coliseuEclipse(): JSX.Element {
  const t = pincel();
  padrao(t, 'c5-povo-sombra', 10, 10, (s) => {
    s.r(0, 0, 10, 10, '#1c1620');
    s.r(1, 1, 3, 3, '#0c0a10');
    s.r(0, 4, 5, 6, '#0c0a10');
    s.r(6, 2, 3, 3, '#100c14');
    s.r(5, 5, 5, 5, '#100c14');
    s.r(1, 1, 3, 1, '#6a3a2a');
    s.r(6, 2, 3, 1, '#5a3226');
  });
  padrao(t, 'c5-areia', 16, 8, (s) => {
    s.r(0, 0, 16, 8, '#6a4a30');
    s.r(3, 2, 1, 1, '#8a6440');
    s.r(11, 5, 1, 1, '#8a6440');
    s.r(7, 6, 2, 1, '#5a3e28');
    s.r(14, 1, 1, 1, '#4a3222');
  });

  // céu escuro de dia, com estrelas
  ceu(t, ['#04050c', '#070814', '#0c0c1e', '#141228', '#1e1630', '#2e1c34'], 0, 54);
  estrelas(t, 0, 319, 2, 44, 40, 23);
  // o sol negro e a coroa
  t.g('c5-coroa', undefined, (s) => {
    halo(s, 160, 26, 34, '#ffe8b0', 0.06);
    halo(s, 160, 26, 20, '#fff4d8', 0.12);
    s.r(159, 2, 2, 48, '#fff4d8', 0.3);
    s.r(134, 25, 52, 2, '#fff4d8', 0.3);
    for (const [dx, dy] of [[-13, -13], [13, -13], [-13, 13], [13, 13], [-17, -7], [17, 7], [-7, 17], [7, -17]] as Ponto[]) {
      s.r(160 + dx - 1, 26 + dy - 1, 2, 2, '#ffe8c0', 0.45);
    }
    disco(s, 160, 26, 12, '#fff8e8', 2);
  });
  disco(t, 160, 26, 10, '#050308', 2);
  brilho(t, 168, 19, '#ffffff', -400);
  // horizonte alaranjado e estranho
  t.r(0, 40, 320, 6, '#5a2a2a');
  t.r(0, 46, 320, 4, '#a8482a');
  t.r(0, 50, 320, 4, '#e0782a');

  // ático com arcos abertos para a luz do horizonte e os mastros do velário
  t.r(0, 50, 320, 14, '#2a2026');
  t.r(0, 50, 320, 1, '#e8903a');
  for (let x = 6; x < 320; x += 20) {
    t.r(x, 53, 8, 9, '#e07a2a');
    t.r(x, 53, 8, 3, '#f0a040');
    t.r(x + 14, 40, 2, 12, '#120e14');
  }
  // arquibancadas lotadas de sombras
  [64, 76, 88].forEach((y, i) => {
    t.r(0, y, 320, 12, '#1a1418');
    t.g('c5-multidao', atraso(-i * 400), (s) => s.r(0, y, 320, 10, 'url(#c5-povo-sombra)'));
    t.r(0, y + 10, 320, 2, '#4a3030');
    t.r(0, y + 10, 320, 1, '#8a5a3a');
  });
  for (let i = 0; i < 7; i++) {
    const x = entre(i * 23 + 5, 6, 314);
    if (x > 130 && x < 190) continue;
    t.ra(x, 66 + (i % 3) * 12, 1, 1, '#ffb050', 'c5-tremor', atraso(-i * 450));
  }
  // camarote do Censor
  t.r(140, 58, 40, 42, '#2a1a1a');
  t.r(136, 58, 48, 6, '#6a0e10');
  t.r(136, 58, 48, 1, '#c8902a');
  t.r(146, 66, 28, 20, '#0e0608');
  halo(t, 160, 76, 14, '#ff3a2a', 0.1, 'c5-olho');
  olho(t, 160, 76, 1, 0);
  t.r(142, 86, 8, 14, '#8a1014');
  t.r(170, 86, 8, 14, '#8a1014');
  t.r(145, 91, 2, 2, '#ff3a2a');
  t.r(173, 91, 2, 2, '#ff3a2a');

  // muro do pódio com tochas
  t.r(0, 100, 320, 12, '#4a3a36');
  t.r(0, 100, 320, 2, '#8a6a5a');
  for (let x = 26; x < 320; x += 52) {
    if (x > 130 && x < 190) continue;
    t.r(x, 104, 12, 8, '#0e0a0c');
  }
  for (const [x, d] of [[16, 0], [66, -300], [116, -700], [200, -200], [250, -900], [300, -500]] as Ponto[]) tocha(t, x, 96, d, 0.08);

  // arena de areia
  t.r(0, 112, 320, 68, 'url(#c5-areia)');
  t.r(0, 112, 320, 2, '#8a5a3a');
  for (const x of [16, 66, 116, 200, 250, 300]) t.r(x - 12, 112, 30, 8, '#ff9a3a', 0.08);
  t.r(0, 112, 320, 68, '#2a2050', 0.25);
  // faixas de sombra do eclipse passando pela areia
  t.g('c5-faixas', undefined, (s) => {
    for (let i = 0; i < 6; i++) s.r(-20 + i * 60, 120 + (i % 3) * 18, 40, 2, '#ffe8c0', 0.06);
  });
  // escudo largado, lança fincada e pegadas
  disco(t, 40, 152, 6, '#5a1a1a', 2);
  disco(t, 40, 152, 3, '#a8803a', 2);
  t.r(282, 128, 1, 22, '#5a3e28');
  t.r(281, 126, 3, 3, '#a8a8b0');
  for (let i = 0; i < 5; i++) t.r(90 + i * 9, 166 - (i % 2) * 3, 3, 1, '#4a3222');
  t.r(0, 164, 320, 16, '#0a0610', 0.3);
  return <>{t.itens}</>;
}
