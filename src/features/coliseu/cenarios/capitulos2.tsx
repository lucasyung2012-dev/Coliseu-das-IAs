/**
 * Cenários do segundo bloco de capítulos do modo História (Coliseu), em pixel art de 320 × 180:
 * o Ludus do Brutus (pátio, forja e celas), as catacumbas e o arquivo do Arquivista das Sombras,
 * o Fórum, o porto de Óstia ao entardecer e o convés do navio de guerra do Censor.
 *
 * `desenhoCapitulo2(lugar)` devolve só o conteúdo do SVG (sem a tag <svg>) para viewBox "0 0 320 180";
 * quem chama põe o <svg> com shapeRendering="crispEdges". Lugares que não são destes capítulos devolvem null.
 *
 * Regras do desenho: coordenadas inteiras, quase tudo em <rect>, chão entre y 136 e 180 (os pés dos
 * personagens ficam por volta de y 155), a faixa central (y 70 a 150) mais calma para os personagens e
 * o topo (uns 18 px) livre de detalhe importante, porque o HUD pode cobrir.
 * As animações de ambiente usam as classes "c2-" de capitulos2.css.
 */
import './capitulos2.css';
import type { CSSProperties } from 'react';

export function desenhoCapitulo2(lugar: string): JSX.Element | null {
  switch (lugar) {
    case 'ludus-patio':
      return ludusPatio();
    case 'ludus-forja':
      return ludusForja();
    case 'ludus-celas':
      return ludusCelas();
    case 'catacumbas':
      return catacumbas();
    case 'catacumbas-arquivo':
      return arquivo();
    case 'forum':
      return forum();
    case 'porto-docas':
      return portoDocas();
    case 'navio-conves':
      return navioConves();
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

/** Linha fina (cordas, cabos, cordame). */
function linha(t: Pincel, x1: number, y1: number, x2: number, y2: number, cor: string, opacity?: number): void {
  t.el((k) => <line key={k} x1={x1} y1={y1} x2={x2} y2={y2} stroke={cor} strokeWidth={1} opacity={opacity} />);
}

/** Céu em faixas (degradê em degraus) de y0 até y1. */
function ceu(t: Pincel, cores: readonly string[], y0: number, y1: number): void {
  const h = Math.ceil((y1 - y0) / cores.length);
  cores.forEach((c, i) => t.r(0, y0 + i * h, 320, h, c));
}

/** Nuvens fofas andando devagar. */
function nuvens(t: Pincel, lista: readonly Ponto[], cor: string, sombra: string, atrasoMs: number): void {
  t.g('c2-nuvem', atraso(atrasoMs), (s) => {
    for (const [x, y] of lista) {
      s.r(x, y, 28, 6, cor);
      s.r(x + 5, y - 4, 14, 4, cor);
      s.r(x + 16, y - 2, 8, 2, cor);
      s.r(x + 2, y + 6, 24, 2, sombra);
    }
  });
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

/** Poça de luz achatada no chão. */
function poca(t: Pincel, cx: number, cy: number, larg: number, cor: string, op: number): void {
  t.g('c2-pulsar', undefined, (s) => {
    s.r(cx - larg, cy - 2, larg * 2, 5, cor, op);
    s.r(cx - Math.round(larg * 0.7), cy - 4, Math.round(larg * 1.4), 9, cor, op);
    s.r(cx - Math.round(larg * 0.4), cy - 5, Math.round(larg * 0.8), 11, cor, op);
  });
}

/** Tocha de parede; (x, y) é o canto de cima da chama. */
function tocha(t: Pincel, x: number, y: number, atrasoMs = 0): void {
  halo(t, x + 2, y + 5, 26, '#ff9a3c', 0.07, 'c2-pulsar', atraso(atrasoMs));
  t.r(x - 2, y + 7, 8, 2, '#5a4030');
  t.r(x - 1, y + 9, 6, 2, '#3a2a20');
  t.r(x + 1, y + 11, 2, 8, '#4a3020');
  t.r(x + 1, y + 11, 1, 8, '#6a4a30');
  t.r(x - 1, y + 17, 6, 3, '#2a2228');
  t.g('c2-chama', atraso(atrasoMs), (s) => {
    s.r(x - 1, y + 3, 6, 5, '#e0401a');
    s.r(x, y + 1, 4, 6, '#ff8a2a');
    s.r(x + 1, y - 2, 2, 5, '#ffc04a');
    s.r(x + 1, y + 3, 2, 3, '#fff0b0');
  });
}

/** Labareda grande: x é o centro, base é o y do pé, s é a largura. */
function chama(t: Pincel, x: number, base: number, s: number, atrasoMs: number): void {
  const h = Math.round(s * 1.6);
  const meia = Math.round(s / 2);
  t.g('c2-chama', { animationDelay: `${atrasoMs}ms`, animationDuration: `${400 + (Math.abs(atrasoMs) % 300)}ms` }, (c) => {
    c.r(x - meia, base - Math.round(h * 0.6), s, Math.round(h * 0.6), '#b8201a');
    c.r(x - meia + 1, base - h, Math.max(2, s - 4), Math.round(h * 0.5), '#e0401a');
    c.r(x - Math.round(s * 0.35), base - Math.round(h * 0.75), Math.max(2, Math.round(s * 0.7)), Math.round(h * 0.75), '#ff7a2a');
    c.r(x - Math.round(s * 0.2), base - Math.round(h * 0.55), Math.max(1, Math.round(s * 0.4)), Math.round(h * 0.55), '#ffc04a');
    c.r(x - Math.round(s * 0.1), base - Math.round(h * 0.3), Math.max(1, Math.round(s * 0.2)), Math.round(h * 0.3), '#fff0b0');
  });
}

/** Vapor saindo de algo quente (água da têmpera, cano). */
function vapor(t: Pincel, x: number, y: number, atrasoMs: number): void {
  for (let k = 0; k < 3; k++) {
    t.ra(x - 2, y - 3, 5 + k, 4, '#e0e0ec', 'c2-vapor', atraso(atrasoMs - k * 900));
  }
}

/** Poeira flutuando numa região. */
function poeira(t: Pincel, n: number, x0: number, x1: number, y0: number, y1: number, cores: readonly string[], semente: number): void {
  for (let i = 0; i < n; i++) {
    const x = entre(semente + i * 13 + 1, x0, x1);
    const y = entre(semente + i * 7 + 3, y0, y1);
    t.ra(x, y, 1, 1, de(cores, i), 'c2-poeira', {
      animationDelay: `${-i * 370}ms`,
      animationDuration: `${6 + (i % 4)}s`,
    });
  }
}

/** Chão de lajes em perspectiva (lajes maiores perto de quem olha), de y0 até 180. */
function chao(t: Pincel, y0: number, paleta: readonly string[], rejunte: string, larg0: number, semente: number): void {
  t.r(0, y0, 320, 180 - y0, rejunte);
  const alturas = [5, 6, 8, 10, 15];
  let y = y0;
  alturas.forEach((h, fila) => {
    if (y >= 180) return;
    const hh = Math.min(h, 180 - y);
    const larg = larg0 + fila * Math.floor(larg0 / 2);
    let x = -((fila * 11 + semente) % larg);
    let n = 0;
    while (x < 320) {
      const w = larg + entre(semente + fila * 50 + n, -3, 3);
      t.r(x + 1, y + 1, w - 1, hh - 1, de(paleta, entre(semente + fila * 31 + n * 7, 0, paleta.length - 1)));
      x += w;
      n++;
    }
    y += h;
  });
}

/** Parede de blocos: rejunte a cada fileira, juntas desencontradas e alguns blocos com a borda clara. */
function blocos(
  t: Pincel,
  x0: number,
  y0: number,
  w: number,
  h: number,
  alt: number,
  larg: number,
  cores: { base: string; rejunte: string; claro: string },
  semente: number,
): void {
  t.r(x0, y0, w, h, cores.base);
  for (let y = y0, fila = 0; y < y0 + h; y += alt, fila++) {
    t.r(x0, y, w, 1, cores.rejunte);
    const hh = Math.min(alt - 1, y0 + h - y - 1);
    if (hh <= 0) continue;
    const desloc = fila % 2 ? Math.floor(larg / 2) : 0;
    for (let x = x0 - desloc + larg, k = 0; x < x0 + w; x += larg, k++) {
      t.r(x, y + 1, 1, hh, cores.rejunte);
      if (sorte(semente + fila * 37 + k) > 0.8) t.r(x + 1, y + 1, Math.min(larg - 1, x0 + w - x - 1), 1, cores.claro);
    }
  }
}

/** Olho do Censor: (cx, cy) é o centro e e é a escala inteira (1 = 12 × 6). */
function olho(t: Pincel, cx: number, cy: number, e: number, atrasoMs: number): void {
  t.r(cx - 6 * e, cy - e, 12 * e, 2 * e, '#f0e6dc');
  t.r(cx - 4 * e, cy - 2 * e, 8 * e, 4 * e, '#f0e6dc');
  t.r(cx - 2 * e, cy - 3 * e, 4 * e, 6 * e, '#f0e6dc');
  t.ra(cx - 2 * e, cy - 2 * e, 4 * e, 4 * e, '#e0201a', 'c2-olho', atraso(atrasoMs));
  t.r(cx - e, cy - e, 2 * e, 2 * e, '#1a0606');
}

/** Estandarte vermelho do Censor, com o olho no meio e a ponta em V. */
function bandeiraOlho(t: Pincel, x: number, y: number, w: number, h: number, e: number, atrasoMs: number): void {
  const cx = x + Math.floor(w / 2);
  const cy = y + Math.floor(h / 2) - 2;
  const q = Math.floor(w / 4);
  t.g('c2-bandeira', atraso(atrasoMs), (s) => {
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

/** Pomba atravessando o céu, batendo as asas. */
function pombaVoando(t: Pincel, x: number, y: number, atrasoMs: number): void {
  t.g('c2-pomba', atraso(atrasoMs), (s) => {
    s.r(x, y, 6, 3, '#f0f0f8');
    s.r(x + 6, y - 1, 2, 2, '#f0f0f8');
    s.r(x - 2, y + 1, 2, 1, '#d8d8e8');
    s.g('c2-asa', undefined, (a) => a.r(x + 1, y - 3, 4, 3, '#d8d8e8'));
  });
}

/** Pomba (ou pardal) bicando o chão; (x, y) é o canto de cima do corpo. */
function pombaChao(t: Pincel, x: number, y: number, atrasoMs: number): void {
  t.r(x - 1, y + 4, 9, 1, '#000000', 0.15);
  t.g('c2-bicar', atraso(atrasoMs), (s) => {
    s.r(x, y, 6, 4, '#a8a8b8');
    s.r(x + 5, y - 2, 3, 3, '#8a8aa0');
    s.r(x + 8, y - 1, 1, 1, '#e0a040');
    s.r(x + 6, y - 1, 1, 1, '#1a1a1a');
    s.r(x - 2, y + 1, 2, 2, '#8a8aa0');
    s.r(x + 1, y + 1, 3, 1, '#c8c8d8');
  });
  t.r(x + 2, y + 4, 1, 1, '#e06a5a');
  t.r(x + 4, y + 4, 1, 1, '#e06a5a');
}

/** Gaivota planando pelo céu. */
function gaivota(t: Pincel, x: number, y: number, atrasoMs: number, duracaoS: number): void {
  t.g('c2-gaivota', { animationDelay: `${atrasoMs}ms`, animationDuration: `${duracaoS}s` }, (s) => {
    s.r(x, y, 5, 2, '#f4f0ea');
    s.r(x + 5, y, 2, 1, '#e0a040');
    s.g('c2-asa', atraso(atrasoMs), (a) => {
      a.r(x - 4, y - 2, 5, 2, '#d8d4cc');
      a.r(x + 3, y - 2, 4, 2, '#d8d4cc');
      a.r(x - 5, y - 3, 2, 1, '#3a3a40');
    });
  });
}

/** Engrenagem girando em volta do próprio centro (origem da rotação em unidades do desenho). */
function engrenagem(t: Pincel, cx: number, cy: number, r: number, cor: string, escuro: string, duracaoS: number, reversa: boolean): void {
  const d = Math.round(r * 0.7);
  t.g(
    'c2-gira',
    {
      transformOrigin: `${cx}px ${cy}px`,
      animationDuration: `${duracaoS}s`,
      animationDirection: reversa ? 'reverse' : 'normal',
    },
    (s) => {
      s.r(cx - r - 2, cy - 1, r * 2 + 4, 3, cor);
      s.r(cx - 1, cy - r - 2, 3, r * 2 + 4, cor);
      for (const [dx, dy] of [[-d, -d], [d, -d], [-d, d], [d, d]] as Ponto[]) s.r(cx + dx - 1, cy + dy - 1, 3, 3, cor);
      disco(s, cx, cy, r, cor, 2);
      disco(s, cx, cy, Math.max(2, r - 3), escuro, 2);
      s.r(cx - 1, cy - r + 2, 2, r * 2 - 4, cor);
      s.r(cx - r + 2, cy - 1, r * 2 - 4, 2, cor);
      s.r(cx - 1, cy - 1, 2, 2, '#1a1208');
    },
  );
}

/* ------------------------------------------------------------------ */
/* Ludus: o pátio de treino (dia, casa do Brutus)                      */
/* ------------------------------------------------------------------ */

/** Porta de cela com grade; x é a esquerda (22 de largura) e y o topo do arco. Termina em y + 32. */
function portaCela(t: Pincel, x: number, y: number): void {
  arco(t, x + 11, y - 2, 13, 21, '#b08a5c', 4);
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
  // espadas de madeira (rudis)
  for (const dx of [6, 13]) {
    t.r(x + dx, 104, 2, 26, '#b08250');
    t.r(x + dx, 104, 1, 26, '#d0a26a');
    t.r(x + dx - 1, 118, 4, 1, '#5a3a1a');
  }
  // lança
  t.r(x + 22, 94, 1, 40, '#7a5432');
  t.r(x + 21, 90, 3, 5, '#c8ccd8');
  t.r(x + 22, 89, 1, 1, '#e8ecf4');
  // escudo de madeira encostado
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
  // corte de espada na palha
  t.r(x + 1, 127, 5, 1, '#f4e4a8');
  // cabeça e o elmo amassado
  t.r(x - 4, 104, 8, 8, '#d8b860');
  t.r(x - 5, 101, 10, 5, '#8a8a96');
  t.r(x - 5, 101, 10, 1, '#c0c0cc');
  t.r(x + 2, 103, 2, 2, '#6a6a76');
  t.r(x - 1, 98, 2, 3, '#c8962a');
  // escudo pendurado no braço
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
  // postes, telhado e sarilho
  t.r(x + 1, 104, 3, 27, '#6a4224');
  t.r(x + 32, 104, 3, 27, '#6a4224');
  t.r(x - 3, 100, 42, 4, '#b85a32');
  t.r(x - 3, 100, 42, 1, '#e07c4c');
  t.r(x + 3, 96, 30, 4, '#a04a28');
  t.r(x + 4, 112, 28, 2, '#5a3a20');
  t.r(x + 35, 110, 2, 6, '#5a3a20');
  t.r(x + 37, 114, 3, 2, '#5a3a20');
  t.r(x + 18, 114, 1, 12, '#c8a870');
  // balde molhado
  t.r(x + 14, 124, 10, 7, '#7a5030');
  t.r(x + 14, 126, 10, 1, '#3a3a44');
  t.r(x + 15, 124, 2, 7, '#9a6a40');
}

function ludusPatio(): JSX.Element {
  const t = pincel();
  ceu(t, ['#6cb8ec', '#80c4f0', '#96cef2', '#acd8f4', '#c2e4f8', '#d4ecf8'], 0, 60);
  // sol e nuvens
  halo(t, 40, 22, 24, '#fff6c8', 0.16);
  t.r(34, 16, 12, 12, '#fff6c8');
  t.r(32, 18, 16, 8, '#fff6c8');
  t.r(36, 14, 8, 16, '#fff6c8');
  t.r(36, 17, 5, 4, '#ffffff');
  nuvens(t, [[96, 18], [180, 10], [262, 24]], '#ffffff', '#dceefa', 0);
  // Roma ao longe: morros, ciprestes e o Coliseu
  t.r(0, 44, 320, 16, '#b4c8d4');
  t.r(0, 40, 70, 4, '#b4c8d4');
  t.r(120, 38, 60, 6, '#b4c8d4');
  t.r(0, 50, 320, 10, '#a8bccc');
  t.r(206, 30, 80, 24, '#bcc4d0');
  t.r(206, 28, 80, 2, '#d0d8e2');
  t.r(206, 30, 6, 24, '#a8b2c0');
  for (let k = 0; k < 9; k++) t.r(214 + k * 8, 38, 4, 6, '#8e9ab0');
  t.r(206, 46, 80, 1, '#a8b2c0');
  for (const x of [20, 27, 154]) {
    t.r(x, 34, 5, 22, '#5a7a5a');
    t.r(x + 1, 30, 3, 4, '#5a7a5a');
    t.r(x + 1, 36, 1, 16, '#6e8e6a');
  }

  // muro do Ludus: telhado, galeria de arcos em cima e as celas embaixo
  t.r(0, 60, 320, 76, '#d6b282');
  t.r(0, 53, 320, 7, '#b85a32');
  t.r(0, 53, 320, 1, '#e07c4c');
  for (let k = 0; k < 16; k++) t.r(k * 20 + 4, 54, 1, 6, '#94401e');
  t.r(0, 60, 320, 2, '#8a5a3a');
  // flâmula do Brutus no telhado
  t.r(159, 34, 2, 20, '#5a3a20');
  t.r(158, 32, 4, 2, '#e0b040');
  t.g('c2-bandeira', atraso(-700), (s) => {
    s.r(161, 35, 14, 6, '#24366e');
    s.r(175, 36, 4, 4, '#24366e');
    s.r(179, 37, 3, 2, '#24366e');
    s.r(161, 35, 14, 1, '#e0b040');
  });
  // galeria
  for (const cx of [18, 50, 82, 114, 206, 238, 270, 302]) {
    t.r(cx - 12, 66, 24, 30, '#e6c896');
    arco(t, cx, 68, 10, 18, '#5a3a28', 3);
    t.r(cx - 11, 93, 22, 3, '#f0d8a8');
  }
  // vida na galeria: um gladiador olhando o treino e um pano secando
  t.r(237, 82, 5, 5, '#c08a5a');
  t.r(237, 81, 5, 2, '#3a2418');
  t.r(235, 87, 9, 6, '#8a3a2a');
  t.r(43, 89, 12, 9, '#e8e0c8');
  t.r(43, 91, 12, 1, '#c84a3a');
  t.r(43, 95, 12, 1, '#c84a3a');
  // pilastras do centro e o estandarte do Brutus (azul com o elmo dourado)
  t.r(128, 62, 4, 34, '#c49e6c');
  t.r(188, 62, 4, 34, '#c49e6c');
  t.r(142, 62, 36, 2, '#6a4a2a');
  t.r(141, 61, 2, 4, '#e0b040');
  t.r(177, 61, 2, 4, '#e0b040');
  t.g('c2-bandeira', undefined, (s) => {
    s.r(146, 64, 28, 28, '#24366e');
    s.r(146, 64, 28, 2, '#e0b040');
    s.r(146, 64, 2, 28, '#e0b040');
    s.r(172, 64, 2, 28, '#e0b040');
    s.r(146, 92, 12, 3, '#24366e');
    s.r(162, 92, 12, 3, '#24366e');
    s.r(146, 95, 7, 2, '#24366e');
    s.r(167, 95, 7, 2, '#24366e');
    // elmo (galea) com penacho branco
    s.r(156, 67, 8, 3, '#f0ece0');
    s.r(158, 66, 6, 1, '#f0ece0');
    s.r(155, 70, 10, 3, '#e0b040');
    s.r(154, 73, 12, 8, '#e0b040');
    s.r(156, 75, 8, 5, '#16204a');
    s.r(158, 75, 1, 5, '#e0b040');
    s.r(161, 75, 1, 5, '#e0b040');
    s.r(156, 77, 8, 1, '#e0b040');
    s.r(152, 81, 16, 2, '#c8962a');
    s.r(155, 71, 2, 4, '#fff0a0');
    // gládio embaixo
    s.r(150, 86, 14, 2, '#e0e0ea');
    s.r(164, 84, 2, 6, '#e0b040');
    s.r(166, 86, 4, 2, '#6a4220');
    s.r(170, 85, 2, 4, '#e0b040');
  });
  // cornija entre os andares
  t.r(0, 96, 320, 4, '#c09a6a');
  t.r(0, 96, 320, 1, '#f2dcae');
  t.r(0, 99, 320, 1, '#8a6440');
  // reboco gasto
  for (let i = 0; i < 6; i++) {
    t.r(entre(i * 3 + 5, 0, 310), entre(i * 5 + 9, 102, 126), entre(i + 40, 3, 8), 2, i % 2 ? '#c8a272' : '#e2c294');
  }
  // portas das celas
  for (const x of [8, 46, 252, 290]) portaCela(t, x, 104);
  // portão do meio
  arco(t, 160, 100, 24, 12, '#b89060', 3);
  arco(t, 160, 104, 20, 12, '#5a3a22', 3);
  for (const x of [148, 154, 166, 172]) t.r(x, 114, 1, 22, '#3e2616');
  t.r(159, 104, 2, 32, '#2a180c');
  t.r(142, 114, 36, 2, '#3a3a44');
  t.r(141, 128, 38, 2, '#3a3a44');
  for (let k = 0; k < 5; k++) t.r(144 + k * 8, 114, 2, 2, '#8a8a96');
  t.r(154, 120, 3, 3, '#c8962a');
  t.r(163, 120, 3, 3, '#c8962a');
  // suportes de tocha apagados
  t.r(131, 108, 4, 2, '#3a3a44');
  t.r(132, 104, 2, 4, '#4a3020');
  t.r(185, 108, 4, 2, '#3a3a44');
  t.r(186, 104, 2, 4, '#4a3020');
  // suportes de armas
  suporteArmas(t, 84);
  suporteArmas(t, 200);
  t.r(0, 132, 320, 4, '#a8845a');

  // areia do pátio
  t.r(0, 136, 320, 44, '#e2c890');
  t.r(0, 136, 320, 5, '#c4a670');
  t.r(0, 141, 320, 2, '#d4b880');
  t.r(0, 168, 320, 12, '#e8d29e');
  for (let i = 0; i < 4; i++) t.r(entre(i * 9 + 3, 0, 280), entre(i * 4 + 70, 146, 176), entre(i + 90, 20, 40), 1, '#d2b67e');
  for (let i = 0; i < 16; i++) {
    t.r(entre(i * 17 + 2, 0, 318), entre(i * 11 + 6, 144, 178), 1, 1, i % 3 ? '#c8aa72' : '#f2deb0');
  }
  // pegadas cruzando o pátio
  for (let k = 0; k < 6; k++) {
    const x = 120 + k * 14;
    t.r(x, 160 + (k % 2) * 4, 3, 2, '#c4a670');
  }
  // bonecos de treino, um poste com marcas e o poço
  boneco(t, 40, '#4a6a9a');
  t.r(72, 128, 5, 28, '#7a5030');
  t.r(72, 128, 2, 28, '#9a6a40');
  for (const y of [132, 138, 145]) t.r(76, y, 1, 2, '#4a2e18');
  t.r(68, 154, 13, 3, '#b89a68');
  boneco(t, 240, '#8a3a2a');
  poco(t, 278);
  // ânfora e balde d'água com concha
  t.r(4, 140, 8, 12, '#b0603a');
  t.r(5, 137, 6, 3, '#b0603a');
  t.r(6, 152, 4, 3, '#8a4a2a');
  t.r(5, 141, 2, 8, '#d07a4a');
  t.r(206, 166, 12, 8, '#7a5030');
  t.r(207, 167, 10, 2, '#5a8ab0');
  t.r(214, 160, 1, 8, '#8a8a96');
  // pardais e poeira no sol
  pombaChao(t, 116, 168, 0);
  pombaChao(t, 186, 172, -900);
  poeira(t, 8, 20, 300, 100, 150, ['#fff6d0', '#f0dca8'], 3);
  return <>{t.itens}</>;
}

/* ------------------------------------------------------------------ */
/* Ludus: a forja (fundos, fogo e o túnel escondido)                   */
/* ------------------------------------------------------------------ */

function ludusForja(): JSX.Element {
  const t = pincel();
  t.r(0, 0, 320, 180, '#1a120e');
  blocos(t, 0, 16, 320, 120, 15, 40, { base: '#3a2a24', rejunte: '#22160f', claro: '#4a3830' }, 21);
  // teto e vigas
  t.r(0, 0, 320, 10, '#160e0a');
  t.r(0, 10, 320, 6, '#4a2e1a');
  t.r(0, 10, 320, 1, '#6a4428');
  t.r(0, 15, 320, 1, '#22140a');
  t.r(126, 16, 6, 120, '#3e2616');
  t.r(126, 16, 1, 120, '#5a3a22');
  // brilho geral do fogo
  halo(t, 50, 112, 74, '#ff7a1a', 0.06, 'c2-pulsar');

  // fornalha (esquerda) e a chaminé
  t.r(36, 0, 28, 48, '#4a3a36');
  t.r(36, 0, 4, 48, '#5e4c46');
  t.r(34, 20, 32, 3, '#2e2420');
  t.r(34, 38, 32, 3, '#2e2420');
  arco(t, 50, 44, 40, 52, '#5a4846', 4);
  for (let i = 0; i < 14; i++) {
    t.r(entre(i * 11 + 2, 22, 72), entre(i * 17 + 5, 62, 128), 7, 4, i % 2 ? '#6a5652' : '#46383a');
  }
  arco(t, 50, 94, 18, 24, '#1a0a06');
  arco(t, 50, 100, 14, 22, '#5a1a08');
  t.g('c2-pulsar', atraso(-600), (s) => arco(s, 50, 106, 10, 20, '#b8361a'));
  chama(t, 43, 132, 10, 0);
  chama(t, 57, 132, 8, -250);
  chama(t, 50, 132, 6, -500);
  for (let k = 0; k < 8; k++) t.r(35 + k * 4, 130 + (k % 2), 4, 3, k % 3 ? '#ff8a2a' : '#ffd060');
  t.r(32, 92, 36, 2, '#ff9a3a', 0.35);
  // brasas subindo da boca
  for (let i = 0; i < 6; i++) {
    t.ra(entre(i * 5 + 1, 40, 60), 100, 1, 1, i % 2 ? '#ffd060' : '#ff8a2a', 'c2-brasa', { animationDelay: `${-i * 520}ms` });
  }

  // fole
  t.r(78, 117, 10, 3, '#2a2a30');
  t.g('c2-fole', undefined, (s) => {
    s.r(86, 112, 24, 3, '#7a5030');
    s.r(86, 112, 24, 1, '#9a6a40');
    s.r(88, 115, 20, 9, '#5a3020');
    s.r(88, 118, 20, 1, '#3e1e14');
    s.r(88, 121, 20, 1, '#3e1e14');
  });
  t.r(86, 124, 24, 3, '#6a4224');
  t.r(108, 104, 2, 9, '#7a5030');
  t.r(108, 102, 9, 2, '#7a5030');
  t.r(96, 127, 4, 9, '#4a2e1a');

  // parede da direita: ferramentas penduradas
  t.r(138, 36, 64, 3, '#6a4224');
  t.r(138, 36, 64, 1, '#8a5a30');
  for (let k = 0; k < 6; k++) t.r(142 + k * 10, 39, 2, 2, '#2a2a30');
  t.r(142, 41, 1, 22, '#4a4a56');
  t.r(145, 41, 1, 22, '#4a4a56');
  t.r(141, 62, 2, 3, '#4a4a56');
  t.r(145, 62, 2, 3, '#4a4a56');
  t.r(153, 41, 2, 18, '#7a5030');
  t.r(150, 57, 8, 5, '#4a4a56');
  t.r(163, 41, 2, 24, '#7a5030');
  t.r(159, 63, 10, 6, '#3e3e4a');
  t.r(159, 63, 10, 1, '#6a6a7a');
  t.r(173, 41, 2, 16, '#6a6a78');
  t.r(173, 41, 2, 4, '#7a5030');
  t.r(183, 41, 2, 12, '#8a8a96');
  t.r(193, 41, 1, 16, '#4a4a56');
  t.r(191, 56, 5, 3, '#4a4a56');
  // prateleira com elmo e peitoral, e um escudo na parede
  t.r(206, 58, 34, 3, '#6a4224');
  t.r(206, 58, 34, 1, '#8a5a30');
  t.r(210, 48, 12, 10, '#8a8a96');
  t.r(212, 46, 8, 2, '#8a8a96');
  t.r(212, 51, 8, 4, '#2a2a30');
  t.r(215, 42, 2, 4, '#c8962a');
  t.r(210, 48, 2, 10, '#b0b0bc');
  t.r(226, 44, 12, 14, '#a07838');
  t.r(226, 44, 12, 2, '#d8a84a');
  t.r(231, 46, 2, 12, '#7a5a2a');
  disco(t, 223, 80, 10, '#a07838');
  disco(t, 223, 80, 8, '#7a3020');
  t.r(221, 78, 4, 4, '#d8a84a');
  t.r(216, 74, 3, 2, '#e8a86a', 0.5);

  // túnel escondido atrás da estante arrastada
  arco(t, 266, 86, 22, 28, '#5a4846');
  arco(t, 266, 90, 18, 28, '#08060a');
  arco(t, 266, 100, 10, 26, '#0e0e1a');
  t.g('c2-pulsar', atraso(-1200), (s) => s.r(261, 118, 10, 18, '#2a3a5a', 0.35));
  t.r(246, 132, 6, 4, '#6a5652');
  t.r(283, 130, 5, 6, '#46383a');
  t.r(250, 86, 3, 3, '#2a1e1a');
  poeira(t, 6, 252, 280, 100, 132, ['#7a8aaa', '#5a6a8a'], 77);

  // chão de pedra escura
  chao(t, 136, ['#3a2e2a', '#342824', '#40332e'], '#1e1612', 22, 5);
  poca(t, 56, 148, 56, '#ff8a2a', 0.07);
  // marcas de arrasto da estante até o lado
  t.r(254, 140, 40, 1, '#5a4a40');
  t.r(258, 146, 38, 1, '#5a4a40');
  // estante de lanças arrastada (torta) para o lado
  t.g(undefined, { transform: 'rotate(-4deg)', transformOrigin: '305px 136px' }, (s) => {
    s.r(292, 70, 3, 68, '#6a4224');
    s.r(315, 70, 3, 68, '#6a4224');
    for (const y of [84, 106, 126]) {
      s.r(292, y, 26, 3, '#8a5a30');
      s.r(292, y, 26, 1, '#b07a44');
    }
    for (const x of [298, 304, 310]) {
      s.r(x, 60, 1, 64, '#7a5432');
      s.r(x - 1, 56, 3, 5, '#a8acb8');
    }
  });

  // bigorna no toco
  t.r(118, 157, 38, 3, '#0e0806', 0.6);
  t.r(126, 140, 20, 18, '#6a4228');
  t.r(126, 140, 20, 2, '#9a6a3e');
  t.r(126, 140, 3, 18, '#7a5030');
  t.r(131, 141, 10, 1, '#7a5030');
  t.r(124, 134, 24, 6, '#34343e');
  t.r(129, 128, 14, 6, '#42424e');
  t.r(118, 122, 36, 6, '#55556a');
  t.r(110, 123, 8, 3, '#55556a');
  t.r(106, 124, 4, 2, '#55556a');
  t.r(118, 122, 36, 1, '#a0a0b4');
  // barra em brasa, martelo e faíscas
  halo(t, 134, 120, 16, '#ff9a3a', 0.08, 'c2-pulsar');
  t.ra(124, 120, 16, 2, '#ff7a2a', 'c2-pulsar');
  t.r(136, 120, 4, 2, '#ffd060');
  t.r(146, 118, 12, 2, '#7a5030');
  t.r(144, 115, 4, 7, '#3a3a44');
  for (let i = 0; i < 9; i++) {
    t.ra(133, 119, 1, 1, i % 2 ? '#ffd060' : '#ff9a3a', `c2-faisca-${(i % 3) + 1}`, { animationDelay: `${-i * 230}ms` });
  }

  // tina de têmpera na frente, soltando vapor
  t.r(10, 160, 52, 16, '#4a3022');
  t.r(10, 160, 52, 2, '#6a4430');
  t.r(13, 162, 46, 4, '#24384a');
  t.r(15, 162, 20, 1, '#5a7a9a');
  t.r(10, 169, 52, 1, '#2a2a30');
  t.r(48, 150, 2, 13, '#3a3a44');
  t.r(51, 148, 2, 15, '#3a3a44');
  vapor(t, 24, 160, 0);
  vapor(t, 40, 160, -1300);
  return <>{t.itens}</>;
}

/* ------------------------------------------------------------------ */
/* Ludus: as celas (noite, luar e lampião)                             */
/* ------------------------------------------------------------------ */

/** Corrente presa na parede com a algema na ponta; (x, y) é o prego. */
function corrente(t: Pincel, x: number, y: number, elos: number): void {
  t.r(x - 1, y - 1, 3, 3, '#5a5a66');
  for (let i = 0; i < elos; i++) t.r(x - (i % 2), y + 2 + i * 3, 1 + (i % 2) * 2, 3, '#4a4a56');
  t.r(x - 2, y + 2 + elos * 3, 5, 3, '#5a5a66');
  t.r(x - 1, y + 3 + elos * 3, 3, 1, '#0e0e16');
}

type Mobilia = 'riscos' | 'balde' | 'desenho';

/** Cela com a grade na frente; x é a esquerda do vão (96 de largura). */
function cela(t: Pincel, x: number, mobilia: Mobilia): void {
  t.r(x - 4, 50, 104, 6, '#3e4058');
  t.r(x - 4, 50, 104, 1, '#5a5e7a');
  t.r(x - 4, 56, 4, 80, '#3e4058');
  t.r(x + 96, 56, 4, 80, '#3e4058');
  t.r(x, 56, 96, 80, '#0e0e16');
  t.r(x, 56, 96, 6, '#08080e');
  t.r(x, 120, 96, 16, '#16141c');
  // palha e coberta
  t.r(x + 8, 128, 40, 8, '#5a4a24');
  t.r(x + 12, 125, 30, 3, '#6a5a2a');
  t.r(x + 16, 124, 8, 1, '#8a7838');
  t.r(x + 30, 126, 14, 6, '#3a2a4a');
  corrente(t, x + 70, 74, 6);
  corrente(t, x + 82, 74, 5);
  if (mobilia === 'riscos') {
    for (let k = 0; k < 4; k++) t.r(x + 12 + k * 3, 80, 1, 9, '#4a4a62');
    t.r(x + 10, 84, 14, 1, '#4a4a62');
    for (let k = 0; k < 3; k++) t.r(x + 30 + k * 3, 80, 1, 9, '#4a4a62');
  } else if (mobilia === 'balde') {
    t.r(x + 56, 126, 10, 10, '#3a2a1e');
    t.r(x + 56, 128, 10, 1, '#4a4a56');
    t.r(x + 52, 133, 6, 3, '#4a3a2a');
  } else {
    // um solzinho riscado na parede: alguém ainda tem esperança
    t.r(x + 18, 80, 8, 8, '#5a5a3a');
    t.r(x + 21, 76, 2, 3, '#5a5a3a');
    t.r(x + 21, 89, 2, 3, '#5a5a3a');
    t.r(x + 14, 83, 3, 2, '#5a5a3a');
    t.r(x + 27, 83, 3, 2, '#5a5a3a');
  }
  // grade
  for (let k = 0; k < 12; k++) {
    const bx = x + 4 + k * 8;
    t.r(bx, 56, 2, 80, '#4a4a58');
    t.r(bx, 56, 1, 80, '#6e6e84');
  }
  t.r(x, 64, 96, 2, '#3a3a46');
  t.r(x, 126, 96, 2, '#3a3a46');
  t.r(x + 44, 92, 8, 8, '#2e2e38');
  t.r(x + 47, 95, 2, 3, '#08080a');
}

function ludusCelas(): JSX.Element {
  const t = pincel();
  blocos(t, 0, 0, 320, 136, 17, 40, { base: '#262838', rejunte: '#14141e', claro: '#34364a' }, 31);
  t.r(0, 0, 320, 8, '#101018');
  // janela alta com a lua
  t.r(140, 12, 40, 30, '#3a3c52');
  t.r(144, 16, 32, 22, '#14203e');
  t.r(144, 16, 32, 6, '#0e1830');
  t.ra(148, 19, 1, 1, '#ffffff', 'c2-estrela');
  t.ra(171, 18, 1, 1, '#ffffff', 'c2-estrela', atraso(-1100));
  t.ra(153, 32, 1, 1, '#c8d8ff', 'c2-estrela', atraso(-2000));
  t.r(160, 21, 10, 10, '#e8ecf8');
  t.r(158, 23, 14, 6, '#e8ecf8');
  t.r(162, 19, 6, 14, '#e8ecf8');
  t.r(162, 24, 2, 2, '#c8d0e4');
  t.r(166, 27, 2, 1, '#c8d0e4');
  for (let k = 0; k < 4; k++) t.r(149 + k * 8, 16, 2, 22, '#2a2a34');
  t.r(144, 26, 32, 2, '#2a2a34');
  t.r(138, 42, 44, 3, '#4a4c64');
  t.r(138, 42, 44, 1, '#6a6e8a');
  // chaveiro pendurado num prego, longe das grades
  t.r(296, 22, 2, 2, '#6a6a76');
  t.r(294, 24, 6, 5, '#8a7a4a');
  t.r(295, 25, 4, 3, '#262838');
  t.r(294, 29, 1, 7, '#c8a848');
  t.r(294, 35, 3, 2, '#c8a848');
  t.r(299, 29, 1, 5, '#c8a848');
  t.r(299, 33, 3, 2, '#c8a848');

  cela(t, 6, 'riscos');
  cela(t, 112, 'balde');
  cela(t, 218, 'desenho');

  // chão de pedra fria
  chao(t, 136, ['#2a2c3a', '#262834', '#30323e'], '#14141c', 24, 9);
  // feixe de luar entrando pela janela (com a poeira dançando)
  t.g('c2-feixe', undefined, (s) => {
    s.p('144,42 176,42 250,160 196,160', '#c8d8ff', 0.07);
    s.p('150,42 170,42 234,160 210,160', '#c8d8ff', 0.06);
    s.r(198, 150, 50, 12, '#a8b8f0', 0.1);
    for (let k = 0; k < 4; k++) s.r(204 + k * 10, 150, 2, 12, '#14141c', 0.25);
  });
  poeira(t, 12, 160, 230, 50, 150, ['#d8e4ff', '#ffffff'], 51);

  // lampião balançando entre as celas
  halo(t, 107, 66, 42, '#ffb04a', 0.07, 'c2-pulsar');
  t.r(100, 42, 14, 2, '#4a4a56');
  t.r(106, 40, 2, 4, '#4a4a56');
  t.g('c2-balancar', undefined, (s) => {
    s.r(106, 44, 1, 14, '#5a5a66');
    s.r(102, 58, 10, 2, '#3a3a44');
    s.r(103, 60, 8, 10, '#2a2a30');
    s.r(104, 61, 6, 8, '#ffcc6a');
    s.r(106, 63, 2, 4, '#fff0b0');
    s.r(102, 70, 10, 2, '#3a3a44');
  });
  poca(t, 107, 144, 34, '#ffb04a', 0.08);
  // um ratinho atravessando o corredor
  t.r(60, 152, 7, 3, '#4a4048');
  t.r(67, 151, 3, 3, '#4a4048');
  t.r(68, 150, 1, 1, '#6a5a64');
  t.r(69, 152, 1, 1, '#ff8a9a');
  t.r(54, 154, 6, 1, '#6a5a60');
  t.r(61, 155, 1, 1, '#2a2028');
  t.r(65, 155, 1, 1, '#2a2028');
  return <>{t.itens}</>;
}

/* ------------------------------------------------------------------ */
/* Catacumbas debaixo da cidade                                        */
/* ------------------------------------------------------------------ */

/** Crânio de 8 × 8; (x, y) é o canto de cima. */
function cranio(t: Pincel, x: number, y: number): void {
  t.r(x, y, 8, 6, '#d8d0b8');
  t.r(x + 1, y + 6, 6, 2, '#c8c0a8');
  t.r(x + 1, y, 3, 1, '#f0e8d0');
  t.r(x + 1, y + 2, 2, 2, '#1a1214');
  t.r(x + 5, y + 2, 2, 2, '#1a1214');
  t.r(x + 3, y + 5, 2, 1, '#3a3034');
  t.r(x + 2, y + 7, 4, 1, '#8a8270');
}

/** Osso deitado; (x, y) é o canto de cima. */
function osso(t: Pincel, x: number, y: number, w: number): void {
  t.r(x, y, w, 2, '#d0c8b0');
  t.r(x - 1, y - 1, 2, 4, '#e0d8c0');
  t.r(x + w - 1, y - 1, 2, 4, '#e0d8c0');
}

/** Lamparina de barro com uma chaminha; (x, y) é o canto de cima do corpo. */
function lamparina(t: Pincel, x: number, y: number, atrasoMs: number): void {
  halo(t, x + 7, y - 4, 18, '#ffb050', 0.09, 'c2-pulsar', atraso(atrasoMs));
  t.r(x, y, 8, 3, '#8a5a3a');
  t.r(x + 1, y + 3, 6, 1, '#5a3a24');
  t.r(x + 6, y - 1, 3, 2, '#8a5a3a');
  t.g('c2-chama', atraso(atrasoMs), (s) => {
    s.r(x + 6, y - 4, 3, 3, '#ff8a2a');
    s.r(x + 7, y - 6, 1, 3, '#ffd060');
  });
}

type Nicho = 'cranio' | 'cranios' | 'ossos' | 'lampada' | 'vazio';

/** Nicho cavado na parede (lóculo) com o que guarda; (x, y) é o canto de cima. */
function nicho(t: Pincel, x: number, y: number, c: Nicho, atrasoMs: number): void {
  t.r(x - 1, y - 1, 30, 20, '#4a3c38');
  t.r(x, y, 28, 18, '#140e10');
  t.r(x, y, 28, 3, '#0a0608');
  if (c === 'cranio') {
    cranio(t, x + 10, y + 9);
    osso(t, x + 3, y + 15, 8);
  } else if (c === 'cranios') {
    cranio(t, x + 3, y + 9);
    cranio(t, x + 16, y + 9);
  } else if (c === 'ossos') {
    osso(t, x + 4, y + 10, 20);
    osso(t, x + 6, y + 14, 16);
  } else if (c === 'lampada') {
    lamparina(t, x + 9, y + 14, atrasoMs);
  }
}

function catacumbas(): JSX.Element {
  const t = pincel();
  t.r(0, 0, 320, 180, '#0e0a10');
  t.r(0, 0, 320, 136, '#3a3030');
  for (let i = 0; i < 8; i++) {
    t.r(entre(i * 7 + 1, 0, 310), entre(i * 9 + 2, 16, 130), entre(i + 30, 4, 10), entre(i + 60, 2, 4), i % 2 ? '#443836' : '#302626');
  }
  // o túnel indo para o fundo
  arco(t, 160, 36, 48, 52, '#4a3c3a', 4);
  arco(t, 160, 40, 44, 52, '#241c1e', 4);
  arco(t, 160, 56, 30, 50, '#181214');
  arco(t, 160, 70, 18, 48, '#0c080a');
  t.p('116,136 204,136 172,106 148,106', '#2a2224');
  // uma luz bem lá no fundo e olhinhos piscando no escuro
  halo(t, 160, 104, 10, '#ffb050', 0.08, 'c2-pulsar');
  t.r(159, 101, 2, 3, '#ffb050');
  t.g('c2-piscar', undefined, (s) => {
    s.r(150, 118, 1, 1, '#ff6a7a');
    s.r(153, 118, 1, 1, '#ff6a7a');
  });
  // teto irregular
  t.r(0, 0, 320, 14, '#0a0608');
  for (let k = 0; k < 16; k++) t.r(k * 20 + entre(k, 0, 6), 14, entre(k + 20, 6, 14), entre(k + 40, 2, 5), '#0a0608');
  // nichos com crânios, ossos e lamparinas
  const conteudo: readonly Nicho[] = ['cranio', 'ossos', 'lampada', 'vazio', 'cranio', 'vazio', 'ossos', 'cranios', 'cranio'];
  const fileiras = [24, 56, 88];
  fileiras.forEach((y, fila) => {
    [6, 42, 78].forEach((x, col) => {
      const c = conteudo[(fila * 3 + col) % conteudo.length] ?? 'vazio';
      nicho(t, x, y, c, -(fila * 3 + col) * 300);
    });
    [214, 250, 286].forEach((x, col) => {
      const c = conteudo[(fila * 3 + col + 4) % conteudo.length] ?? 'vazio';
      nicho(t, x, y, c, -(fila * 3 + col) * 410);
    });
  });
  // lamparina extra iluminando o recado dos rebeldes
  nicho(t, 286, 88, 'lampada', -700);
  // tocha na entrada do túnel
  tocha(t, 108, 108, -300);
  // reboco com riscos de texto escondido e a pena de carvão (o sinal dos rebeldes)
  t.r(214, 110, 100, 24, '#5e504a');
  t.r(214, 110, 100, 1, '#6e605a');
  t.r(214, 133, 30, 1, '#3a3030');
  for (let row = 0; row < 4; row++) {
    let x = 218;
    for (let k = 0; x < 258; k++) {
      const w = entre(row * 20 + k, 2, 6);
      t.r(x, 113 + row * 5, w, 1, '#8e7e72');
      x += w + entre(row * 20 + k + 7, 2, 3);
    }
  }
  for (let i = 0; i < 10; i++) t.r(282 + i * 2, 130 - i * 2, 2, 2, '#141014');
  for (let i = 3; i < 10; i++) t.r(278 + i * 2, 129 - i * 2, 4, 2, '#2a2228');
  for (let i = 4; i < 9; i++) t.r(284 + i * 2, 131 - i * 2, 3, 2, '#2a2228');
  t.r(280, 132, 2, 2, '#141014');
  t.r(276, 133, 8, 1, '#2a2228', 0.7);
  // teias nos cantos
  linha(t, 0, 16, 18, 30, '#8a8a96', 0.35);
  linha(t, 0, 26, 12, 16, '#8a8a96', 0.35);
  linha(t, 320, 18, 300, 32, '#8a8a96', 0.35);

  // chão de terra e pedra
  t.r(0, 136, 320, 44, '#241c1c');
  t.r(0, 136, 320, 3, '#160f10');
  t.p('116,136 204,136 260,180 60,180', '#2e2424');
  for (let i = 0; i < 18; i++) {
    t.r(entre(i * 13 + 4, 0, 312), entre(i * 7 + 8, 142, 176), entre(i + 5, 4, 10), entre(i + 15, 2, 4), de(['#3a2e2e', '#2a2222', '#463838'], i));
  }
  osso(t, 40, 170, 12);
  osso(t, 250, 164, 10);
  cranio(t, 22, 158);
  // gotas pingando do teto nas poças
  for (const [x, ms] of [[124, 0], [204, -1100]] as Ponto[]) {
    t.r(x - 1, 14, 3, 2, '#2a2a3a');
    t.ra(x, 16, 1, 2, '#8ab0d8', 'c2-gota', atraso(ms));
    t.r(x - 8, 147, 17, 3, '#2a3a52');
    t.r(x - 5, 147, 6, 1, '#5a7aa0');
    t.ra(x - 4, 147, 9, 1, '#8ab0d8', 'c2-ondinha', atraso(ms));
  }
  return <>{t.itens}</>;
}

/* ------------------------------------------------------------------ */
/* Arquivo do Arquivista das Sombras (fundo das catacumbas)            */
/* ------------------------------------------------------------------ */

/** Padrões de pontas de pergaminho e gavetas de latão (economiza muitos retângulos). */
function padroes(t: Pincel): void {
  t.el((k) => (
    <defs key={k}>
      <pattern id="c2-rolos" x={0} y={0} width={4} height={4} patternUnits="userSpaceOnUse">
        <rect x={0} y={0} width={4} height={4} fill="#1a1222" />
        <rect x={0} y={0} width={3} height={3} fill="#b8a684" />
        <rect x={1} y={1} width={1} height={1} fill="#5a4a38" />
      </pattern>
      <pattern id="c2-gavetas" x={0} y={0} width={10} height={8} patternUnits="userSpaceOnUse">
        <rect x={0} y={0} width={10} height={8} fill="#3a2a14" />
        <rect x={0} y={0} width={9} height={7} fill="#a8783a" />
        <rect x={0} y={0} width={9} height={1} fill="#d8a85a" />
        <rect x={3} y={3} width={3} height={1} fill="#3a2a14" />
      </pattern>
    </defs>
  ));
}

/** Cabo pendurado fazendo barriga entre x0 e x1 (passo de 6). */
function cabo(t: Pincel, x0: number, x1: number, y: number, queda: number, cor: string): void {
  const larg = x1 - x0;
  for (let x = x0; x < x1; x += 6) {
    const u = (x + 3 - x0) / larg;
    t.r(x, y + Math.round(4 * queda * u * (1 - u)), Math.min(6, x1 - x), 2, cor);
  }
}

/** Estante alta de perto: pergaminhos em cima e embaixo, gavetas de latão no meio. */
function estanteArquivo(t: Pincel, x: number, w: number): void {
  t.r(x, 4, w, 134, '#2a1a10');
  t.r(x + 3, 10, w - 6, 40, 'url(#c2-rolos)');
  t.r(x + 3, 54, w - 6, 48, 'url(#c2-gavetas)');
  t.r(x + 3, 106, w - 6, 28, 'url(#c2-rolos)');
  for (const y of [8, 30, 50, 102, 120, 134]) {
    t.r(x, y, w, 3, '#5a3a1e');
    t.r(x, y, w, 1, '#c8963a');
  }
  t.r(x, 4, 3, 134, '#4a2e16');
  t.r(x + w - 3, 4, 3, 134, '#4a2e16');
  t.r(x, 4, 1, 134, '#8a6430');
  t.r(x, 4, w, 2, '#c8963a');
}

function arquivo(): JSX.Element {
  const t = pincel();
  padroes(t);
  t.r(0, 0, 320, 180, '#0c0814');
  // estantes sem fim lá atrás
  for (const y of [22, 44, 66, 88, 110]) {
    t.r(0, y, 320, 18, 'url(#c2-rolos)');
    t.r(0, y + 18, 320, 4, '#2a1a12');
    t.r(0, y + 18, 320, 1, '#6a4a24');
  }
  for (let x = 20; x < 320; x += 40) t.r(x, 20, 3, 116, '#2a1a12');
  t.r(0, 20, 320, 116, '#140a24', 0.6);
  // brilho violeta da máquina
  halo(t, 160, 74, 90, '#9a5aff', 0.07, 'c2-pulsar');
  // teto da caverna
  t.r(0, 0, 320, 18, '#08050e');
  for (let k = 0; k < 14; k++) t.r(k * 24 + entre(k + 3, 0, 8), 18, entre(k + 11, 8, 16), entre(k + 23, 2, 6), '#08050e');

  // estantes de perto, uma de cada lado, e a escada
  estanteArquivo(t, 0, 62);
  estanteArquivo(t, 258, 62);
  t.r(0, 4, 62, 134, '#9a5aff', 0.05);
  t.p('66,138 70,138 52,20 48,20', '#5a3a1e');
  t.p('84,138 88,138 66,20 62,20', '#5a3a1e');
  for (let k = 0; k < 9; k++) {
    const y = 128 - k * 13;
    const x = 69 - Math.round(((138 - y) * 18) / 118);
    t.r(x, y, 16, 2, '#7a5430');
  }
  // gaveta aberta com papéis
  t.r(268, 70, 18, 8, '#a8783a');
  t.r(268, 70, 18, 1, '#d8a85a');
  t.r(270, 66, 14, 4, '#e8e0c8');
  t.r(272, 64, 6, 2, '#f4ecd8');

  // cabos pendurados do teto até a máquina
  cabo(t, 40, 140, 18, 16, '#1e1a2a');
  cabo(t, 180, 290, 18, 20, '#1e1a2a');
  cabo(t, 70, 150, 20, 26, '#2a1a3a');
  cabo(t, 170, 260, 22, 24, '#2a1a3a');

  // a máquina de apagar memórias
  t.r(140, 0, 6, 40, '#8a6630');
  t.r(174, 0, 6, 40, '#8a6630');
  t.r(140, 0, 2, 40, '#c8963a');
  t.r(174, 0, 2, 40, '#c8963a');
  for (const y of [12, 28]) {
    t.r(138, y, 10, 3, '#5a4018');
    t.r(172, y, 10, 3, '#5a4018');
  }
  t.p('148,30 172,30 166,40 154,40', '#a8783a');
  t.r(156, 26, 8, 4, '#e8dcc0');
  t.r(156, 26, 2, 4, '#b8a684');
  t.r(116, 112, 88, 24, '#4a3418');
  t.r(116, 112, 88, 2, '#c8963a');
  for (let k = 0; k < 8; k++) t.r(120 + k * 11, 116, 2, 2, '#d8a84a');
  t.r(124, 40, 72, 72, '#6a4a22');
  t.r(124, 40, 72, 2, '#d8a84a');
  t.r(124, 40, 3, 72, '#8a6630');
  t.r(193, 40, 3, 72, '#3a2810');
  engrenagem(t, 124, 54, 10, '#a8783a', '#3a2810', 12, false);
  engrenagem(t, 198, 98, 8, '#a8783a', '#3a2810', 9, true);
  disco(t, 160, 74, 28, '#c8963a', 2);
  disco(t, 160, 74, 25, '#2a1640', 2);
  t.g('c2-maquina', undefined, (s) => {
    disco(s, 160, 74, 20, '#5a2ab0', 2);
    disco(s, 160, 74, 14, '#8a4ae8', 2);
    disco(s, 160, 74, 8, '#c8a0ff', 2);
    disco(s, 160, 74, 3, '#f4ecff', 1);
  });
  t.r(150, 60, 4, 2, '#ffffff', 0.5);
  // mostradores e luzinhas
  disco(t, 134, 102, 5, '#e8e0c8', 2);
  t.r(134, 98, 1, 4, '#a01a1a');
  disco(t, 186, 102, 5, '#e8e0c8', 2);
  t.r(186, 102, 4, 1, '#a01a1a');
  for (let k = 0; k < 4; k++) {
    t.ra(148 + k * 7, 104, 3, 2, k % 2 ? '#7aff9a' : '#c88aff', 'c2-piscar', { animationDelay: `${-k * 1300}ms`, animationDuration: `${3 + k}s` });
  }
  // bandeja com pergaminhos já apagados (em branco)
  t.r(196, 106, 18, 4, '#5a4018');
  t.r(198, 102, 14, 4, '#f4f0ff');
  t.r(200, 99, 10, 3, '#e8e4f4');
  // alavanca
  t.r(110, 92, 2, 20, '#4a4a56');
  t.r(108, 90, 6, 4, '#a01a1a');

  // chão polido com o reflexo violeta
  t.r(0, 136, 320, 44, '#140e1c');
  for (const y of [144, 156, 172]) t.r(0, y, 320, 1, '#0a0610');
  for (let x = 30; x < 320; x += 60) t.r(x, 137, 1, 43, '#0a0610');
  t.g('c2-pulsar', atraso(-900), (s) => {
    s.r(118, 138, 84, 10, '#7a3ae0', 0.12);
    s.r(132, 148, 56, 8, '#7a3ae0', 0.08);
  });
  // cabos grossos no chão até a máquina
  t.r(62, 140, 56, 3, '#1e1a2a');
  t.r(202, 142, 56, 3, '#1e1a2a');
  t.r(62, 140, 56, 1, '#3a2a4a');
  // pergaminhos caídos
  t.r(40, 160, 14, 4, '#c8b894');
  t.r(52, 159, 3, 6, '#a89874');
  t.r(262, 166, 12, 4, '#c8b894');
  t.r(90, 172, 8, 3, '#b8a684');
  poeira(t, 16, 70, 250, 30, 150, ['#c8a0ff', '#e8d8ff', '#8a5aff'], 61);
  return <>{t.itens}</>;
}

/* ------------------------------------------------------------------ */
/* O Fórum de Roma (dia)                                               */
/* ------------------------------------------------------------------ */

/** Templo de colunas com frontão; x é a esquerda (largura 96), pódio até y 136. */
function templo(t: Pincel, x: number, censor: boolean): void {
  const w = 96;
  const cx = x + 48;
  t.p(`${x - 2},46 ${cx},26 ${x + w + 2},46`, '#e4dac4');
  t.p(`${x + 10},44 ${cx},32 ${x + w - 10},44`, '#c8bca2');
  if (censor) olho(t, cx, 40, 1, -400);
  else t.r(cx - 4, 38, 8, 4, '#b0a488');
  t.r(x - 2, 46, w + 4, 8, '#e8dec8');
  t.r(x - 2, 46, w + 4, 1, '#fff6e4');
  t.r(x - 2, 53, w + 4, 1, '#b8ac94');
  t.r(x + 4, 54, w - 8, 50, '#8a7c66');
  t.r(x + 4, 54, w - 8, 6, '#6a5e4c');
  for (let k = 0; k < 6; k++) {
    const c = x + 6 + k * 16;
    t.r(c - 1, 54, 8, 4, '#e8dec8');
    t.r(c, 58, 6, 44, '#f0e8d8');
    t.r(c + 2, 58, 1, 44, '#d8ccb8');
    t.r(c + 4, 58, 2, 44, '#c8bca4');
    t.r(c - 1, 102, 8, 2, '#d8ccb4');
  }
  t.r(x - 4, 104, w + 8, 32, '#d8ccb4');
  t.r(x - 4, 104, w + 8, 1, '#f4ecdc');
  for (let k = 0; k < 4; k++) t.r(x - 4 + k * 2, 112 + k * 6, w + 8 - k * 4, 1, '#b8ac94');
}

/** Pessoa da multidão (silhueta): x é o centro, y o topo da cabeça. */
function pessoa(t: Pincel, x: number, y: number, roupa: string, pele: string): void {
  t.r(x - 2, y, 4, 4, pele);
  t.r(x - 4, y + 4, 8, 12, roupa);
}

function forum(): JSX.Element {
  const t = pincel();
  ceu(t, ['#70bcee', '#86c6f0', '#9ed2f2', '#b6dcf4', '#cce8f8'], 0, 70);
  nuvens(t, [[20, 20], [118, 12], [236, 26]], '#ffffff', '#dceefa', -3000);
  // Palatino ao longe
  t.r(0, 56, 320, 50, '#c4c4d0');
  t.r(30, 50, 60, 6, '#c4c4d0');
  t.r(220, 48, 80, 8, '#c4c4d0');
  for (let k = 0; k < 10; k++) t.r(8 + k * 31, 62, 12, 8, '#b0b0c0');

  // basílica no fundo com o estandarte enorme do Censor e as cornetas de propaganda
  t.r(100, 34, 120, 78, '#e0d2b6');
  t.r(96, 30, 128, 4, '#b85a32');
  t.r(96, 30, 128, 1, '#e07c4c');
  t.r(100, 34, 120, 2, '#c4b496');
  for (const cx of [110, 126, 194, 210]) arco(t, cx, 44, 5, 14, '#5a4c3e');
  for (const cx of [110, 126, 194, 210]) arco(t, cx, 76, 5, 14, '#5a4c3e');
  t.r(100, 70, 120, 3, '#c8b89a');
  bandeiraOlho(t, 138, 36, 44, 62, 3, 0);
  for (const x of [102, 210]) {
    t.r(x + 3, 22, 2, 8, '#5a4018');
    t.r(x, 16, 8, 6, '#c8963a');
    t.r(x - 2, 14, 12, 2, '#e0b04a');
  }

  // templos
  templo(t, -6, false);
  templo(t, 230, true);
  // estátuas nos cantos da rostra
  for (const [x, braco] of [[108, 1], [212, 0]] as Ponto[]) {
    t.r(x - 5, 96, 10, 16, '#c8bca4');
    t.r(x - 5, 96, 10, 1, '#e8dec8');
    t.r(x - 2, 70, 5, 5, '#f0ece4');
    t.r(x - 3, 75, 7, 14, '#e8e2d6');
    t.r(x - 3, 75, 2, 14, '#d0c8b8');
    t.r(x - 3, 89, 3, 7, '#e0d8c8');
    t.r(x + 1, 89, 3, 7, '#e0d8c8');
    if (braco) {
      t.r(x + 4, 70, 2, 8, '#e8e2d6');
    } else {
      // capuz vermelho do Censor posto na estátua
      t.r(x - 3, 69, 7, 7, '#a8161a');
      t.r(x - 1, 71, 3, 2, '#ff4a3a');
      t.r(x + 4, 76, 2, 8, '#e8e2d6');
    }
  }
  // rostra no centro, com as proas de bronze
  t.r(104, 112, 112, 24, '#cfc0a2');
  t.r(102, 110, 116, 3, '#e8dcc0');
  t.r(102, 110, 116, 1, '#fff4dc');
  t.r(104, 132, 112, 4, '#b0a084');
  for (const x of [118, 144, 170, 196]) {
    t.r(x, 119, 10, 5, '#6a8a6a');
    t.r(x + 10, 120, 4, 3, '#6a8a6a');
    t.r(x + 14, 121, 2, 1, '#8aaa8a');
    t.r(x, 124, 12, 2, '#4a6a50');
    t.r(x, 119, 10, 1, '#9ab89a');
  }
  for (let k = 0; k < 10; k++) t.r(106 + k * 12, 104, 2, 6, '#d8ccb4');
  t.r(104, 103, 112, 2, '#e8dcc0');
  t.r(154, 96, 12, 8, '#8a6630');
  t.r(154, 96, 12, 1, '#c8963a');

  // multidão no fundo dos dois lados, alguns com bandeirinhas do Censor
  const roupas = ['#8a4a3a', '#4a6a8a', '#a08a5a', '#6a5a7a', '#5a7a5a', '#9a6a4a'];
  const peles = ['#c08a5a', '#8a5a3a', '#e0b088', '#a87050'];
  for (const [lado, x0] of [[0, 2], [1, 222]] as Ponto[]) {
    for (let fila = 0; fila < 2; fila++) {
      t.g('c2-multidao', atraso(-(lado * 2 + fila) * 200), (s) => {
        for (let k = 0; k < 10; k++) {
          const x = x0 + 4 + k * 10 + fila * 5;
          pessoa(s, x, 118 + fila * 4, de(roupas, k * 3 + fila + lado), de(peles, k + fila * 2 + lado));
          if ((k + fila + lado) % 4 === 0) {
            s.r(x + 4, 110 + fila * 4, 1, 10, '#5a4030');
            s.r(x + 5, 110 + fila * 4, 4, 3, '#a8161a');
          }
        }
      });
    }
  }

  // lajes do Fórum
  chao(t, 136, ['#d8ccb0', '#cfc2a4', '#c4b698'], '#a89878', 26, 3);
  t.r(0, 136, 320, 2, '#b8a888');
  // pombas
  pombaChao(t, 92, 164, 0);
  pombaChao(t, 236, 158, -700);
  pombaChao(t, 250, 170, -1300);
  pombaVoando(t, -16, 30, 0);
  pombaVoando(t, -24, 22, -5000);
  pombaVoando(t, -12, 44, -10000);
  return <>{t.itens}</>;
}

/* ------------------------------------------------------------------ */
/* Porto de Óstia ao entardecer                                        */
/* ------------------------------------------------------------------ */

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

function portoDocas(): JSX.Element {
  const t = pincel();
  ceu(t, ['#2a1e4a', '#44285a', '#6a345e', '#9a4456', '#c85a48', '#e8803e', '#f4a64a', '#f8c862'], 0, 96);
  t.ra(40, 10, 1, 1, '#fff6e0', 'c2-estrela');
  t.ra(296, 14, 1, 1, '#fff6e0', 'c2-estrela', atraso(-1500));
  t.ra(250, 6, 1, 1, '#fff6e0', 'c2-estrela', atraso(-700));
  t.g('c2-nuvem', atraso(-8000), (s) => {
    s.r(20, 40, 70, 2, '#c8607a');
    s.r(30, 38, 40, 2, '#d87a80');
    s.r(190, 30, 90, 2, '#9a4a70');
    s.r(210, 28, 50, 2, '#b85a78');
    s.r(110, 54, 64, 2, '#f0a070');
    s.r(124, 52, 30, 2, '#f8b880');
  });
  // sol se pondo atrás do mar
  halo(t, 160, 90, 44, '#ffd080', 0.12, 'c2-pulsar');
  disco(t, 160, 94, 14, '#ffe08a', 2);
  t.r(150, 86, 20, 1, '#fff0b8');
  // terra ao longe
  t.r(0, 86, 80, 10, '#5a2e4a');
  t.r(0, 82, 40, 4, '#5a2e4a');
  t.r(250, 88, 70, 8, '#5a2e4a');
  t.r(282, 84, 38, 4, '#5a2e4a');
  // mar
  t.r(0, 96, 320, 40, '#3a3a6a');
  t.r(0, 96, 320, 6, '#6a4a6a');
  t.r(0, 110, 320, 12, '#30305a');
  t.r(0, 122, 320, 14, '#262850');
  t.g('c2-agua', undefined, (s) => {
    const largs = [28, 22, 24, 16, 18, 10, 12, 6];
    largs.forEach((w, k) => s.r(160 - w / 2, 97 + k * 4, w, 1, k % 2 ? '#f8c070' : '#ffe0a0'));
  });
  t.g('c2-agua', atraso(-1200), (s) => {
    for (let i = 0; i < 14; i++) s.r(entre(i * 5 + 2, 0, 310), entre(i * 3 + 7, 100, 132), entre(i + 9, 4, 10), 1, i % 2 ? '#8a6a8a' : '#5a5a8a');
  });
  // barquinho de vela ao longe
  t.g('c2-navio', atraso(-500), (s) => {
    s.r(56, 108, 22, 3, '#2a1a26');
    s.r(58, 111, 18, 1, '#1e1420');
    s.r(66, 90, 1, 18, '#2a1a26');
    s.p('67,91 67,106 78,106', '#e8c8b0');
  });
  // torres da boca do porto com o fogo aceso e a corrente gigante esticada entre elas
  for (const [x, ms] of [[92, 0], [218, -350]] as Ponto[]) {
    t.r(x, 62, 12, 46, '#4a3048');
    t.r(x, 62, 3, 46, '#5e3e58');
    t.r(x - 2, 58, 16, 4, '#5a3a54');
    t.r(x + 2, 54, 8, 4, '#2a1a2a');
    t.r(x + 4, 76, 4, 6, '#ffb060');
    t.r(x - 3, 107, 18, 2, '#c8a0b0');
    halo(t, x + 6, 50, 14, '#ffb050', 0.12, 'c2-pulsar', atraso(ms));
    chama(t, x + 6, 54, 6, ms);
  }
  for (let i = 0, x = 104; x < 218; i++, x += 5) {
    const u = (x + 2.5 - 104) / 114;
    const y = 68 + Math.round(4 * 22 * u * (1 - u));
    if (i % 2) t.r(x, y - 1, 5, 3, '#1e1420');
    else t.r(x, y, 5, 1, '#1e1420');
  }
  // navio mercante ancorado
  t.g('c2-navio', undefined, (s) => {
    s.r(240, 104, 64, 10, '#2a1a26');
    s.r(236, 100, 8, 8, '#2a1a26');
    s.r(300, 98, 10, 8, '#2a1a26');
    s.r(240, 104, 64, 1, '#6a4050');
    s.r(262, 44, 2, 60, '#2a1a26');
    s.r(284, 52, 2, 52, '#2a1a26');
    s.r(250, 50, 26, 2, '#2a1a26');
    s.r(274, 58, 22, 2, '#2a1a26');
    s.r(252, 52, 22, 8, '#e0b8a0');
    s.r(276, 60, 18, 7, '#e0b8a0');
    s.r(252, 52, 22, 1, '#f8d8c0');
    s.r(246, 112, 56, 2, '#1e1420');
  });
  t.ra(305, 94, 2, 2, '#ffd060', 'c2-pulsar');

  // cais de madeira
  t.r(0, 136, 320, 44, '#6a4a32');
  t.r(0, 134, 320, 4, '#4a3022');
  t.r(0, 134, 320, 1, '#8a6040');
  for (const y of [143, 151, 161, 173]) t.r(0, y, 320, 1, '#4a3022');
  for (let i = 0; i < 14; i++) t.r(entre(i * 9 + 1, 0, 316), [138, 145, 154, 164][i % 4] ?? 138, 1, entre(i + 3, 4, 8), '#4a3022');
  for (let i = 0; i < 24; i++) t.r(entre(i * 11 + 5, 0, 318), entre(i * 7 + 2, 138, 178), 1, 1, '#8a6a4a');
  for (let x = 4; x < 320; x += 44) {
    t.r(x, 122, 6, 14, '#5a3a26');
    t.r(x, 122, 6, 2, '#8a6040');
    t.ra(x - 2, 134, 10, 1, '#c8a0b0', 'c2-agua', atraso(-x * 10));
  }
  // gaivota pousada num poste
  t.r(180, 118, 5, 4, '#f4f0ea');
  t.r(184, 117, 3, 3, '#f4f0ea');
  t.r(187, 118, 2, 1, '#e0a040');
  t.r(179, 119, 3, 2, '#8a8a96');

  // sarilho (guincho) da corrente na frente, à esquerda
  t.r(4, 154, 58, 4, '#4a3022');
  t.r(8, 118, 4, 36, '#5a3a26');
  t.r(50, 118, 4, 36, '#5a3a26');
  t.r(6, 116, 50, 3, '#7a5434');
  disco(t, 31, 136, 13, '#5a3a22', 2);
  for (const y of [128, 132, 136, 140, 144]) t.r(20, y, 22, 2, '#3a3a46');
  engrenagem(t, 31, 136, 6, '#8a8a96', '#3a3a46', 16, false);
  t.r(54, 130, 8, 3, '#5a3a26');
  t.r(60, 126, 3, 8, '#7a5434');
  for (let i = 0; i < 8; i++) t.r(42 + i * 5, 126 + i, 5, i % 2 ? 3 : 1, '#2a2a34');

  // caixotes, barris e ânforas
  caixote(t, 72, 140, 22, 16, true);
  caixote(t, 76, 126, 16, 14, false);
  caixote(t, 96, 146, 16, 12, true);
  barril(t, 226, 142);
  barril(t, 240, 144);
  t.r(114, 142, 6, 12, '#b0603a');
  t.r(115, 139, 4, 3, '#b0603a');
  t.r(116, 154, 2, 2, '#8a4a2a');
  t.r(122, 146, 6, 10, '#a05434');
  t.r(123, 143, 4, 3, '#a05434');

  // guindaste de roda com o caixote pendurado balançando
  t.p('266,150 272,150 236,38 232,38', '#6a4628');
  t.p('282,150 288,150 238,40 234,40', '#5a3a22');
  t.r(228, 34, 10, 6, '#3a2618');
  disco(t, 296, 128, 18, '#7a5434', 3);
  disco(t, 296, 128, 14, '#2a1a12', 3);
  t.r(295, 112, 2, 32, '#7a5434');
  t.r(280, 127, 32, 2, '#7a5434');
  t.r(258, 148, 60, 8, '#4a3022');
  t.r(258, 148, 60, 1, '#8a6040');
  t.g('c2-balancar', undefined, (s) => {
    s.r(232, 40, 1, 48, '#c8a070');
    s.r(224, 88, 18, 14, '#8a5a30');
    s.r(224, 88, 18, 1, '#b07a44');
    s.r(224, 94, 18, 1, '#5a3a1e');
    s.r(226, 86, 14, 2, '#c8a070');
  });
  // lampião aceso no guindaste
  halo(t, 262, 128, 16, '#ffc060', 0.12, 'c2-pulsar');
  t.r(260, 124, 5, 7, '#ffd070');
  t.r(259, 122, 7, 2, '#2a1a12');

  // gaivotas
  gaivota(t, -20, 30, 0, 18);
  gaivota(t, -30, 46, -6000, 22);
  gaivota(t, -10, 22, -12000, 20);
  return <>{t.itens}</>;
}

/* ------------------------------------------------------------------ */
/* Convés do navio de guerra do Censor (noite, tempestade)             */
/* ------------------------------------------------------------------ */

/** Canhão no reparo; x é a ponta da boca, dir é -1 (aponta para a esquerda) ou 1 (direita). */
function canhao(t: Pincel, x: number, dir: number): void {
  const x0 = dir < 0 ? x : x - 40;
  const boca = dir < 0 ? x0 : x0 + 36;
  const traseira = dir < 0 ? x0 + 36 : x0;
  t.r(x0 + 10, 134, 26, 10, '#4a3020');
  t.r(x0 + 10, 134, 26, 1, '#6a4430');
  disco(t, x0 + 14, 146, 4, '#2a1e16', 2);
  disco(t, x0 + 32, 146, 4, '#2a1e16', 2);
  t.r(x0 + 2, 126, 36, 8, '#22222c');
  t.r(x0 + 4, 127, 32, 1, '#4a4a5a');
  t.r(boca, 125, 4, 10, '#30303c');
  t.r(traseira, 128, 4, 4, '#30303c');
  t.r(x0 + 12, 126, 2, 8, '#3a3a48');
  t.r(x0 + 24, 126, 2, 8, '#3a3a48');
}

/** Vela vermelha do Censor presa entre as vergas; x é a esquerda. */
function vela(t: Pincel, x: number, atrasoMs: number): void {
  t.g('c2-vela', atraso(atrasoMs), (s) => {
    s.r(x, 24, 88, 30, '#8a1418');
    s.r(x + 4, 54, 80, 3, '#8a1418');
    s.r(x + 12, 57, 64, 2, '#8a1418');
    s.r(x, 24, 88, 2, '#a8282a');
    for (let k = 1; k < 7; k++) s.r(x + k * 12, 26, 1, 30, '#6a0e12');
    s.r(x + 84, 26, 4, 28, '#5a0a0e');
    olho(s, x + 44, 40, 2, atrasoMs);
  });
}

function navioConves(): JSX.Element {
  const t = pincel();
  ceu(t, ['#06070e', '#0a0c16', '#0e1220', '#121828', '#161e30'], 0, 100);
  // nuvens de tempestade
  t.g('c2-nuvem', undefined, (s) => {
    for (const [x, y, w] of [[0, 20, 80], [110, 10, 90], [220, 26, 100], [60, 44, 70]] as const) {
      s.r(x, y, w, 8, '#1c2234');
      s.r(x + 6, y - 5, w - 14, 5, '#1c2234');
      s.r(x + 8, y - 5, w - 20, 1, '#2a3248');
      s.r(x + 4, y + 8, w - 8, 2, '#141a28');
    }
  });
  // o raio (só aparece no clarão)
  t.g('c2-relampago', undefined, (s) => {
    for (const [x, y, h] of [[236, 4, 8], [232, 12, 8], [234, 20, 6], [228, 26, 10], [224, 36, 8], [226, 44, 6], [220, 50, 12]] as const) {
      s.r(x, y, 3, h, '#f0f4ff');
    }
  });
  // mar revolto atrás da amurada
  t.r(0, 84, 320, 30, '#14203a');
  t.r(0, 84, 320, 4, '#1a2a48');
  t.g('c2-onda', undefined, (s) => {
    for (let x = -24; x < 340; x += 28) {
      s.r(x, 86, 16, 3, '#2a4466');
      s.r(x + 4, 85, 6, 1, '#8aa8c8');
    }
  });
  t.g('c2-onda-volta', undefined, (s) => {
    for (let x = -10; x < 340; x += 22) {
      s.r(x, 96, 12, 3, '#22385a');
      s.r(x + 2, 95, 5, 1, '#6a88a8');
    }
  });
  t.g('c2-onda', atraso(-900), (s) => {
    for (let x = -20; x < 340; x += 34) s.r(x, 104, 20, 3, '#1e3252');
  });

  // mastros, vergas e as velas vermelhas
  for (const x of [78, 244]) {
    t.r(x, 0, 6, 132, '#3a2a1e');
    t.r(x, 0, 2, 132, '#5a4030');
    for (const y of [34, 70, 100]) t.r(x - 1, y, 8, 2, '#4a4a56');
    t.r(x - 48, 21, 102, 3, '#3a2a1e');
    t.r(x - 44, 58, 94, 3, '#3a2a1e');
  }
  vela(t, 37, 0);
  vela(t, 203, -1300);
  // cordame
  linha(t, 80, 4, 24, 112, '#5a4a3a');
  linha(t, 82, 4, 136, 112, '#5a4a3a');
  linha(t, 80, 22, 6, 112, '#4a3a2e');
  linha(t, 246, 4, 190, 112, '#5a4a3a');
  linha(t, 248, 4, 302, 112, '#5a4a3a');
  linha(t, 248, 22, 316, 112, '#4a3a2e');
  linha(t, 84, 64, 244, 64, '#4a3a2e');
  // lampião balançando na corda entre os mastros
  halo(t, 163, 82, 30, '#ffb04a', 0.08, 'c2-pulsar');
  t.g('c2-balancar', undefined, (s) => {
    s.r(163, 64, 1, 12, '#5a5a66');
    s.r(159, 76, 10, 2, '#2a2a30');
    s.r(160, 78, 8, 9, '#2a2a30');
    s.r(161, 79, 6, 7, '#ffc860');
    s.r(163, 81, 2, 3, '#fff0b0');
    s.r(159, 87, 10, 2, '#2a2a30');
  });

  // amurada de ferro com rebites
  t.r(0, 112, 320, 20, '#2a2c38');
  t.r(0, 110, 320, 3, '#4a4c5a');
  t.r(0, 110, 320, 1, '#6a6e80');
  t.r(0, 130, 320, 2, '#1a1c24');
  for (let x = 6; x < 320; x += 12) t.r(x, 116, 1, 1, '#5a5c6c');
  for (let x = 12; x < 320; x += 24) t.r(x, 126, 1, 1, '#5a5c6c');
  // ondas estourando por cima da amurada
  for (const [x, ms] of [[52, 0], [176, -1400], [290, -2600]] as Ponto[]) {
    t.g('c2-espuma', atraso(ms), (s) => {
      s.r(x - 8, 104, 16, 6, '#8aa8c8');
      s.r(x - 5, 98, 10, 6, '#b8d0e8');
      s.r(x - 2, 94, 4, 4, '#e0ecf8');
      s.r(x + 8, 100, 3, 3, '#b8d0e8');
      s.r(x - 12, 101, 3, 3, '#b8d0e8');
    });
  }

  // convés de chapas de ferro molhadas
  t.r(0, 132, 320, 48, '#2e303c');
  for (const [y, h, desl] of [[132, 10, 0], [142, 14, 20], [156, 24, 8]] as const) {
    t.r(0, y, 320, 1, '#1c1e26');
    for (let x = desl; x < 320; x += 40) {
      t.r(x, y + 1, 1, h - 1, '#1c1e26');
      t.r(x + 2, y + 2, 1, 1, '#4a4c5a');
    }
  }
  t.g('c2-agua', undefined, (s) => {
    for (let i = 0; i < 12; i++) s.r(entre(i * 7 + 3, 0, 300), entre(i * 5 + 1, 136, 176), entre(i + 4, 6, 18), 1, '#5a6a8a');
  });
  t.r(140, 150, 46, 4, '#6a5a3a', 0.25);
  // canhões, balas, rolo de corda e barril
  canhao(t, 0, -1);
  canhao(t, 320, 1);
  for (const [x, y] of [[254, 152], [260, 152], [266, 152], [257, 147], [263, 147], [260, 142]] as Ponto[]) {
    disco(t, x + 3, y + 3, 3, '#1a1a22', 2);
    t.r(x + 1, y + 1, 2, 1, '#4a4a5a');
  }
  for (const [w, dy] of [[20, 0], [16, 2], [10, 4]] as Ponto[]) {
    t.r(64 - w / 2, 156 + dy, w, 2, '#a8865a');
    t.r(64 - w / 2, 158 + dy, w, 1, '#6a5030');
  }
  barril(t, 288, 138);
  // escotilha de grade na frente
  t.r(140, 164, 40, 12, '#3a2a1e');
  for (let x = 144; x < 178; x += 6) t.r(x, 166, 2, 8, '#120e0a');

  // chuva caindo em diagonal (o desenho se repete a cada 60 px na descida)
  t.g('c2-chuva', undefined, (s) => {
    for (let k = -1; k < 3; k++) {
      for (let i = 0; i < 12; i++) {
        s.r(entre(i * 3 + 11, 0, 350) - k * 10, entre(i * 5 + 17, 0, 59) + k * 60, 1, 5, '#8aa0c8');
      }
    }
  });
  // clarão do relâmpago na cena toda
  t.ra(0, 0, 320, 180, '#d8e0ff', 'c2-relampago');
  return <>{t.itens}</>;
}
