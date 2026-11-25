import type { BairroId } from './roma';

/**
 * A GEOMETRIA DE ROMA (25/11/2026): o rio, a muralha, as ruas e onde fica cada lugar. O mapa
 * desenhado e a Roma caminhável usam as mesmas medidas (o mapa tem 320 × 200).
 */
export const W = 320;
export const H = 200;

/** Onde fica cada lugar no mapa grande. */
export const POS: Record<BairroId, [number, number]> = {
  biblioteca: [150, 42],
  observatorio: [286, 30],
  templo: [264, 70],
  subura: [212, 64],
  forum: [178, 98],
  coliseu: [224, 118],
  ludus: [266, 136],
  aqueduto: [300, 96],
  catacumbas: [204, 178],
  porto: [40, 156],
};

// O rio Tibre, a muralha e as ruas.
export const RIO: [number, number][] = [[160, 0], [152, 18], [138, 36], [132, 56], [132, 76], [124, 100], [106, 126], [82, 150], [62, 168], [50, 178]];
export const MURALHA = { cx: 202, cy: 100, rx: 102, ry: 72 };
export const RUAS: [number, number][][] = [
  [[178, 98], [224, 118]],
  [[178, 98], [212, 64]],
  [[212, 64], [264, 70]],
  [[264, 70], [300, 96]],
  [[224, 118], [266, 136]],
  [[224, 118], [204, 160], [204, 178], [204, 200]],
  [[178, 98], [150, 42], [150, 0]],
  [[178, 98], [140, 96], [124, 100], [100, 112], [70, 140], [40, 156]],
  [[264, 70], [286, 30]],
  [[212, 64], [232, 30], [250, 0]],
  [[266, 136], [304, 120], [320, 116]],
];
export const dist = (px: number, py: number, [ax, ay]: [number, number], [bx, by]: [number, number]) => {
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(px - ax - t * dx, py - ay - t * dy);
};
export const pertoDaLinha = (x: number, y: number, l: [number, number][], d: number) => l.some((p, k) => k > 0 && dist(x, y, l[k - 1]!, p) < d);
export const naMuralha = (x: number, y: number, folga = 1) => ((x - MURALHA.cx) / MURALHA.rx) ** 2 + ((y - MURALHA.cy) / MURALHA.ry) ** 2 < folga;
export const CIRCO: [number, number] = [178, 142];

