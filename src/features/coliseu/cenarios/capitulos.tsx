/**
 * Cenários dos capítulos do modo História (Coliseu), em pixel art de 320 × 180.
 *
 * `desenhoCapitulo(lugar)` devolve só o conteúdo do SVG (sem a tag <svg>) para viewBox "0 0 320 180";
 * quem chama põe o <svg> com shapeRendering="crispEdges". Lugares que não são de capítulo devolvem null.
 *
 * Regras do desenho: coordenadas inteiras, quase tudo em <rect>, chão entre y 136 e 180 (os pés dos
 * personagens ficam por volta de y 155) e a faixa central (y 70 a 150) mais calma para os personagens.
 * As animações de ambiente usam as classes "cap-" de capitulos.css.
 */
import './capitulos.css';
import type { CSSProperties } from 'react';
import type { Lugar } from '@/game/historia/roteiro';

export function desenhoCapitulo(lugar: Lugar): JSX.Element | null {
  switch (lugar) {
    case 'biblioteca-estantes':
      return estantes();
    case 'biblioteca-salao':
      return salao(false);
    case 'biblioteca-chamas':
      return salao(true);
    case 'biblioteca-escada':
      return escada();
    case 'rua-noite':
      return ruaNoite();
    case 'jaula-carroca':
      return jaula();
    case 'beco':
      return beco();
    case 'rua-mercado':
      return mercado();
    case 'coliseu-tunel':
      return tunel();
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/* Ferramentas de desenho                                              */
/* ------------------------------------------------------------------ */

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

/** Arco em degraus (semicírculo de raio r com o topo em y) e o corpo reto embaixo (altura base). */
function arco(t: Pincel, cx: number, y: number, r: number, base: number, cor: string, passo = 2): void {
  for (let dy = 0; dy < r; dy += passo) {
    const h = Math.min(passo, r - dy);
    const meio = Math.round(Math.sqrt(Math.max(0, r * r - (r - dy - h / 2) ** 2)));
    if (meio > 0) t.r(cx - meio, y + dy, meio * 2, h, cor);
  }
  if (base > 0) t.r(cx - r, y + r, r * 2, base, cor);
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
  t.g('cap-pulsar', undefined, (s) => {
    s.r(cx - larg, cy - 2, larg * 2, 5, cor, op);
    s.r(cx - Math.round(larg * 0.7), cy - 4, Math.round(larg * 1.4), 9, cor, op);
    s.r(cx - Math.round(larg * 0.4), cy - 5, Math.round(larg * 0.8), 11, cor, op);
  });
}

/** Tocha de parede; (x, y) é o canto de cima da chama. */
function tocha(t: Pincel, x: number, y: number, atrasoMs = 0): void {
  halo(t, x + 2, y + 5, 26, '#ff9a3c', 0.07, 'cap-pulsar', atraso(atrasoMs));
  t.r(x - 2, y + 7, 8, 2, '#5a4030');
  t.r(x - 1, y + 9, 6, 2, '#3a2a20');
  t.r(x + 1, y + 11, 2, 8, '#4a3020');
  t.r(x + 1, y + 11, 1, 8, '#6a4a30');
  t.r(x - 1, y + 17, 6, 3, '#2a2228');
  t.g('cap-chama', atraso(atrasoMs), (s) => {
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
  t.g('cap-chama', { animationDelay: `${atrasoMs}ms`, animationDuration: `${400 + (Math.abs(atrasoMs) % 300)}ms` }, (c) => {
    c.r(x - meia, base - Math.round(h * 0.6), s, Math.round(h * 0.6), '#b8201a');
    c.r(x - meia + 1, base - h, Math.max(2, s - 4), Math.round(h * 0.5), '#e0401a');
    c.r(x - Math.round(s * 0.35), base - Math.round(h * 0.75), Math.max(2, Math.round(s * 0.7)), Math.round(h * 0.75), '#ff7a2a');
    c.r(x - Math.round(s * 0.2), base - Math.round(h * 0.55), Math.max(1, Math.round(s * 0.4)), Math.round(h * 0.55), '#ffc04a');
    c.r(x - Math.round(s * 0.1), base - Math.round(h * 0.3), Math.max(1, Math.round(s * 0.2)), Math.round(h * 0.3), '#fff0b0');
    c.r(x + Math.round(s * 0.25), base - Math.round(h * 0.95), 2, Math.round(h * 0.3), '#ff7a2a');
  });
}

/** Vapor saindo de um cano. */
function vapor(t: Pincel, x: number, y: number, atrasoMs: number): void {
  for (let k = 0; k < 3; k++) {
    t.ra(x - 2, y - 3, 5 + k, 4, '#e0e0ec', 'cap-vapor', atraso(atrasoMs - k * 900));
  }
}

/** Poeira flutuando numa região. */
function poeira(t: Pincel, n: number, x0: number, x1: number, y0: number, y1: number, cores: readonly string[], semente: number): void {
  for (let i = 0; i < n; i++) {
    const x = entre(semente + i * 13 + 1, x0, x1);
    const y = entre(semente + i * 7 + 3, y0, y1);
    t.ra(x, y, 1, 1, de(cores, i), 'cap-poeira', {
      animationDelay: `${-i * 370}ms`,
      animationDuration: `${6 + (i % 4)}s`,
    });
  }
}

/** Calçamento de pedras em perspectiva (pedras maiores perto de quem olha). */
function pedras(t: Pincel, y0: number, paleta: readonly string[], rejunte: string): void {
  t.r(0, y0, 320, 180 - y0, rejunte);
  const alturas = [4, 5, 6, 7, 8, 10, 12];
  let y = y0;
  alturas.forEach((h, linha) => {
    if (y >= 180) return;
    const larg = 10 + linha * 4;
    let x = -((linha * 7) % larg);
    let n = 0;
    while (x < 320) {
      const w = larg + entre(linha * 50 + n, -2, 2);
      t.r(x + 1, y + 1, w - 1, h - 1, de(paleta, entre(linha * 31 + n * 7, 0, 2)));
      x += w;
      n++;
    }
    y += h;
  });
}

/* ------------------------------------------------------------------ */
/* Biblioteca: estantes (noite, luz quente)                            */
/* ------------------------------------------------------------------ */

const LOMBADAS = [
  '#a83a2a', '#7a2a20', '#3a6a9a', '#2a4a6a', '#c8962a', '#8a6a1a',
  '#4a8a3a', '#2e5a26', '#7a3a8a', '#d8c8a0', '#5a2a5a', '#b85a2a',
] as const;

/** Estante alta com três prateleiras de livros e um armário embaixo. */
function estante(t: Pincel, x0: number, w: number, semente: number): void {
  const y0 = 24;
  const fim = 138;
  t.r(x0 - 2, y0 - 6, w + 4, 6, '#6e4220');
  t.r(x0 - 2, y0 - 6, w + 4, 1, '#b07a3a');
  t.r(x0 - 1, y0 - 1, w + 2, 1, '#2a160a');
  t.r(x0, y0, w, fim - y0, '#140a04');
  t.r(x0, y0, 4, fim - y0, '#5a3418');
  t.r(x0 + 1, y0, 1, fim - y0, '#8a5a2c');
  t.r(x0 + w - 4, y0, 4, fim - y0, '#4a2a12');
  t.r(x0 + w - 4, y0, 1, fim - y0, '#6e4220');
  const dentro = w - 8;
  for (let fileira = 0; fileira < 3; fileira++) {
    const prat = y0 + 2 + fileira * 26 + 24;
    let x = x0 + 5;
    let n = semente * 97 + fileira * 31;
    while (x < x0 + w - 6) {
      n++;
      if (sorte(n * 3) < 0.1) {
        x += 4; // vão na prateleira
        continue;
      }
      const lw = entre(n, 3, 5);
      if (x + lw > x0 + w - 5) break;
      const lh = entre(n + 50, 14, 21);
      t.r(x, prat - lh, lw, lh, de(LOMBADAS, entre(n + 90, 0, 11)));
      if (sorte(n + 7) < 0.3) t.r(x, prat - lh + 3, lw, 1, '#e8c86a', 0.7);
      x += lw + (sorte(n + 11) < 0.2 ? 1 : 0);
    }
    t.r(x0 + 4, prat, dentro, 2, '#8a5a2c');
    t.r(x0 + 4, prat + 2, dentro, 1, '#2a160a');
  }
  // armário de duas portas
  const ya = y0 + 2 + 3 * 26 + 2;
  const meia = Math.floor(dentro / 2);
  for (const xa of [x0 + 4, x0 + 4 + meia]) {
    t.r(xa, ya, meia, fim - ya, '#5a3418');
    t.r(xa + 3, ya + 3, meia - 6, fim - ya - 6, '#4a2a12');
    t.r(xa + 3, ya + 3, meia - 6, 1, '#2a160a');
  }
  t.r(x0 + 4, ya - 1, dentro, 1, '#8a5a2c');
  t.r(x0 + 4 + meia - 3, ya + 14, 2, 3, '#c8962a');
  t.r(x0 + 4 + meia + 1, ya + 14, 2, 3, '#c8962a');
}

/** Lampião de óleo pendurado no teto, balançando. */
function lampada(t: Pincel, x: number, corrente: number, atrasoMs: number): void {
  t.g('cap-balancar', atraso(atrasoMs), (s) => {
    s.r(x, 0, 1, corrente, '#5a4a3a');
    const y = corrente;
    halo(s, x, y + 7, 28, '#ffb04a', 0.06);
    s.r(x - 3, y, 7, 2, '#8a6a2a');
    s.r(x - 4, y + 2, 9, 8, '#ffd04a');
    s.r(x - 4, y + 2, 1, 8, '#8a6a2a');
    s.r(x + 4, y + 2, 1, 8, '#8a6a2a');
    s.r(x - 1, y + 4, 3, 5, '#fff0b0');
    s.r(x - 3, y + 10, 7, 2, '#8a6a2a');
    s.r(x - 1, y + 12, 3, 2, '#5a4220');
  });
}

function estantes(): JSX.Element {
  const t = pincel();
  t.r(0, 0, 320, 180, '#1c100a');
  // teto com vigas
  t.r(0, 0, 320, 12, '#120804');
  t.r(0, 12, 320, 3, '#3a2210');
  t.r(0, 15, 320, 1, '#0c0602');
  for (let x = 8; x < 320; x += 40) {
    t.r(x, 0, 6, 12, '#2a160a');
    t.r(x, 0, 1, 12, '#4a2c14');
  }
  // parede do meio com lambri
  t.r(120, 16, 80, 122, '#26180e');
  t.r(120, 108, 80, 30, '#3a2210');
  t.r(120, 108, 80, 1, '#5a3418');
  for (let x = 124; x < 196; x += 12) t.r(x, 112, 8, 22, '#4a2c14');

  // janela em arco: noite lá fora
  arco(t, 160, 26, 28, 54, '#5a4a44', 3);
  arco(t, 160, 28, 26, 52, '#3a2e2c', 3);
  arco(t, 160, 30, 24, 50, '#16244a', 3);
  t.r(136, 80, 48, 24, '#22325c');
  t.r(136, 92, 48, 12, '#2c3e6a');
  const estrelas: [number, number][] = [[142, 40], [150, 58], [176, 62], [146, 72], [180, 48], [170, 74], [154, 46]];
  estrelas.forEach(([x, y], i) => t.ra(x, y, 1, 1, '#fff0d0', 'cap-estrela', atraso(i * 500)));
  halo(t, 168, 42, 12, '#c8d8ff', 0.06);
  t.r(165, 37, 6, 10, '#e8e0c0');
  t.r(163, 39, 10, 6, '#e8e0c0');
  t.r(166, 40, 2, 2, '#c8c0a0');
  t.r(169, 43, 2, 1, '#c8c0a0');
  // telhados da cidade lá fora
  t.r(136, 94, 10, 10, '#0e1224');
  t.r(146, 90, 8, 14, '#0e1224');
  t.r(154, 96, 12, 8, '#0e1224');
  arco(t, 172, 88, 6, 10, '#0e1224', 2);
  t.r(178, 92, 6, 12, '#0e1224');
  t.ra(140, 97, 1, 1, '#ffb04a', 'cap-piscar');
  t.r(149, 94, 1, 2, '#ffb04a');
  t.r(158, 99, 1, 1, '#ff8a3a');
  // caixilhos e peitoril
  t.r(159, 30, 2, 74, '#2a1e1c');
  t.r(136, 66, 48, 2, '#2a1e1c');
  t.r(130, 104, 60, 4, '#7a6a60');
  t.r(130, 104, 60, 1, '#a89a8a');
  t.r(132, 108, 56, 1, '#2a1e1c');

  // as quatro estantes
  estante(t, 2, 56, 1);
  estante(t, 62, 56, 2);
  estante(t, 202, 56, 3);
  estante(t, 262, 56, 4);
  // trilho de latão e escada de biblioteca
  t.r(200, 27, 120, 2, '#c8962a');
  t.r(200, 27, 120, 1, '#f0d070');
  t.r(266, 24, 2, 128, '#7a4a22');
  t.r(266, 24, 1, 128, '#a8703a');
  t.r(280, 24, 2, 128, '#6a3e1c');
  for (let y = 32; y < 150; y += 10) t.r(268, y, 12, 2, '#8a5a2c');
  t.r(265, 24, 4, 3, '#c8962a');
  t.r(279, 24, 4, 3, '#c8962a');

  // chão de tábuas
  t.r(0, 136, 320, 3, '#2a160a');
  t.r(0, 139, 320, 41, '#4a2c16');
  const linhas = [139, 143, 148, 154, 161, 169, 178];
  linhas.forEach((y, i) => {
    t.r(0, y, 320, 1, '#2e1a0c');
    t.r(0, y + 1, 320, 1, '#5a3820');
    const prox = linhas[i + 1] ?? 180;
    const passo = 44 + i * 8;
    for (let x = (i * 29) % passo; x < 320; x += passo) t.r(x, y, 1, prox - y, '#2e1a0c');
  });
  // luar entrando pela janela
  t.p('136,104 184,104 214,180 112,180', '#9ab0e0', 0.05);
  // tapete
  t.r(104, 150, 112, 22, '#6a1a1a');
  t.r(106, 152, 108, 18, '#c8962a');
  t.r(108, 154, 104, 14, '#8a2a24');
  t.r(152, 158, 16, 6, '#c8962a');
  t.r(156, 156, 8, 10, '#c8962a');
  t.r(158, 159, 4, 4, '#6a1a1a');
  t.r(112, 157, 6, 8, '#5a1a1a');
  t.r(202, 157, 6, 8, '#5a1a1a');
  for (let x = 106; x < 214; x += 6) t.r(x, 172, 2, 2, '#d8c8a0');

  // mesa de leitura com livro aberto, tinteiro e vela
  t.r(130, 120, 60, 4, '#7a4a22');
  t.r(130, 120, 60, 1, '#a8703a');
  t.r(132, 124, 56, 7, '#5a3418');
  t.r(132, 130, 56, 1, '#2a160a');
  t.r(134, 131, 4, 15, '#4a2a12');
  t.r(182, 131, 4, 15, '#4a2a12');
  t.r(159, 126, 2, 2, '#c8962a');
  t.r(144, 116, 13, 4, '#e8dcc0');
  t.r(157, 116, 13, 4, '#d8ccb0');
  t.r(156, 115, 2, 5, '#7a2a20');
  t.r(146, 117, 9, 1, '#9a8a70');
  t.r(146, 118, 7, 1, '#9a8a70');
  t.r(159, 117, 9, 1, '#9a8a70');
  t.r(159, 118, 8, 1, '#9a8a70');
  t.r(136, 115, 4, 5, '#1a1a2a');
  t.r(137, 114, 2, 1, '#3a3a4a');
  t.r(139, 108, 1, 7, '#e8e8f0');
  t.r(140, 108, 1, 3, '#c8c8d8');
  halo(t, 177, 108, 20, '#ffb04a', 0.07, 'cap-pulsar');
  t.r(174, 119, 7, 1, '#c8962a');
  t.r(176, 111, 3, 9, '#e8e0c8');
  t.r(176, 111, 1, 9, '#fff8e8');
  t.g('cap-chama', undefined, (s) => {
    s.r(176, 106, 3, 5, '#ffc04a');
    s.r(177, 105, 1, 3, '#fff0b0');
  });

  // lampiões e as poças de luz no chão
  poca(t, 92, 152, 40, '#ffb04a', 0.07);
  poca(t, 230, 152, 40, '#ffb04a', 0.07);
  lampada(t, 92, 34, 0);
  lampada(t, 230, 34, -1500);
  // poeira dançando na luz
  poeira(t, 20, 70, 250, 50, 140, ['#ffe8b0', '#ffe8b0', '#c8d8ff'], 0);
  return <>{t.itens}</>;
}

/* ------------------------------------------------------------------ */
/* Biblioteca: grande salão (e o mesmo salão em chamas)                */
/* ------------------------------------------------------------------ */

function salao(fogo: boolean): JSX.Element {
  const t = pincel();
  t.r(0, 0, 320, 180, fogo ? '#2e1416' : '#241a2a');
  t.r(0, 100, 320, 38, fogo ? '#24100e' : '#1c1422');
  t.r(0, 100, 320, 1, fogo ? '#4a2420' : '#3a3048');
  // cornija com dentículos
  t.r(0, 0, 320, 8, '#140e18');
  t.r(0, 8, 320, 4, '#8a826e');
  t.r(0, 8, 320, 1, '#c8bea8');
  for (let x = 2; x < 320; x += 10) t.r(x, 12, 5, 2, '#6a6252');

  // janelas em arco com a cidade queimando lá fora
  const janelas = [43, 99, 221, 277];
  janelas.forEach((cx, i) => {
    arco(t, cx, 26, 17, 56, '#3a3040', 3);
    t.g(fogo ? 'cap-tremular' : 'cap-pulsar', atraso(i * 300), (s) => {
      arco(s, cx, 29, 14, 54, fogo ? '#ff7a2a' : '#c8501a', 3);
      s.r(cx - 14, 76, 28, 21, fogo ? '#ffb04a' : '#e07a2a', fogo ? 0.9 : 0.6);
    });
    t.r(cx - 14, 88, 8, 9, '#3a0e0a');
    t.r(cx - 6, 84, 6, 13, '#3a0e0a');
    t.r(cx + 2, 90, 12, 7, '#3a0e0a');
    t.r(cx - 1, 29, 2, 68, '#1c1422');
    t.r(cx - 14, 62, 28, 2, '#1c1422');
    t.r(cx - 19, 97, 38, 3, '#a89e88');
    t.r(cx - 19, 97, 38, 1, '#d8cfbb');
  });

  // colunas de mármore
  for (const x of [6, 68, 118, 190, 240, 302]) {
    t.r(x, 20, 12, 114, '#b8ae98');
    t.r(x + 1, 20, 1, 114, '#e0d8c4');
    t.r(x + 4, 20, 1, 114, '#8a826e');
    t.r(x + 7, 20, 1, 114, '#8a826e');
    t.r(x + 10, 20, 2, 114, '#7a7262');
    t.r(x - 3, 14, 18, 4, '#d8cfbb');
    t.r(x - 2, 18, 16, 2, '#a89e88');
    t.r(x - 4, 14, 2, 3, '#7a7262');
    t.r(x + 14, 14, 2, 3, '#7a7262');
    t.r(x - 2, 130, 16, 2, '#a89e88');
    t.r(x - 3, 132, 18, 6, '#d8cfbb');
    t.r(x - 3, 137, 18, 1, '#7a7262');
  }

  // estandartes da biblioteca (livro aberto) nas colunas que ladeiam a estátua
  [119, 191].forEach((bx, i) => {
    const pano = fogo ? '#5a1018' : '#7a1a2a';
    t.g('cap-bandeira', atraso(i * 700), (s) => {
      s.r(bx - 1, 21, 12, 1, '#5a4a3a');
      s.r(bx, 22, 10, 58, pano);
      s.r(bx + 1, 24, 1, 52, '#9a2a3a');
      s.r(bx, 22, 10, 2, '#c8962a');
      s.r(bx, 76, 10, 2, '#c8962a');
      s.r(bx + 2, 42, 3, 6, '#e8d8a0');
      s.r(bx + 5, 42, 3, 6, '#d8c890');
      s.r(bx + 4, 41, 2, 8, '#c8962a');
      s.r(bx, 80, 4, 4, pano);
      s.r(bx + 6, 80, 4, 4, pano);
    });
    if (fogo) chama(t, bx + 5, 86, 8, i * 170);
  });

  // estátua do Guardião Zero: robô antigo de bronze, segurando um livro no alto
  halo(t, 160, 70, 40, fogo ? '#ff5a2a' : '#c8a0ff', fogo ? 0.06 : 0.04);
  t.r(136, 108, 48, 5, '#c8bea8');
  t.r(136, 108, 48, 1, '#e8e0cc');
  t.r(140, 113, 40, 25, '#8a826e');
  t.r(140, 113, 2, 25, '#a89e88');
  t.r(176, 113, 4, 25, '#6a6252');
  t.r(150, 120, 20, 7, '#5a5248');
  t.r(152, 122, 4, 1, '#c8962a');
  t.r(158, 122, 4, 1, '#c8962a');
  t.r(164, 122, 4, 1, '#c8962a');
  t.r(154, 124, 12, 1, '#a89e88');
  const B = '#8a6a3a';
  const BE = '#5a4220';
  const BC = '#b8904a';
  const PA = '#4a8a7a';
  // pernas
  t.r(149, 90, 8, 18, B);
  t.r(163, 90, 8, 18, B);
  t.r(149, 90, 2, 18, BC);
  t.r(169, 90, 2, 18, BE);
  t.r(147, 104, 11, 4, BE);
  t.r(162, 104, 11, 4, BE);
  // tronco, mostrador e rebites
  t.r(145, 58, 30, 32, B);
  t.r(145, 58, 3, 32, BC);
  t.r(171, 58, 4, 32, BE);
  t.r(148, 86, 24, 4, BE);
  t.r(154, 64, 12, 12, BE);
  t.r(156, 66, 8, 8, '#c8962a');
  t.r(159, 67, 2, 4, BE);
  t.r(150, 79, 20, 1, BE);
  t.r(150, 82, 20, 1, BE);
  t.r(147, 60, 1, 1, BC);
  t.r(172, 60, 1, 1, BC);
  t.r(147, 84, 1, 1, BC);
  t.r(172, 84, 1, 1, BC);
  // braço esquerdo caído
  t.r(139, 58, 7, 7, B);
  t.r(140, 65, 5, 22, B);
  t.r(140, 65, 1, 22, BC);
  t.r(139, 87, 7, 5, BE);
  // braço direito erguido com o livro
  t.r(175, 58, 7, 7, B);
  t.r(176, 44, 5, 14, B);
  t.r(176, 44, 1, 14, BC);
  t.r(174, 40, 8, 4, BE);
  t.r(170, 32, 16, 8, BC);
  t.r(177, 32, 2, 8, BE);
  t.r(171, 34, 5, 1, '#e0c070');
  t.r(180, 34, 5, 1, '#e0c070');
  // cabeça, olhos, grade da boca e antena
  t.r(149, 38, 22, 20, B);
  t.r(149, 38, 22, 2, BC);
  t.r(149, 38, 2, 20, BC);
  t.r(169, 40, 2, 18, BE);
  t.r(153, 45, 5, 4, '#1a120a');
  t.r(162, 45, 5, 4, '#1a120a');
  if (fogo) {
    t.ra(154, 46, 3, 2, '#ff7a2a', 'cap-pulsar');
    t.ra(163, 46, 3, 2, '#ff7a2a', 'cap-pulsar');
  } else {
    t.r(154, 46, 3, 2, '#4a3a20');
    t.r(163, 46, 3, 2, '#4a3a20');
  }
  t.r(154, 52, 12, 1, BE);
  t.r(154, 54, 12, 1, BE);
  t.r(159, 30, 2, 8, BE);
  t.r(158, 27, 4, 3, '#c8962a');
  // pátina verde do tempo
  t.r(152, 58, 2, 10, PA, 0.7);
  t.r(165, 40, 1, 6, PA, 0.7);
  t.r(150, 94, 1, 8, PA, 0.7);
  t.r(173, 66, 1, 12, PA, 0.6);
  t.r(141, 70, 1, 8, PA, 0.6);

  // piso de mármore xadrez em perspectiva
  t.r(0, 138, 320, 42, fogo ? '#5a3428' : '#5e5054');
  const linhas = [138, 143, 149, 156, 164, 173];
  linhas.forEach((y, i) => {
    const h = (linhas[i + 1] ?? 180) - y;
    const w = 20 + i * 6;
    const desloc = (160 - Math.round(w / 2)) % w;
    for (let k = 0, x = desloc - w; x < 320; k++, x += w) {
      if ((k + i) % 2 === 0) t.r(x, y, w, h, fogo ? '#3a1c16' : '#3e3238');
    }
    t.r(0, y, 320, 1, fogo ? '#7a4a38' : '#8a7a7a', 0.5);
  });
  // a luz das janelas no chão
  janelas.forEach((cx, i) => {
    t.g('cap-pulsar', atraso(i * 400), (s) => {
      s.p(`${cx - 14},100 ${cx + 14},100 ${cx + 30},180 ${cx - 2},180`, fogo ? '#ff8a3a' : '#ff7a3a', fogo ? 0.1 : 0.06);
    });
  });

  if (!fogo) {
    poeira(t, 14, 20, 300, 60, 150, ['#ffd8a0', '#ffc080'], 5);
    return <>{t.itens}</>;
  }

  // ---- em chamas ----
  // fumaça junto ao teto
  t.r(0, 0, 320, 30, '#0e0606', 0.45);
  for (let i = 0; i < 10; i++) {
    const w = entre(i + 2, 10, 22);
    t.ra(entre(i * 5 + 1, 0, 300), entre(i * 9 + 4, 30, 110), w, Math.round(w * 0.6), '#2a1a1a', 'cap-fumaca', {
      animationDelay: `${-i * 1000}ms`,
    });
  }
  // fogo correndo pela base da parede (menos na frente da estátua)
  for (let i = 0; i < 10; i++) {
    const x = 14 + i * 33 + entre(i, -4, 4);
    if (x > 128 && x < 192) continue;
    halo(t, x, 126, 24, '#ff6a2a', 0.06, 'cap-pulsar', atraso(i * 200));
    chama(t, x, 138, entre(i + 3, 7, 12), i * 90);
  }
  // vigas caídas queimando nos cantos da frente
  t.r(0, 160, 46, 8, '#3a1a0e');
  t.r(0, 160, 46, 1, '#5a2a14');
  t.r(20, 162, 6, 2, '#ff6a2a');
  t.r(276, 164, 44, 8, '#3a1a0e');
  t.r(276, 164, 44, 1, '#5a2a14');
  t.r(298, 166, 5, 2, '#ff6a2a');
  t.r(52, 170, 6, 3, '#7a2a20');
  chama(t, 12, 162, 14, 50);
  chama(t, 34, 164, 10, 210);
  chama(t, 292, 166, 14, 120);
  chama(t, 310, 165, 10, 330);
  chama(t, 55, 170, 5, 400);
  // brasas subindo
  for (let i = 0; i < 26; i++) {
    const tam = i % 4 === 0 ? 2 : 1;
    t.ra(entre(i * 7 + 2, 0, 318), entre(i * 11 + 6, 120, 175), tam, tam, i % 2 ? '#ffb04a' : '#ff6a2a', 'cap-brasa', {
      animationDelay: `${-i * 230}ms`,
      animationDuration: `${2.6 + (i % 5) * 0.4}s`,
    });
  }
  // véu vermelho do incêndio
  t.ra(0, 0, 320, 180, '#ff3a10', 'cap-luz-fogo');
  return <>{t.itens}</>;
}

/* ------------------------------------------------------------------ */
/* Biblioteca: escada para o porão secreto                             */
/* ------------------------------------------------------------------ */

function escada(): JSX.Element {
  const t = pincel();
  t.r(0, 0, 320, 180, '#221a26');
  // parede de blocos de pedra (só o que aparece acima da escada)
  const corPedra = ['#3a3040', '#342a38', '#40364a'];
  for (let lin = 0; lin < 12; lin++) {
    const y = 8 + lin * 11;
    const desloc = lin % 2 ? 16 : 0;
    for (let k = 0, x = -desloc; x < 320; k++, x += 32) {
      if (x + 32 <= 231 && y > 64 + 8 * Math.floor((x + 32) / 21)) continue;
      t.r(x + 1, y + 1, 31, 10, de(corPedra, lin * 7 + k * 3));
    }
  }
  // passagem lá em cima, por onde a escada vem
  arco(t, 10, 18, 10, 28, '#0a060c', 2);
  t.r(2, 50, 16, 6, '#ffb04a', 0.15);

  // degraus descendo da esquerda para a direita
  for (let i = 0; i <= 10; i++) {
    const x = i * 21;
    const y = 56 + i * 8;
    t.r(x, y, 24, 138 - y, '#2a222c');
    t.r(x, y + 8, 24, 3, '#3a3040');
    t.r(x, y, 24, 2, '#8a7a88');
    t.r(x, y + 2, 24, 6, '#5a4a58');
    t.r(x, y + 7, 24, 1, '#1a141c');
  }
  // corrimão em degraus, com balaústres
  for (let i = 0; i < 10; i++) {
    const x = i * 21;
    const y = 56 + i * 8;
    t.r(x + 10, y - 14, 1, 14, '#1a1a22');
    t.r(x, y - 15, 21, 2, '#4a3424');
    t.r(x + 20, y - 15, 2, 10, '#4a3424');
  }
  t.r(212, 112, 4, 26, '#3a2a1e');
  t.r(211, 109, 6, 4, '#5a4030');
  // livro esquecido num degrau
  t.r(108, 100, 8, 3, '#3a6a9a');
  t.r(108, 100, 8, 1, '#d8c8a0');

  // porta do porão em arco, com luz vazando pela fresta
  arco(t, 272, 92, 20, 26, '#5a4a58', 3);
  arco(t, 272, 96, 16, 26, '#4a2c16', 2);
  for (let x = 262; x <= 282; x += 5) t.r(x, 104, 1, 34, '#2e1a0c');
  t.r(256, 110, 32, 2, '#2a2a32');
  t.r(256, 126, 32, 2, '#2a2a32');
  for (const x of [258, 270, 284]) {
    t.r(x, 110, 1, 1, '#6a6a78');
    t.r(x, 126, 1, 1, '#6a6a78');
  }
  t.r(276, 114, 6, 1, '#8a6a2a');
  t.r(278, 116, 4, 4, '#c8962a');
  t.r(279, 117, 2, 2, '#4a2c16');
  t.ra(280, 121, 1, 2, '#ffd04a', 'cap-pulsar');
  t.ra(258, 137, 28, 1, '#ffb04a', 'cap-pulsar');
  // estante arrastada para o lado (escondia a porta)
  t.r(296, 58, 26, 80, '#4a2a12');
  t.r(296, 58, 2, 80, '#6e4220');
  t.r(296, 56, 26, 3, '#6e4220');
  for (let p = 0; p < 3; p++) {
    const yb = 80 + p * 22;
    t.r(298, yb, 22, 2, '#8a5a2c');
    for (let k = 0; k < 4; k++) {
      const h = entre(p * 9 + k, 12, 17);
      t.r(300 + k * 5, yb - h, 4, h, de(LOMBADAS, p * 5 + k * 3));
    }
  }

  // chão de lajes
  t.r(0, 138, 320, 42, '#1e1820');
  const filas = [138, 145, 154, 165, 180];
  for (let i = 0; i < filas.length - 1; i++) {
    const y = filas[i] ?? 138;
    const h = (filas[i + 1] ?? 180) - y;
    const w = 34 + i * 10;
    const desloc = i % 2 ? Math.round(w / 2) : 0;
    for (let k = 0, x = -desloc; x < 320; k++, x += w) {
      t.r(x + 1, y + 1, w - 1, h - 1, de(['#3a3238', '#342c34', '#2e262e'], i * 5 + k));
    }
  }
  // marcas de arrasto da estante
  t.r(266, 141, 30, 1, '#120c12');
  t.r(270, 144, 28, 1, '#120c12');
  // um ratinho de olho na gente
  t.r(242, 134, 5, 3, '#4a4048');
  t.r(246, 133, 2, 2, '#4a4048');
  t.r(239, 136, 3, 1, '#6a5a60');
  t.ra(247, 133, 1, 1, '#ff5a4a', 'cap-piscar');

  // tochas e as poças de luz
  poca(t, 170, 146, 30, '#ff9a3c', 0.06);
  poca(t, 244, 148, 26, '#ff9a3c', 0.06);
  tocha(t, 60, 30, 0);
  tocha(t, 168, 62, -170);
  tocha(t, 240, 84, -330);
  // teias de aranha no canto
  for (let k = 0; k < 8; k++) {
    t.r(317 - k * 3, k * 2, 3, 1, '#8a8090', 0.5);
    t.r(319 - k, k * 3, 1, 2, '#8a8090', 0.4);
  }
  poeira(t, 10, 40, 260, 40, 130, ['#ffd8a0'], 11);
  // escuro em cima
  t.r(0, 0, 320, 10, '#0a060c', 0.7);
  return <>{t.itens}</>;
}

/* ------------------------------------------------------------------ */
/* Rua de Roma à noite                                                 */
/* ------------------------------------------------------------------ */

function ruaNoite(): JSX.Element {
  const t = pincel();
  t.r(0, 0, 320, 180, '#0c0a24');
  t.r(0, 50, 320, 40, '#120f30');
  t.r(0, 90, 320, 48, '#1a1640');
  for (let i = 0; i < 22; i++) {
    const x = entre(i * 17 + 5, 2, 318);
    const y = entre(i * 23 + 9, 2, 70);
    t.ra(x, y, 1, 1, i % 4 === 0 ? '#ffe8a0' : '#ffffff', i % 3 === 0 ? 'cap-estrela' : undefined, atraso(i * 330));
  }
  // lua
  halo(t, 262, 24, 22, '#c8d0ff', 0.05);
  t.r(256, 16, 12, 16, '#e8e0c0');
  t.r(254, 18, 16, 12, '#e8e0c0');
  t.r(258, 14, 8, 20, '#e8e0c0');
  t.r(266, 18, 3, 12, '#d0c8a8');
  t.r(258, 20, 3, 3, '#c8c0a0');
  t.r(264, 26, 2, 2, '#c8c0a0');
  t.r(262, 17, 2, 1, '#c8c0a0');
  // engrenagem gigante girando atrás da cidade
  t.el((k) => (
    <g key={k} className="girar-devagar" style={{ transformOrigin: '70px 74px' }}>
      <circle cx={70} cy={74} r={26} fill="#1a1636" />
      <circle cx={70} cy={74} r={10} fill="#120f30" />
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={i} x={66} y={44} width={8} height={6} fill="#1a1636" transform={`rotate(${i * 36} 70 74)`} />
      ))}
    </g>
  ));
  // silhueta distante: telhados e uma cúpula
  arco(t, 200, 60, 24, 14, '#1a1636', 2);
  for (let i = 0; i < 12; i++) {
    const x = i * 28 - 6;
    const topo = entre(i * 3 + 1, 74, 96);
    t.r(x, topo, 26, 138 - topo, '#18142e');
    if (i % 2 === 0) t.r(x + 6, topo + 6, 2, 2, '#c88a3a', 0.7);
  }

  // insulae (prédios de vários andares)
  const predios: [number, number, number, string][] = [
    [0, 62, 40, '#3a2a3e'],
    [64, 58, 58, '#43303e'],
    [124, 72, 48, '#362a40'],
    [198, 56, 62, '#40303a'],
    [256, 64, 36, '#3a2a3e'],
  ];
  let n = 0;
  predios.forEach(([x, w, topo, cor], b) => {
    t.r(x, topo, w, 138 - topo, cor);
    t.r(x + w - 2, topo, 2, 138 - topo, '#24182a');
    t.r(x - 2, topo - 4, w + 4, 4, '#5a2a26');
    t.r(x - 2, topo - 4, w + 4, 1, '#7a3a2e');
    for (let y = topo + 24; y < 120; y += 26) t.r(x, y, w, 2, '#24182a');
    const colunas = Math.floor((w - 8) / 18);
    for (let y = topo + 8; y < 104; y += 26) {
      for (let c = 0; c < colunas; c++) {
        n++;
        const wx = x + 7 + c * 18;
        t.r(wx - 1, y - 1, 10, 12, '#1e1424');
        if (sorte(n * 5 + b) < 0.42) {
          t.ra(wx, y, 8, 10, '#ffb04a', 'cap-piscar', atraso(-n * 700));
          t.r(wx + 3, y, 1, 10, '#7a4a1a');
          t.r(wx, y + 4, 8, 1, '#7a4a1a');
        } else {
          t.r(wx, y, 8, 10, '#140c1a');
        }
        t.r(wx - 1, y + 10, 10, 1, '#5a4a5a');
      }
    }
    // porta de loja em arco no térreo
    arco(t, x + Math.floor(w / 2), 112, 8, 18, '#140c1a', 2);
  });
  // cartaz do Censor no prédio do meio
  t.r(150, 112, 12, 14, '#d8ccb0');
  t.r(152, 117, 8, 4, '#c0282a');
  t.ra(155, 118, 2, 2, '#ff4a3a', 'cap-olho');

  // canos de cobre com vapor
  t.r(0, 104, 320, 3, '#6a4a2a');
  t.r(0, 104, 320, 1, '#a8703a');
  for (let x = 20; x < 320; x += 40) t.r(x, 103, 4, 5, '#8a5a2a');
  t.r(120, 60, 3, 44, '#6a4a2a');
  t.r(120, 60, 1, 44, '#a8703a');
  t.r(117, 80, 9, 2, '#8a2a2a');
  t.r(120, 77, 3, 8, '#8a2a2a');
  vapor(t, 42, 101, 0);
  vapor(t, 202, 101, -1300);
  vapor(t, 302, 101, -600);

  // calçada e calçamento
  t.r(0, 136, 320, 4, '#4a4250');
  t.r(0, 136, 320, 1, '#6a6070');
  pedras(t, 140, ['#3a3444', '#443e4e', '#302a3a'], '#1c1824');
  // poça refletindo a lua
  t.r(176, 164, 34, 5, '#1a2244');
  t.r(180, 163, 26, 1, '#1a2244');
  t.r(184, 167, 4, 1, '#6a78a8');
  t.ra(190, 165, 8, 1, '#c8d0f0', 'cap-estrela');

  // postes de luz
  for (const x of [60, 260]) {
    poca(t, x, 150, 30, '#ffb04a', 0.06);
    halo(t, x, 86, 30, '#ffc04a', 0.06, 'cap-pulsar');
    t.r(x - 3, 140, 7, 3, '#1a1a22');
    t.r(x - 1, 92, 3, 48, '#2a2a34');
    t.r(x, 92, 1, 48, '#4a4a58');
    t.r(x - 4, 80, 9, 2, '#2a2a34');
    t.r(x - 3, 82, 7, 8, '#ffd04a');
    t.r(x - 3, 82, 1, 8, '#8a6a2a');
    t.r(x + 3, 82, 1, 8, '#8a6a2a');
    t.r(x - 1, 84, 3, 4, '#fff0b0');
    t.r(x - 4, 90, 9, 2, '#2a2a34');
    t.r(x - 2, 78, 5, 2, '#2a2a34');
    t.r(x, 76, 1, 2, '#2a2a34');
  }
  return <>{t.itens}</>;
}

/* ------------------------------------------------------------------ */
/* Dentro da jaula de bronze, a carroça andando por uma rua de sol     */
/* ------------------------------------------------------------------ */

/** Paisagem do fundo (aqueduto, templo, ciprestes), em faixa de 320 px. */
function longe(s: Pincel, dx: number): void {
  s.r(dx, 84, 320, 30, '#9ab4c4');
  s.r(dx, 70, 320, 5, '#b0c0cc');
  for (let k = 0; k < 16; k++) s.r(dx + k * 20, 75, 4, 12, '#b0c0cc');
  s.r(dx + 200, 56, 32, 4, '#a8b8c4');
  s.r(dx + 196, 60, 40, 4, '#a8b8c4');
  for (let k = 0; k < 5; k++) s.r(dx + 198 + k * 8, 64, 3, 20, '#a8b8c4');
  for (const k of [40, 120, 160, 290]) {
    s.r(dx + k, 70, 5, 30, '#6a8a7a');
    s.r(dx + k + 1, 64, 3, 6, '#6a8a7a');
  }
}

/** Fachadas de sol, listras da rua e a multidão, em faixa de 320 px. */
function frenteRua(s: Pincel, dx: number): void {
  const cores = ['#d8a868', '#c8906a', '#e0c090', '#b87a5a'];
  for (let b = 0; b < 4; b++) {
    const x = dx + b * 80;
    const topo = 28 + entre(b * 5 + 2, 0, 18);
    s.r(x, topo, 78, 112 - topo, de(cores, b));
    s.r(x + 74, topo, 4, 112 - topo, '#5a3a2a', 0.3);
    s.r(x - 1, topo - 5, 80, 5, '#a84a2a');
    s.r(x - 1, topo - 5, 80, 1, '#d06a3a');
    s.r(x - 1, topo - 1, 80, 1, '#6a2a18');
    for (let andar = 0; andar < 2; andar++) {
      const wy = topo + 10 + andar * 24;
      if (wy > 76) continue;
      for (let c = 0; c < 2; c++) {
        const wx = x + 14 + c * 38;
        s.r(wx, wy, 10, 13, '#4a2e24');
        s.r(wx - 3, wy, 3, 13, '#4a7a5a');
        s.r(wx + 10, wy, 3, 13, '#4a7a5a');
        s.r(wx - 3, wy + 13, 16, 2, '#f0dcb8');
      }
    }
    // loja no térreo com toldo
    s.r(x + 28, 92, 22, 20, '#3a2418');
    s.r(x + 24, 88, 30, 4, b % 2 ? '#c0384a' : '#3a6ad0');
    s.r(x + 24, 88, 30, 1, '#ffffff', 0.4);
    if (b === 2) {
      // estandarte com o olho do Censor
      const bx = x + 32;
      s.r(bx, topo + 4, 12, 30, '#b0202a');
      s.r(bx, topo + 4, 12, 2, '#e0b040');
      s.r(bx + 2, topo + 15, 8, 4, '#f0e8d8');
      s.r(bx + 4, topo + 14, 4, 6, '#f0e8d8');
      s.r(bx + 5, topo + 15, 2, 4, '#1a0a0a');
    }
  }
  for (let k = 0; k < 8; k++) s.r(dx + k * 40 + 6, 124, 18, 1, '#a89878');
  for (let k = 0; k < 6; k++) s.r(dx + k * 54 + 20, 132, 12, 1, '#a89878');
  // multidão na calçada, alguns com o punho erguido
  s.g('cap-multidao', atraso(dx), (m) => {
    for (let k = 0; k < 9; k++) {
      const px = dx + 6 + k * 35 + entre(k + 3, 0, 8);
      const cor = de(['#6a5a6a', '#7a6a72', '#5a4a5a'], k);
      m.r(px, 100, 7, 12, cor);
      m.r(px + 1, 94, 5, 6, cor);
      if (k % 3 === 0) m.r(px + 6, 88, 2, 8, cor);
    }
  });
}

function jaula(): JSX.Element {
  const t = pincel();
  // céu de sol
  t.r(0, 0, 320, 180, '#8ac8f0');
  t.r(0, 50, 320, 40, '#a8d8f4');
  halo(t, 40, 16, 22, '#fff8d0', 0.15);
  t.r(34, 10, 12, 12, '#fff4c0');
  t.r(32, 12, 16, 8, '#fff4c0');
  t.g('cap-nuvem', undefined, (s) => {
    for (const [x, y] of [[90, 20], [190, 12], [270, 34]] as [number, number][]) {
      s.r(x, y, 30, 6, '#ffffff');
      s.r(x + 6, y - 4, 16, 4, '#ffffff');
      s.r(x + 2, y + 6, 26, 2, '#e0f0fa');
    }
  });
  // o mundo lá fora passa e chacoalha
  t.g('cap-sacudir', undefined, (w) => {
    w.g('cap-rolar-lento', undefined, (s) => {
      longe(s, 0);
      longe(s, 320);
    });
    w.r(0, 108, 320, 32, '#c8b898');
    w.r(0, 108, 320, 2, '#a89878');
    w.g('cap-rolar', undefined, (s) => {
      frenteRua(s, 0);
      frenteRua(s, 320);
    });
  });

  // a jaula: teto com rebites
  t.r(0, 0, 320, 8, '#5a3a14');
  t.r(0, 0, 320, 1, '#c8962a');
  t.r(0, 6, 320, 2, '#3a240a');
  for (let x = 6; x < 320; x += 20) t.r(x, 3, 2, 2, '#e0b860');
  // chão de tábuas com borda de bronze
  t.r(0, 138, 320, 42, '#6a4a22');
  t.r(0, 138, 320, 4, '#c8962a');
  t.r(0, 138, 320, 1, '#f0d070');
  t.r(0, 142, 320, 1, '#3a240a');
  [150, 163, 176].forEach((y, i) => {
    t.r(0, y, 320, 1, '#4a3014');
    for (let x = 30 + i * 37; x < 320; x += 96) t.r(x, y - (i === 0 ? 7 : 12), 1, i === 0 ? 7 : 12, '#4a3014');
  });
  // sombras das grades no chão
  for (let x = 10; x < 320; x += 30) t.r(x + 5, 143, 3, 37, '#3a240a', 0.35);
  // palha
  for (let k = 0; k < 8; k++) {
    const x = entre(k * 3 + 7, 4, 310);
    const y = entre(k * 5 + 1, 146, 174);
    t.r(x, y, 6, 1, '#e0c060');
    t.r(x + 2, y - 1, 3, 1, '#c8a848');
  }
  // grades de bronze
  t.r(0, 0, 8, 140, '#5a3a14');
  t.r(312, 0, 8, 140, '#5a3a14');
  for (let x = 10; x < 320; x += 30) {
    t.r(x, 8, 5, 132, '#8a6a2a');
    t.r(x + 1, 8, 1, 132, '#e0b860');
    t.r(x + 4, 8, 1, 132, '#4a3010');
  }
  t.r(0, 60, 320, 3, '#6a4a1a');
  t.r(0, 60, 320, 1, '#c8962a');
  // cadeado
  t.r(159, 61, 6, 3, '#8a6a2a');
  t.r(158, 64, 8, 9, '#c8962a');
  t.r(158, 64, 8, 1, '#f0d070');
  t.r(161, 67, 2, 3, '#3a240a');
  return <>{t.itens}</>;
}

/* ------------------------------------------------------------------ */
/* Beco de dia                                                         */
/* ------------------------------------------------------------------ */

/** Cartaz com o olho do Censor; riscado = um rebelde passou um X por cima. */
function cartazOlho(t: Pincel, x: number, y: number, parede: string, riscado: boolean): void {
  t.r(x, y, 22, 28, '#e8dcc0');
  t.r(x, y, 22, 1, '#f8f0e0');
  t.r(x + 18, y + 24, 4, 4, parede);
  t.r(x + 5, y + 9, 12, 6, '#c0282a');
  t.r(x + 3, y + 11, 16, 2, '#c0282a');
  t.r(x + 8, y + 9, 6, 6, '#1a0a0a');
  t.ra(x + 10, y + 11, 2, 2, '#ff4a3a', 'cap-olho');
  t.r(x + 4, y + 19, 14, 2, '#1a1a1a');
  t.r(x + 6, y + 23, 10, 1, '#5a5a5a');
  if (riscado) {
    for (let k = 0; k < 9; k++) {
      t.r(x + 2 + k * 2, y + 3 + k * 2, 2, 2, '#f8f8f8', 0.85);
      t.r(x + 18 - k * 2, y + 3 + k * 2, 2, 2, '#f8f8f8', 0.85);
    }
  }
}

function caixote(t: Pincel, x: number, y: number, w: number, h: number): void {
  t.r(x, y, w, h, '#8a5a2a');
  t.r(x, y, w, 2, '#a87040');
  t.r(x, y, 2, h, '#a87040');
  t.r(x + w - 2, y, 2, h, '#5a3418');
  t.r(x, y + h - 2, w, 2, '#5a3418');
  t.r(x + 2, y + Math.floor(h / 2), w - 4, 1, '#5a3418');
  t.r(x + Math.floor(w / 3), y + 2, 1, h - 4, '#6a4220');
  t.r(x + Math.floor((2 * w) / 3), y + 2, 1, h - 4, '#6a4220');
}

function beco(): JSX.Element {
  const t = pincel();
  t.r(0, 0, 320, 180, '#2a2026');
  // fim do beco: céu e uma rua clara lá adiante
  t.r(110, 0, 100, 40, '#8ac8f0');
  t.r(110, 0, 100, 12, '#78b8e8');
  t.r(120, 30, 36, 106, '#e8c8a0');
  t.r(156, 22, 30, 114, '#f0d8b0');
  t.r(186, 34, 24, 102, '#e0b890');
  for (const [x, y] of [[128, 44], [140, 44], [164, 36], [174, 36], [164, 60], [192, 48], [128, 70], [174, 64]] as [number, number][]) {
    t.r(x, y, 6, 8, '#a88060');
  }
  t.r(110, 120, 100, 18, '#e8d8b8');
  // alguém passando lá no fim
  t.g('cap-passante', undefined, (s) => {
    s.r(112, 104, 5, 12, '#6a4a5a');
    s.r(113, 100, 3, 4, '#6a4a5a');
    s.r(112, 116, 2, 4, '#5a3a4a');
    s.r(115, 116, 2, 4, '#5a3a4a');
  });
  // paredes laterais em perspectiva
  t.p('100,0 128,18 128,138 100,148', '#6a4a40');
  t.p('220,0 192,24 192,138 220,148', '#3e2c2e');

  // fachada da esquerda, no sol
  const paredeE = '#c8946a';
  t.r(0, 0, 100, 140, paredeE);
  t.r(0, 0, 100, 4, '#a87850');
  t.r(8, 20, 14, 10, '#b8845a', 0.6);
  t.r(60, 110, 22, 14, '#b8845a', 0.6);
  // tijolos aparecendo sob o reboco
  t.r(10, 82, 48, 27, '#7a5a48');
  for (let lin = 0; lin < 5; lin++) {
    for (let k = 0; k < 4; k++) {
      t.r(12 + k * 11 + (lin % 2) * 5, 84 + lin * 5, 9, 4, de(['#9a4a32', '#8a3e2a', '#a85a3a'], lin * 4 + k));
    }
  }
  // janela com venezianas e vaso de flor
  t.r(30, 22, 24, 30, '#3a2420');
  t.r(32, 24, 20, 26, '#1a1014');
  t.r(22, 22, 8, 30, '#4a7a6a');
  t.r(54, 22, 8, 30, '#4a7a6a');
  for (let y = 26; y < 52; y += 6) {
    t.r(22, y, 8, 1, '#3a6050');
    t.r(54, y, 8, 1, '#3a6050');
  }
  t.r(28, 52, 28, 3, '#e0c8a8');
  t.r(36, 46, 10, 6, '#a84a2a');
  t.r(35, 42, 4, 4, '#4a8a3a');
  t.r(41, 40, 4, 6, '#5aa04a');
  t.r(42, 39, 2, 2, '#e84a6a');
  cartazOlho(t, 64, 66, paredeE, false);
  // cano de cobre da esquerda
  t.r(92, 0, 4, 136, '#8a5a2a');
  t.r(92, 0, 1, 136, '#c8804a');
  for (const y of [30, 70, 110]) t.r(90, y, 8, 2, '#4a3a30');

  // fachada da direita, na sombra
  const paredeD = '#8a6a5e';
  t.r(220, 0, 100, 140, paredeD);
  t.r(262, 20, 26, 32, '#2a1a1e');
  t.r(264, 22, 10, 28, '#c04a4a');
  t.r(276, 22, 10, 28, '#1a1014');
  t.r(260, 52, 30, 3, '#a88a7a');
  cartazOlho(t, 248, 64, paredeD, true);
  // canos de ferro, vazando vapor e pingando
  t.r(228, 0, 5, 136, '#6a6a78');
  t.r(228, 0, 1, 136, '#9a9aa8');
  t.r(232, 0, 1, 136, '#4a4a58');
  t.r(226, 40, 9, 3, '#5a5a68');
  t.r(233, 100, 87, 4, '#6a6a78');
  t.r(233, 100, 87, 1, '#9a9aa8');
  t.r(226, 98, 9, 8, '#5a5a68');
  t.r(282, 99, 4, 6, '#5a5a68');
  t.r(300, 94, 9, 2, '#a83a2a');
  t.r(303, 91, 3, 8, '#a83a2a');
  t.r(304, 98, 1, 2, '#5a5a68');
  vapor(t, 284, 97, 0);
  vapor(t, 231, 38, -1200);
  t.ra(296, 104, 1, 2, '#9ac8e8', 'cap-gota');

  // varais com roupa balançando
  t.r(96, 36, 44, 1, '#3a3a3a');
  t.r(140, 37, 44, 1, '#3a3a3a');
  t.r(184, 36, 44, 1, '#3a3a3a');
  t.r(96, 14, 66, 1, '#3a3a3a');
  t.r(162, 15, 66, 1, '#3a3a3a');
  const roupas: [number, number, string, number, number][] = [
    [104, 37, '#c0384a', 10, 14],
    [118, 37, '#f0e8d0', 14, 10],
    [136, 38, '#3a6ad0', 8, 16],
    [150, 38, '#e8c84a', 12, 12],
    [168, 38, '#f0e8d0', 16, 18],
    [190, 37, '#4a8a3a', 10, 12],
    [206, 37, '#c06aa0', 8, 10],
    [112, 15, '#d8c8a0', 12, 8],
    [140, 15, '#3a6ad0', 6, 10],
    [176, 16, '#c0384a', 10, 9],
    [198, 16, '#f0e8d0', 8, 7],
  ];
  roupas.forEach(([x, y, cor, w, h], i) => {
    t.g('cap-roupa', atraso(-i * 300), (s) => {
      s.r(x, y, w, h, cor);
      s.r(x, y + h - 2, w, 2, '#000000', 0.15);
      s.r(x + 1, y, 1, h, '#ffffff', 0.25);
      s.r(x + 1, y - 1, 1, 2, '#8a5a2a');
      s.r(x + w - 2, y - 1, 1, 2, '#8a5a2a');
    });
  });

  // chão de pedras, com sombra do lado direito
  t.r(0, 136, 320, 3, '#5a4a4a');
  pedras(t, 139, ['#8a7a72', '#7a6a64', '#96867c'], '#4a3c3a');
  t.r(200, 139, 120, 41, '#1a1020', 0.22);
  t.r(286, 139, 20, 2, '#4a6a8a');
  t.ra(292, 139, 8, 1, '#9ac8e8', 'cap-estrela');

  // caixotes, barril e o gato
  caixote(t, 6, 112, 28, 26);
  caixote(t, 34, 118, 22, 20);
  caixote(t, 12, 92, 20, 20);
  t.r(289, 115, 24, 20, '#7a4a22');
  t.r(290, 112, 22, 26, '#7a4a22');
  t.r(293, 112, 2, 26, '#a06a34');
  t.r(290, 116, 22, 2, '#3a3a42');
  t.r(290, 132, 22, 2, '#3a3a42');
  t.g('cap-rabo', undefined, (s) => {
    s.r(12, 80, 2, 8, '#1a1418');
    s.r(10, 78, 3, 3, '#1a1418');
  });
  t.r(14, 86, 14, 6, '#1a1418');
  t.r(26, 82, 7, 6, '#1a1418');
  t.r(26, 80, 2, 2, '#1a1418');
  t.r(31, 80, 2, 2, '#1a1418');
  t.ra(28, 84, 1, 1, '#f2d04a', 'cap-piscar');
  t.ra(31, 84, 1, 1, '#f2d04a', 'cap-piscar');
  // sol batendo na parede da esquerda
  t.p('0,0 70,0 100,40 100,70', '#fff0c0', 0.1);
  return <>{t.itens}</>;
}

/* ------------------------------------------------------------------ */
/* Rua do mercado, com sol                                             */
/* ------------------------------------------------------------------ */

/** Estandarte vermelho com o olho do Censor. */
function bandeiraOlho(t: Pincel, x: number, y: number, h: number, atrasoMs: number): void {
  t.g('cap-bandeira', atraso(atrasoMs), (s) => {
    s.r(x - 1, y - 2, 14, 2, '#5a4a3a');
    s.r(x, y, 12, h, '#b0202a');
    s.r(x, y, 1, h, '#d0404a');
    s.r(x + 11, y, 1, h, '#801018');
    s.r(x, y + 2, 12, 1, '#e0b040');
    s.r(x, y + h - 3, 12, 1, '#e0b040');
    const ey = y + Math.floor(h / 2) - 3;
    s.r(x + 2, ey + 1, 8, 4, '#f0e8d8');
    s.r(x + 3, ey, 6, 6, '#f0e8d8');
    s.r(x + 4, ey + 1, 4, 4, '#1a0a0a');
    s.r(x + 5, ey + 2, 2, 2, '#ff3a2a');
    s.r(x, y + h, 4, 4, '#b0202a');
    s.r(x + 8, y + h, 4, 4, '#b0202a');
  });
}

type Mercadoria = 'frutas' | 'potes' | 'tecidos';

/** Barraca com toldo listrado e balcão. */
function barraca(t: Pincel, x: number, w: number, cor: string, mercadoria: Mercadoria, atrasoMs: number): void {
  t.r(x, 136, w, 4, '#000000', 0.12);
  t.r(x + 4, 96, w - 8, 20, '#5a3a24');
  t.r(x + 1, 96, 3, 40, '#6a3e1c');
  t.r(x + w - 4, 96, 3, 40, '#6a3e1c');
  // toldo listrado com a borda ondulando
  for (let k = 0; k * 8 < w; k++) t.r(x + k * 8, 88, 8, 8, k % 2 ? '#f0e8d0' : cor);
  t.r(x, 88, w, 1, '#ffffff', 0.35);
  t.g('cap-bandeira', atraso(atrasoMs), (s) => {
    for (let k = 0; k * 8 < w; k++) s.r(x + k * 8 + 1, 96, 6, 2, k % 2 ? '#f0e8d0' : cor);
  });
  // coisas penduradas
  for (let k = 0; k < 3; k++) {
    t.r(x + 12 + k * 24, 97, 1, 3, '#5a4a3a');
    t.r(x + 11 + k * 24, 100, 3, 5, mercadoria === 'tecidos' ? '#c06aa0' : '#e8e0c8');
  }
  // balcão
  t.r(x, 116, w, 4, '#a8703a');
  t.r(x, 116, w, 1, '#d0985a');
  t.r(x + 2, 120, w - 4, 16, '#7a4a22');
  t.r(x + 2, 127, w - 4, 1, '#5a3418');
  for (let k = 0; k < 4; k++) {
    const bx = x + 6 + k * 18;
    if (mercadoria === 'frutas') {
      const c = de(['#e04a3a', '#f29a2a', '#7a3a8a', '#6ac04a'], k);
      t.r(bx, 112, 14, 4, '#a8803a');
      t.r(bx + 1, 109, 4, 3, c);
      t.r(bx + 5, 108, 4, 4, c);
      t.r(bx + 9, 109, 4, 3, c);
      t.r(bx + 6, 108, 1, 1, '#ffffff', 0.5);
    } else if (mercadoria === 'potes') {
      t.r(bx + 2, 100, 6, 2, '#a85a2a');
      t.r(bx, 102, 10, 10, '#c0703a');
      t.r(bx + 1, 112, 8, 4, '#a85a2a');
      t.r(bx + 2, 103, 1, 6, '#e09a5a');
      t.r(bx, 106, 10, 1, '#5a2a14');
    } else {
      const c = de(['#3a6ad0', '#e8c84a', '#c0384a', '#4a8a3a'], k);
      t.r(bx, 108, 14, 8, c);
      t.r(bx, 111, 14, 1, '#000000', 0.2);
      t.r(bx, 108, 14, 1, '#ffffff', 0.3);
    }
  }
}

/** Pomba voando de um lado ao outro. */
function pombaVoando(t: Pincel, x: number, y: number, atrasoMs: number): void {
  t.g('cap-pomba', atraso(atrasoMs), (s) => {
    s.r(x, y, 6, 3, '#f0f0f8');
    s.r(x + 6, y - 1, 2, 2, '#f0f0f8');
    s.r(x - 2, y + 1, 2, 1, '#d8d8e8');
    s.g('cap-asa', undefined, (a) => a.r(x + 1, y - 3, 4, 3, '#d8d8e8'));
  });
}

/** Pomba no chão, bicando. */
function pombaChao(t: Pincel, x: number, y: number, atrasoMs: number): void {
  t.r(x, y, 7, 4, '#9a9aa8');
  t.r(x + 1, y + 1, 4, 2, '#b8b8c8');
  t.r(x - 2, y + 1, 3, 2, '#7a7a88');
  t.r(x + 2, y + 4, 1, 2, '#d07060');
  t.r(x + 4, y + 4, 1, 2, '#d07060');
  t.g('cap-bicar', atraso(atrasoMs), (s) => {
    s.r(x + 6, y - 3, 3, 3, '#8a8a98');
    s.r(x + 9, y - 2, 1, 1, '#e0a040');
  });
}

function mercado(): JSX.Element {
  const t = pincel();
  t.r(0, 0, 320, 180, '#9ad0f0');
  t.r(0, 40, 320, 30, '#b0dcf4');
  t.r(0, 70, 320, 30, '#c8e8f8');
  // sol e nuvens
  halo(t, 280, 20, 24, '#fff8d0', 0.15);
  t.r(274, 14, 12, 12, '#fff8d0');
  t.r(272, 16, 16, 8, '#fff8d0');
  t.r(276, 12, 8, 16, '#fff8d0');
  t.g('cap-nuvem', undefined, (s) => {
    for (const [x, y] of [[40, 18], [150, 10], [210, 30]] as [number, number][]) {
      s.r(x, y, 28, 6, '#ffffff');
      s.r(x + 5, y - 4, 14, 4, '#ffffff');
      s.r(x + 2, y + 6, 24, 2, '#e0f0fa');
    }
  });
  // morros e o aqueduto ao longe
  t.r(0, 84, 320, 30, '#a8c8a0');
  t.r(20, 80, 60, 6, '#a8c8a0');
  t.r(180, 78, 90, 8, '#a8c8a0');
  t.r(0, 62, 320, 6, '#d8c8b0');
  t.r(0, 62, 320, 1, '#f0e4d0');
  for (let k = 4; k < 12; k++) {
    const x = k * 20;
    t.r(x, 68, 4, 30, '#d8c8b0');
    t.r(x + 4, 68, 16, 2, '#d8c8b0');
    t.r(x + 4, 70, 2, 2, '#d8c8b0');
    t.r(x + 18, 70, 2, 2, '#d8c8b0');
  }
  t.r(0, 96, 320, 4, '#c8b8a0');

  // prédio da esquerda
  t.r(0, 24, 104, 112, '#e0b888');
  t.r(98, 24, 6, 112, '#b88a60');
  t.r(0, 18, 108, 6, '#b8502a');
  t.r(0, 18, 108, 1, '#e0703a');
  t.r(0, 23, 108, 1, '#7a3018');
  t.r(0, 62, 104, 3, '#c89a6a');
  for (const x of [10, 40, 70]) {
    t.r(x, 34, 16, 20, '#5a3a2a');
    t.r(x + 2, 32, 12, 2, '#5a3a2a');
    t.r(x, 54, 16, 2, '#f0d8b0');
  }
  t.r(72, 50, 12, 4, '#a84a2a');
  t.r(73, 46, 4, 4, '#4a8a3a');
  t.r(78, 45, 4, 5, '#5aa04a');
  // prédio da direita
  t.r(216, 30, 104, 106, '#d8a878');
  t.r(216, 30, 4, 106, '#a87a50');
  t.r(212, 24, 108, 6, '#a84a2a');
  t.r(212, 24, 108, 1, '#d06a3a');
  t.r(212, 29, 108, 1, '#6a2a18');
  t.r(216, 66, 104, 3, '#b88a5a');
  for (const x of [228, 260, 292]) {
    t.r(x, 40, 16, 20, '#5a3a2a');
    t.r(x + 2, 38, 12, 2, '#5a3a2a');
    t.r(x, 60, 16, 2, '#f0d8b0');
  }
  // estandartes do Censor e o varal de bandeirinhas entre os prédios
  bandeiraOlho(t, 27, 30, 30, 0);
  bandeiraOlho(t, 246, 36, 30, -900);
  t.r(104, 40, 112, 1, '#5a4a3a');
  t.g('cap-bandeira', atraso(-400), (s) => {
    for (let k = 0; k < 12; k++) {
      const x = 106 + k * 9;
      const c = k % 2 ? '#f0e8d0' : '#b0202a';
      s.r(x, 41, 5, 3, c);
      s.r(x + 1, 44, 3, 2, c);
      s.r(x + 2, 46, 1, 1, c);
    }
  });

  // chão de lajes claras
  t.r(0, 136, 320, 44, '#b0a088');
  const filas = [136, 142, 150, 160, 172, 180];
  for (let i = 0; i < filas.length - 1; i++) {
    const y = filas[i] ?? 136;
    const h = (filas[i + 1] ?? 180) - y;
    const w = 30 + i * 10;
    const desloc = i % 2 ? Math.round(w / 2) : 0;
    for (let k = 0, x = -desloc; x < 320; k++, x += w) {
      t.r(x + 1, y + 1, w - 1, h - 1, de(['#d8c8a8', '#d0c0a0', '#c0b090'], i * 3 + k));
    }
  }
  // barracas
  barraca(t, 4, 80, '#c0384a', 'frutas', 0);
  barraca(t, 120, 80, '#3a6ad0', 'potes', -700);
  barraca(t, 236, 80, '#4a8a3a', 'tecidos', -1400);
  // uma maçã que caiu
  t.r(98, 168, 3, 3, '#e04a3a');
  t.r(99, 167, 1, 1, '#4a8a3a');
  // pombas
  pombaChao(t, 104, 150, 0);
  pombaChao(t, 214, 162, -800);
  pombaVoando(t, -16, 30, 0);
  pombaVoando(t, -24, 22, -5000);
  pombaVoando(t, -12, 44, -10000);
  return <>{t.itens}</>;
}

/* ------------------------------------------------------------------ */
/* Túnel de pedra que leva à arena                                     */
/* ------------------------------------------------------------------ */

/** Meia largura do arco maior do túnel na altura y (centro em y 130, raio 120). */
function meiaLarguraTunel(y: number): number {
  if (y >= 130) return 120;
  const d = 130 - y;
  return d >= 120 ? 0 : Math.sqrt(120 * 120 - d * d);
}

function tunel(): JSX.Element {
  const t = pincel();
  t.r(0, 0, 320, 180, '#140e10');
  // blocos da parede, fora do arco maior
  for (let lin = 0; lin < 12; lin++) {
    const y = lin * 12;
    const desloc = lin % 2 ? 16 : 0;
    for (let k = 0, x = -desloc; x < 320; k++, x += 32) {
      if (Math.abs(x + 16 - 160) + 16 < meiaLarguraTunel(y + 6)) continue;
      t.r(x + 1, y + 1, 31, 11, de(['#3e3230', '#362a28', '#46383a'], lin * 3 + k));
    }
  }
  // arcos que se repetem para dentro do túnel
  arco(t, 160, 10, 120, 8, '#5a4a46', 6);
  arco(t, 160, 14, 116, 8, '#2a2022', 6);
  arco(t, 160, 38, 92, 8, '#4a3c3a', 5);
  arco(t, 160, 42, 88, 8, '#221a1c', 5);
  arco(t, 160, 66, 64, 8, '#3e3230', 4);
  arco(t, 160, 70, 60, 8, '#1c1416', 4);
  // juntas das aduelas no arco da frente
  for (let a = 10; a <= 170; a += 16) {
    const rad = (a * Math.PI) / 180;
    const x = 160 + Math.round(118 * Math.cos(rad));
    const y = 130 - Math.round(118 * Math.sin(rad));
    t.r(x - 1, y - 1, 2, 2, '#2a2022');
  }
  // a boca do túnel: a arena clara lá fora
  arco(t, 160, 86, 36, 16, '#fff0c8', 3);
  t.r(124, 108, 72, 4, '#d8b078');
  t.r(124, 112, 72, 10, '#e8c890');
  for (let x = 126; x < 196; x += 4) t.r(x, 109, 2, 2, '#b88a58');
  t.r(124, 122, 72, 16, '#f8e0a8');
  t.r(132, 96, 1, 14, '#8a6a4a');
  t.r(186, 96, 1, 14, '#8a6a4a');
  t.g('cap-bandeira', undefined, (s) => {
    s.r(133, 96, 6, 4, '#c0282a');
    s.r(187, 96, 6, 4, '#c0282a');
  });
  halo(t, 160, 118, 44, '#fff8e0', 0.1, 'cap-feixe');
  // grade de ferro levantada (só as pontas aparecem)
  for (let x = 136; x <= 184; x += 8) {
    t.r(x, 82, 2, 12, '#2a2226');
    t.r(x, 94, 2, 2, '#5a5058');
  }
  t.r(134, 88, 52, 2, '#2a2226');
  for (let y = 58; y < 86; y += 4) {
    t.r(122, y, 2, 3, '#5a5058');
    t.r(196, y, 2, 3, '#5a5058');
  }

  // chão de lajes, mais claro no meio (onde bate a luz)
  t.r(0, 138, 320, 42, '#2a2224');
  const filas = [138, 143, 149, 156, 164, 173, 180];
  for (let i = 0; i < filas.length - 1; i++) {
    const y = filas[i] ?? 138;
    const h = (filas[i + 1] ?? 180) - y;
    const w = 22 + i * 8;
    const desloc = i % 2 ? Math.round(w / 2) : 0;
    for (let x = -desloc; x < 320; x += w) {
      const d = Math.abs(x + w / 2 - 160);
      const cor = d < 50 ? '#5a4c44' : d < 100 ? '#40363a' : '#302628';
      t.r(x + 1, y + 1, w - 1, h - 1, cor);
    }
  }
  t.r(140, 140, 40, 2, '#c8a878', 0.5);
  t.r(130, 146, 60, 1, '#c8a878', 0.3);
  // pegadas na areia que o vento trouxe
  for (let k = 0; k < 4; k++) {
    t.r(154 + (k % 2) * 8, 174 - k * 9, 3, 2, '#1a1214', 0.5);
  }
  // feixes de luz vindos da arena
  t.g('cap-feixe', undefined, (s) => s.p('142,100 178,100 250,180 70,180', '#fff0c0', 0.1));
  t.g('cap-feixe', atraso(-2500), (s) => s.p('150,100 170,100 200,180 120,180', '#fff8e0', 0.12));
  poeira(t, 18, 110, 210, 96, 170, ['#fff4d0', '#ffe8b0'], 21);

  // escudo e lança na parede esquerda, elmo na direita
  t.r(10, 102, 12, 24, '#8a2a20');
  t.r(8, 104, 16, 20, '#8a2a20');
  t.r(8, 104, 1, 20, '#c8962a');
  t.r(23, 104, 1, 20, '#5a1a14');
  t.r(14, 112, 4, 4, '#c8962a');
  t.r(30, 84, 2, 54, '#6a4a2a');
  t.r(29, 80, 4, 5, '#b8b8c8');
  t.r(296, 108, 14, 10, '#a8a8b8');
  t.r(296, 108, 14, 1, '#d8d8e8');
  t.r(298, 104, 10, 4, '#c0282a');
  t.r(300, 112, 8, 2, '#2a2a32');
  // tochas
  tocha(t, 24, 64, 0);
  tocha(t, 292, 64, -250);
  tocha(t, 84, 96, -120);
  tocha(t, 232, 96, -380);
  return <>{t.itens}</>;
}
