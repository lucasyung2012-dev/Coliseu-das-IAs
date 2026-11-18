import { LIGAS } from './ligas';

/**
 * Paradas do Mapa de troféus: as 5 ligas e paradas no meio do caminho. Cada
 * parada tem um ponto no mapa (desenhado em 360 × 900, de baixo para cima).
 */
export interface Parada {
  trofeus: number;
  /** Nome da liga, quando a parada é a entrada de uma liga. */
  liga?: string;
  x: number;
  y: number;
}

const ALTURA = 900;
const XS = [180, 90, 70, 150, 270, 300, 220, 100, 80, 170, 280, 260, 180];
const TROFEUS = [0, 100, 250, 500, 800, 1100, 1500, 2200, 2800, 3500, 4500, 5800, 7000];

export const PARADAS: Parada[] = TROFEUS.map((trofeus, i) => ({
  trofeus,
  liga: LIGAS.find((l) => l.min === trofeus)?.nome,
  x: XS[i]!,
  y: ALTURA - 50 - (i * (ALTURA - 110)) / (TROFEUS.length - 1),
}));

/** Caminho suave passando por todas as paradas (Catmull-Rom convertido em curvas de Bézier). */
export function caminhoSvg(pts: { x: number; y: number }[] = PARADAS): string {
  let d = `M ${pts[0]!.x} ${pts[0]!.y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]!;
    const p1 = pts[i]!;
    const p2 = pts[i + 1]!;
    const p3 = pts[i + 2] ?? p2;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C ${c1.x.toFixed(1)} ${c1.y.toFixed(1)}, ${c2.x.toFixed(1)} ${c2.y.toFixed(1)}, ${p2.x} ${p2.y}`;
  }
  return d;
}

/** Onde o gladiador fica no mapa com essa quantidade de troféus. */
export function posicaoNoMapa(trofeus: number): { x: number; y: number } {
  const ultima = PARADAS[PARADAS.length - 1]!;
  if (trofeus >= ultima.trofeus) return { x: ultima.x, y: ultima.y };
  const k = PARADAS.findIndex((p, i) => trofeus >= p.trofeus && trofeus < PARADAS[i + 1]!.trofeus);
  const a = PARADAS[Math.max(0, k)]!;
  const b = PARADAS[Math.max(0, k) + 1]!;
  const t = (trofeus - a.trofeus) / (b.trofeus - a.trofeus);
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

/** Ligas cruzadas entre dois valores de troféus (para a festa de subir de liga). */
export function ligasCruzadas(de: number, ate: number): string[] {
  return PARADAS.filter((p) => p.liga && p.trofeus > de && p.trofeus <= ate).map((p) => p.liga!);
}
